
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MineFieldGame } from '@/types/minefield';
import { TrendingUp, Target, Bomb, Gem } from 'lucide-react';
import { formatMultiplier } from '@/utils/minefieldMultipliers';

interface GameStatsProps {
  game: MineFieldGame;
}

export const GameStats: React.FC<GameStatsProps> = ({ game }) => {
  const safeCells = game.totalCells - game.mineCount;
  const remainingSafeCells = safeCells - game.revealedCount;

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Target className="h-5 w-5" />
          Game Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-primary">{formatMultiplier(game.currentMultiplier)}</p>
            <p className="text-xs text-muted-foreground">Multiplier</p>
          </div>
          
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              ${(game.betAmount + game.profit).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Potential Win</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Gem className="h-4 w-4 text-green-400" />
              <span className="text-sm">Gems Found</span>
            </div>
            <span className="font-semibold">{game.revealedCount}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bomb className="h-4 w-4 text-red-400" />
              <span className="text-sm">Mines</span>
            </div>
            <span className="font-semibold">{game.mineCount}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Safe Cells Left</span>
            <span className="font-semibold">{remainingSafeCells}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Bet Amount</span>
            <span className="font-semibold">${game.betAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Profit</span>
            <span className={`font-semibold ${game.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${game.profit.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
