
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

  useEffect(() => {
    if (waitingTime >= 15 && needsMorePlayers) {
      toast({
        title: 'No Players Found',
        description: 'No other players found. Consider calling a bot to start!',
      });
    }
  }, [waitingTime, needsMorePlayers, toast]);

  useEffect(() => {
    if (countdown === 0 && battleStatus === 'waiting' && !needsMorePlayers) {
      startBattle();
    }
  }, [countdown, battleStatus, needsMorePlayers, startBattle]);
};
