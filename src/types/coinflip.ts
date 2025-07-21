
export interface CoinflipGame {
  id: string;
  creator_id: string;
  creator_side: string;
  creator_bet_amount: number;
  creator_entry_type: string;
  joiner_id?: string;
  joiner_side?: string;
  joiner_bet_amount?: number;
  joiner_entry_type?: string;
  winner_id?: string;
  winning_side?: string;
  status: string;
  total_value: number;
  created_at: string;
  completed_at?: string;
}

export interface CreateGameParams {
  side: 'heads' | 'tails';
  betAmount: number;
  entryType: 'balance' | 'item';
  itemId?: string;
}

export interface JoinGameParams {
  gameId: string;
  entryType: 'balance' | 'item';
  itemId?: string;
}

export interface GameResponse {
  success: boolean;
  error?: string;
  game_id?: string;
  bet_amount?: number;
  winner_id?: string;
  winning_side?: string;
  total_payout?: number;
  is_winner?: boolean;
  is_bot_game?: boolean;
}
