
import React from 'react';
import { Card } from '@/components/ui/card';
import { LoginDialog } from '@/components/auth/LoginDialog';

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

interface GameCardProps {
  game: Game;
  isAuthenticated: boolean;
  onPlayGame: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, isAuthenticated, onPlayGame }) => {
  const cardContent = (
    <Card 
      className={`relative overflow-hidden border-none bg-transparent ${
        game.comingSoon ? 'cursor-not-allowed' : 'cursor-pointer'
      } group h-48`}
      onClick={() => isAuthenticated && onPlayGame(game.id)}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${game.imageUrl})` }}
      />
      
      {/* Dark Overlay */}
      <div className={`absolute inset-0 ${
        game.comingSoon 
          ? 'bg-black/70' 
          : 'bg-black/40 group-hover:bg-black/50 transition-all duration-300'
      }`} />
      
      {/* 2x XP Badge */}
      {game.doubleXP && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            2x XP
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6">
        <div className="flex-1" />
        
        {/* Game Name and Coming Soon Label */}
        <div className="text-center">
          <h3 className="font-bold text-xl tracking-wider text-white !text-white" style={{ color: 'white !important' }}>
            {game.name}
          </h3>
          {game.comingSoon && (
            <div className="mt-2 inline-flex items-center bg-primary/20 border border-primary/50 rounded-full px-3 py-1">
              <span className="text-primary text-sm font-medium">Coming Soon</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Hover Effect Border */}
      {!game.comingSoon && (
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/70 rounded-lg transition-all duration-300" />
      )}
    </Card>
  );

  if (isAuthenticated) {
    return cardContent;
  }

  return (
    <LoginDialog>
      {cardContent}
    </LoginDialog>
  );
};
