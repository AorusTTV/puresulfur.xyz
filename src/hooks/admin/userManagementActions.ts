
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateLevelInfo, formatNumber } from '@/utils/levelUtils';
import { User } from './userManagementTypes';

export const useUserActions = () => {
  const { toast } = useToast();

  const copyUserIdToClipboard = async (userId: string) => {
    try {
      await navigator.clipboard.writeText(userId);
      toast({
        title: 'Copied',
        description: 'User ID copied to clipboard',
        variant: 'default'
      });
      return true;
    } catch (error) {
      console.error('Failed to copy user ID:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy user ID to clipboard',
        variant: 'destructive'
      });
      return false;
    }
  };

  const adjustBalance = async (userId: string, amount: number) => {
    try {
      console.log('[USER-MGMT] Adjusting balance for user:', userId, 'to amount:', amount);
      
      const { error } = await supabase
        .from('profiles')
        .update({ balance: amount })
        .eq('id', userId);

      if (error) {
        console.error('[USER-MGMT] Error updating balance:', error);
        throw error;
      }
      
      console.log('[USER-MGMT] Balance updated successfully');
      toast({
        title: 'Success',
        description: 'User balance updated successfully'
      });
    } catch (error) {
      console.error('[USER-MGMT] Error updating balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update balance. Check console for details.',
        variant: 'destructive'
      });
    }
  };

  const adjustExperience = async (userId: string, experience: number) => {
    try {
      console.log('[USER-MGMT] Adjusting experience for user:', userId, 'to amount:', experience);
      
      // Calculate new level based on experience
      const levelInfo = calculateLevelInfo(experience);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          experience: experience,
          level: levelInfo.currentLevel
        })
        .eq('id', userId);

      if (error) {
        console.error('[USER-MGMT] Error updating experience:', error);
        throw error;
      }
      
      console.log('[USER-MGMT] Experience updated successfully');
      toast({
        title: 'Success',
        description: `User experience updated to ${formatNumber(experience)} XP (Level ${levelInfo.currentLevel})`
      });
    } catch (error) {
      console.error('[USER-MGMT] Error updating experience:', error);
      toast({
        title: 'Error',
        description: 'Failed to update experience. Check console for details.',
        variant: 'destructive'
      });
    }
  };

  const toggleLeaderboardParticipation = async (user: User) => {
    try {
      const newStatus = !user.leaderboard_disabled;
      console.log('[USER-MGMT] Toggling leaderboard participation for user:', user.id, 'to:', newStatus);
      
      // Call the database function directly
      const { error } = await supabase
        .from('profiles')
        .update({ leaderboard_disabled: newStatus })
        .eq('id', user.id);

      if (error) {
        console.error('[USER-MGMT] Error toggling leaderboard participation:', error);
        throw error;
      }

      console.log('[USER-MGMT] Leaderboard participation toggled successfully');
      toast({
        title: 'Success',
        description: newStatus 
          ? `${user.nickname || user.steam_username} has been disabled from leaderboards`
          : `${user.nickname || user.steam_username} has been enabled for leaderboards`
      });
    } catch (error) {
      console.error('[USER-MGMT] Error toggling leaderboard participation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update leaderboard participation. Check console for details.',
        variant: 'destructive'
      });
    }
  };

  const handleUnbanUser = async (user: User) => {
    try {
      console.log('[USER-MGMT] Unbanning user:', user.id);
      
      const { data, error } = await supabase.rpc('unban_user', {
        p_user_id: user.id
      });

      if (error) {
        console.error('[USER-MGMT] Error unbanning user:', error);
        throw error;
      }

      console.log('[USER-MGMT] User unbanned successfully');
      toast({
        title: 'Success',
        description: `${user.nickname || user.steam_username} has been unbanned`
      });
    } catch (error) {
      console.error('[USER-MGMT] Error unbanning user:', error);
      toast({
        title: 'Error',
        description: 'Failed to unban user. Check console for details.',
        variant: 'destructive'
      });
    }
  };

  return {
    copyUserIdToClipboard,
    adjustBalance,
    adjustExperience,
    toggleLeaderboardParticipation,
    handleUnbanUser,
    toast
  };
};
