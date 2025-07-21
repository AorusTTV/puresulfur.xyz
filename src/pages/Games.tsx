
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGameStatus } from '@/hooks/useGameStatus';
import { WheelOfFortuneGame } from '@/components/games/wheel/WheelOfFortuneGame';
import { CoinflipGame } from '@/components/games/coinflip/CoinflipGame';
import { PlinkoGame } from '@/components/games/plinko/PlinkoGame';
import { MineFieldGame } from '@/components/games/minefield/MineFieldGame';
import { JackpotGame } from '@/components/games/jackpot/JackpotGame';
import { CrateBattlesGame } from '@/components/games/cratebattles/CrateBattlesGame';
import { DualGame } from '@/components/games/dual/DualGame';
import { GamesBanner } from '@/components/games/GamesBanner';
import { GamesGrid } from '@/components/games/GamesGrid';
import { ComingSoonSection } from '@/components/games/ComingSoonSection';
import { MaintenancePage } from '@/components/maintenance/MaintenancePage';
import { games } from '@/data/gamesData';

const Games = () => {
  const { user, profile } = useAuth();
  const { isGameActive } = useGameStatus();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = profile?.nickname === 'admin';

  const handlePlayGame = (gameId: string) => {
    if (!user) {
      return;
    }
    const game = games.find(g => g.id === gameId);
    if (game?.comingSoon) {
      return; // Don't navigate to coming soon games
    }
    setSelectedGame(gameId);
    console.log(`Starting game: ${gameId}`);
  };

  const handleBackToGames = () => {
    setSelectedGame(null);
  };

  // If a game is selected, check if it's active (unless user is admin)
  if (selectedGame) {
    // If game is inactive and user is not admin, show maintenance page
    if (!isGameActive(selectedGame) && !isAdmin) {
      return <MaintenancePage />;
    }

    // Show the appropriate game component
    if (selectedGame === 'crate-battles') {
      return <CrateBattlesGame onBackToGames={handleBackToGames} />;
    }

    if (selectedGame === 'bandit-wheel') {
      return <WheelOfFortuneGame onBackToGames={handleBackToGames} />;
    }

    if (selectedGame === 'coinflip') {
      return <CoinflipGame onBackToGames={handleBackToGames} />;
    }

    if (selectedGame === 'plinko') {
      return <PlinkoGame onBackToGames={handleBackToGames} />;
    }

    if (selectedGame === 'minefield') {
      return <MineFieldGame onBackToGames={handleBackToGames} />;
    }

    if (selectedGame === 'jackpot') {
      return <JackpotGame onBackToGames={handleBackToGames} />;
    }

    if (selectedGame === 'dual') {
      return <DualGame onBackToGames={handleBackToGames} />;
    }
  }

  return (
    <div className="min-h-screen">
      {/* Title Banner Section */}
      <GamesBanner />

      <div className="container mx-auto px-4 py-8">
        {/* Games Grid */}
        <GamesGrid 
          games={games}
          isAuthenticated={!!user}
          onPlayGame={handlePlayGame}
        />

        {/* Coming Soon Section */}
        <ComingSoonSection />
      </div>
    </div>
  );
};

export default Games;
