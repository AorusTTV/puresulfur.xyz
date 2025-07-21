
import { supabase } from '@/integrations/supabase/client';
import { addExperience } from '@/utils/experienceUtils';

interface PlaceBetResponse {
  success: boolean;
  bet_id?: string;
  game_id?: string;
  remaining_balance?: number;
  error?: string;
}

export const placeBet = async (
  userId: string,
  amount: number,
  selectedMultiplier: number,
  colorMapping: Record<number, string>,
  wheelSections: Array<{ number: number; multiplier: number; color: string; textColor: string }>
): Promise<PlaceBetResponse> => {
  try {
    console.log('Placing wheel bet:', { amount, selectedMultiplier });
    
    const colorName = colorMapping[selectedMultiplier as keyof typeof colorMapping];
    const multiplier = wheelSections.find(s => s.number === selectedMultiplier)?.multiplier || 2;
    
    const { data, error } = await supabase.rpc('place_wheel_bet', {
      p_user_id: userId,
      p_bet_amount: amount,
      p_bet_color: colorName,
      p_multiplier: multiplier
    });

    if (error) {
      console.error('Bet placement error:', error);
      throw error;
    }

    console.log('Wheel bet placement response:', data);

    // Add experience manually for wheel bets since the function doesn't handle it
    try {
      await addExperience(userId, amount);
      console.log(`Added XP for wheel bet: ${amount} sulfur wagered`);
    } catch (expError) {
      console.error('Error adding XP for wheel bet:', expError);
    }

    return data as unknown as PlaceBetResponse;
  } catch (error) {
    console.error('Error placing wheel bet:', error);
    throw error;
  }
};

// Wheel sections with correct multipliers like bandit.camp
export const wheelSections = [
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' },
  { number: 5, multiplier: 6, color: '#5DADE2', textColor: '#000' },
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' },
  { number: 3, multiplier: 4, color: '#58D68D', textColor: '#000' },
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' },
  { number: 10, multiplier: 11, color: '#AF7AC5', textColor: '#000' },
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' },
  { number: 5, multiplier: 6, color: '#5DADE2', textColor: '#000' },
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' },
  { number: 3, multiplier: 4, color: '#58D68D', textColor: '#000' },
  { number: 20, multiplier: 21, color: '#F1948A', textColor: '#000' },
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' },
  { number: 3, multiplier: 4, color: '#58D68D', textColor: '#000' },
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' },
  { number: 5, multiplier: 6, color: '#5DADE2', textColor: '#000' },
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' }
];

export const colorMapping = {
  1: 'yellow',
  3: 'green', 
  5: 'blue',
  10: 'purple',
  20: 'red'
};
