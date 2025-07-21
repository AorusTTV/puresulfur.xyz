
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InventorySyncService } from './steamInventory/inventorySyncService';
import { SyncDebugInfo, SteamInventorySyncHookReturn } from './steamInventory/types';

export const useSteamInventorySync = (): SteamInventorySyncHookReturn => {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<SyncDebugInfo | null>(null);
  const [lastSync, setLastSync] = useState<Date | undefined>();
  const [itemCount, setItemCount] = useState(0);
  const { toast } = useToast();

  const syncInventory = useCallback(async (retryAttempt: number = 0) => {
    if (loading) {
      console.log('[SYNC-HOOK] Sync already in progress, ignoring request');
      return;
    }

    setLoading(true);
    setDebugInfo(null);

    try {
      console.log('[SYNC-HOOK] 🚀 Starting REAL Steam inventory sync...');
      
      toast({
        title: '🔄 Starting Real Steam Sync',
        description: 'Connecting to Steam Web API with Hebrew pricing...',
      });

      const result = await InventorySyncService.performSync(retryAttempt);
      
      if (result.debugInfo) {
        setDebugInfo(result.debugInfo);
        console.log('[SYNC-HOOK] Debug info:', result.debugInfo);
      }

      setItemCount(result.itemCount);
      setLastSync(new Date());

      toast({
        title: '✅ Real Steam Sync Complete!',
        description: `Successfully synced ${result.itemCount} real Steam items with Hebrew pricing (USD × 1.495)`,
      });

      console.log('[SYNC-HOOK] ✅ REAL Steam sync completed successfully');
      
    } catch (error) {
      console.error('[SYNC-HOOK] ❌ REAL Steam sync failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      
      // Check if this is a retryable error
      const isRetryable = errorMessage.includes('RATE_LIMIT') || 
                         errorMessage.includes('SERVER_ERROR') || 
                         errorMessage.includes('timeout');
      
      if (isRetryable && retryAttempt < 2) {
        console.log('[SYNC-HOOK] 🔄 Retrying sync due to retryable error...');
        toast({
          title: '⚠️ Sync Issue - Retrying',
          description: `Encountered ${errorMessage}, retrying in a moment...`,
          variant: 'destructive',
        });
        
        // Retry after a brief delay
        setTimeout(() => {
          syncInventory(retryAttempt + 1);
        }, 3000);
        
      } else {
        toast({
          title: '❌ Real Steam Sync Failed',
          description: `Failed to sync real Steam inventory: ${errorMessage}`,
          variant: 'destructive',
        });
      }
      
    } finally {
      setLoading(false);
    }
  }, [loading, toast]);

  const checkSyncStatus = useCallback(async () => {
    try {
      const result = await InventorySyncService.checkAndAutoSync();
      return result;
    } catch (error) {
      console.warn('[SYNC-HOOK] Status check failed:', error);
      return { itemCount: 0, shouldSync: true };
    }
  }, []);

  return {
    syncInventory: () => syncInventory(0),
    checkSyncStatus,
    loading,
    debugInfo,
    lastSync,
    itemCount
  };
};
