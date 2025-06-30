import React, { useState, useMemo } from 'react';
import { Card }   from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { rustCrates, RustCrate } from './rustCrateData';
import { CrateGrid }            from './CrateGrid';
import { GameModeSelector }     from './GameModeSelector';
import { Trash2 }               from 'lucide-react';
import { useAuth }              from '@/contexts/AuthContext';

/* ──────────────────────────────────────────────────────────────────── */
/* TYPES                                                               */
/* ──────────────────────────────────────────────────────────────────── */
export interface BasketEntry {
  crate: RustCrate;
  qty:   number;
}
interface Props {
  playerCount: number;
  gameMode: 'default' | 'terminal' | 'unlucky' | 'jackpot' | 'puresulfur';
  teamMode: string;
  onPlayerCountChange: (n: number) => void;
  onGameModeChange: (
    m: 'default' | 'terminal' | 'unlucky' | 'jackpot' | 'puresulfur'
  ) => void;
  onTeamModeChange: (m: string) => void;
  onStartBattle: (basket: Record<string, BasketEntry>) => void;
}

/* ──────────────────────────────────────────────────────────────────── */
/* COMPONENT                                                           */
/* ──────────────────────────────────────────────────────────────────── */
export const BattleConfigForm: React.FC<Props> = ({
  playerCount,
  gameMode,
  teamMode,
  onPlayerCountChange,
  onGameModeChange,
  onTeamModeChange,
  onStartBattle,
}) => {
  const { profile } = useAuth();

  /* ---------- basket state ---------- */
  const [basket, setBasket] = useState<Record<string, BasketEntry>>({});

  const addToBasket = (crate: RustCrate, qty: number) =>
    setBasket((prev) => {
      const next = { ...prev };
      next[crate.id] = { crate, qty: (next[crate.id]?.qty || 0) + qty };
      return next;
    });

  const removeCrate = (id: string) =>
    setBasket((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  /* ---------- derived totals ---------- */
  const basketArr   = useMemo(() => Object.values(basket), [basket]);
  const totalCrates = useMemo(() => basketArr.reduce((s, b) => s + b.qty, 0), [basketArr]);
  const totalCost   = useMemo(
    () => basketArr.reduce((s, b) => s + b.qty * b.crate.price, 0),
    [basketArr]
  );

  /* ─────────── JSX ─────────── */
  return (
    <div className="space-y-6">
      {/* DEBUG line — delete once you see it render */}
      <div style={{ color: 'red', textAlign: 'center' }}>
        *** loaded BattleConfigForm ***
      </div>

      {/* ① Crate grid ---------------------------------------------------- */}
      <CrateGrid onAddToBattle={addToBasket} onCrateSelect={() => {}} />

      {/* ② Basket -------------------------------------------------------- */}
      {basketArr.length > 0 && (
        <Card className="bg-card/60 border-border/50 p-6">
          <h3 className="text-xl font-bold mb-4">
            Battle Crates&nbsp;({totalCrates})
          </h3>
          <div className="space-y-3">
            {basketArr.map(({ crate, qty }) => (
              <div
                key={crate.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={crate.image}
                    alt={crate.name}
                    className="w-12 h-12 object-cover rounded border-2 border-primary/20"
                  />
                  <div>
                    <div className="font-medium">{crate.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {qty}×  @ ${crate.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                <button
                  className="text-muted-foreground hover:text-red-500"
                  title="Remove"
                  onClick={() => removeCrate(crate.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ③ Game-mode / team-mode selector ------------------------------- */}
      <GameModeSelector
        gameMode={gameMode}
        setGameMode={onGameModeChange}
        teamMode={teamMode}
        setTeamMode={onTeamModeChange}
        playerCount={playerCount}
        setPlayerCount={onPlayerCountChange}
      />

      {/* ④ Privacy toggle (placeholder) ---------------------------------- */}
      <Card className="bg-card/60 border-border/50 p-4">
        <Button variant="outline" size="sm" disabled>
          🔓 Public Battle (coming soon)
        </Button>
      </Card>

      {/* ⑤ Summary ------------------------------------------------------- */}
      <Card className="bg-secondary/30 border-border/50 p-4">
        <h3 className="font-semibold mb-3">Battle Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total crates:</span>
            <span className="ml-2 font-medium">{totalCrates}</span>
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
            <span className="ml-2 font-bold text-green-400">
              ${totalCost.toFixed(2)}
            </span>
          </div>
        </div>
      </Card>

      {/* ⑥ Create battle ------------------------------------------------- */}
      <Button
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3"
        disabled={totalCrates === 0 || !profile || profile.balance < totalCost}
        onClick={() => onStartBattle(basket)}
      >
        Create Battle (${totalCost.toFixed(2)})
      </Button>
    </div>
  );
};
