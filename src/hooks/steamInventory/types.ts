
export interface SteamInventoryItem {
  assetid: string;
  appid: number;
  contextid: number;
  classid: string;
  instanceid: string;
  market_hash_name: string;
  name?: string;
  icon_url: string;
  tradable: boolean;
  marketable: boolean;
}

export interface SyncDebugInfo {
  steamId: string;
  itemsProcessed: number;
  botUsed: string;
  debugInfo: {
    syncMethod: string;
    processingTimeMs: number;
    steamApiCalls: number;
    priceApiCalls: number;
    pricingMethod: string;
    storeItemsCreated: number;
    privacyValidation?: string;
    errorHandling?: string;
  };
  step: string;
  durationMs: number;
  retryAttempt: number;
  message: string;
}

export interface SyncResult {
  itemCount: number;
  debugInfo?: SyncDebugInfo;
}

export interface SteamInventorySyncHookReturn {
  syncInventory: () => Promise<void>;
  checkSyncStatus: () => Promise<{ itemCount: number; shouldSync: boolean }>;
  loading: boolean;
  debugInfo: SyncDebugInfo | null;
  lastSync?: Date;
  itemCount: number;
}
