
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus } from 'lucide-react';

interface BettingControlsProps {
  currentBet: number;
  onBetChange: (bet: number) => void;
  onDropBall: () => void;
  isDropping: boolean;
  balance: number;
  activeBallsCount?: number;
  maxMultiplier: number;
  minMultiplier: number;
}

export const BettingControls = ({
  currentBet,
  onBetChange,
  onDropBall,
  isDropping,
  balance,
  activeBallsCount = 0,
  maxMultiplier,
  minMultiplier
}: BettingControlsProps) => {
  const quickBets = [0.1, 1, 5, 10, 25, 50];

  const handleInputChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onBetChange(Math.min(numValue, balance));
    }
  };

  const handleQuickBet = (amount: number) => {
    onBetChange(Math.min(amount, balance));
  };

  const handleMaxBet = () => {
    onBetChange(Math.min(balance, 1000));
  };

  const handleBetAdjust = (delta: number) => {
    const newBet = Math.max(0.1, Math.min(currentBet + delta, balance));
    onBetChange(newBet);
  };

  // Allow play as long as there's a valid bet and sufficient balance (remove active balls restriction)
  const canPlay = currentBet > 0 && currentBet <= balance;

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-primary text-xl font-bold">Place Your Bet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-4 border border-border/50">
          <div className="text-sm text-muted-foreground mb-1">Balance</div>
          <div className="text-xl font-bold text-foreground flex items-center">
            <img 
              src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
              alt="Sulfur" 
              className="h-6 w-6 mr-2" 
            />
            {balance.toFixed(2)}
          </div>
        </div>

        {/* Bet Amount Input with +/- buttons */}
        <div className="space-y-3">
          <Label htmlFor="bet-amount" className="text-foreground font-medium">Bet Amount</Label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleBetAdjust(-0.1)}
              disabled={currentBet <= 0.1}
              className="bg-muted border-border text-foreground hover:bg-muted/80 h-10 w-10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="bet-amount"
              type="number"
              value={currentBet}
              onChange={(e) => handleInputChange(e.target.value)}
              min="0.1"
              max={balance}
              step="0.1"
              className="bg-muted border-border text-foreground text-center font-medium"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleBetAdjust(0.1)}
              disabled={currentBet >= balance}
              className="bg-muted border-border text-foreground hover:bg-muted/80 h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Bet Buttons */}
        <div className="space-y-3">
          <Label className="text-foreground font-medium">Quick Bets</Label>
          <div className="grid grid-cols-3 gap-2">
            {quickBets.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => handleQuickBet(amount)}
                disabled={amount > balance}
                className={`bg-muted border-border text-foreground hover:bg-muted/80 transition-all ${
                  currentBet === amount ? 'ring-2 ring-accent bg-accent/20' : ''
                }`}
              >
                {amount < 1 ? amount.toFixed(1) : amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={handleMaxBet}
            className="w-full bg-muted border-border text-foreground hover:bg-muted/80"
          >
            Max Bet ({Math.min(balance, 1000).toFixed(2)})
          </Button>

          <Button
            onClick={onDropBall}
            disabled={!canPlay || isDropping}
            className={`w-full font-bold py-4 text-lg transition-all ${
              canPlay && !isDropping
                ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-[1.02]' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isDropping ? 'Processing...' : 'Drop Ball'}
          </Button>
        </div>

        {/* Potential Win Display */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-border/50">
          <div className="text-sm text-muted-foreground mb-1">Potential Win Range</div>
          <div className="text-lg font-bold text-foreground flex items-center justify-between">
            <span className="text-destructive">{(currentBet * minMultiplier).toFixed(2)}</span>
            <span className="text-muted-foreground">to</span>
            <span className="text-primary">{(currentBet * maxMultiplier).toFixed(0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
