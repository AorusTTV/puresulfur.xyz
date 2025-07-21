
import React from 'react';
import { Gamepad2 } from 'lucide-react';

export const GamesBanner: React.FC = () => {
  return (
    <div 
      className="relative h-64 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(/lovable-uploads/fb07dbf5-5844-4e29-8344-5a92a1343766.png)` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Banner Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Gamepad2 className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-orbitron gaming-text-glow">
              GAMES
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">Choose your adventure and test your luck</p>
        </div>
      </div>
    </div>
  );
};
