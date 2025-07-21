
import React from 'react';
import { GameCard } from './GameCard';

interface Game {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  minBet: number;
  maxBet: number;
  comingSoon?: boolean;
  doubleXP?: boolean;
}

interface GamesGridProps {
  games: Game[];
  isAuthenticated: boolean;
  onPlayGame: (gameId: string) => void;
}

export const GamesGrid: React.FC<GamesGridProps> = ({ games, isAuthenticated, onPlayGame }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {games.map((game) => (
        <GameCard 
          key={game.id}
          game={game}
          isAuthenticated={isAuthenticated}
          onPlayGame={onPlayGame}
        />
      ))}
    </div>
  );
};
