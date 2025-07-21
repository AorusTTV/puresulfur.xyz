
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useBanCheck = () => {
  const { user, loading: authLoading } = useAuth();
  const [isBanned, setIsBanned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBanStatus = async () => {
      // If auth is still loading, wait
      if (authLoading) {
        return;
      }

      // If no user, not banned
      if (!user) {
        setIsBanned(false);
        setLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_banned')
          .eq('id', user.id)
          .single();

        setIsBanned(profile?.is_banned === true);
      } catch (error) {
        console.error('Error checking ban status:', error);
        setIsBanned(false);
      } finally {
        setLoading(false);
      }
    };

    checkBanStatus();
  }, [user, authLoading]);

  return { isBanned, loading: loading || authLoading };
};
