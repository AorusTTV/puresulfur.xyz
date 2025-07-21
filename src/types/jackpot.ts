
export interface JackpotGameData {
  id: string;
  total_value: number;
  status: 'active' | 'drawing' | 'completed';
  created_at: string;
  winner_id?: string;
  house_fee?: number;
  winner_prize?: number;
}

export interface JackpotEntryData {
  id: string;
  user_id: string;
  value: number;
  ticket_start: number;
  ticket_end: number;
  created_at: string;
  entry_type: string;
  profiles: {
    steam_username: string;
    avatar_url: string;
  } | null;
}
