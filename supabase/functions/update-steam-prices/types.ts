
export interface SteamMarketResponse {
  success?: boolean;
  lowest_sell_order?: number; // Price in cents (USD when currency=1)
  highest_buy_order?: number;
}

export interface UpdateResult {
  success: boolean;
  message: string;
  timestamp: string;
  itemsProcessed: number;
  successCount: number;
  errorCount: number;
}
