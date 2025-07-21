
import { useState, useEffect } from 'react';
import { jackpotService } from '@/services/jackpotService';
import type { JackpotGameData, JackpotEntryData } from '@/types/jackpot';

export const useJackpotGame = () => {
  const [currentGame, setCurrentGame] = useState<JackpotGameData | null>(null);
  const [entries, setEntries] = useState<JackpotEntryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [userInventory, setUserInventory] = useState<any[]>([]);

  const fetchCurrentGame = async () => {
    const game = await jackpotService.fetchCurrentGame();
    setCurrentGame(game);
  };

  const fetchEntries = async () => {
    if (!currentGame) return;
    const gameEntries = await jackpotService.fetchEntries(currentGame.id);
    setEntries(gameEntries);
  };

  const refreshGame = async () => {
    setIsLoading(true);
    try {
      await fetchCurrentGame();
      await fetchEntries();
    } finally {
      setIsLoading(false);
    }
  };

  const joinGame = async (userId: string, amount: number) => {
    setIsLoading(true);
    try {
      const success = await jackpotService.joinGame(userId, amount);
      if (success) {
        await fetchCurrentGame();
        await fetchEntries();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  const depositSkin = async (userId: string, itemId: string, value: number) => {
    setIsLoading(true);
    try {
      const success = await jackpotService.depositSkin(userId, itemId, value);
      if (success) {
        await fetchCurrentGame();
        await fetchEntries();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  const addBalanceEntry = async (userId: string, amount: number) => {
    return await joinGame(userId, amount);
  };

  const addItemEntry = async (userId: string, itemId: string, value: number) => {
    return await depositSkin(userId, itemId, value);
  };

  useEffect(() => {
    fetchCurrentGame();
  }, []);

  useEffect(() => {
    if (currentGame) {
      fetchEntries();
    }
  }, [currentGame]);

  return {
    currentGame,
    entries,
    isLoading,
    loading: isLoading,
    history,
    userInventory,
    fetchCurrentGame,
    fetchEntries,
    refreshGame,
    joinGame,
    depositSkin,
    addBalanceEntry,
    addItemEntry
  };
};

// Re-export types for backward compatibility
export type { JackpotGameData, JackpotEntryData };
