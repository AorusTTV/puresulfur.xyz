
import React from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlinkoGameHeaderProps {
  onBackToGames?: () => void;
}

export const PlinkoGameHeader: React.FC<PlinkoGameHeaderProps> = ({ onBackToGames }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBackToGames}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Games
        </Button>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-orbitron gaming-text-glow flex items-center gap-3">
          <Zap className="h-8 w-8 text-primary" />
          PLINKO
        </h1>
      </div>
    </div>
  );
};
