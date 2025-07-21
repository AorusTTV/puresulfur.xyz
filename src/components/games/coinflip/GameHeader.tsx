
import React from 'react';
import { Coins } from 'lucide-react';

export const GameHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center gap-3">
        <Coins className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-orbitron gaming-text-glow">
            COINFLIP
          </h1>
          <p className="text-muted-foreground">50/50 chance to double your skins</p>
        </div>
      </div>
    </div>
  );
};
