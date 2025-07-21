
import { coinflipService } from '@/services/coinflipService';
import { useCoinflipAnimation } from '@/hooks/useCoinflipAnimation';
import { addExperience } from '@/utils/experienceUtils';
import { supabase } from '@/integrations/supabase/client';
import type { CoinflipGame } from '@/types/coinflip';

interface UseGameActionsParams {
  user: any;
  profile: any;
  games: CoinflipGame[];
  setIsCreating: (value: boolean) => void;
  setIsJoining: (value: boolean) => void;
  refreshProfile: () => Promise<void>;
  refreshGames: () => Promise<void>;
}

export const useCoinflipGameActions = ({
  user,
  profile,
  games,
  setIsCreating,
  setIsJoining,
  refreshProfile,
  refreshGames
}: UseGameActionsParams) => {
  const { startAnimation, stopAnimation } = useCoinflipAnimation();

  const createGame = async (side: 'heads' | 'tails', betAmount: number, entryType: 'balance' | 'item', itemId?: string) => {
    if (!user) {
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
        return false;
      }

      // Add to user wagers for tracking and experience (now on frontend)
      try {
        await supabase
          .from('user_wagers')
          .insert({
            user_id: user.id,
            amount: response.bet_amount,
            game_type: 'coinflip',
            description: 'Coinflip game created'
          });

        await addExperience(user.id, response.bet_amount);
        console.log(`Added XP for coinflip game creation: ${response.bet_amount} sulfur wagered`);
      } catch (expError) {
        console.error('Error adding wager/XP for coinflip game creation:', expError);
      }

      console.log(`Coinflip game created successfully - bet: ${response.bet_amount}`);

      await refreshProfile();
      await refreshGames();
      
      return true;
    } catch (error) {
      console.error('Error in createGame:', error);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const joinGame = async (gameId: string, entryType: 'balance' | 'item', itemId?: string) => {
    if (!user) {
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
        return false;
      }

      // Start coin flip animation with the result
      startAnimation(response.winning_side as 'heads' | 'tails');

      // Stop animation after it completes
      setTimeout(() => {
        stopAnimation();
      }, 4100); // Wait for full animation + result display

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
      await refreshGames();
      
      return true;
    } catch (error) {
      console.error('Error in joinGame:', error);
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  const playAgainstBot = async (gameId: string) => {
    if (!user) {
      return false;
    }

    try {
      setIsJoining(true);

      const response = await coinflipService.playAgainstBot(user.id, gameId);

      if (!response.success) {
        return false;
      }

      // Start coin flip animation with the result
      startAnimation(response.winning_side as 'heads' | 'tails');

      // Stop animation after it completes
      setTimeout(() => {
        stopAnimation();
      }, 4100); // Wait for full animation + result display

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
      await refreshGames();
      
      return true;
    } catch (error) {
      console.error('Error in playAgainstBot:', error);
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  return {
    createGame,
    joinGame,
    playAgainstBot
  };
};
