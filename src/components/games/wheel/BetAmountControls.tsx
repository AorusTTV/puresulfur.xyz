
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BetAmountControlsProps {
  betAmount: string;
  userBalance: number;
  isSpinning: boolean;
  onBetAmountChange: (value: string) => void;
  onDoubleBet: () => void;
  onDivideBet: () => void;
  onAddToBet: (amount: number) => void;
}

export const BetAmountControls: React.FC<BetAmountControlsProps> = ({
  betAmount,
  userBalance,
  isSpinning,
  onBetAmountChange,
  onDoubleBet,
  onDivideBet,
  onAddToBet
}) => {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Enter amount"
        value={betAmount}
        onChange={(e) => onBetAmountChange(e.target.value)}
        className="bg-background/50 border-border text-foreground placeholder-muted-foreground"
        type="number"
        step="0.01"
        min="0"
        max={userBalance || 0}
        disabled={isSpinning}
      />

      <div className="grid grid-cols-4 gap-2">
        <Button 
          onClick={onDoubleBet}
          className="bg-accent/20 hover:bg-accent/30 text-accent hover:text-accent-foreground border border-accent/30"
          disabled={isSpinning}
        >
          x2
        </Button>
        <Button 
          onClick={onDivideBet}
          className="bg-accent/20 hover:bg-accent/30 text-accent hover:text-accent-foreground border border-accent/30"
          disabled={isSpinning}
        >
          /2
        </Button>
        <Button 
          onClick={() => onAddToBet(0.5)}
          className="bg-accent/20 hover:bg-accent/30 text-accent hover:text-accent-foreground border border-accent/30"
          disabled={isSpinning}
        >
          +0.50
        </Button>
        <Button 
          onClick={() => onAddToBet(1)}
          className="bg-accent/20 hover:bg-accent/30 text-accent hover:text-accent-foreground border border-accent/30"
          disabled={isSpinning}
        >
          +1.00
        </Button>
      </div>
    </div>
  );
};
