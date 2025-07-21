
export interface DebugPricingLayer {
  '1_steam_request'?: {
    url: string;
    headers: Record<string, string>;
    raw_response: any;
    currency_used: string;
    lowest_sell_order_cents: number;
  };
  '2_worker_computation'?: {
    lowest_sell_cents: number;
    ask_usd: number;
    multiplier: number;
    final_price: number;
    formula: string;
    expected_result: string;
    calculation_correct: boolean;
  };
  '3_db_write'?: {
    rows_affected: number;
    update_error: string | null;
    update_success: boolean;
  };
  '4_db_verification'?: {
    price_before: number;
    price_after: number;
    updated_at: string;
    verification_success: boolean;
    item_id: string;
  };
  '5_cache_simulation'?: {
    cache_key: string;
    cached_value: number;
    ttl_seconds: number;
    cache_status: string;
  };
  '6_api_output'?: {
    total_same_name_items: number;
    unique_prices: number[];
    price_consistency: boolean;
    all_items: any[];
  };
  '7_frontend_data'?: {
    store_query_items: number;
    store_prices: number[];
    frontend_consistency: boolean;
  };
}

export interface DebugPricingAnalysis {
  item_lookup_successful: boolean;
  steam_request_valid: boolean;
  computation_correct: boolean;
  db_update_successful: boolean;
  price_verification_passed: boolean;
  consistency_check_passed: boolean;
  overall_pipeline_health: string;
}

export interface DebugPricingResult {
  success: boolean;
  item: string;
  item_id: string;
  requested_name: string;
  timestamp: string;
  layers: DebugPricingLayer;
  analysis: DebugPricingAnalysis;
  error?: string;
}

export type DebugPricingResults = Record<string, DebugPricingResult>;
