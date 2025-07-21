
import { useState } from 'react';

const ROUND_DURATION = 30; // seconds

interface WheelGameState {
  isSpinning: boolean;
  timeLeft: number;
  currentGame: any;
  userBets: any[];
  totalBets: number;
  playerCount: number;
  winningSection: number | null;
}

export const useWheelGameState = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentGame, setCurrentGame] = useState<any>(null);
  const [userBets, setUserBets] = useState<any[]>([]);
  const [totalBets, setTotalBets] = useState(0);
  const [playerCount, setPlayerCount] = useState(0);
  const [winningSection, setWinningSection] = useState<number | null>(null);

  const resetGameState = () => {
    setUserBets([]);
    setTimeLeft(30);
    setWinningSection(null);
    setIsSpinning(false);
  };

  const updateGameData = (gameData: any, bets: any[], uniquePlayerCount: number) => {
    setCurrentGame(gameData);
    setTotalBets(gameData?.total_bets || 0);
    setPlayerCount(uniquePlayerCount);

    // Calculate global timeLeft from backend created_at
    if (gameData?.created_at) {
      const now = Date.now();
      const created = Date.parse(gameData.created_at);
      let secondsElapsed = Math.floor((now - created) / 1000);
      let newTimeLeft = ROUND_DURATION - secondsElapsed;
      if (gameData.status === 'spinning' || gameData.status === 'completed') {
        newTimeLeft = 0;
      }
      setTimeLeft(newTimeLeft > 0 ? newTimeLeft : 0);
    }

    // Wheel animation/result sync
    if ((gameData.status === 'spinning' || gameData.status === 'completed') && gameData.winning_index !== null && gameData.winning_index !== undefined) {
      setIsSpinning(true);
      setWinningSection(gameData.winning_index);
    } else if (gameData.status === 'active') {
      setIsSpinning(false);
      setWinningSection(null);
    }

    // Only set user bets if the game is active (not completed)
    if (gameData?.status === 'active' && bets) {
      const userBetsForGame = bets.filter(bet => bet.user_id === gameData?.user_id);
      setUserBets(userBetsForGame);
    } else {
      setUserBets([]);
    }
  };

  return {
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
  };
};
