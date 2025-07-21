
import { supabase } from '@/integrations/supabase/client';

export class SteamApiService {
  static async fetchActiveBots(): Promise<Array<{ id: string; label: string; steam_id: string }>> {
    console.log('[STEAM-API] Fetching active Steam bots...');
    
    try {
      const { data: bots, error } = await supabase
        .from('steam_bots')
        .select('id, label, steam_id, last_status')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[STEAM-API] Error fetching bots:', error);
        throw new Error(`Failed to fetch Steam bots: ${error.message}`);
      }

      if (!bots || bots.length === 0) {
        console.warn('[STEAM-API] No active Steam bots found');
        throw new Error('No active Steam bots configured. Please add a Steam bot in admin settings.');
      }

      console.log('[STEAM-API] Found', bots.length, 'active bots:', bots.map(b => b.label));
      return bots;
      
    } catch (error) {
      console.error('[STEAM-API] Failed to fetch active bots:', error);
      throw error;
    }
  }

  static async validateBotConfiguration(botId: string): Promise<boolean> {
    console.log('[STEAM-API] Validating bot configuration for:', botId);
    
    try {
      const { data: bot, error } = await supabase
        .from('steam_bots')
        .select('steam_id, api_key_encrypted, is_active')
        .eq('id', botId)
        .single();

      if (error || !bot) {
        console.error('[STEAM-API] Bot not found:', error);
        return false;
      }

      if (!bot.is_active) {
        console.warn('[STEAM-API] Bot is not active');
        return false;
      }

      if (!bot.steam_id) {
        console.warn('[STEAM-API] Bot missing Steam ID');
        return false;
      }

      console.log('[STEAM-API] Bot configuration is valid');
      return true;
      
    } catch (error) {
      console.error('[STEAM-API] Bot validation failed:', error);
      return false;
    }
  }
}
