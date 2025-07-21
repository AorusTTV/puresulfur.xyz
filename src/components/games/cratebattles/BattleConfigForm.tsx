
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { RustCrate } from './rustCrateData';
import { GameModeSelector } from './GameModeSelector';
import { Trash2 } from 'lucide-react';

interface BattleConfigFormProps {
  selectedCrate: RustCrate;
  battleCrates?: Array<{crate: RustCrate, quantity: number}>;
  playerCount: number;
  gameMode: 'default' | 'terminal' | 'unlucky' | 'jackpot' | 'puresulfur';
  teamMode: string;
  onPlayerCountChange: (count: number) => void;
  onGameModeChange: (mode: 'default' | 'terminal' | 'unlucky' | 'jackpot' | 'puresulfur') => void;
  onTeamModeChange: (mode: string) => void;
  onStartBattle: () => void;
  minEntry: number;
  maxEntry: number;
}

export const BattleConfigForm: React.FC<BattleConfigFormProps> = ({
  selectedCrate,
  battleCrates = [],
  playerCount,
  gameMode,
  teamMode,
  onPlayerCountChange,
  onGameModeChange,
  onTeamModeChange,
  onStartBattle,
  minEntry,
  maxEntry
}) => {
  const { profile } = useAuth();

  const teamModes = ['1v1', '2v2', '3v3', '1v1v1', '2v2v2'];

  const getTotalCost = () => {
    return battleCrates.reduce((total, item) => total + (item.crate.price * item.quantity), 0);
  };

  const getTotalCrates = () => {
    return battleCrates.reduce((total, item) => total + item.quantity, 0);
  };

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const totalCost = getTotalCost();
    if (totalCost < minEntry || totalCost > maxEntry) {
      setError(`Total cost must be between ${minEntry} and ${maxEntry}`);
    } else {
      setError(null);
    }
  }, [getTotalCost, minEntry, maxEntry]);

  return (
    <div className="space-y-6">
      {/* Added Crates Display */}
      {battleCrates.length > 0 && (
        <Card className="bg-card/60 border-border/50 p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Battle Crates ({getTotalCrates()})</h3>
          <div className="space-y-3">
            {battleCrates.map((item, index) => (
              <div key={`${item.crate.id}-${index}`} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img 
                    src={item.crate.image} 
                    alt={item.crate.name}
                    className="w-12 h-12 object-cover rounded border-2 border-primary/20"
                  />
                  <div>
                    <div className="font-medium text-foreground">{item.crate.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity}x @ ${item.crate.price} each
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400">
                    ${(item.crate.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Game Mode Selection */}
      <GameModeSelector 
        gameMode={gameMode}
        setGameMode={onGameModeChange}
        teamMode={teamMode}
        setTeamMode={onTeamModeChange}
        playerCount={playerCount}
        setPlayerCount={onPlayerCountChange}
      />

      {/* Privacy Toggle */}
      <Card className="bg-card/60 border-border/50 p-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <span>🔓</span>
            <span>Public Battle</span>
          </Button>
        </div>
      </Card>

      {/* Battle Summary */}
      <Card className="bg-secondary/30 border-border/50 p-4">
        <h3 className="font-semibold mb-3">Battle Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total crates:</span>
            <span className="ml-2 font-medium">{getTotalCrates()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Game mode:</span>
            <span className="ml-2 font-medium capitalize">{gameMode}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Team mode:</span>
            <span className="ml-2 font-medium">{teamMode}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total cost:</span>
            <span className="ml-2 font-bold text-green-400">${getTotalCost().toFixed(2)}</span>
          </div>
        </div>
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      </Card>

      {/* Create Battle Button */}
      <Button
        onClick={onStartBattle}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3"
        disabled={!profile || profile.balance < getTotalCost() || battleCrates.length === 0 || !!error}
      >
        Create Battle
      </Button>
    </div>
  );
};
