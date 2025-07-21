import { supabase } from '@/integrations/supabase/client';
import { DualGame, DualWeapon, DualGameResult } from '@/types/dual';

export class DualService {
  static async getActiveGames(): Promise<DualGame[]> {
    const { data, error } = await supabase
      .from('dual_games')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active dual games:', error);
      throw error;
    }

    return (data || []) as unknown as DualGame[];
  }

  static async getWeapons(): Promise<DualWeapon[]> {
    const { data, error } = await supabase
      .from('dual_weapons')
      .select('*')
      .order('damage', { ascending: false });

    if (error) {
      console.error('Error fetching dual weapons:', error);
      throw error;
    }

    return data || [];
  }

  static async createGame(
    side: string,
    betAmount: number,
    entryType: string,
    itemId?: string
  ): Promise<DualGameResult> {
    const { data, error } = await supabase.rpc('create_dual_game', {
      p_creator_id: (await supabase.auth.getUser()).data.user?.id,
      p_side: side,
      p_bet_amount: betAmount,
      p_entry_type: entryType,
      p_item_id: itemId
    });

    if (error) {
      console.error('Error creating dual game:', error);
      throw error;
    }

    return data as unknown as DualGameResult;
  }

  static async joinGame(
    gameId: string,
    side: string,
    entryType: string,
    itemId?: string,
    isBot: boolean = false
  ): Promise<DualGameResult> {
    const { data, error } = await supabase.rpc('join_dual_game', {
      p_game_id: gameId,
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_side: side,
      p_entry_type: entryType,
      p_item_id: itemId,
      p_is_bot: isBot
    });

    if (error) {
      console.error('Error joining dual game:', error);
      throw error;
    }

    return data as unknown as DualGameResult;
  }

  static async getGameHistory(): Promise<DualGame[]> {
    const { data, error } = await supabase
      .from('dual_games')
      .select('*')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching dual game history:', error);
      throw error;
    }

    return (data || []) as unknown as DualGame[];
  }
}