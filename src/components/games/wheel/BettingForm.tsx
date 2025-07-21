
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BetAmountControls } from './BetAmountControls';
import { BetInfo } from './BetInfo';
import { SulfurIcon } from '@/components/ui/SulfurIcon';

interface BettingFormProps {
  betAmount: string;
  selectedMultiplier: number | null;
  userBalance: number;
  isSpinning: boolean;
  isLoggedIn: boolean;
  onBetAmountChange: (value: string) => void;
  onPlaceBet: () => void;
  onClearBet: () => void;
  onMaxBet: () => void;
  onDoubleBet: () => void;
  onDivideBet: () => void;
  onAddToBet: (amount: number) => void;
}

export const BettingForm: React.FC<BettingFormProps> = ({
  betAmount,
  selectedMultiplier,
  userBalance,
  isSpinning,
  isLoggedIn,
  onBetAmountChange,
  onPlaceBet,
  onClearBet,
  onMaxBet,
  onDoubleBet,
  onDivideBet,
  onAddToBet
}) => {
  const wheelSections = [
    { number: 1, multiplier: 2 },
    { number: 3, multiplier: 4 },
    { number: 5, multiplier: 6 },
    { number: 10, multiplier: 11 },
    { number: 20, multiplier: 21 }
  ];

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-foreground font-bold text-lg">PLACE BET</h3>
          <div className="flex items-center gap-1 ml-auto">
            <SulfurIcon className="h-4 w-4" />
            <span className="text-foreground">{userBalance.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        <div className="space-y-4">
          <BetAmountControls
            betAmount={betAmount}
            userBalance={userBalance}
            isSpinning={isSpinning}
            onBetAmountChange={onBetAmountChange}
            onDoubleBet={onDoubleBet}
            onDivideBet={onDivideBet}
            onAddToBet={onAddToBet}
          />

          <BetInfo
            selectedMultiplier={selectedMultiplier}
            betAmount={betAmount}
            wheelSections={wheelSections}
          />

          <Button 
            onClick={onPlaceBet}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold"
            disabled={isSpinning || !isLoggedIn || !selectedMultiplier || !betAmount}
          >
            {isSpinning ? 'WHEEL SPINNING' : !isLoggedIn ? 'Login Required' : 'PLACE BET'}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={onClearBet}
              className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              disabled={isSpinning}
            >
              CLEAR
            </Button>
            <Button 
              onClick={onMaxBet}
              className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              disabled={isSpinning}
            >
              MAX BET
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
