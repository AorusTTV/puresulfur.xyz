
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { supabase } from '@/integrations/supabase/client';

export const useNotificationListeners = () => {
  const { user, refreshProfile } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up notification listeners for user:', user.id);

    // Listen for tip notifications
    const tipsChannel = supabase
      .channel('tips_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tips',
          filter: `recipient_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Tip received via real-time:', payload);
          
          // Refresh user's balance immediately
          await refreshProfile();
          
          // Get sender information
          const { data: senderProfile, error } = await supabase
            .from('profiles')
            .select('nickname, steam_username')
            .eq('id', payload.new.sender_id)
            .single();

          if (error) {
            console.error('Error fetching sender profile:', error);
          }

          const senderName = senderProfile?.nickname || senderProfile?.steam_username || 'Someone';
          const amount = payload.new.amount;

          console.log('Adding tip notification:', { senderName, amount });

          addNotification({
            title: 'Tip Received!',
            message: `${senderName} sent you $${amount}`,
            type: 'success',
            duration: 5000, // Show for 5 seconds
          });
        }
      )
      .subscribe((status) => {
        console.log('Tips channel subscription status:', status);
      });

    // Listen for mute notifications
    const mutesChannel = supabase
      .channel('mutes_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_mutes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Mute received via real-time:', payload);
          
          const expiresAt = new Date(payload.new.expires_at);
          const now = new Date();
          const durationMs = expiresAt.getTime() - now.getTime();
          const durationMinutes = Math.ceil(durationMs / (1000 * 60));
          const reason = payload.new.reason;

          addNotification({
            title: 'You have been muted',
            message: `Duration: ${durationMinutes} minutes${reason ? ` - Reason: ${reason}` : ''}`,
            type: 'warning',
          });
        }
      )
      .subscribe((status) => {
        console.log('Mutes channel subscription status:', status);
      });

    // Listen for unmute notifications (when mutes are deactivated)
    const unmutesChannel = supabase
      .channel('unmutes_notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_mutes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Mute status updated via real-time:', payload);
          
          // Check if mute was deactivated (unmuted)
          if (payload.old.is_active === true && payload.new.is_active === false) {
            addNotification({
              title: 'You have been unmuted',
              message: 'You can now send messages again',
              type: 'success',
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Unmutes channel subscription status:', status);
      });

    // Cleanup function
    return () => {
      console.log('Cleaning up notification listeners');
      supabase.removeChannel(tipsChannel);
      supabase.removeChannel(mutesChannel);
      supabase.removeChannel(unmutesChannel);
    };
  }, [user, addNotification, refreshProfile]);
};
