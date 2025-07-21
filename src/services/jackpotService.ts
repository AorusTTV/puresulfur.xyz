
import { supabase } from '@/integrations/supabase/client';
import type { JackpotGameData, JackpotEntryData } from '@/types/jackpot';

export const jackpotService = {
  async fetchCurrentGame(): Promise<JackpotGameData | null> {
    try {
      console.log('Fetching current jackpot game...');
      const { data, error } = await supabase
        .from('jackpot_games')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching current game:', error);
        return null;
      }

      console.log('Current game data:', data);
      if (data) {
        return {
          id: data.id,
          total_value: data.total_value,
          status: data.status as 'active' | 'drawing' | 'completed',
          created_at: data.created_at,
          winner_id: data.winner_id,
          house_fee: data.house_fee,
          winner_prize: data.winner_prize
        };
      }

      // No active game exists, create one
      console.log('No active game found, creating new one...');
      const { data: newGame, error: createError } = await supabase
        .from('jackpot_games')
        .insert({
          total_value: 0,
          status: 'active'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating new game:', createError);
        return null;
      }

      console.log('New game created:', newGame);
      return {
        id: newGame.id,
        total_value: newGame.total_value,
        status: newGame.status as 'active' | 'drawing' | 'completed',
        created_at: newGame.created_at,
        winner_id: newGame.winner_id,
        house_fee: newGame.house_fee,
        winner_prize: newGame.winner_prize
      };
    } catch (error) {
      console.error('Unexpected error fetching current game:', error);
      return null;
    }
  },

  async fetchEntries(gameId: string): Promise<JackpotEntryData[]> {
    try {
      console.log('Fetching entries for game:', gameId);
      const { data, error } = await supabase
        .from('jackpot_entries')
        .select(`
          *,
          profiles:user_id (
            steam_username,
            avatar_url
          )
        `)
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
        return [];
      }

      console.log('Entries data:', data);
      // Transform data to handle the profiles relationship properly
      return (data || []).map(entry => ({
        id: entry.id,
        user_id: entry.user_id,
        value: entry.value,
        ticket_start: entry.ticket_start,
        ticket_end: entry.ticket_end,
        created_at: entry.created_at,
        entry_type: entry.entry_type,
        profiles: Array.isArray(entry.profiles) && entry.profiles.length > 0 
          ? entry.profiles[0] 
          : entry.profiles || null
      }));
    } catch (error) {
      console.error('Unexpected error fetching entries:', error);
      return [];
    }
  },

  async joinGame(userId: string, amount: number): Promise<boolean> {
    // Check user balance first
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (!profile || profile.balance < amount) {
      throw new Error('Insufficient balance');
    }

    console.log('Joining game with balance:', { userId, amount });
    const { data, error } = await supabase.rpc('add_jackpot_entry', {
      p_user_id: userId,
      p_entry_type: 'balance',
      p_value: amount
    });

    if (error) {
      console.error('Error joining game:', error);
      throw error;
    }

    console.log('Successfully joined game:', data);
    return true;
  },

  async depositSkin(userId: string, itemId: string, value: number): Promise<boolean> {
    console.log('Depositing skin:', { userId, itemId, value });
    const { data, error } = await supabase.rpc('add_jackpot_entry', {
      p_user_id: userId,
      p_entry_type: 'item',
      p_value: value,
      p_item_id: itemId
    });

    if (error) {
      console.error('Error depositing skin:', error);
      throw error;
    }

    console.log('Successfully deposited skin:', data);
    return true;
  }
};
