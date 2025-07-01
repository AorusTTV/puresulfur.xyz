
import { useState, useEffect } from 'react';

export const useBattleStatus = (initialBattle: any) => {
  const [battleStatus, setBattleStatus] = useState<'waiting' | 'rolling' | 'finished'>('waiting');
  const [battleData, setBattleData] = useState(initialBattle);
  const [countdown, setCountdown] = useState(5);
  const [waitingTime, setWaitingTime] = useState(0);

  const playersJoined = battleData?.players?.length || 1;
  const needsMorePlayers = playersJoined < (battleData?.playerCount || 2);

  // Effect for waiting time
  useEffect(() => {
    if (needsMorePlayers && battleStatus === 'waiting') {
      const timer = setInterval(() => {
        setWaitingTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [needsMorePlayers, battleStatus]);

  // Effect for countdown
  useEffect(() => {
    if (battleStatus === 'waiting' && !needsMorePlayers && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, battleStatus, needsMorePlayers]);

  return {
    battleStatus,
    setBattleStatus,
    battleData,
    setBattleData,
    countdown,
    setCountdown,
    waitingTime,
    setWaitingTime,
    playersJoined,
    needsMorePlayers
  };
};
