
export interface PersistentBattle {
  id: string;
  creator_id: string;
  total_value: number;
  player_count: number;
  game_mode: string;
  team_mode: string;
  crates: any[];
  status: string;
  created_at: string;
  players: any[];
}

export interface DatabaseBattleResponse {
  success: boolean;
  error?: string;
  battle_id?: string;
  bot_name?: string;
  slot_number?: number;
}
