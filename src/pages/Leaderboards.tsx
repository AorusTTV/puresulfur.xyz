
import React from 'react';
import { MonthlyLeaderboard } from '@/components/leaderboard/MonthlyLeaderboard';
import { Trophy } from 'lucide-react';

const Leaderboards = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
      {/* Title Banner Section */}
      <div 
        className="relative h-64 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/lovable-uploads/4b55ef1d-e679-4120-9757-2ff1b0a0a166.png)` }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Banner Content */}
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-primary mr-4" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-orbitron gaming-text-glow">
                LEADERBOARDS
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">Top players ranked by monthly wagering activity</p>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <MonthlyLeaderboard />
      </main>
    </div>
  );
};

export default Leaderboards;
