
import { supabase } from '@/integrations/supabase/client';
import { RustCrate } from '../rustCrateData';
import { DatabaseBattleResponse } from '../types/persistentBattleTypes';

export const createPersistentBattleApi = async (
  creatorId: string,
  battleCrates: Array<{crate: RustCrate, quantity: number}>,
  playerCount: number,
  gameMode: string,
  teamMode: string
): Promise<DatabaseBattleResponse | null> => {
  const totalCost = battleCrates.reduce((total, item) => total + (item.crate.price * item.quantity), 0);
  
  // Log the payload for debugging
  const payload = {
    p_creator_id: creatorId,
    p_total_value: totalCost,
    p_player_count: playerCount,
    p_game_mode: gameMode,
    p_team_mode: teamMode,
    p_crates: battleCrates.map(({ crate, quantity }) => ({
      crate_id: crate.id,
      quantity
    }))
  };
  console.log('Payload for create_crate_battle:', JSON.stringify(payload, null, 2));

  const { data, error } = await supabase.rpc('create_crate_battle', payload);

  // Debug logging
  console.log('create_crate_battle RPC result:', { data, error });

  if (error) throw error;

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No battle returned from create_crate_battle');
  }
  return data[0] as unknown as DatabaseBattleResponse;
};

export const joinPersistentBattleApi = async (
  battleId: string,
  userId: string
): Promise<DatabaseBattleResponse | null> => {
  const { data, error } = await supabase.rpc('join_crate_battle', {
    p_battle_id: battleId,
    p_user_id: userId
  });
  console.log(data,'adfadsf')
  if (error) {
    console.error(error);
    throw error;
  }
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No battle returned from join_crate_battle');
  }
  const battle = data[0]; // Use the first row

  return battle as unknown as DatabaseBattleResponse;
};

export const addBotToSlotApi = async (
  battleId: string,
  slotNumber: number,
  requesterId: string
): Promise<DatabaseBattleResponse | null> => {
  const { data, error } = await supabase.rpc('add_bot_to_battle_slot', {
    p_battle_id: battleId,
    p_slot_number: slotNumber,
    p_requester_id: requesterId
  });

  if (error) throw error;

  return data as unknown as DatabaseBattleResponse;
};
