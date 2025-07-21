
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  item_id: string;
  steam_item_id: string | null;
  tradable: boolean | null;
  market_hash_name: string | null;
  icon_url: string | null;
  exterior: string | null;
  rarity_color: string | null;
  quantity: number | null;
  store_items: {
    name: string;
    price: number;
    image_url: string | null;
    rarity: string;
  } | null;
}

interface PlayerInventoryProps {
  userId: string;
  onDepositSkin: (itemId: string, value: number) => Promise<boolean>;
  isLoading: boolean;
}

export const PlayerInventory = ({ userId, onDepositSkin, isLoading }: PlayerInventoryProps) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [depositingItem, setDepositingItem] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInventory = async () => {
    try {
      console.log('Fetching inventory for user:', userId);
      const { data, error } = await supabase
        .from('user_inventory')
        .select(`
          *,
          store_items:item_id (
            name,
            price,
            image_url,
            rarity
          )
        `)
        .eq('user_id', userId)
        .eq('tradable', true)
        .gt('quantity', 0)
        .order('purchased_at', { ascending: false });

      if (error) {
        console.error('Error fetching inventory:', error);
        toast({
          title: 'Error',
          description: 'Failed to load inventory',
          variant: 'destructive',
        });
        return;
      }

      console.log('Raw inventory data:', data);

      // Transform data to handle the store_items relationship properly
      const transformedInventory = (data || []).map(item => {
        const storeItem = Array.isArray(item.store_items) && item.store_items.length > 0 
          ? item.store_items[0] 
          : item.store_items || null;
        
        console.log('Transforming item:', { item, storeItem });
        
        return {
          id: item.id,
          item_id: item.item_id,
          steam_item_id: item.steam_item_id,
          tradable: item.tradable,
          market_hash_name: item.market_hash_name,
          icon_url: item.icon_url,
          exterior: item.exterior,
          rarity_color: item.rarity_color,
          quantity: item.quantity,
          store_items: storeItem
        };
      });

      console.log('Transformed inventory:', transformedInventory);
      setInventory(transformedInventory);
    } catch (error) {
      console.error('Unexpected error fetching inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory',
        variant: 'destructive',
      });
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleDepositSkin = async (item: InventoryItem) => {
    if (!item.store_items) {
      toast({
        title: 'Error',
        description: 'Item value not found',
        variant: 'destructive',
      });
      return;
    }

    setDepositingItem(item.id);
    try {
      console.log('Attempting to deposit skin:', { itemId: item.id, value: item.store_items.price });
      const success = await onDepositSkin(item.id, item.store_items.price);
      if (success) {
        toast({
          title: 'Success',
          description: `${item.store_items.name} deposited to jackpot!`,
        });
        await fetchInventory(); // Refresh inventory
      }
    } catch (error) {
      console.error('Error depositing skin:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to deposit skin',
        variant: 'destructive',
      });
    } finally {
      setDepositingItem(null);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchInventory();
    }
  }, [userId]);

  if (loadingInventory) {
    return (
      <Card className="bg-slate-800/60 border-slate-700/50">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-slate-400 mt-2">Loading inventory...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/60 border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-orange-400" />
          Your Inventory
          <Badge variant="outline" className="ml-auto">
            {inventory.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {inventory.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">No tradable items</p>
            <p className="text-slate-500 text-sm">
              Visit the store to purchase items or get free items from daily crates
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {inventory.map((item) => (
              <div 
                key={item.id}
                className="relative bg-slate-700/50 rounded-lg p-3 border border-slate-600/50 hover:border-orange-500/50 transition-colors h-full flex flex-col"
              >
                {/* Item Image */}
                <div className="aspect-square mb-3 bg-slate-600/50 rounded-lg flex items-center justify-center overflow-hidden">
                  {item.store_items?.image_url ? (
                    <img 
                      src={item.store_items.image_url} 
                      alt={item.store_items.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-slate-400" />
                  )}
                </div>

                {/* Item Info */}
                <div className="space-y-2 flex-grow flex flex-col">
                  <h4 className="text-white text-sm font-medium line-clamp-2 min-h-[2.5rem]">
                    {item.market_hash_name || item.store_items?.name || 'Unknown Item'}
                  </h4>
                  
                  {item.exterior && (
                    <div className="w-full">
                      <Badge 
                        variant="outline" 
                        className="text-xs w-full justify-center py-1 px-2 min-h-[1.5rem] whitespace-normal text-center leading-tight"
                      >
                        {item.exterior}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-medium text-sm">
                      ${item.store_items?.price?.toFixed(2) || '0.00'}
                    </span>
                    {item.quantity && item.quantity > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        x{item.quantity}
                      </Badge>
                    )}
                  </div>

                  {/* Deposit Button */}
                  <Button
                    size="sm"
                    onClick={() => handleDepositSkin(item)}
                    disabled={isLoading || depositingItem === item.id || !item.store_items}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xs mt-auto"
                  >
                    {depositingItem === item.id ? (
                      <div className="flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                        Depositing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Plus className="h-3 w-3" />
                        Deposit
                      </div>
                    )}
                  </Button>
                </div>

                {/* Rarity Color Border */}
                {item.rarity_color && (
                  <div 
                    className="absolute inset-0 rounded-lg border-2 pointer-events-none"
                    style={{ borderColor: item.rarity_color }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
