
import { useState } from 'react';
import { placeBet, wheelSections, colorMapping } from '@/utils/wheelBettingUtils';

interface UseWheelBettingProps {
  user: any;
  profile: any;
  isSpinning: boolean;
  loadCurrentGame: () => Promise<void>;
}

export const useWheelBetting = ({ user, profile, isSpinning, loadCurrentGame }: UseWheelBettingProps) => {
  const [betAmount, setBetAmount] = useState('');
  const [selectedMultiplier, setSelectedMultiplier] = useState<number | null>(null);

  const handleBetAmountChange = (value: string) => {
    setBetAmount(value);
  };

  const handlePlaceBet = async () => {
    if (!user || !selectedMultiplier) {
      return;
    }

    // Prevent betting while spinning
    if (isSpinning) {
      return;
    }

    const amount = parseFloat(betAmount);
    if (!amount || amount <= 0) {
      return;
    }

    if (amount > (profile?.balance || 0)) {
      return;
    }

    try {
      const response = await placeBet(user.id, amount, selectedMultiplier, colorMapping, wheelSections);

      if (response.success) {
        console.log('Bet placed successfully');
        
        // Reload game data
        await loadCurrentGame();
        
        // Clear bet
        setBetAmount('');
        setSelectedMultiplier(null);
      } else {
        console.error('Bet failed:', response.error);
      }
    } catch (error) {
      console.error('Error placing bet:', error);
    }
  };

  const addToBet = (amount: number) => {
    const currentAmount = parseFloat(betAmount) || 0;
    setBetAmount((currentAmount + amount).toFixed(2));
  };

  const divideBet = () => {
    const currentAmount = parseFloat(betAmount) || 0;
    setBetAmount((currentAmount / 2).toFixed(2));
  };

  const doubleBet = () => {
    const currentAmount = parseFloat(betAmount) || 0;
    setBetAmount((currentAmount * 2).toFixed(2));
  };

  const clearBet = () => {
    setBetAmount('');
    setSelectedMultiplier(null);
  };

  const maxBet = () => {
    setBetAmount((profile?.balance || 0).toFixed(2));
  };

  return {
    betAmount,
    selectedMultiplier,
    setSelectedMultiplier,
    handleBetAmountChange,
    handlePlaceBet,
    addToBet,
    divideBet,
    doubleBet,
    clearBet,
    maxBet
  };
};
