
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWheelGameState } from './useWheelGameState';
import { useWheelGameTimer } from './useWheelGameTimer';
import { useWheelGameActions } from './useWheelGameActions';
import { loadCurrentGame as loadGameData } from '@/utils/wheelGameUtils';

export const useWheelGame = () => {
  const { user, profile, refreshProfile } = useAuth();
  
  const {
    isSpinning,
    timeLeft,
    currentGame,
    userBets,
    totalBets,
    playerCount,
    winningSection,
    setIsSpinning,
    setTimeLeft,
    setCurrentGame,
    setUserBets,
    setTotalBets,
    setPlayerCount,
    setWinningSection,
    resetGameState,
    updateGameData
  } = useWheelGameState();

  const loadCurrentGame = async () => {
    const gameData = await loadGameData(user?.id);
    if (gameData) {
      updateGameData(gameData.game, gameData.bets, gameData.uniquePlayerCount);
      
      if (gameData.bets && user?.id) {
        const userBetsForGame = gameData.bets.filter(bet => bet.user_id === user.id);
        setUserBets(userBetsForGame);
      }
    }
  };

  const { handleSpin } = useWheelGameActions({
    currentGame,
    userBets,
    setIsSpinning,
    setTimeLeft,
    setUserBets,
    setWinningSection,
    refreshProfile,
    loadCurrentGame
  });

  useWheelGameTimer({
    timeLeft,
    setTimeLeft,
    isSpinning,
    currentGame,
    onTimerComplete: handleSpin
  });

  useEffect(() => {
    loadCurrentGame();
  }, []);

  return {
    // State
    isSpinning,
    timeLeft,
    currentGame,
    userBets,
    totalBets,
    playerCount,
    winningSection,
    user,
    profile,
    // Actions
    loadCurrentGame,
    handleSpin,
    setUserBets
  };
};
