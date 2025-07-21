export interface DualWeapon {
  id: string;
  name: string;
  image_url: string;
  damage: number;
  accuracy: number;
  fire_rate: number;
  rarity: string;
  created_at: string;
}

export interface DualGame {
  id: string;
  creator_id: string;
  creator_side: string;
  creator_bet_amount: number;
  creator_entry_type: string;
  creator_item_id?: string;
  joiner_id?: string;
  joiner_side?: string;
  joiner_bet_amount?: number;
  joiner_entry_type?: string;
  joiner_item_id?: string;
  status: 'waiting' | 'battle' | 'completed';
  winner_id?: string;
  total_value: number;
  battle_result?: {
    creator_weapon: DualWeapon;
    joiner_weapon: DualWeapon;
    battle_sequence: any[];
  };
  created_at: string;
  completed_at?: string;
  // Joined properties from queries
  creator?: any;
  joiner?: any;
  winner?: any;
}

export interface DualGameResult {
  success: boolean;
  winner_id?: string;
  total_payout?: number;
  is_winner?: boolean;
  is_bot_game?: boolean;
  battle_result?: any;
  error?: string;
  game_id?: string;
}