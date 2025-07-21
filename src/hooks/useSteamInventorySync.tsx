
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { InventorySyncService } from './steamInventory/inventorySyncService';

export const useSteamInventorySync = () => {
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | undefined>();
  const [itemCount, setItemCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const { profile } = useAuth();

  const syncInventory = async (isRetry: boolean = false) => {
    setLoading(true);
    const currentRetry = isRetry ? retryCount : 0;
    
    try {
      console.log(`[STEAM-SYNC] Starting enhanced inventory sync (attempt ${currentRetry + 1})...`);
      
      // Check if user has Steam ID
      if (!profile?.steam_id) {
        toast({
          title: 'Steam Account Required',
          description: 'Please login with Steam to sync your inventory',
          variant: 'destructive'
        });
        return;
      }
      
      // Check if user has an API key configured
      if (!profile?.api_key) {
        toast({
          title: 'API Key Required',
          description: 'Please add your Steam API key in your profile settings to sync inventory data',
          variant: 'destructive'
        });
        return;
      }
      
      const result = await InventorySyncService.performSync(currentRetry);
      
      console.log('[STEAM-SYNC] Enhanced sync completed:', result);
      
      setItemCount(result.itemCount);
      setLastSync(new Date());
      setDebugInfo(result.debugInfo || null);
      
      // Reset retry count on success
      setRetryCount(0);
      
      const successMessage = result.itemCount > 0 
        ? `Successfully synced ${result.itemCount} items from your Steam inventory with enhanced validation`
        : 'Enhanced inventory sync completed - no items found (may be under trade hold, private, or empty)';
      
      toast({
        title: 'Enhanced Inventory Synced',
        description: successMessage,
      });
      
    } catch (error) {
      console.error('[STEAM-SYNC] Enhanced sync failed:', error);
      
      // Increment retry count for failed syncs
      if (isRetry) {
        setRetryCount(prev => prev + 1);
      } else {
        setRetryCount(1);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync Steam inventory. Please try again.';
      const retryText = retryCount > 0 ? ` (Attempt ${retryCount + 1})` : '';
      
      // Enhanced error categorization for user
      let userFriendlyTitle = 'Sync Failed';
      if (errorMessage.includes('private') || errorMessage.includes('privacy')) {
        userFriendlyTitle = 'Privacy Issue';
      } else if (errorMessage.includes('rate limit')) {
        userFriendlyTitle = 'Rate Limit Exceeded';
      } else if (errorMessage.includes('HTTP_400')) {
        userFriendlyTitle = 'Steam API Error';
      }
      
      toast({
        title: userFriendlyTitle,
        description: `${errorMessage}${retryText}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const retrySync = async () => {
    if (retryCount >= 3) {
      toast({
        title: 'Maximum Retries Reached',
        description: 'Please check your Steam profile settings, ensure your inventory is public, and verify your API key configuration.',
        variant: 'destructive'
      });
      return;
    }
    
    await syncInventory(true);
  };

  const checkSyncStatus = async () => {
    try {
      console.log('[STEAM-SYNC] Checking enhanced sync status...');
      
      const result = await InventorySyncService.checkAndAutoSync();
      
      console.log('[STEAM-SYNC] Enhanced sync status:', result);
      
      if (result.shouldSync && profile?.steam_id && profile?.api_key) {
        toast({
          title: 'Enhanced Inventory Sync Recommended',
          description: 'Your inventory data appears to be outdated. Consider syncing your Steam inventory with enhanced validation.',
        });
      }
      
      return result;
    } catch (error) {
      console.error('[STEAM-SYNC] Enhanced status check failed:', error);
      return {
        itemCount: 0,
        shouldSync: true
      };
    }
  };

  return {
    syncInventory: () => syncInventory(false),
    retrySync,
    checkSyncStatus,
    loading,
    lastSync,
    itemCount,
    debugInfo,
    retryCount,
    canRetry: retryCount < 3
  };
};
