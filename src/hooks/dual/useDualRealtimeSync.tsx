import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDualRealtimeSync = (
  refreshGames: () => Promise<void>,
  onGameCompleted?: (gameResult: any) => void,
  currentUserId?: string,
  onBattleStart?: (pendingBattle: any) => void
) => {
  const channelRef = useRef<any>(null);
  const processedGames = useRef<Set<string>>(new Set());
  const startedGames = useRef<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUserId) return;

    // Also set up polling to check for game status changes
    const pollInterval = setInterval(async () => {
      try {
        const { data: userGames, error } = await supabase
          .from('dual_games')
          .select('*')
          .or(`creator_id.eq.${currentUserId},joiner_id.eq.${currentUserId}`)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('[DUAL-SYNC] Polling error:', error);
          return;
        }

        if (userGames && userGames.length > 0) {
          const latestGame = userGames[0];
          const completedAt = new Date(latestGame.completed_at);
          const now = new Date();
          const timeDiff = (now.getTime() - completedAt.getTime()) / 1000;
          if (timeDiff < 10 && !processedGames.current.has(latestGame.id)) {
            processedGames.current.add(latestGame.id);
            if (onGameCompleted) {
              const battleResult = {
                success: true,
                winner_id: latestGame.winner_id,
                total_payout: latestGame.total_value || 0,
                is_winner: latestGame.winner_id === currentUserId,
                is_bot_game: latestGame.joiner_id === null,
                battle_result: latestGame.battle_result,
                game_id: latestGame.id
              };
              onGameCompleted(battleResult);
            }
          }
        }
      } catch (error) {
        console.error('[DUAL-SYNC] Polling error:', error);
      }
    }, 2000);

    const channel = supabase
      .channel('dual-games-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dual_games'
        },
        (payload) => {
          refreshGames();
          const game = payload.new as any;
          const oldGame = payload.old as any;
          const isInvolved = game?.creator_id === currentUserId || game?.joiner_id === currentUserId;

          if (payload.eventType === 'UPDATE' && isInvolved && game) {
            // 1. Trigger battle animation for creator as soon as joiner joins (pending state)
            if (
              game.joiner_id &&
              (!oldGame?.joiner_id || oldGame.joiner_id !== game.joiner_id) &&
              game.creator_id === currentUserId &&
              !startedGames.current.has(game.id)
            ) {
              startedGames.current.add(game.id);
              toast({
                title: '⚔️ Opponent Joined!',
                description: 'Someone joined your dual game! Battle starting...'
              });
              if (onBattleStart) {
                // Minimal info for pending battle
                onBattleStart({
                  game_id: game.id,
                  pending: true,
                  creator_id: game.creator_id,
                  joiner_id: game.joiner_id,
                  // Optionally add more info if needed
                });
              }
            }
            // 2. When game is completed, show real result
            if (game.status === 'completed' && !processedGames.current.has(game.id)) {
              processedGames.current.add(game.id);
              if (game.winner_id === currentUserId) {
                toast({
                  title: '🏆 Victory!',
                  description: `You won the dual battle! Payout: ${game.total_value || 0} sulfur`,
                });
              } else if (game.winner_id) {
                toast({
                  title: '💀 Defeat',
                  description: 'You lost the dual battle. Better luck next time!',
                  variant: 'destructive'
                });
              } else {
                toast({
                  title: '🤖 Bot Battle',
                  description: 'The house won this round.',
                  variant: 'destructive'
                });
              }
              if (onGameCompleted) {
                const battleResult = {
                  success: true,
                  winner_id: game.winner_id,
                  total_payout: game.total_value || 0,
                  is_winner: game.winner_id === currentUserId,
                  is_bot_game: game.joiner_id === null,
                  battle_result: game.battle_result,
                  game_id: game.id
                };
                onGameCompleted(battleResult);
              }
            }
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: '🎮 New Dual Game!',
              description: 'A new dual game has been created. Join now!',
            });
          }
        }
      )
      .subscribe((status, error) => {
        if (error) {
          setTimeout(() => {
            refreshGames();
          }, 3000);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      clearInterval(pollInterval);
    };
  }, [currentUserId, refreshGames, onGameCompleted, onBattleStart, toast]);
}; 