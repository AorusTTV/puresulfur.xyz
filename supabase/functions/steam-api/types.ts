
export interface SteamItem {
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
  pos: number;
  market_hash_name?: string;
  icon_url?: string;
  tradable?: boolean;
  marketable?: boolean;
  name?: string;
  type?: string;
  market_value?: number;
}

export interface SteamInventoryResponse {
  assets?: SteamItem[];
  descriptions?: Array<{
    classid: string;
    instanceid: string;
    market_hash_name: string;
    icon_url: string;
    tradable: number;
    marketable: number;
    name: string;
    type: string;
  }>;
  success?: number;
  error?: string;
}

export interface TradeOfferResponse {
  tradeofferid?: string;
  needs_mobile_confirmation?: boolean;
  needs_email_confirmation?: boolean;
  email_domain?: string;
}

export interface ProcessedInventoryItem {
  assetid: string;
  classid: string;
  instanceid: string;
  market_hash_name: string;
  icon_url: string;
  tradable: boolean;
  marketable: boolean;
  name: string;
  type: string;
  estimated_value: number;
}
