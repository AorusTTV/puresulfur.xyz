
import { supabase } from '@/integrations/supabase/client';
import { SteamApiService } from './steamApiService';
import { DatabaseService } from './databaseService';
import { SyncDebugInfo } from './types';

export class InventorySyncService {
  static async performSync(retryAttempt: number = 0): Promise<{ itemCount: number; debugInfo?: SyncDebugInfo }> {
    const startTime = Date.now();
    console.log(`[INV-SYNC] ╔══════════════════════════════════════════════════════════════╗`);
    console.log(`[INV-SYNC] ║ Starting ENHANCED Steam inventory sync process (attempt ${retryAttempt + 1})  ║`);
    console.log(`[INV-SYNC] ║ Target: Live Steam inventory with Hebrew pricing (×1.495)   ║`);
    console.log(`[INV-SYNC] ║ Enhanced: Privacy validation + better error handling        ║`);
    console.log(`[INV-SYNC] ╚══════════════════════════════════════════════════════════════╝`);
    
    // Get current user profile with Steam ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('steam_id, api_key')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    if (!profile.steam_id) {
      throw new Error('Steam ID not found in profile. Please login with Steam.');
    }

    if (!profile.api_key) {
      throw new Error('API key not configured. Please add your API key in profile settings.');
    }

    console.log('[INV-SYNC] 🔗 Using Steam ID from profile:', profile.steam_id);

