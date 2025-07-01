
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
        (payload) => {
          console.log('Player joined battle:', payload);
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
