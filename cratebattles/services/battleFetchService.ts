
import { supabase } from '@/integrations/supabase/client';
import { PersistentBattle } from '../types/persistentBattleTypes';

export const fetchAvailableBattlesApi = async (): Promise<PersistentBattle[]> => {
  // Get battles with their players
  const { data: battles, error: battlesError } = await supabase
    .from('crate_battles')
    .select(`
      *,
      crate_battle_players (
        *,
        profiles (nickname, avatar_url, level)
      )
    `)
    .eq('status', 'waiting')
    .order('created_at', { ascending: false });

  if (battlesError) throw battlesError;

  // Transform the data to match the expected format
  const transformedBattles: PersistentBattle[] = battles?.map(battle => ({
    id: battle.id,
    creator_id: battle.creator_id,
    total_value: battle.total_value,
    player_count: battle.player_count,
    // Preserve the exact game_mode and team_mode from the database
    game_mode: battle.game_mode || 'default',
    team_mode: battle.team_mode || '1v1',
    crates: Array.isArray(battle.crates) ? battle.crates : [],
    status: battle.status,
    created_at: battle.created_at,
    players: battle.crate_battle_players?.map((player: any) => ({
      id: player.user_id || `bot-${player.id}`,
      name: player.is_bot ? player.bot_name : player.profiles?.nickname || 'Unknown',
      avatar: player.is_bot ? null : player.profiles?.avatar_url,
      isBot: player.is_bot,
      level: player.is_bot ? Math.floor(Math.random() * 50) + 1 : player.profiles?.level || 1,
      team: player.team,
      slotNumber: player.slot_number,
      paidAmount: player.paid_amount
    })) || []
  })) || [];

  console.log('Fetched battles with preserved game modes:', transformedBattles.map(b => ({ id: b.id, game_mode: b.game_mode, team_mode: b.team_mode })));

  return transformedBattles;
};
