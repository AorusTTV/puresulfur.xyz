
import { useState } from 'react';
import type { CoinflipGame } from '@/types/coinflip';

export const useCoinflipGameState = () => {
  const [games, setGames] = useState<CoinflipGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  console.log('useCoinflipGameState - Current states:', {
    gamesCount: games.length,
    isLoading,
    isCreating,
    isJoining
  });

  return {
    games,
    setGames,
    isLoading,
    setIsLoading,
    isCreating,
    setIsCreating,
    isJoining,
    setIsJoining
  };
};
