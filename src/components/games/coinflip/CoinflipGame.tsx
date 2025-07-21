
import React from 'react';
import { useCoinflipGame } from '@/hooks/useCoinflipGame';
import { useCoinflipRealtimeSync } from '@/hooks/coinflip/useCoinflipRealtimeSync';
import { GameHeader } from './GameHeader';
import { CreateGameForm } from './CreateGameForm';
import { GamesList } from './GamesList';
import { CoinFlipAnimation } from './CoinFlipAnimation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CoinflipGameProps {
  onBackToGames: () => void;
}

export const CoinflipGame: React.FC<CoinflipGameProps> = ({ onBackToGames }) => {
  const navigate = useNavigate();
  
  const {
    games,
    loading,
    isCreating,
    isJoining,
    isFlipping,
    flipResult,
    user,
    profile,
    createGame,
    joinGame,
    playAgainstBot,
    loadGames
  } = useCoinflipGame();

  // Enhanced real-time sync as backup
  // useCoinflipRealtimeSync(loadGames);

  // Default game settings - in the future this should come from a hook or context
  const gameSettings = {
    fee_percentage: 5,
    min_entry: 1,
    max_entry: 1000,
    is_active: true
  };

  const handleBackToGames = () => {
    if (onBackToGames) {
      onBackToGames();
    } else {
      navigate('/games');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-muted">
      <div className="container mx-auto px-4 py-8">
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

        {/* 2x XP Badge */}
        <div className="mb-6 flex justify-end">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            🎯 2x XP Active
          </div>
        </div>
        
        {/* Coin Flip Animation Overlay */}
        {isFlipping && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card rounded-lg p-8 max-w-md w-full mx-4 border border-border">
              <CoinFlipAnimation
                isFlipping={isFlipping}
                result={flipResult || undefined}
                onAnimationComplete={() => {
                  // Animation complete callback handled in hook
                }}
              />
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Create Game Section */}
          <div className="lg:col-span-1">
            <CreateGameForm
              onCreateGame={createGame}
              onPlayAgainstBot={playAgainstBot}
              isCreating={isCreating}
              isJoining={isJoining}
              userBalance={profile?.balance || 0}
              isLoggedIn={!!user}
            />
          </div>

          {/* Games List */}
          <div className="lg:col-span-2">
            <GamesList
              games={games}
              loading={loading}
              isJoining={isJoining}
              currentUserId={user?.id}
              onJoinGame={joinGame}
              onPlayAgainstBot={playAgainstBot}
              onRefresh={loadGames}
              gameSettings={gameSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
