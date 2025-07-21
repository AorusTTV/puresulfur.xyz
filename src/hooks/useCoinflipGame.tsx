
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { coinflipService } from '@/services/coinflipService';
import { useCoinflipAnimation } from '@/hooks/useCoinflipAnimation';
import { addExperience } from '@/utils/experienceUtils';
import type { CoinflipGame, CreateGameParams, JoinGameParams } from '@/types/coinflip';

export const useCoinflipGame = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { isFlipping, flipResult, startAnimation, stopAnimation } = useCoinflipAnimation();
  
  const [games, setGames] = useState<CoinflipGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const processedGames = useRef<Set<string>>(new Set());

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      const gamesData = await coinflipService.loadGames();
      setGames(gamesData);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time updates for coinflip games
  useEffect(() => {
    console.log('[COINFLIP] useEffect triggered', {
      user,
      isFlipping,
      toast,
      startAnimation,
      stopAnimation
    });
    if (!user) return;

    console.log('[COINFLIP] Setting up real-time updates...');
    const channel = supabase.channel('coinflip-games-realtime');

    // Polling as backup for missed events
    const pollInterval = setInterval(async () => {
      try {
        const { data: userGames, error } = await supabase
          .from('coinflip_games')
          .select('*')
          .or(`creator_id.eq.${user.id},joiner_id.eq.${user.id}`)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(1);
        if (error) {
          console.error('[COINFLIP] Polling error:', error);
          return;
        }
        if (userGames && userGames.length > 0) {
          const latestGame = userGames[0] as any;
          const completedAt = new Date(latestGame.completed_at);
          const now = new Date();
          const timeDiff = (now.getTime() - completedAt.getTime()) / 1000;
          if (timeDiff < 10 && !processedGames.current.has(latestGame.id)) {
            processedGames.current.add(latestGame.id);
            // Trigger animation and toast
            startAnimation(latestGame.winning_side as 'heads' | 'tails');
            setTimeout(() => {
              stopAnimation();
              const sideLabel = latestGame.winning_side === 'heads' ? 'SULFUR' : 'SCRAP';
              if (latestGame.winner_id === user.id) {
                toast({
                  title: 'Congratulations! 🎉',
                  description: `You won ${latestGame.total_payout || ''} sulfur! The coin landed on ${sideLabel}.`
                });
              } else {
                toast({
                  title: 'Better luck next time!',
                  description: `You lost. The coin landed on ${sideLabel}.`,
                  variant: 'destructive'
                });
              }
            }, 8000);
          }
        }
      } catch (error) {
        console.error('[COINFLIP] Polling error:', error);
      }
    }, 2000);

    channel
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'coinflip_games' }, 
        (payload) => {
          console.log('[COINFLIP] Real-time update received:', payload);
          loadGames();
          const game = payload.new as any;
          const oldGame = payload.old as any;
          const isInvolved = user && (game?.creator_id === user.id || game?.joiner_id === user.id);
          if (payload.eventType === 'UPDATE' && isInvolved && game) {
            if (game.status === 'completed' && !processedGames.current.has(game.id)) {
              processedGames.current.add(game.id);
              startAnimation(game.winning_side as 'heads' | 'tails');
              setTimeout(() => {
                stopAnimation();
                const sideLabel = game.winning_side === 'heads' ? 'SULFUR' : 'SCRAP';
                if (game.winner_id === user.id) {
                  toast({
                    title: 'Congratulations! 🎉',
                    description: `You won ${game.total_payout || ''} sulfur! The coin landed on ${sideLabel}.`
                  });
                  loadGames();

                } else {
                  toast({
                    title: 'Better luck next time!',
                    description: `You lost. The coin landed on ${sideLabel}.`,
                    variant: 'destructive'
                  });
                  loadGames();
                }
              }, 8000);
            }
            // Optionally, show a toast when a joiner joins (for creator)
            if (
              game.joiner_id &&
              (!oldGame?.joiner_id || oldGame.joiner_id !== game.joiner_id) &&
              game.creator_id === user.id
            ) {
              toast({
                title: '🪙 Opponent Joined!',
                description: 'Someone joined your coinflip game! Flipping the coin...'
              });
            }
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: '🎮 New Coinflip Game!',
              description: 'A new game has been created. Join now!',
            });
          }
        }
      )
      .subscribe((status, error) => {
        console.log('[COINFLIP] Real-time subscription status:', status);
        if (error) {
          console.error('[COINFLIP] Real-time subscription error:', error);
          setTimeout(() => {
            console.log('[COINFLIP] Attempting to reconnect real-time subscription...');
            loadGames();
          }, 5000);
        }
        if (status === 'SUBSCRIBED') {
          console.log('[COINFLIP] Successfully subscribed to real-time updates');
        }
      });

    // Auto-refresh every 15 seconds as backup
    const autoRefreshInterval = setInterval(() => {
      console.log('[COINFLIP] Auto-refreshing games list...');
      loadGames();
    }, 15000);

    // Cleanup on unmount
    return () => {
      console.log('[COINFLIP] Cleaning up real-time subscription and auto-refresh');
      supabase.removeChannel(channel);
      clearInterval(autoRefreshInterval);
      clearInterval(pollInterval);
    };
  }, [user, loadGames, toast, isFlipping, startAnimation, stopAnimation]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const createGame = async (side: 'heads' | 'tails', betAmount: number, entryType: 'balance' | 'item', itemId?: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a game',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsCreating(true);

      const response = await coinflipService.createGame(user.id, {
        side,
        betAmount,
        entryType,
        itemId
      });

      if (!response.success) {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create game',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Game Created! 🎮',
        description: `Your ${side.toUpperCase()} game is now live! Waiting for players...`,
      });

      await refreshProfile();
      await loadGames();
      
      return true;
    } catch (error) {
      console.error('Error in createGame:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const joinGame = async (gameId: string, entryType: 'balance' | 'item', itemId?: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to join a game',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsJoining(true);

      const response = await coinflipService.joinGame(user.id, {
        gameId,
        entryType,
        itemId
      });

      if (!response.success) {
        toast({
          title: 'Error',
          description: response.error || 'Failed to join game',
          variant: 'destructive',
        });
        return false;
      }

      // startAnimation(response.winning_side as 'heads' | 'tails'); // REMOVED: Animation will be triggered by real-time update only

      // Extended timeout for the smooth animation (about 8 seconds total)
      setTimeout(() => {
        stopAnimation();
        
        const sideLabel = response.winning_side === 'heads' ? 'SULFUR' : 'SCRAP';
        
        if (response.is_winner) {
          toast({
            title: 'Congratulations! 🎉',
            description: `You won ${response.total_payout} sulfur! The coin landed on ${sideLabel}.`
          });
        } else {
          toast({
            title: 'Better luck next time!',
            description: `You lost. The coin landed on ${sideLabel}.`,
            variant: 'destructive'
          });
        }
      }, 8000);

      // Add to user wagers for tracking and experience (now on frontend)
      const game = games.find(g => g.id === gameId);
      const betAmount = game?.creator_bet_amount || 0;
      
      try {
        await supabase
          .from('user_wagers')
          .insert({
            user_id: user.id,
            amount: betAmount,
            game_type: 'coinflip',
            description: 'Coinflip game joined'
          });

        await addExperience(user.id, betAmount);
        console.log(`Added XP for coinflip game join: ${betAmount} sulfur wagered`);
      } catch (expError) {
        console.error('Error adding wager/XP for coinflip game join:', expError);
      }

      console.log(`Coinflip game joined successfully - game: ${gameId}`);

      await refreshProfile();
      await loadGames();
      
      return true;
    } catch (error) {
      console.error('Error in joinGame:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  const playAgainstBot = async (gameId: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to play against bot',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsJoining(true);

      const response = await coinflipService.playAgainstBot(user.id, gameId);

      if (!response.success) {
        toast({
          title: 'Error',
          description: response.error || 'Failed to start bot game',
          variant: 'destructive',
        });
        return false;
      }

      // --- REMOVED: startAnimation and stopAnimation here ---
      // Animation will be triggered by real-time update only

      // Add to user wagers for tracking and experience (now on frontend)
      const game = games.find(g => g.id === gameId);
      const betAmount = game?.creator_bet_amount || 0;
      
      try {
        await supabase
          .from('user_wagers')
          .insert({
            user_id: user.id,
            amount: betAmount,
            game_type: 'coinflip',
            description: 'Coinflip bot game'
          });

        await addExperience(user.id, betAmount);
        console.log(`Added XP for bot coinflip game: ${betAmount} sulfur wagered`);
      } catch (expError) {
        console.error('Error adding wager/XP for bot coinflip game:', expError);
      }

      console.log(`Bot coinflip game completed successfully - game: ${gameId}`);

      await refreshProfile();
      await loadGames();
      
      return true;
    } catch (error) {
      console.error('Error in playAgainstBot:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  return {
    games,
    loading,
    isCreating,
    isJoining,
    isFlipping,
    flipResult,
    user,
    profile,
    createGame,
    joinGame,
    playAgainstBot,
    loadGames
  };
};
