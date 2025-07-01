
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useBalanceOperations = () => {
  const { refreshProfile } = useAuth();

  const deductBalance = async (userId: string, amount: number) => {
    try {
      const { data, error } = await supabase
        .rpc('deduct_balance', {
          user_id: userId,
          amount: amount
        });

      if (error) {
        console.error('Error deducting balance:', error);
        throw error;
      }

      // Refresh the profile to update the balance in the UI
      await refreshProfile();
      return data;
    } catch (error) {
      console.error('Failed to deduct balance:', error);
      throw error;
    }
  };

  return {
    deductBalance
  };
};
