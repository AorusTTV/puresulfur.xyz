
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LevelUpGift {
  id: string;
  level: number;
  sulfur_amount: number;
  claimed: boolean;
  created_at: string;
}

export const useLevelUpGifts = () => {
  const [gifts, setGifts] = useState<LevelUpGift[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGifts = async () => {
    if (!user) {
      setGifts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('level_up_gifts')
        .select('*')
        .eq('user_id', user.id)
        .order('level', { ascending: false });

      if (error) throw error;

      setGifts(data || []);
    } catch (error) {
      console.error('Error fetching level up gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshGifts = () => {
    fetchGifts();
  };

  useEffect(() => {
    fetchGifts();
  }, [user]);

  const unclaimedGifts = gifts.filter(gift => !gift.claimed);
  const hasUnclaimedGifts = unclaimedGifts.length > 0;

  return {
    gifts,
    unclaimedGifts,
    hasUnclaimedGifts,
    loading,
    refreshGifts
  };
};
