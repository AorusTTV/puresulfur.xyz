
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PlinkoBoard } from './PlinkoBoard';
import { BettingControls } from './BettingControls';
import { GameStats } from './GameStats';
import { PayoutSlots } from './PayoutSlots';
import { GameModeSelector } from './GameModeSelector';
import { PlinkoBall } from './PlinkoBall';
import { GameMode, getMultipliersForMode, getMaxMultiplierForMode, getMinMultiplierForMode } from './gameModes';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { addExperience } from '@/utils/experienceUtils';
import { PlinkoGameHeader } from './PlinkoGameHeader';

interface PlinkoGameProps {
  onBackToGames?: () => void;
}

interface GameResult {
  ballId: string;
  slotIndex: number;
  multiplier: number;
  winAmount: number;
}

interface DeductBalanceResponse {
  success: boolean;
  error?: string;
  previous_balance?: number;
  new_balance?: number;
  amount_deducted?: number;
}

export const PlinkoGame: React.FC<PlinkoGameProps> = ({ onBackToGames }) => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [currentBet, setCurrentBet] = useState(1);
  const [activeBallsCount, setActiveBallsCount] = useState(0);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [totalWagered, setTotalWagered] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('medium');
  const [isProcessingBet, setIsProcessingBet] = useState(false);
  
  // Throttle state updates to improve performance
  const lastUpdateTime = useRef(0);
  const updateThrottle = 16; // ~60 FPS

  const currentMultipliers = getMultipliersForMode(gameMode);
  const maxMultiplier = getMaxMultiplierForMode(gameMode);
  const minMultiplier = getMinMultiplierForMode(gameMode);

  const handleBackToGames = () => {
    if (onBackToGames) {
      onBackToGames();
    } else {
      navigate('/games');
    }
  };

  const handleBetChange = useCallback((newBet: number) => {
    setCurrentBet(newBet);
  }, []);

  const handleGameModeChange = useCallback((mode: GameMode) => {
    setGameMode(mode);
    console.log(`Game mode changed to: ${mode}`);
  }, []);

  const handleDropBall = useCallback(async () => {
    if (!user || !profile) {
      toast({
        title: 'Login Required',
        description: 'Please login to play Plinko',
        variant: 'destructive',
      });
      return;
    }

    if (profile.balance < currentBet) {
      toast({
        title: 'Insufficient Balance',
        description: 'You don\'t have enough balance to place this bet',
        variant: 'destructive',
      });
      return;
    }

    if (isProcessingBet) {
      return; // Prevent multiple bets while processing
    }

    // Limit concurrent balls to prevent performance issues
    if (activeBallsCount >= 5) {
      toast({
        title: 'Too Many Balls',
        description: 'Please wait for some balls to finish before dropping more',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessingBet(true);

    try {
      console.log(`Dropping ball with bet: ${currentBet}, mode: ${gameMode}`);
      
      // Immediately deduct balance using the deduct_balance function
      const { data: deductData, error: deductError } = await supabase.rpc('deduct_balance', {
        user_id: user.id,
        amount: currentBet
      });

      const deductResponse = deductData as unknown as DeductBalanceResponse;

      if (deductError || !deductResponse?.success) {
        console.error('Error deducting balance:', deductError || deductResponse?.error);
        toast({
          title: 'Error',
          description: deductResponse?.error || 'Failed to deduct balance. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      console.log(`Balance deducted successfully: ${currentBet} Sulfur`);
      
      // Immediately refresh profile to show updated balance
      await refreshProfile();
      
      // Increase ball count and update total wagered
      setActiveBallsCount(prev => prev + 1);
      setTotalWagered(prev => prev + currentBet);
      
      // Add to user wagers for tracking and experience
      try {
        await addExperience(user.id, currentBet);
        console.log(`Added XP for plinko bet: ${currentBet} sulfur wagered`);
      } catch (expError) {
        console.error('Error adding XP for plinko bet:', expError);
      }

      // Add to user wagers for leaderboard tracking
      const { error: wagerError } = await supabase
        .from('user_wagers')
        .insert({
          user_id: user.id,
          amount: currentBet,
          game_type: 'plinko',
          description: `Plinko bet with ${gameMode} mode`
        });

      if (wagerError) {
        console.error('Error recording wager:', wagerError);
      }
      
    } catch (error) {
      console.error('Error processing bet:', error);
      toast({
        title: 'Error',
        description: 'Failed to place bet. Please try again.',
        variant: 'destructive',
      });
      setActiveBallsCount(prev => Math.max(0, prev - 1));
      setTotalWagered(prev => prev - currentBet);
    } finally {
      setIsProcessingBet(false);
    }
  }, [user, profile, currentBet, activeBallsCount, gameMode, toast, isProcessingBet, refreshProfile]);

  const handleBallLanded = useCallback(async (slotIndex: number, multiplier: number) => {
    if (!user || !profile) return;

    try {
      console.log(`Ball landed in slot ${slotIndex} with multiplier ${multiplier}x`);
      
      const winAmount = currentBet * multiplier;
      
      // Only add the win amount to balance (bet was already deducted)
      if (winAmount > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .update({ balance: profile.balance + winAmount })
          .eq('id', user.id)
          .select()
          .single();

        if (profileError) {
          console.error('Error updating balance with winnings:', profileError);
          toast({
            title: 'Error',
            description: 'Failed to process winnings. Please contact support.',
            variant: 'destructive',
          });
          return;
        }
      }

      // Record the bet in plinko_bets table
      const { error: betError } = await supabase
        .from('plinko_bets')
        .insert({
          user_id: user.id,
          bet_amount: currentBet,
          multiplier: multiplier,
          win_amount: winAmount,
          slot_index: slotIndex,
          game_mode: gameMode
        });

      if (betError) {
        console.error('Error recording plinko bet:', betError);
      }

      console.log(`Plinko bet processed successfully - bet: ${currentBet}, win: ${winAmount}`);

      // Update game state
      const result: GameResult = {
        ballId: Date.now().toString(),
        slotIndex,
        multiplier,
        winAmount,
      };

      setGameHistory(prev => [result, ...prev.slice(0, 49)]);
      setTotalWinnings(prev => prev + winAmount);
      
      // Decrease ball count
      setActiveBallsCount(prev => Math.max(0, prev - 1));

      // Refresh profile to update balance display
      await refreshProfile();

      console.log(`Won: ${winAmount} Sulfur with ${multiplier}x multiplier`);

      // Show appropriate toast based on multiplier
      if (multiplier >= 25) {
        toast({
          title: '🚀 LEGENDARY WIN!',
          description: `${multiplier}x multiplier - Won ${winAmount.toFixed(2)} Sulfur!`,
          duration: 6000,
        });
      } else if (multiplier >= 10) {
        toast({
          title: '🎉 MASSIVE WIN!',
          description: `${multiplier}x multiplier - Won ${winAmount.toFixed(2)} Sulfur!`,
          duration: 5000,
        });
      } else if (multiplier >= 5) {
        toast({
          title: '🔥 BIG WIN!',
          description: `${multiplier}x multiplier - Won ${winAmount.toFixed(2)} Sulfur`,
          duration: 4000,
        });
      } else if (multiplier >= 2) {
        toast({
          title: '✅ Nice Win!',
          description: `${multiplier}x multiplier - Won ${winAmount.toFixed(2)} Sulfur`,
        });
      } else if (multiplier >= 1) {
        toast({
          title: 'Small Win',
          description: `${multiplier}x multiplier - Won ${winAmount.toFixed(2)} Sulfur`,
        });
      } else {
        toast({
          title: 'Better luck next time!',
          description: `${multiplier}x multiplier - Won ${winAmount.toFixed(2)} Sulfur`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in handleBallLanded:', error);
      toast({
        title: 'Error',
        description: 'Failed to process result. Please contact support.',
        variant: 'destructive',
      });
      
      // Decrease ball count on error
      setActiveBallsCount(prev => Math.max(0, prev - 1));
    }
  }, [user, profile, currentBet, gameMode, toast, refreshProfile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={handleBackToGames}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Games
            </Button>
            
            <div className="text-center">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-orbitron gaming-text-glow">
                PLINKO
              </h1>
            </div>
            
            <div className="w-32" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Game Board */}
            <div className="xl:col-span-3">
              <Card className="bg-card/60 border-border/50 p-6 backdrop-blur-sm">
                <PlinkoBoard
                  onBallLanded={handleBallLanded}
                  activeBallsCount={activeBallsCount}
                  betAmount={currentBet}
                  multipliers={currentMultipliers}
                />
              </Card>
            </div>

            {/* Sidebar Controls */}
            <div className="xl:col-span-1 space-y-4">
              <GameModeSelector
                selectedMode={gameMode}
                onModeChange={handleGameModeChange}
              />
              
              <BettingControls
                currentBet={currentBet}
                onBetChange={handleBetChange}
                onDropBall={handleDropBall}
                isDropping={isProcessingBet}
                balance={profile?.balance || 0}
                activeBallsCount={activeBallsCount}
                maxMultiplier={maxMultiplier}
                minMultiplier={minMultiplier}
              />
              
              <GameStats
                gameHistory={gameHistory}
                totalWinnings={totalWinnings}
                totalWagered={totalWagered}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
