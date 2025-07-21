
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MuteStatus {
  isMuted: boolean;
  remainingTime: number; // in seconds
  muteReason?: string;
}

export const useMuteStatus = () => {
  const [muteStatus, setMuteStatus] = useState<MuteStatus>({
    isMuted: false,
    remainingTime: 0
  });
  const { user, profile } = useAuth();

  // Check if user is admin (admins are exempt from mutes)
  const isAdmin = profile?.nickname === 'admin';

  useEffect(() => {
    if (!user) {
      setMuteStatus({ isMuted: false, remainingTime: 0 });
      return;
    }

    // Admins are never muted
    if (isAdmin) {
      setMuteStatus({ isMuted: false, remainingTime: 0 });
      return;
    }

    const checkMuteStatus = async () => {
      try {
        console.log('Checking mute status for user:', user.id);
        
        // Get active mute information
        const { data: mutes, error } = await supabase
          .from('user_mutes')
          .select('expires_at, reason')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .order('expires_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error checking mute status:', error);
          // On error, assume not muted to prevent blocking users
          setMuteStatus({ isMuted: false, remainingTime: 0 });
          return;
        }

        if (mutes && mutes.length > 0) {
          const mute = mutes[0];
          const expiresAt = new Date(mute.expires_at);
          const now = new Date();
          const remainingMs = expiresAt.getTime() - now.getTime();
          const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

          console.log('Mute found, remaining seconds:', remainingSeconds);

          setMuteStatus({
            isMuted: remainingSeconds > 0,
            remainingTime: remainingSeconds,
            muteReason: mute.reason
          });
        } else {
          console.log('No active mutes found');
          setMuteStatus({ isMuted: false, remainingTime: 0 });
        }
      } catch (error) {
        console.error('Error in checkMuteStatus:', error);
        // On error, assume not muted to prevent blocking users
        setMuteStatus({ isMuted: false, remainingTime: 0 });
      }
    };

    // Check initially
    checkMuteStatus();

    // Set up real-time subscription to user_mutes table
    const channel = supabase
      .channel('user_mutes_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_mutes',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Mute status changed:', payload);
        // Immediately recheck mute status when changes occur
        checkMuteStatus();
      })
      .subscribe();

    // Check every 5 seconds to update countdown (reduced frequency)
    const interval = setInterval(checkMuteStatus, 5000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  return muteStatus;
};
