
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useBattleSubscriptions = (
  battleId: string | null,
  onBattleUpdate: (payload: any) => void,
  onPlayerJoin: (payload: any) => void
) => {
  useEffect(() => {
    if (!battleId) return;

    console.log('Setting up battle subscriptions for battle:', battleId);

    // Subscribe to battle updates
    const battleChannel = supabase
      .channel(`battle-${battleId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crate_battles',
          filter: `id=eq.${battleId}`
        },
        (payload) => {
          console.log('Battle updated:', payload);
          onBattleUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crate_battle_players',
          filter: `battle_id=eq.${battleId}`
        },
        async (payload) => {
          console.log('Player joined battle:', payload);
          // Fetch the latest battle data and call onBattleUpdate
          const { data: updatedBattle } = await supabase
            .from('crate_battles')
            .select(`
              id,
              creator_id,
              total_value,
              player_count,
              game_mode,
              team_mode,
              crates,
              status,
              created_at,
              crate_battle_players (
                user_id,
                is_bot,
                bot_name,
                team,
                slot_number,
                paid_amount,
                profiles!crate_battle_players_user_id_fkey (
                  nickname,
                  avatar_url,
                  level
                )
              )
            `)
            .eq('id', battleId)
            .single();
          if (updatedBattle) {
            onBattleUpdate({ new: updatedBattle, old: {} });
          }
          onPlayerJoin(payload);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up battle subscriptions');
      // Fix: Check if channel is a RealtimeChannel object before comparing
      if (battleChannel && typeof battleChannel === 'object') {
        supabase.removeChannel(battleChannel);
      }
    };
  }, [battleId, onBattleUpdate, onPlayerJoin]);
};
