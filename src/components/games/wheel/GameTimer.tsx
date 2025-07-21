
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface GameTimerProps {
  timeLeft: number;
  isSpinning: boolean;
}

export const GameTimer: React.FC<GameTimerProps> = ({ timeLeft, isSpinning }) => {
  const getProgressBarWidth = () => {
    if (isSpinning) return "0%";
    // 30 seconds is full width (changed from 15)
    const percentage = (timeLeft / 30) * 100;
    return `${percentage}%`;
  };
  
  return (
    <div className="text-center mb-4">
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm inline-block w-full max-w-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-foreground font-bold text-lg">
                {isSpinning ? 'SPINNING' : 'NEXT ROLL IN'}
              </div>
              <div className="text-muted-foreground text-xs">
                {isSpinning ? 'Bets for this round are now final!' : 'Bets are only valid for this round!'}
              </div>
            </div>
            
            <div className="text-2xl font-bold text-primary">
              {isSpinning ? '...' : `${timeLeft}s`}
            </div>
          </div>
          
          {/* Progress Bar - Using site's design system */}
          <div className="h-2 bg-secondary rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-linear"
              style={{ width: getProgressBarWidth() }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
