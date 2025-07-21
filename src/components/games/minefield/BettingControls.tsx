
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MineFieldGame } from '@/types/minefield';
import { Coins, Play, TrendingUp } from 'lucide-react';

interface BettingControlsProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  mineCount: number;
  setMineCount: (count: number) => void;
  onStartGame: () => void;
  onCashOut: () => void;
  game: MineFieldGame | null;
  userBalance: number;
  loading: boolean;
}

export const BettingControls: React.FC<BettingControlsProps> = ({
  betAmount,
  setBetAmount,
  mineCount,
  setMineCount,
  onStartGame,
  onCashOut,
  game,
  userBalance,
  loading
}) => {
  const quickBetAmounts = [1, 5, 10, 25, 50, 100];

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Coins className="h-5 w-5" />
          Game Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Display */}
        <div className="bg-muted/20 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">Your Balance</p>
          <p className="text-2xl font-bold text-primary">${userBalance.toFixed(2)}</p>
        </div>

        {/* Bet Amount */}
        <div className="space-y-2">
          <Label htmlFor="betAmount">Bet Amount</Label>
          <Input
            id="betAmount"
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            min="0.1"
            step="0.1"
            disabled={game?.gameStatus === 'playing'}
            className="bg-background/50"
          />
          
          {/* Quick Bet Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {quickBetAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setBetAmount(amount)}
                disabled={game?.gameStatus === 'playing'}
                className="text-xs"
              >
                ${amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Mine Count */}
        <div className="space-y-2">
          <Label htmlFor="mineCount">Number of Mines</Label>
          <Select 
            value={mineCount.toString()} 
            onValueChange={(value) => setMineCount(parseInt(value))}
            disabled={game?.gameStatus === 'playing'}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 22 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'Mine' : 'Mines'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {!game || game.gameStatus !== 'playing' ? (
            <Button 
              onClick={onStartGame}
              disabled={loading || betAmount > userBalance}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Game
            </Button>
          ) : (
            <Button 
              onClick={onCashOut}
              disabled={loading || game.revealedCount === 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Cash Out ${((game.betAmount || 0) + (game.profit || 0)).toFixed(2)}
            </Button>
          )}
        </div>

        {betAmount > userBalance && (
          <p className="text-sm text-red-400">Insufficient balance for this bet</p>
        )}
      </CardContent>
    </Card>
  );
};
