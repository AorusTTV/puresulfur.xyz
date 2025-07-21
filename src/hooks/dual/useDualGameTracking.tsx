import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDualGameTracking = (currentUserId?: string) => {
  const [userGames, setUserGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUserGames = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      
      // Get games where user is creator or joiner
      const { data, error } = await supabase
        .from('dual_games')
        .select('*')
        .or(`creator_id.eq.${currentUserId},joiner_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[DUAL-TRACKING] Error loading user games:', error);
        return;
      }

      setUserGames(data || []);
    } catch (error) {
      console.error('[DUAL-TRACKING] Error in loadUserGames:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserGames();
    
    // Refresh user games every 5 seconds
    const interval = setInterval(loadUserGames, 5000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const getUserActiveGame = () => {
    return userGames.find(game => 
      game.status === 'waiting' && 
      (game.creator_id === currentUserId || game.joiner_id === currentUserId)
    );
  };

  const getUserCompletedGames = () => {
    return userGames.filter(game => 
      game.status === 'completed' && 
      (game.creator_id === currentUserId || game.joiner_id === currentUserId)
    );
  };

  return {
    userGames,
    loading,
    getUserActiveGame,
    getUserCompletedGames,
    refreshUserGames: loadUserGames
  };
}; 