
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { CountdownTimer } from './BattleAnimations';

interface BattleStatusManagerProps {
  needsMorePlayers: boolean;
  battleStatus: 'waiting' | 'rolling' | 'finished';
  waitingTime: number;
  countdown: number;
  onCallBot: () => void;
  onStartBattle: () => void;
}

export const BattleStatusManager: React.FC<BattleStatusManagerProps> = ({
  needsMorePlayers,
  battleStatus,
  waitingTime,
  countdown,
  onCallBot,
  onStartBattle
}) => {
  if (needsMorePlayers) {
    return (
      <div className="text-center space-y-3">
        <div className="text-lg font-bold text-orange-500 animate-pulse">
          Searching for players...
        </div>
        <div className="text-sm text-muted-foreground">
          {waitingTime}s elapsed
        </div>
        <Button
          onClick={onCallBot}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold"
        >
          <Bot className="h-4 w-4 mr-2" />
          CALL BOT
        </Button>
      </div>
    );
  }

  if (!needsMorePlayers && battleStatus === 'waiting') {
    return (
      <div className="text-center">
        <CountdownTimer seconds={countdown} onComplete={onStartBattle} />
        <div className="text-sm text-muted-foreground mt-2">Battle starts in</div>
      </div>
    );
  }

  if (battleStatus === 'rolling') {
    return (
      <div className="text-center">
        <div className="text-lg font-bold text-primary animate-pulse">Rolling...</div>
        <div className="text-sm text-muted-foreground">Opening crates</div>
      </div>
    );
  }

  return null;
};
