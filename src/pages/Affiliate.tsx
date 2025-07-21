
import React from 'react';
import { AffiliateDashboard } from '@/components/affiliate/AffiliateDashboard';
import { GameGuard } from '@/components/games/GameGuard';

const Affiliate: React.FC = () => {
  return (
    <GameGuard gameName="Affiliate Program">
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <AffiliateDashboard />
        </div>
      </div>
    </GameGuard>
  );
};

export default Affiliate;
