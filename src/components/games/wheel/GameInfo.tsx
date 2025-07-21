
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface GameInfoProps {
  currentGame: any;
}

export const GameInfo: React.FC<GameInfoProps> = ({ currentGame }) => {
  return (
    <Card className="bg-slate-800/60 border-slate-600">
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">#{currentGame?.game_round || 'Loading...'}</div>
          <div className="text-slate-400">Round #{currentGame?.id?.slice(-8) || 'N/A'}</div>
        </div>
      </CardContent>
    </Card>
  );
};
