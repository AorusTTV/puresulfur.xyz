
import React from 'react';
import { Button } from '@/components/ui/button';
import { MineFieldGame } from '@/types/minefield';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  game: MineFieldGame | null;
  onCellClick: (cellId: number) => void;
  loading: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ game, onCellClick, loading }) => {
  if (!game) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted/20 rounded-lg border-2 border-dashed border-border">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-2">Ready to start mining?</p>
          <p className="text-sm text-muted-foreground">Set your bet and mine count, then click "Start Game"</p>
        </div>
      </div>
    );
  }

  // Check if game is finished (won or lost)
  const isGameFinished = game.gameStatus === 'won' || game.gameStatus === 'lost';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto">
        {game.cells.map((cell) => {
          // Show content for revealed cells during gameplay, or all cells when game is finished
          const shouldShowContent = cell.isRevealed || isGameFinished;
          
          return (
            <Button
              key={cell.id}
              variant="outline"
              className={cn(
                "aspect-square p-0 text-2xl font-bold transition-all duration-200",
                "hover:scale-105 active:scale-95",
                {
                  // Default unrevealed state during gameplay
                  "bg-muted hover:bg-muted/80 border-border": !cell.isRevealed && !isGameFinished,
                  
                  // Cells that were clicked during gameplay (revealed cells)
                  "bg-green-500 hover:bg-green-600 border-green-400 text-white": 
                    cell.isRevealed && !cell.isMine,
                  "bg-red-500 hover:bg-red-600 border-red-400": 
                    cell.isRevealed && cell.isMine,
                  
                  // Cells revealed only at game end (not clicked during gameplay)
                  "bg-muted/60 hover:bg-muted/70 border-border/70": 
                    !cell.isRevealed && isGameFinished,
                  
                  // Disabled state
                  "cursor-not-allowed opacity-50": loading || game.gameStatus !== 'playing'
                }
              )}
              style={{ width: '100px', height: '100px' }}
              onClick={() => onCellClick(cell.id)}
              disabled={cell.isRevealed || loading || game.gameStatus !== 'playing'}
            >
              {shouldShowContent && cell.isMine && (
                <img 
                  src="/lovable-uploads/d339e72c-3e56-4820-948f-af2854f8a24d.png" 
                  alt="Mine" 
                  className="w-13 h-13 object-contain"
                />
              )}
              {shouldShowContent && !cell.isMine && (
                <img 
                  src="/lovable-uploads/1d98c053-273f-477d-ba8c-da0953c4eb7a.png" 
                  alt="Sulfur" 
                  className="w-13 h-13 object-contain"
                />
              )}
            </Button>
          );
        })}
      </div>

      {game.gameStatus === 'lost' && (
        <div className="text-center p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 font-semibold">Game Over! You hit a mine.</p>
          <p className="text-red-300 text-sm mt-1">All mine and sulfur locations are now revealed. Bright cells are ones you clicked.</p>
        </div>
      )}

      {game.gameStatus === 'won' && (
        <div className="text-center p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
          <p className="text-green-400 font-semibold">Congratulations! You cashed out successfully.</p>
          <p className="text-green-300 text-sm mt-1">All mine and sulfur locations are now revealed. Bright cells are ones you clicked.</p>
        </div>
      )}
    </div>
  );
};
