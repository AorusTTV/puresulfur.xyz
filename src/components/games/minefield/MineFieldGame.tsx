
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { GameBoard } from './GameBoard';
import { BettingControls } from './BettingControls';
import { GameStats } from './GameStats';
import { MineFieldGame as MineFieldGameType, MineFieldCell } from '@/types/minefield';
import { ArrowLeft, Bomb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { addExperience } from '@/utils/experienceUtils';
import { getMinefieldMultiplier } from '@/utils/minefieldMultipliers';

interface MineFieldGameProps {
  onBackToGames?: () => void;
}

export const MineFieldGame: React.FC<MineFieldGameProps> = ({ onBackToGames }) => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [game, setGame] = useState<MineFieldGameType | null>(null);
  const [betAmount, setBetAmount] = useState<number>(1);
  const [mineCount, setMineCount] = useState<number>(3);
  const [loading, setLoading] = useState(false);

  const handleBackToGames = () => {
    if (onBackToGames) {
      onBackToGames();
    } else {
      navigate('/games');
    }
  };

  // Update user balance in Supabase
  const updateUserBalance = useCallback(async (newBalance: number) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update balance. Please try again.',
        variant: 'destructive'
      });
      return false;
    }

    // Refresh the profile to get updated balance
    await refreshProfile();
    return true;
  }, [user, refreshProfile, toast]);

  // Initialize a new game
  const initializeGame = useCallback((bet: number, mines: number) => {
    const totalCells = 25; // 5x5 grid
    const cells: MineFieldCell[] = [];
    
    // Create all cells
    for (let i = 0; i < totalCells; i++) {
      cells.push({
        id: i,
        isRevealed: false,
        isMine: false,
        isSelected: false
      });
    }
    
    // Randomly place mines
    const minePositions = new Set<number>();
    while (minePositions.size < mines) {
      const position = Math.floor(Math.random() * totalCells);
      minePositions.add(position);
    }
    
    // Set mines in cells
    minePositions.forEach(position => {
      cells[position].isMine = true;
    });

    const newGame: MineFieldGameType = {
      id: `minefield_${Date.now()}`,
      cells,
      totalCells,
      mineCount: mines,
      revealedCount: 0,
      betAmount: bet,
      currentMultiplier: 1,
      gameStatus: 'playing',
      profit: 0
    };

    setGame(newGame);
  }, []);

  // Handle cell click
  const handleCellClick = useCallback(async (cellId: number) => {
    if (!game || game.gameStatus !== 'playing' || loading) return;
    
    const cell = game.cells[cellId];
    if (cell.isRevealed) return;

    setLoading(true);

    const updatedCells = [...game.cells];
    updatedCells[cellId] = { ...cell, isRevealed: true, isSelected: true };

    if (cell.isMine) {
      // Hit a mine - game over
      const updatedGame: MineFieldGameType = {
        ...game,
        cells: updatedCells,
        gameStatus: 'lost',
        profit: -game.betAmount
      };
      
      setGame(updatedGame);

      // Update user balance (balance was already deducted when game started)
      // No need to deduct again, just refresh to show current balance
      await refreshProfile();
    } else {
      // Safe cell - use new multiplier system
      const newRevealedCount = game.revealedCount + 1;
      const newMultiplier = getMinefieldMultiplier(game.mineCount, newRevealedCount);
      const newProfit = (game.betAmount * newMultiplier) - game.betAmount;

      const updatedGame: MineFieldGameType = {
        ...game,
        cells: updatedCells,
        revealedCount: newRevealedCount,
        currentMultiplier: newMultiplier,
        profit: newProfit
      };

      setGame(updatedGame);
    }

    setLoading(false);
  }, [game, loading, refreshProfile]);

  // Start new game
  const handleStartGame = useCallback(async () => {
    if (!profile || (profile.balance || 0) < betAmount) {
      toast({
        title: 'Insufficient Balance',
        description: 'Not enough balance to place this bet.',
        variant: 'destructive'
      });
      return;
    }

    if (mineCount >= 24) {
      toast({
        title: 'Invalid Mine Count',
        description: 'Mine count must be less than 24.',
        variant: 'destructive'
      });
      return;
    }

    // Deduct bet from balance
    const newBalance = (profile.balance || 0) - betAmount;
    const success = await updateUserBalance(newBalance);
    
    if (!success) return;

    // Add experience points for the wager
    if (user) {
      const expAdded = await addExperience(user.id, betAmount);
      if (expAdded) {
        console.log(`Added experience for MINEFIELD bet: $${betAmount}`);
        // Refresh profile to show updated XP and level
        await refreshProfile();
      }
    }

    // Add to user wagers tracking
    if (user) {
      const { error } = await supabase
        .from('user_wagers')
        .insert({
          user_id: user.id,
          amount: betAmount,
          game_type: 'minefield',
          description: `MINEFIELD bet: $${betAmount} with ${mineCount} mines`
        });

      if (error) {
        console.error('Error tracking wager:', error);
      }
    }

    initializeGame(betAmount, mineCount);
  }, [profile, betAmount, mineCount, updateUserBalance, initializeGame, toast, user, refreshProfile]);

  // Cash out - query authoritative backend multiplier
  const handleCashOut = useCallback(async () => {
    if (!game || game.gameStatus !== 'playing') return;

    // Get authoritative multiplier from backend calculation
    const authoritativeMultiplier = getMinefieldMultiplier(game.mineCount, game.revealedCount);
    const winAmount = game.betAmount * authoritativeMultiplier;
    
    const updatedGame: MineFieldGameType = {
      ...game,
      gameStatus: 'won',
      currentMultiplier: authoritativeMultiplier,
      profit: winAmount - game.betAmount
    };
    
    setGame(updatedGame);

    // Update user balance
    if (profile) {
      const newBalance = (profile.balance || 0) + winAmount;
      await updateUserBalance(newBalance);
    }

    // Log the authoritative multiplier for verification
    console.log(`Cash out: ${game.mineCount} mines, ${game.revealedCount} safe clicks -> ${authoritativeMultiplier}× multiplier`);
  }, [game, profile, updateUserBalance]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
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
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-orbitron gaming-text-glow flex items-center justify-center gap-3">
                <Bomb className="h-8 w-8 text-primary" />
                MINEFIELD
              </h1>
            </div>
            
            <div className="w-32" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Board */}
            <div className="lg:col-span-2">
              <Card className="bg-card/60 border-border/50 backdrop-blur-sm p-6">
                <GameBoard 
                  game={game} 
                  onCellClick={handleCellClick}
                  loading={loading}
                />
              </Card>
            </div>

            {/* Controls and Stats */}
            <div className="space-y-6">
              <BettingControls
                betAmount={betAmount}
                setBetAmount={setBetAmount}
                mineCount={mineCount}
                setMineCount={setMineCount}
                onStartGame={handleStartGame}
                onCashOut={handleCashOut}
                game={game}
                userBalance={profile?.balance || 0}
                loading={loading}
              />
              
              {game && (
                <GameStats game={game} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
