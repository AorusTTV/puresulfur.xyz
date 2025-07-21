
export interface CreateAffiliateCodeResponse {
  success: boolean;
  code?: string;
  error?: string;
}

export interface UpdateAffiliateCodeResponse {
  success: boolean;
  code?: string;
  error?: string;
}

export interface ApplyAffiliateCodeResponse {
  success: boolean;
  error?: string;
}

export interface ChangeAffiliateCodeResponse {
  success: boolean;
  code?: string;
  error?: string;
  next_change_available?: string;
}

export interface PayAffiliateCommissionsResponse {
  success: boolean;
  amount_paid?: number;
}

// Extended profile type that includes affiliate_code_used and affiliate_code_changed_at
export interface ExtendedProfile {
  id: string;
  nickname?: string;
  steam_username?: string;
  avatar_url?: string;
  level: number;
  experience?: number;
  balance?: number;
  steam_id?: string;
  steam_trade_url?: string;
  api_key?: string;
  affiliate_code_used?: string;
  affiliate_code_changed_at?: string;
  leaderboard_disabled?: boolean;
  is_banned?: boolean;
  age_verified?: boolean;
  birth_date?: string;
  terms_accepted_at?: string;
  jurisdiction_confirmed?: boolean;
  total_wagered?: number;
  referred_by?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  // Daily case requirements fields
  steam_profile_public?: boolean;
  owns_rust?: boolean;
  steam_name?: string;
  steam_level?: number;
  joined_discord?: boolean;
}
