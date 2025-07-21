
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCoinflipRealtimeSync = (refreshGames: () => Promise<void>) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    console.log('[COINFLIP-SYNC] Setting up enhanced real-time sync...');
    
    const channel = supabase
      .channel('coinflip-games-enhanced-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coinflip_games'
        },
        (payload) => {
          console.log('[COINFLIP-SYNC] Real-time update received:', payload);
          refreshGames();
        }
      )
      .subscribe((status, error) => {
        console.log('[COINFLIP-SYNC] Subscription status:', status);
        
        if (error) {
          console.error('[COINFLIP-SYNC] Subscription error:', error);
          // Attempt to reconnect after a delay
          setTimeout(() => {
            console.log('[COINFLIP-SYNC] Attempting to reconnect...');
            refreshGames();
          }, 3000);
        }
        
        if (status === 'SUBSCRIBED') {
          console.log('[COINFLIP-SYNC] Successfully subscribed to real-time updates');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log('[COINFLIP-SYNC] Cleaning up real-time sync subscription');
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [refreshGames]);
};
