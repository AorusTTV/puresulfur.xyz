
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  steam_username: string;
  nickname: string;
  balance: number;
  level: number;
  experience: number;
  total_wagered: number;
  is_banned: boolean;
  leaderboard_disabled?: boolean;
  created_at: string;
}

interface DeleteUserResponse {
  success: boolean;
  error?: string;
  message?: string;
}

interface DeleteAffiliateCodeResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export const useUserActionHandlers = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const handleBalanceAdjustment = (user: User, onAdjustBalance: (userId: string, amount: number) => Promise<void>) => {
    const newBalance = prompt('Enter new balance:', user.balance?.toString());
    if (newBalance && !isNaN(Number(newBalance))) {
      onAdjustBalance(user.id, Number(newBalance));
    }
  };

  const handleExperienceAdjustment = (user: User, onAdjustExperience: (userId: string, experience: number) => Promise<void>) => {
    const newXP = prompt('Enter new experience:', user.experience?.toString() || '0');
    if (newXP && !isNaN(Number(newXP))) {
      onAdjustExperience(user.id, Number(newXP));
    }
  };

  const handleDeleteAffiliateCode = async (user: User) => {
    const confirmMessage = `Are you sure you want to DELETE the affiliate code for "${user.nickname || user.steam_username}"?\n\nThis action will:\n- Deactivate their current affiliate code\n- Clear their affiliate references\n- Allow them to create a new code\n- Deactivate any referrals they made\n\nType "DELETE" to confirm:`;
    
    const confirmation = prompt(confirmMessage);
    
    if (confirmation !== 'DELETE') {
      if (confirmation !== null) {
        toast({
          title: 'Deletion Cancelled',
          description: 'You must type "DELETE" to confirm deletion',
          variant: 'destructive'
        });
      }
      return;
    }

    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to delete affiliate codes',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('[AFFILIATE-DELETE] Attempting to delete affiliate code for user:', user.id);
      
      const { data, error } = await supabase.rpc('delete_user_affiliate_code', {
        p_user_id: user.id,
        p_admin_id: currentUser.id
      });

      if (error) {
        console.error('[AFFILIATE-DELETE] Error deleting affiliate code:', error);
        throw error;
      }

      // Safely convert the response
      const response = data as unknown as DeleteAffiliateCodeResponse;

      if (response && !response.success) {
        console.error('[AFFILIATE-DELETE] Function returned error:', response.error);
        toast({
          title: 'Deletion Failed',
          description: response.error,
          variant: 'destructive'
        });
        return;
      }

      console.log('[AFFILIATE-DELETE] Affiliate code deleted successfully:', response);
      toast({
        title: 'Affiliate Code Deleted',
        description: `${user.nickname || user.steam_username}'s affiliate code has been deleted`,
        variant: 'default'
      });

    } catch (error) {
      console.error('[AFFILIATE-DELETE] Unexpected error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete affiliate code. Please check console for details.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    const confirmMessage = `Are you sure you want to PERMANENTLY DELETE the user "${user.nickname || user.steam_username}"?\n\nThis action will:\n- Delete all user data including inventory, bets, and chat messages\n- Remove the user from all games and leaderboards\n- Delete their authentication account (they cannot log back in with the same Steam account)\n- This action CANNOT be undone\n\nType "DELETE" to confirm:`;
    
    const confirmation = prompt(confirmMessage);
    
    if (confirmation !== 'DELETE') {
      if (confirmation !== null) {
        toast({
          title: 'Deletion Cancelled',
          description: 'User must type "DELETE" to confirm deletion',
          variant: 'destructive'
        });
      }
      return;
    }

    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to delete users',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('[USER-DELETE] Attempting to delete user:', user.id);
      
      const { data, error } = await supabase.rpc('delete_user_account', {
        p_user_id: user.id,
        p_admin_id: currentUser.id
      });

      if (error) {
        console.error('[USER-DELETE] Error deleting user:', error);
        throw error;
      }

      // Safely convert the response by first casting to unknown, then to our interface
      const response = data as unknown as DeleteUserResponse;

      if (response && !response.success) {
        console.error('[USER-DELETE] Function returned error:', response.error);
        toast({
          title: 'Deletion Failed',
          description: response.error,
          variant: 'destructive'
        });
        return;
      }

      console.log('[USER-DELETE] User deleted successfully:', response);
      toast({
        title: 'User Deleted',
        description: `${user.nickname || user.steam_username} has been permanently deleted`,
        variant: 'default'
      });

    } catch (error) {
      console.error('[USER-DELETE] Unexpected error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please check console for details.',
        variant: 'destructive'
      });
    }
  };

  return {
    handleBalanceAdjustment,
    handleExperienceAdjustment,
    handleDeleteUser,
    handleDeleteAffiliateCode
  };
};
