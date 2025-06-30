
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BattleAnimations } from './BattleAnimations';

interface BattleControlsProps {
  battleStatus: 'waiting' | 'rolling' | 'finished';
  winner: string | null;
  battleData: any;
  onBattleEnd: () => void;
}

export const BattleControls: React.FC<BattleControlsProps> = ({
  battleStatus,
  winner,
  battleData,
  onBattleEnd
}) => {
  if (battleStatus !== 'finished') {
    return null;
  }

  return (
    <BattleAnimations>
      <Card className="bg-card/60 border-border/50 p-6">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Battle Complete!</h3>
          {winner && (
            <div className="text-lg text-muted-foreground">
              🎉 {battleData?.players?.find((p: any) => p.id === winner)?.name || 'Unknown'} wins the battle! 🎉
            </div>
          )}
          <div className="flex justify-center space-x-4">
            <Button onClick={onBattleEnd} variant="outline">
              New Battle
            </Button>
            <Button 
              onClick={onBattleEnd}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Back to Selection
            </Button>
          </div>
        </div>
      </Card>
    </BattleAnimations>
  );
};
