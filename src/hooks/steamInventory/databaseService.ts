
import { supabase } from '@/integrations/supabase/client';
import { SteamInventoryItem } from './types';

export class DatabaseService {
  static async upsertInventoryItems(botId: string, items: SteamInventoryItem[]): Promise<void> {
    console.log('[DB-SERVICE] 💾 Upserting', items.length, 'real inventory items for bot:', botId);
    
    const inventoryItems = items.map((item: SteamInventoryItem) => ({
      bot_id: botId,
      steam_item_id: item.assetid,
      market_hash_name: item.market_hash_name || item.name || 'Unknown Item',
      icon_url: item.icon_url ? `https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}/360fx360f` : null,
      tradable: item.tradable === true,
      marketable: item.marketable === true,
      name: item.name || item.market_hash_name || 'Unknown Item',
      exterior: null,
      rarity_color: null,
      last_synced: new Date().toISOString()
    }));

    console.log('[DB-SERVICE] 📝 Prepared real inventory items for upsert:', {
      count: inventoryItems.length,
      sample: inventoryItems.slice(0, 2)
    });

    try {
      const { error: upsertError } = await supabase
        .from('steam_bot_inventory')
        .upsert(inventoryItems, { 
          onConflict: 'bot_id,steam_item_id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('[DB-SERVICE] ❌ Error upserting inventory items:', upsertError);
        throw new Error(`Database upsert failed: ${upsertError.message}`);
      }

      console.log('[DB-SERVICE] ✅ Successfully upserted', inventoryItems.length, 'real inventory items');
    } catch (error) {
      console.error('[DB-SERVICE] ❌ Upsert exception:', error);
      throw error;
    }
  }

  static async markOldItems(botId: string, currentItemIds: string[]): Promise<void> {
    console.log('[DB-SERVICE] 🔄 Marking old items for bot:', botId);
    
    try {
      const { error: markOldError } = await supabase
        .from('steam_bot_inventory')
        .update({ 
          last_synced: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('bot_id', botId)
        .not('steam_item_id', 'in', `(${currentItemIds.map(id => `"${id}"`).join(',')})`);

      if (markOldError) {
        console.warn('[DB-SERVICE] ⚠️ Warning marking old items:', markOldError);
      } else {
        console.log('[DB-SERVICE] ✅ Successfully marked old items');
      }
    } catch (error) {
      console.warn('[DB-SERVICE] ⚠️ Exception marking old items:', error);
    }
  }

  static async syncToStore(): Promise<void> {
    console.log('[DB-SERVICE] 🏪 Syncing bot inventory to store with Hebrew pricing...');
    
    try {
      // Call the RPC function to sync bot inventory to store
      const { data, error: syncError } = await supabase.rpc('sync_bot_inventory_to_store');
      
      if (syncError) {
        console.error('[DB-SERVICE] ❌ Error syncing to store:', syncError);
        throw new Error(`Store sync failed: ${syncError.message}`);
      }

      console.log('[DB-SERVICE] 🏪 Store sync result:', data);
      
      // Get final count of store items
      const { count: storeCount } = await supabase
        .from('store_items')
        .select('*', { count: 'exact', head: true })
        .eq('is_bot_item', true);

      console.log('[DB-SERVICE] ✅ Successfully synced bot inventory to store');
      console.log('[DB-SERVICE] 🏪 Total store items (bot): ', storeCount || 0);
      
    } catch (error) {
      console.error('[DB-SERVICE] ❌ Store sync exception:', error);
      throw error;
    }
  }

  static async checkRecentInventoryItems(): Promise<{ hasRecentItems: boolean; count: number; storeCount: number }> {
    console.log('[DB-SERVICE] 🔍 Checking for recent inventory and store items...');
    
    try {
      // Check bot inventory
      const { data: inventoryItems } = await supabase
        .from('steam_bot_inventory')
        .select('id, last_synced')
        .eq('tradable', true)
        .gte('last_synced', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .limit(1);

      const { data: allItems, count } = await supabase
        .from('steam_bot_inventory')
        .select('id', { count: 'exact' })
        .eq('tradable', true);

      // Check store items
      const { count: storeCount } = await supabase
        .from('store_items')
        .select('id', { count: 'exact' })
        .eq('is_bot_item', true);

      const result = {
        hasRecentItems: !!inventoryItems && inventoryItems.length > 0,
        count: count || 0,
        storeCount: storeCount || 0
      };

      console.log('[DB-SERVICE] 📊 Recent inventory check result:', result);
      return result;
    } catch (error) {
      console.error('[DB-SERVICE] ❌ Recent items check failed:', error);
      return {
        hasRecentItems: false,
        count: 0,
        storeCount: 0
      };
    }
  }

  static async validateStoreSync(): Promise<{ botItems: number; storeItems: number; syncHealthy: boolean }> {
    console.log('[DB-SERVICE] 🔍 Validating store sync health...');
    
    try {
      // Count bot inventory items
      const { count: botCount } = await supabase
        .from('steam_bot_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('tradable', true);

      // Count store items from bot
      const { count: storeCount } = await supabase
        .from('store_items')
        .select('*', { count: 'exact', head: true })
        .eq('is_bot_item', true);

      const syncHealthy = (storeCount || 0) > 0 && (storeCount || 0) >= (botCount || 0) * 0.8; // 80% threshold

      const result = {
        botItems: botCount || 0,
        storeItems: storeCount || 0,
        syncHealthy
      };

      console.log('[DB-SERVICE] 📊 Store sync validation:', result);
      return result;
      
    } catch (error) {
      console.error('[DB-SERVICE] ❌ Store sync validation failed:', error);
      return {
        botItems: 0,
        storeItems: 0,
        syncHealthy: false
      };
    }
  }
}