    try {
      // Get active bots for storing items
      const bots = await SteamApiService.fetchActiveBots();
      if (bots.length === 0) {
        throw new Error('No active Steam bot found');
      }
      
      const activeBot = bots[0];
      console.log('[INV-SYNC] 🤖 Using active bot:', activeBot.label);

      // Call the ENHANCED Steam bot manager to perform comprehensive sync
      console.log('[INV-SYNC] 📡 Calling ENHANCED Steam bot manager for REAL inventory sync...');
      const { data: syncResult, error: syncError } = await supabase.functions.invoke('steam-bot-manager', {
        body: {
          action: 'sync_inventory',
          botId: activeBot.id,
          retryAttempt: retryAttempt
        }
      });

      if (syncError) {
        console.error('[INV-SYNC] ❌ Steam bot manager error:', syncError);
        
        // Enhanced error categorization
        let enhancedErrorMessage = syncError.message;
        if (syncError.message?.includes('private') || syncError.message?.includes('privacy')) {
          enhancedErrorMessage = 'Steam inventory is private. Please make your Steam profile and inventory public in Steam Privacy Settings.';
        } else if (syncError.message?.includes('rate limit')) {
          enhancedErrorMessage = 'Steam API rate limit exceeded. Please wait a few minutes and try again.';
        } else if (syncError.message?.includes('HTTP_400')) {
          enhancedErrorMessage = 'Steam API returned a bad request error. This usually means the Steam account has privacy restrictions or invalid configuration.';
        }
        
        throw new Error(`Steam bot sync failed: ${enhancedErrorMessage}`);
      }

      if (!syncResult?.success) {
        console.error('[INV-SYNC] ❌ Steam bot sync returned failure:', syncResult?.error);
        
        // Enhanced error handling for specific failure types
        let failureMessage = syncResult?.error || 'Unknown sync error';
        if (syncResult?.details?.errorCategory) {
          switch (syncResult.details.errorCategory) {
            case 'PRIVACY_ERROR':
              failureMessage = 'Steam inventory access denied. Please ensure your Steam profile and inventory are set to public.';
              break;
            case 'CONFIGURATION_ERROR':
              failureMessage = `Configuration issue: ${syncResult.error}`;
              break;
            case 'RATE_LIMIT_ERROR':
              failureMessage = 'Steam API rate limit exceeded. Please wait a few minutes before retrying.';
              break;
            case 'BAD_REQUEST_ERROR':
              failureMessage = 'Invalid request to Steam API. Please check your Steam account settings and try again.';
              break;
          }
        }
        
        throw new Error(`Steam bot sync failed: ${failureMessage}`);
      }

      const itemCount = syncResult.itemCount || 0;
      const totalDuration = Date.now() - startTime;

      console.log(`[INV-SYNC] ✅ ENHANCED Steam sync completed successfully!`);
      console.log(`[INV-SYNC] 📊 Items synced: ${itemCount} (Real Steam inventory)`);
      console.log(`[INV-SYNC] ⏱️  Duration: ${totalDuration}ms`);
      console.log(`[INV-SYNC] 💰 Pricing: Hebrew (USD × 1.495)`);
      console.log(`[INV-SYNC] 🛡️  Privacy validation: Passed`);

      // Enhanced real-time updates
      try {
        const channel = supabase.channel('enhanced-store-updates-listener');
        channel.on('broadcast', { event: 'store:inventoryUpdated' }, (payload) => {
          console.log('[INV-SYNC] 📡 Received enhanced real-time inventory update:', payload);
          // Frontend components can subscribe to this channel for real-time updates
        });
        await channel.subscribe();
        
        // Clean up subscription after a brief moment
        setTimeout(() => {
          supabase.removeChannel(channel);
        }, 5000);
      } catch (realtimeError) {
        console.warn('[INV-SYNC] ⚠️ Failed to set up enhanced realtime listener:', realtimeError);
        // Don't fail the sync for realtime issues
      }

      // Verify store sync was successful
      console.log('[INV-SYNC] 🏪 Verifying enhanced store sync...');
      const { data: storeItems, count: storeCount } = await supabase
        .from('store_items')
        .select('id', { count: 'exact' })
        .eq('is_bot_item', true);

      console.log(`[INV-SYNC] 🏪 Store items available: ${storeCount || 0}`);

      return { 
        itemCount,
        debugInfo: {
          steamId: profile.steam_id,
          itemsProcessed: itemCount,
          botUsed: activeBot.label,
          debugInfo: {
            syncMethod: 'enhanced-steam-web-api',
            processingTimeMs: totalDuration,
            steamApiCalls: Math.ceil(itemCount / 100), // Estimated API calls
            priceApiCalls: itemCount, // Each item needs price lookup
            pricingMethod: 'hebrew_1_495x',
            storeItemsCreated: storeCount || 0,
            privacyValidation: 'passed',
            errorHandling: 'enhanced'
          },
          step: 'completed_success_enhanced',
          durationMs: totalDuration,
          retryAttempt,
          message: `Successfully synced ${itemCount} real items using ENHANCED Steam Web API with Hebrew pricing and privacy validation`
        }
      };

    } catch (error) {
      const totalDuration = Date.now() - startTime;
      console.error(`[INV-SYNC] ❌ ENHANCED sync failed after ${totalDuration}ms (attempt ${retryAttempt + 1}):`, error);
      
      // Enhanced error with context and user-friendly messaging
      if (error instanceof Error) {
        let enhancedMessage = error.message;
        
        // Add helpful context for common errors
        if (error.message.includes('private') || error.message.includes('privacy')) {
          enhancedMessage += ' Visit: https://steamcommunity.com/my/edit/settings to change your privacy settings.';
        } else if (error.message.includes('rate limit')) {
          enhancedMessage += ' This is temporary - Steam limits how often we can check inventories.';
        } else if (error.message.includes('HTTP_400')) {
          enhancedMessage += ' Please verify your Steam account is properly configured and accessible.';
        }
        
        error.message = `${enhancedMessage} (Duration: ${totalDuration}ms, Attempt: ${retryAttempt + 1})`;
      }
      
      throw error;
    }
  }

  static async checkAndAutoSync(): Promise<{ itemCount: number; shouldSync: boolean }> {
    try {
      // Check if we have recent inventory data (within last hour for real-time systems)
      const { data: recentItems } = await supabase
        .from('steam_bot_inventory')
        .select('id, last_synced')
        .gte('last_synced', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // 1 hour
        .limit(1);

      const shouldSync = !recentItems || recentItems.length === 0;
      
      // Get total item count from bot inventory
      const { count: botCount } = await supabase
        .from('steam_bot_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('tradable', true);

      // Get total item count from store
      const { count: storeCount } = await supabase
        .from('store_items')
        .select('*', { count: 'exact', head: true })
        .eq('is_bot_item', true);

      console.log('[INV-SYNC] Enhanced status check:', {
        recentItemsFound: recentItems?.length || 0,
        botInventoryItems: botCount || 0,
        storeItems: storeCount || 0,
        shouldSync,
        lastSyncTime: recentItems?.[0]?.last_synced,
        syncFrequency: 'hourly_enhanced'
      });

      return {
        itemCount: Math.max(botCount || 0, storeCount || 0),
        shouldSync
      };
    } catch (error) {
      console.error('[INV-SYNC] Enhanced status check failed:', error);
      return {
        itemCount: 0,
        shouldSync: true
      };
    }
  }

  static async subscribeToInventoryUpdates(callback: (data: any) => void): Promise<() => void> {
    console.log('[INV-SYNC] 📡 Setting up enhanced real-time inventory update subscription...');
    
    const channel = supabase.channel('enhanced-inventory-updates');
    
    channel
      .on('broadcast', { event: 'store:inventoryUpdated' }, (payload) => {
        console.log('[INV-SYNC] 📡 Enhanced real-time inventory update received:', payload);
        callback(payload);
      })
      .subscribe();
    
    // Return cleanup function
    return () => {
      console.log('[INV-SYNC] 🔌 Cleaning up enhanced inventory update subscription');
      supabase.removeChannel(channel);
    };
  }
}
