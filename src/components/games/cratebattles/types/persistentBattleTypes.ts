
export interface BattlePlayer {
  user_id: string;
  slot_number: number;
  name?: string;
  avatar?: string;
  isBot?: boolean;
  team?: string;
  level?: number;
}

export interface DatabaseBattleResponse {
  id: string;
  creator_id: string;
  total_value: number;
  player_count: number;
  game_mode: string;
  team_mode: string;
  crates: any[];
  status: string;
  created_at: string;
  started_at?: string;
  players: BattlePlayer[];
}

export interface PersistentBattle extends DatabaseBattleResponse {}
