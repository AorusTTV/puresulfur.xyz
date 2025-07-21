
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { GameHeader } from './GameHeader';
import { WheelSection } from './WheelSection';
import { WheelSidebar } from './WheelSidebar';
import { useWheelGame } from '@/hooks/useWheelGame';
import { useWheelBetting } from '@/hooks/useWheelBetting';
import { GameGuard } from '@/components/games/GameGuard';

interface WheelOfFortuneGameProps {
  onBackToGames?: () => void;
}

export const WheelOfFortuneGame: React.FC<WheelOfFortuneGameProps> = ({ onBackToGames }) => {
  const navigate = useNavigate();
  
  const {
    isSpinning,
    timeLeft,
    currentGame,
    userBets,
    totalBets,
    playerCount,
    winningSection,
    user,
    profile,
    loadCurrentGame
  } = useWheelGame();

  const {
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
  } = useWheelBetting({
    user,
    profile,
    isSpinning,
    loadCurrentGame
  });

  const handleBackToGames = () => {
    if (onBackToGames) {
      onBackToGames();
    } else {
      navigate('/games');
    }
  };

  return (
    <GameGuard gameName="Wheel of Fortune">
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="p-4">
          <div className="container mx-auto max-w-7xl">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="outline"
                onClick={handleBackToGames}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Games
              </Button>
              <GameHeader />
              <div className="w-32" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <WheelSection
                timeLeft={timeLeft}
                isSpinning={isSpinning}
                winningSection={winningSection}
                selectedMultiplier={selectedMultiplier}
                onMultiplierSelect={setSelectedMultiplier}
                userBets={userBets}
              />

              <WheelSidebar
                betAmount={betAmount}
                selectedMultiplier={selectedMultiplier}
                userBalance={profile?.balance || 0}
                isSpinning={isSpinning}
                isLoggedIn={!!user}
                userBets={userBets}
                currentGame={currentGame}
                totalBets={totalBets}
                playerCount={playerCount}
                onBetAmountChange={handleBetAmountChange}
                onPlaceBet={handlePlaceBet}
                onClearBet={clearBet}
                onMaxBet={maxBet}
                onDoubleBet={doubleBet}
                onDivideBet={divideBet}
                onAddToBet={addToBet}
              />
            </div>
          </div>
        </div>
      </div>
    </GameGuard>
  );
};
