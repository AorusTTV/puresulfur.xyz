// src/components/games/cratebattles/hooks/useBattleWaitingEffects.ts
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useBattleWaitingEffects = (
  waitingTime: number,
  needsMorePlayers: boolean,
  countdown: number,
  battleStatus: 'waiting' | 'rolling' | 'finished',
  startBattle: () => void
) => {
  const { toast } = useToast();

  // If we've been waiting for 15s without enough players, prompt to call a bot
  useEffect(() => {
    if (waitingTime >= 15 && needsMorePlayers) {
      toast({
        title: 'No Players Found',
        description: 'No other players found. Consider calling a bot to start!',
      });
    }
  }, [waitingTime, needsMorePlayers, toast]);

  // When countdown hits zero (and we're still in “waiting”), kick off the battle
  useEffect(() => {
    if (countdown === 0 && battleStatus === 'waiting' && !needsMorePlayers) {
      console.log('[WAIT] countdown hit 0 — calling startBattle');
      startBattle();
    }
  }, [countdown, battleStatus, needsMorePlayers, startBattle]);
};
