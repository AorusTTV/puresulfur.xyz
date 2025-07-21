import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GameStatus {
  [gameKey: string]: boolean;
}

export const useGameStatus = () => {
  const [gameStatuses, setGameStatuses] = useState<GameStatus>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGameStatuses();
  }, []);

  const loadGameStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('game_settings')
        .select('setting_key, setting_value')
        .like('setting_key', '%_active');

      if (error) {
        console.error('Error loading game statuses:', error);
        return;
      }

      const statuses: GameStatus = {};
      
      // Set default active status for all games
      const gameTypes = ['wheel', 'coinflip', 'jackpot', 'crate_battles', 'minefield', 'plinko', 'dual'];
      gameTypes.forEach(game => {
        statuses[game] = true; // Default to active
      });

      // Apply actual statuses from database
      data?.forEach((setting) => {
        const gameType = setting.setting_key.replace('_active', '');
        statuses[gameType] = setting.setting_value === 'true';
      });

      setGameStatuses(statuses);
    } catch (error) {
      console.error('Error loading game statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const isGameActive = (gameKey: string): boolean => {
    // Map game IDs to database keys
    const gameKeyMap: { [key: string]: string } = {
      'bandit-wheel': 'wheel',
      'coinflip': 'coinflip',
      'jackpot': 'jackpot',
      'crate-battles': 'crate_battles',
      'minefield': 'minefield',
      'plinko': 'plinko',
      'dual': 'dual'
    };

    const dbKey = gameKeyMap[gameKey] || gameKey;
    return gameStatuses[dbKey] ?? true; // Default to active if not found
  };

  const refreshGameStatuses = () => {
    loadGameStatuses();
  };

  return {
    gameStatuses,
    isGameActive,
    loading,
    refreshGameStatuses
  };
};