
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  rarity: string;
  category: string;
  in_stock: number;
  is_bot_item?: boolean;
  bot_inventory_id?: string;
}

interface SyncResponse {
  success: boolean;
  message?: string;
  error?: string;
  items_synced?: number;
}

// Helper to normalize image URLs for Steam CDN
const normalizeImageUrl = (url) => {
  if (!url) return '/placeholder.svg';
  if (url.startsWith('http')) {
    // Rewrite steamcommunity.com/economy/image/ URLs to akamaihd.net CDN
    if (url.includes('steamcommunity.com/economy/image/')) {
      const path = url.split('/economy/image/')[1];
      return `https://steamcommunity-a.akamaihd.net/economy/image/${path}/360fx360f`;
    }
    return url;
  }
  return url;
};

export const useStoreData = () => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('high-to-low');
  const { toast } = useToast();

  useEffect(() => {
    fetchStoreItems();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, priceFilter]);

  // Debug effect to see when items change
  useEffect(() => {
    console.log('[STORE-DATA] 📦 Items state changed:', {
      itemsLength: items.length,
      sampleItems: items.slice(0, 3).map(item => ({ id: item.id, name: item.name }))
    });
  }, [items]);

  const setupRealtimeSubscription = () => {
    console.log('[STORE-DATA] Setting up realtime subscription for store updates...');
    
    const channel = supabase
      .channel('store-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_items'
        },
        (payload) => {
          console.log('[STORE-DATA] Realtime update detected:', payload);
          fetchStoreItems();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'steam_bot_inventory'
        },
        (payload) => {
          console.log('[STORE-DATA] Bot inventory update detected:', payload);
          // Trigger store refresh after inventory changes
          setTimeout(() => fetchStoreItems(), 1000);
        }
      )
      .subscribe((status) => {
        console.log('[STORE-DATA] Realtime subscription status:', status);
      });

    return () => {
      console.log('[STORE-DATA] Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  };

  const debugDatabaseState = async () => {
    console.log('[STORE-DATA] 🔍 Debugging database state...');
    
    try {
      // Check if there are any Steam bots
      const { data: bots, error: botsError } = await supabase
        .from('steam_bots')
        .select('id, label, is_active, last_status')
        .eq('is_active', true);
      
      console.log('[STORE-DATA] 🤖 Active Steam bots:', {
        count: bots?.length || 0,
        bots: bots?.map(b => ({ id: b.id, label: b.label, status: b.last_status }))
      });
      
      if (botsError) {
        console.error('[STORE-DATA] ❌ Error fetching bots:', botsError);
      }
      
      // Check total inventory items
      const { count: totalInventory, error: totalError } = await supabase
        .from('steam_bot_inventory')
        .select('*', { count: 'exact', head: true });
      
      console.log('[STORE-DATA] 📦 Total inventory items:', totalInventory);
      
      if (totalError) {
        console.error('[STORE-DATA] ❌ Error counting inventory:', totalError);
      }
      
      // Check tradable items
      const { count: tradableItems, error: tradableError } = await supabase
        .from('steam_bot_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('tradable', true);
      
      console.log('[STORE-DATA] 📦 Tradable inventory items:', tradableItems);
      
      if (tradableError) {
        console.error('[STORE-DATA] ❌ Error counting tradable items:', tradableError);
      }
      
      // Get a sample of items if any exist
      if (tradableItems && tradableItems > 0) {
        const { data: sampleItems, error: sampleError } = await supabase
          .from('steam_bot_inventory')
          .select('id, market_hash_name, tradable, balance_price, market_price_usd')
          .eq('tradable', true)
          .limit(3);
        
        console.log('[STORE-DATA] 📋 Sample items:', sampleItems);
        
        if (sampleError) {
          console.error('[STORE-DATA] ❌ Error fetching sample items:', sampleError);
        }
      }
      
    } catch (error) {
      console.error('[STORE-DATA] ❌ Debug database state failed:', error);
    }
  };

  const fetchStoreItems = async () => {
    try {
      // Fetch items from both sources
      const [botInventoryResult, storeItemsResult] = await Promise.all([
        supabase
          .from('steam_bot_inventory')
          .select('*')
          .eq('tradable', true)
          .order('last_synced', { ascending: false }),
        supabase
          .from('store_items')
          .select('*')
          .gt('in_stock', 0)
          .order('created_at', { ascending: false })
      ]);

      if (botInventoryResult.error) {
        console.error('[STORE-DATA] Error fetching bot inventory:', botInventoryResult.error);
      }
      if (storeItemsResult.error) {
        console.error('[STORE-DATA] Error fetching store items:', storeItemsResult.error);
      }

      // Map bot inventory items to StoreItem interface
      const botItems = (botInventoryResult.data || []).map((item) => {
        let rarity = 'Consumer';
        if (item.rarity_color === '#eb4b4b') rarity = 'Covert';
        else if (item.rarity_color === '#8650AC') rarity = 'Classified';
        else if (item.rarity_color === '#4b69ff') rarity = 'Restricted';
        else if (item.rarity_color === '#5e98d9') rarity = 'Mil-Spec';
        else if (item.rarity_color === '#d2d2d2') rarity = 'Industrial';
        else if (item.rarity_color === '#b0c3d9') rarity = 'Consumer';
        // Use market_price_usd * 1.2 if available, else fallback
        let price = item.market_price_usd ? parseFloat((item.market_price_usd * 1.2).toFixed(2)) : (item.balance_price ?? 1.0);
        return {
          id: item.id,
          name: item.market_hash_name || item.name || 'Unknown Item',
          description: 'Steam item from bot inventory',
          price: price,
          image_url: normalizeImageUrl(item.icon_url),
          rarity: rarity,
          category: 'weapon',
          in_stock: 1,
          is_bot_item: true,
          bot_inventory_id: item.id,
          inventory_item_id: item.id,
        };
      });
      // For store_items, use market_price_usd * 1.2 if available, else fallback to price
      const storeItems = (storeItemsResult.data || []).map((item) => {
        const anyItem = item as any;
        return {
          ...item,
          price: (typeof anyItem.market_price_usd === 'number' && !isNaN(anyItem.market_price_usd)) ? parseFloat((anyItem.market_price_usd * 1.2).toFixed(2)) : item.price,
          image_url: item.image_url && item.image_url.trim() !== '' ? normalizeImageUrl(item.image_url) : '/placeholder.svg',
        };
      });
      const allItems = [...botItems, ...storeItems];
      setItems(allItems);
    } catch (error) {
      console.error('[STORE-DATA] Exception fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    console.log('[STORE-DATA] 🔍 Applying filters...', {
      totalItems: items.length,
      searchTerm,
      priceFilter,
      itemsSample: items.slice(0, 3).map(item => ({ id: item.id, name: item.name, price: item.price }))
    });

    let filtered = items.filter(item => {
      const searchMatch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      console.log('[STORE-DATA] 🔍 Filtering item:', {
        name: item.name,
        searchTerm,
        searchMatch,
        description: item.description
      });
      
      return searchMatch;
    });

    console.log('[STORE-DATA] 🔍 After search filter:', {
      beforeFilter: items.length,
      afterFilter: filtered.length
    });

    // Sort by price based on filter
    if (priceFilter === 'high-to-low') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    } else if (priceFilter === 'low-to-high') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    }

    console.log('[STORE-DATA] ✅ Filtering complete:', {
      filteredCount: filtered.length,
      averagePrice: filtered.length > 0 ? 
        (filtered.reduce((sum, item) => sum + item.price, 0) / filtered.length).toFixed(2) : 0,
      sampleFiltered: filtered.slice(0, 3).map(item => ({ id: item.id, name: item.name, price: item.price }))
    });

    setFilteredItems(filtered);
  };

  const syncBotInventory = async () => {
    setSyncing(true);
    try {
      console.log('[STORE-DATA] Syncing bot inventory to store...');
      
      const { data, error } = await supabase.rpc('sync_bot_inventory_to_store');
      
      if (error) {
        console.error('[STORE-DATA] Error syncing bot inventory:', error);
        toast({
          title: 'Sync Failed',
          description: `Failed to sync bot inventory: ${error.message}`,
          variant: 'destructive'
        });
        return;
      }

      const response = data as SyncResponse;
      console.log('[STORE-DATA] Sync response:', response);

      if (response && response.success) {
        toast({
          title: 'Sync Successful',
          description: `${response.items_synced || 0} items synced from active bots`,
        });
        
        // Refresh store items after sync
        await fetchStoreItems();
      } else {
        toast({
          title: 'Sync Failed',
          description: response?.error || 'Failed to sync bot inventory',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('[STORE-DATA] Exception syncing bot inventory:', error);
      toast({
        title: 'Sync Failed',
        description: `Failed to sync bot inventory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  return {
    items,
    filteredItems,
    loading,
    syncing,
    searchTerm,
    setSearchTerm,
    priceFilter,
    setPriceFilter,
    syncBotInventory,
    refreshItems: fetchStoreItems
  };
};
