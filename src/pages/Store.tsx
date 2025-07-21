import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/middleware/RoleMiddleware';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StoreHeader } from '@/components/store/StoreHeader';
import { StoreFilters } from '@/components/store/StoreFilters';

import { StoreDisplayOptimizer } from '@/components/store/StoreDisplayOptimizer';
import { PaymentTestComponent } from '@/components/store/PaymentTestComponent';
import { CartButton } from '@/components/store/CartButton';
import { CartSidebar } from '@/components/store/CartSidebar';
import { useStoreData } from '@/hooks/useStoreData';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, RefreshCw, RefreshCcw } from 'lucide-react';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  rarity: string;
  category: string;
  in_stock: number;
  bot_inventory_id?: string;
  is_bot_item?: boolean;
}

interface PurchaseResponse {
  success: boolean;
  error?: string;
  message?: string;
}

const Store = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { hasRole } = useRole();
  const { toast } = useToast();
  const [showPaymentTest, setShowPaymentTest] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  
  const {
    filteredItems,
    loading,
    syncing,
    searchTerm,
    setSearchTerm,
    priceFilter,
    setPriceFilter,
    syncBotInventory,
    refreshItems
  } = useStoreData();

  const handlePurchase = async (item: StoreItem) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to purchase items',
        variant: 'destructive'
      });
      return;
    }

    if (!profile || profile.balance < item.price) {
      toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough balance to purchase this item',
        variant: 'destructive'
      });
      return;
    }

    // Check if user has trade URL for bot items
    if (item.is_bot_item) {
      console.log('[STORE-PURCHASE] Checking trade URL for bot item:', {
        itemId: item.id,
        profileTradeUrl: profile.steam_trade_url,
        tradeUrlExists: !!(profile.steam_trade_url && profile.steam_trade_url.trim() !== '')
      });

      if (!profile.steam_trade_url || profile.steam_trade_url.trim() === '') {
        toast({
          title: 'Steam Trade URL Required',
          description: 'Please add your Steam Trade URL in your profile settings to purchase Steam items. You can find this in your Steam inventory privacy settings.',
          variant: 'destructive'
        });
        return;
      }
    }

    setPurchasing(true);

    try {
      console.log('[STORE-PURCHASE] Attempting to purchase item:', {
        itemId: item.id,
        itemName: item.name,
        price: item.price,
        botInventoryId: item.bot_inventory_id,
        isBotItem: item.is_bot_item,
        userBalance: profile.balance,
        userTradeUrl: profile.steam_trade_url ? 'SET' : 'NOT_SET'
      });

      // Use the enhanced purchase function for bot items
      if (item.is_bot_item && item.bot_inventory_id) {
        const { data, error } = await supabase.rpc('purchase_inventory_item', {
          p_user_id: user.id,
          p_inventory_item_id: item.bot_inventory_id,
          p_item_price: item.price
        });

        if (error) {
          console.error('[STORE-PURCHASE] RPC error:', error);
          throw error;
        }

        const response = data as unknown as PurchaseResponse;

        if (response && !response.success) {
          console.error('[STORE-PURCHASE] Purchase failed:', response.error);
          toast({
            title: 'Purchase Failed',
            description: response.error || 'Failed to complete purchase. Please try again.',
            variant: 'destructive'
          });
          return;
        }

        console.log('[STORE-PURCHASE] Purchase successful:', {
          itemName: item.name,
          price: item.price
        });

        toast({
          title: 'Purchase Successful!',
          description: response.message || `You purchased ${item.name} for $${item.price.toFixed(2)}. Check your Steam client for the trade offer.`,
        });
      } else {
        // Handle regular store items (non-bot items) - existing logic
        toast({
          title: 'Purchase Failed',
          description: 'Regular store items are not yet implemented',
          variant: 'destructive'
        });
        return;
      }

      // Refresh the items to update stock
      refreshItems();
      
      // Refresh user profile to update balance
      await refreshProfile();
      
    } catch (error) {
      console.error('[STORE-PURCHASE] Purchase failed:', error);
      toast({
        title: 'Purchase Failed',
        description: 'Failed to complete purchase. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Loading store inventory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
      <StoreHeader 
        user={user}
        onDepositSuccess={() => refreshProfile()}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Admin Controls - Only show for admins */}
        {user && hasRole('admin') && (
          <div className="mb-6 p-4 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Admin Controls</h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={syncBotInventory}
                disabled={syncing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {syncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                {syncing ? 'Syncing...' : 'Sync Bot Inventory'}
              </Button>
              <Button
                onClick={refreshItems}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Store
              </Button>
              <Button
                onClick={() => setShowPaymentTest(!showPaymentTest)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {showPaymentTest ? 'Hide' : 'Show'} Payment Test
              </Button>
            </div>
            {showPaymentTest && (
              <div className="mt-4">
                <PaymentTestComponent />
              </div>
            )}
          </div>
        )}

        {/* Cart Button - Top Right */}
        <div className="flex justify-end mb-6">
          <CartButton onClick={() => setIsCartOpen(true)} />
        </div>


        {/* Filters */}
        <StoreFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          filteredItemsCount={filteredItems.length}
        />

        {/* Optimized Store Display */}
        <StoreDisplayOptimizer
          items={filteredItems}
          user={user}
          profile={profile}
          onPurchase={handlePurchase}
          searchTerm={searchTerm}
          priceFilter={priceFilter}
          purchasing={purchasing}
        />

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-slate-400 text-xl mb-4">No items available</div>
            <p className="text-slate-500">
              {searchTerm ? 'Try adjusting your search or filters' : 'The store inventory is currently empty. Items will appear here when active Steam bots have tradable inventory.'}
            </p>
            {user && hasRole('admin') && (
              <div className="mt-4">
                <Button
                  onClick={syncBotInventory}
                  disabled={syncing}
                  className="flex items-center gap-2"
                >
                  {syncing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                  {syncing ? 'Syncing Bot Inventory...' : 'Sync Bot Inventory'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  );
};

export default Store;
