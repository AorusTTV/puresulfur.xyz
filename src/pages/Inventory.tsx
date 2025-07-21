import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventoryFilters } from '@/components/inventory/InventoryFilters';
import { InventoryItemCard } from '@/components/inventory/InventoryItemCard';
import { InventoryEmptyState } from '@/components/inventory/InventoryEmptyState';
import { DepositHistory } from '@/components/inventory/DepositHistory';
import { Package, Key, User, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface SteamInventoryItem {
  id: string;
  steam_item_id: string;
  market_hash_name: string;
  icon_url: string;
  tradable: boolean;
  marketable: boolean;
  exterior: string;
  rarity_color: string;
  bot_id: string;
  last_synced: string;
  duplicateCount?: number;
}

interface GroupedItem extends SteamInventoryItem {
  itemIds: string[];
  totalQuantity: number;
}

const Inventory = () => {
  const [items, setItems] = useState<SteamInventoryItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GroupedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [syncStatus, setSyncStatus] = useState<{
    isOnline: boolean;
    lastSync?: string;
    itemCount: number;
    storeCount: number;
  }>({ isOnline: false, itemCount: 0, storeCount: 0 });
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    groupDuplicateItems();
  }, [items]);

  useEffect(() => {
    filterAndSortItems();
  }, [groupedItems, searchTerm, filterType]);



  const fetchSteamInventory = useCallback(async () => {
    
    if (!profile?.steam_id || !profile?.api_key) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      console.log('[INVENTORY] Sending request with:', {
        steamId: profile.steam_id,
        hasAccessToken: !!accessToken
      });
      
      const response = await fetch('https://sckkxdmwzxayefwvcgic.supabase.co/functions/v1/fetch-steam-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ steamId: profile.steam_id }),
      });
     
      console.log('[INVENTORY] Response status:', response.status);
      const res = await response.json();
      console.log('[INVENTORY] Response data:', res);
      if (!response.ok) {
        throw new Error(`Failed to fetch Steam inventory: ${res.error || response.statusText}`);
      }
      
      if (res.items) {
        setItems(res.items);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('[INVENTORY] Error fetching Steam inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your Steam inventory',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [profile?.steam_id, profile?.api_key, toast]);

  useEffect(() => {
    if (user) {
      fetchSteamInventory();
    } else {
      setLoading(false);
    }
  }, [user, fetchSteamInventory]);

  // Separate useEffect for real-time updates to properly manage subscription lifecycle
  useEffect(() => {
    if (!user) return;
    
    console.log('[INVENTORY] 📡 Setting up real-time inventory updates...');
    
    // Subscribe to inventory update events
    const channel = supabase.channel('inventory-realtime');
    
    channel
      .on('broadcast', { event: 'store:inventoryUpdated' }, (payload) => {
        console.log('[INVENTORY] 📡 Real-time update received:', payload);
        
        toast({
          title: '🔄 Inventory Updated',
          description: `${payload.payload.item_count} items synced with Hebrew pricing`,
        });
        
        // Refresh inventory data
        fetchSteamInventory();
      })
      .subscribe();

    // Cleanup on unmount
    return () => {
      console.log('[INVENTORY] 🔌 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user, toast, fetchSteamInventory]);

  const groupDuplicateItems = () => {
    if (!items.length) {
      setGroupedItems([]);
      return;
    }

    const grouped = items.reduce((acc, item) => {
      const key = item.market_hash_name;
      
      if (acc[key]) {
        acc[key].totalQuantity += 1;
        acc[key].itemIds.push(item.id);
        acc[key].duplicateCount = acc[key].totalQuantity;
      } else {
        acc[key] = {
          ...item,
          itemIds: [item.id],
          totalQuantity: 1,
          duplicateCount: 1
        };
      }
      
      return acc;
    }, {} as Record<string, GroupedItem>);

    const groupedArray = Object.values(grouped);
    console.log('[INVENTORY] Grouped items:', groupedArray.length, 'unique items from', items.length, 'total items');
    setGroupedItems(groupedArray);
  };

  const filterAndSortItems = () => {
    let filtered = groupedItems.filter(item => {
      const matchesSearch = 
        item.market_hash_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterType === 'all' ||
        (filterType === 'tradable' && item.tradable) ||
        (filterType === 'marketable' && item.marketable);
      
      return matchesSearch && matchesFilter;
    });

    setFilteredItems(filtered);
  };

  const handleDepositSkin = async (item: GroupedItem) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to deposit skins',
        variant: 'destructive'
      });
      return;
    }

    if (!profile?.steam_trade_url) {
      toast({
        title: 'Steam Trade URL Required',
        description: 'Please add your Steam Trade URL in your profile settings to deposit skins. You can find this in your Steam inventory privacy settings.',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('[INVENTORY] Initiating skin deposit for:', item.market_hash_name);
      
      toast({
        title: 'Deposit Initiated',
        description: `Processing deposit for ${item.market_hash_name}...`,
      });

      // Calculate deposit value (Steam market price - 20%)
      const marketPrice = await fetchSteamMarketPrice(item.market_hash_name);
      const depositValue = Math.round((marketPrice * 0.80) * 100) / 100; // 80% of market price

      console.log('[INVENTORY] Market price calculation:', {
        itemName: item.market_hash_name,
        marketPrice,
        depositValue,
        discount: '20%'
      });

      // Create deposit record
      const { data: depositData, error: depositError } = await (supabase as any)
        .from('steam_deposits')
        .insert({
          user_id: user.id,
          steam_item_id: item.steam_item_id,
          market_hash_name: item.market_hash_name,
          market_price: marketPrice,
          deposit_value: depositValue,
          status: 'pending',
          quantity: item.totalQuantity
        })
        .select()
        .single();

      if (depositError) {
        console.error('[INVENTORY] Deposit record creation failed:', depositError);
        throw new Error('Failed to create deposit record');
      }

      // Update user balance
      const newBalance = (profile.balance || 0) + depositValue;
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (balanceError) {
        console.error('[INVENTORY] Balance update failed:', balanceError);
        throw new Error('Failed to update balance');
      }

      // Remove items from bot inventory (mark as deposited)
      const { error: inventoryError } = await (supabase as any)
        .from('steam_bot_inventory')
        .update({ 
          status: 'deposited',
          deposited_at: new Date().toISOString(),
          deposit_value: depositValue
        })
        .in('id', item.itemIds);

      if (inventoryError) {
        console.error('[INVENTORY] Inventory update failed:', inventoryError);
        // Don't fail the deposit for inventory update issues
      }

      console.log('[INVENTORY] Deposit successful:', {
        itemName: item.market_hash_name,
        marketPrice,
        depositValue,
        newBalance
      });

      toast({
        title: 'Deposit Successful!',
        description: `${item.market_hash_name} deposited for $${depositValue.toFixed(2)} (Market: $${marketPrice.toFixed(2)})`,
      });

      // Refresh inventory and profile
      await fetchSteamInventory();
      await refreshProfile();

    } catch (error) {
      console.error('[INVENTORY] Deposit failed:', error);
      toast({
        title: 'Deposit Failed',
        description: error instanceof Error ? error.message : 'Failed to deposit skin. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Helper function to fetch Steam market price
  const fetchSteamMarketPrice = async (marketHashName: string): Promise<number> => {
    try {
      const encodedName = encodeURIComponent(marketHashName);
      const url = `https://steamcommunity.com/market/priceoverview/?appid=252490&currency=1&market_hash_name=${encodedName}`;
      
      console.log('[INVENTORY] Fetching market price for:', marketHashName);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        console.warn('[INVENTORY] Market price fetch failed:', response.status);
        return 0.50; // Fallback price
      }

      const data = await response.json();
      
      if (data.success && data.median_price) {
        const priceStr = data.median_price.replace(/[$,]/g, '');
        const marketPrice = parseFloat(priceStr);
        
        if (!isNaN(marketPrice) && marketPrice > 0) {
          console.log('[INVENTORY] Market price found:', marketPrice);
          return marketPrice;
        }
      }
      
      console.log('[INVENTORY] No market data, using fallback price');
      return 0.50; // Fallback price
      
    } catch (error) {
      console.error('[INVENTORY] Market price fetch error:', error);
      return 0.50; // Fallback price
    }
  };

  // Enhanced No API Key State with better messaging
  const NoApiKeyState = () => (
    <div className="text-center py-16">
      <Key className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
      <div className="text-muted-foreground text-xl mb-4">
        Steam API Key Required for Real Inventory
      </div>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        To sync your REAL Steam inventory with Hebrew pricing (USD × 1.495), you need to add your Steam API key. 
        This connects to your actual Rust skins using our advanced bot system.
      </p>
      <div className="space-y-4">
        <Link to="/profile">
          <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
            <User className="h-4 w-4 mr-2" />
            Add API Key in Profile
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Quick setup for real inventory:</p>
          <ol className="list-decimal list-inside space-y-1 text-left max-w-sm mx-auto">
            <li>Go to your profile settings</li>
            <li>Add your Steam API key</li>
            <li>Return here and sync your REAL inventory</li>
            <li>Real-time updates with Hebrew pricing</li>
          </ol>
        </div>
      </div>
    </div>
  );

  // No Steam ID State
  const NoSteamIdState = () => (
    <div className="text-center py-16">
      <User className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
      <div className="text-muted-foreground text-xl mb-4">
        Steam Account Required
      </div>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        You need to login with Steam to sync your REAL inventory using our real-time bot system. 
        Please logout and login again using Steam.
      </p>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Login Required</h1>
            <p className="text-muted-foreground mb-8">Please login with Steam to view your REAL Rust inventory with Hebrew pricing</p>
            <LoginDialog>
              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                Login to View Real Inventory
              </Button>
            </LoginDialog>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-foreground text-xl">Loading REAL Steam inventory with Hebrew pricing...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
      <InventoryHeader 
        uniqueItemsCount={groupedItems.length}
        totalItemsCount={items.length}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Show sync card only if user has both API key and Steam ID */}
        {profile?.api_key && profile?.steam_id && (
          <InventoryFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filteredItemsCount={filteredItems.length}
            totalItemsCount={items.length}
          />
        )}

        {/* Deposit History */}
        {profile?.steam_id && (
          <DepositHistory />
        )}

        {/* Show filters only if user has both requirements and items */}
        {profile?.api_key && profile?.steam_id && items.length > 0 && (
          <InventoryFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filteredItemsCount={filteredItems.length}
            totalItemsCount={items.length}
          />
        )}

        {/* Main content area */}
        {!profile?.steam_id ? (
          <NoSteamIdState />
        ) : !profile?.api_key ? (
          <NoApiKeyState />
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onDepositSkin={handleDepositSkin}
              />
            ))}
          </div>
        ) : (
          <InventoryEmptyState
            hasItems={items.length > 0}
            onSync={fetchSteamInventory}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default Inventory;
