
import { supabase } from '@/integrations/supabase/client';
import type { CoinflipGame, CreateGameParams, JoinGameParams, GameResponse } from '@/types/coinflip';

export const coinflipService = {
  async loadGames(): Promise<CoinflipGame[]> {
    try {
      const { data, error } = await supabase
        .from('coinflip_games')
        .select('*')
        .in('status', ['waiting', 'completed'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading games:', error);
        return [];
      }

      console.log('Loaded coinflip games:', data);
      return data || [];
    } catch (error) {
      console.error('Error in loadGames:', error);
      return [];
    }
  },

  async createGame(userId: string, params: CreateGameParams): Promise<GameResponse> {
    try {
      const { data, error } = await supabase.rpc('create_coinflip_game', {
        p_user_id: userId,
        p_side: params.side,
        p_bet_amount: params.betAmount,
        p_entry_type: params.entryType,
        p_item_id: params.itemId || null
      });

      if (error) {
        console.error('Error creating game:', error);
        return { success: false, error: 'Failed to create game. Please try again.' };
      }

      return data as unknown as GameResponse;
    } catch (error) {
      console.error('Error in createGame:', error);
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  },

  async joinGame(userId: string, params: JoinGameParams): Promise<GameResponse> {
    try {
      const { data, error } = await supabase.rpc('join_coinflip_game' as any, {
        p_game_id: params.gameId,
        p_user_id: userId,
        p_entry_type: params.entryType,
        p_item_id: params.itemId || null,
        p_is_bot: false
      });

      if (error) {
        console.error('Error joining game:', error);
        return { success: false, error: 'Failed to join game. Please try again.' };
      }

      return (data || { success: false, error: 'No data returned' }) as unknown as GameResponse;
    } catch (error) {
      console.error('Error in joinGame:', error);
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  },

  async playAgainstBot(userId: string, gameId: string): Promise<GameResponse> {
    try {
      const { data, error } = await supabase.rpc('join_coinflip_game' as any, {
        p_game_id: gameId,
        p_user_id: userId,
        p_entry_type: 'balance',
        p_item_id: null,
        p_is_bot: true
      });

      if (error) {
        console.error('Error playing against bot:', error);
        return { success: false, error: 'Failed to start bot game. Please try again.' };
      }

      return (data || { success: false, error: 'No data returned' }) as unknown as GameResponse;
    } catch (error) {
      console.error('Error in playAgainstBot:', error);
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  }
};
