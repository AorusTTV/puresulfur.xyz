
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Award } from 'lucide-react';

interface GameResult {
  ballId: string;
  slotIndex: number;
  multiplier: number;
  winAmount: number;
}

interface GameStatsProps {
  gameHistory: GameResult[];
  totalWinnings: number;
  totalWagered: number;
}

export const GameStats = ({ gameHistory, totalWinnings, totalWagered }: GameStatsProps) => {
  const totalGames = gameHistory.length;
  const averageMultiplier = totalGames > 0 
    ? gameHistory.reduce((sum, game) => sum + game.multiplier, 0) / totalGames 
    : 0;
  
  const biggestWin = gameHistory.reduce((max, game) => 
    game.winAmount > max ? game.winAmount : max, 0
  );

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-primary text-xl font-bold flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Game Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Total Games</div>
            <div className="text-lg font-bold text-foreground">{totalGames}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center border border-border/50">
            <div className="text-xs text-muted-foreground mb-1">Avg Multiplier</div>
            <div className="text-lg font-bold text-foreground">{averageMultiplier.toFixed(2)}x</div>
          </div>
        </div>

        {/* Biggest Win - Always visible */}
        <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg p-3 text-center border border-accent/30">
          <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center">
            <Award className="h-3 w-3 mr-1" />
            Biggest Win
          </div>
          <div className="text-lg font-bold text-accent flex items-center justify-center">
            <img 
              src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
              alt="Sulfur" 
              className="h-4 w-4 mr-1" 
            />
            {biggestWin.toFixed(2)}
          </div>
        </div>

        {/* Recent Games */}
        {gameHistory.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground font-medium">Recent Games</div>
            <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
              {gameHistory.slice(0, 8).map((game, index) => (
                <div
                  key={game.ballId}
                  className="bg-muted/30 rounded p-2 flex justify-between items-center text-xs border border-border/30"
                >
                  <span className="text-muted-foreground">#{totalGames - index}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold px-1.5 py-0.5 rounded text-xs ${
                      game.multiplier >= 10 ? 'bg-primary/30 text-primary' :
                      game.multiplier >= 2 ? 'bg-accent/30 text-accent' :
                      game.multiplier >= 1 ? 'bg-secondary/30 text-secondary-foreground' :
                      'bg-destructive/30 text-destructive'
                    }`}>
                      {game.multiplier}x
                    </span>
                    <span className="text-foreground font-medium">{game.winAmount.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
