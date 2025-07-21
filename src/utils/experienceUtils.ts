
import { supabase } from '@/integrations/supabase/client';

export const addExperience = async (userId: string, amountWagered: number): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('add_experience', {
      user_id: userId,
      amount_wagered: amountWagered
    });

    if (error) {
      console.error('Error adding experience:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error calling add_experience function:', error);
    return false;
  }
};

export const calculateExpFromWager = (amountWagered: number): number => {
  // 5 XP per $0.01 wagered
  return Math.floor(amountWagered * 100) * 5;
};
