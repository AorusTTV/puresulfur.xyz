import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  RefreshCcw,
  RefreshCw
} from 'lucide-react';
import { StorePriceValidator } from '@/components/store/StorePriceValidator';

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

export const StoreManagement = () => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStoreItems();
  }, []);

  const fetchStoreItems = async () => {
    try {
      const { data, error } = await supabase
        .from('store_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching store items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load store items',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const syncBotInventory = async () => {
    setSyncing(true);
    try {
      console.log('[STORE-MGMT] Syncing bot inventory to store...');
      
      const { data, error } = await supabase.rpc('sync_bot_inventory_to_store');
      
      if (error) {
        console.error('[STORE-MGMT] Error syncing bot inventory:', error);
        toast({
          title: 'Sync Failed',
          description: 'Failed to sync bot inventory to store',
          variant: 'destructive'
        });
        return;
      }

      const response = data as SyncResponse;

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
      console.error('[STORE-MGMT] Exception syncing bot inventory:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync bot inventory',
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('store_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });

      fetchStoreItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading store items...</div>
        </CardContent>
      </Card>
    );
  }

  const botItems = items.filter(item => item.is_bot_item);
  const regularItems = items.filter(item => !item.is_bot_item);

  return (
    <div className="space-y-6">
      {/* Store Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Store Management Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap mb-4">
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
              {syncing ? 'Syncing...' : 'Sync Bot Inventory'}
            </Button>
            <Button
              onClick={fetchStoreItems}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Items
            </Button>
          </div>
          
          {/* Store Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">Total Items</span>
              </div>
              <div className="text-2xl font-bold">{items.length}</div>
            </div>
            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Bot Items</span>
              </div>
              <div className="text-2xl font-bold text-blue-500">{botItems.length}</div>
            </div>
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Regular Items</span>
              </div>
              <div className="text-2xl font-bold text-green-500">{regularItems.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Price Validation */}
      <StorePriceValidator items={items} />

      {/* Store Items Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Store Items ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="relative">
                <CardContent className="p-4">
                  <div className="aspect-square rounded-lg mb-3 flex items-center justify-center bg-secondary">
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{item.name}</h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {item.rarity}
                    </Badge>
                    <div className="flex items-center text-primary font-bold text-sm">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {item.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>Stock: {item.in_stock}</span>
                    {item.is_bot_item && (
                      <Badge variant="secondary" className="text-xs">Bot Item</Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingItem(item)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No store items found</p>
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
        </CardContent>
      </Card>
    </div>
  );
};
