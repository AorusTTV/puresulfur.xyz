// src/components/games/cratebattles/CreateBattleDialog.tsx
// Uses the new BattleConfigForm (which embeds CrateGrid with +ADD / Inspect)
// ---------------------------------------------------------------------------
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button }   from '@/components/ui/button';
import { useAuth }  from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BattleConfigForm } from './BattleConfigForm';
import { rustCrates, RustCrate } from './rustCrateData';
import { useCrateBattle } from './useCrateBattle';

/* ──────────────────────────────────────────────────────────────── */
/* Types                                                            */
/* ──────────────────────────────────────────────────────────────── */
export interface BasketEntry {
  crate: RustCrate;
  qty:   number;
}
interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onBattleCreated: (battle: any) => void;
}

/* ──────────────────────────────────────────────────────────────── */
/* Component                                                        */
/* ──────────────────────────────────────────────────────────────── */
export const CreateBattleDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onBattleCreated,
}) => {
  const { profile } = useAuth();
  const { toast }   = useToast();
  const {
    gameMode,
    setGameMode,
    teamMode,
    setTeamMode,
    playerCount,
    setPlayerCount,
    createBattle,
  } = useCrateBattle();

  /** basket comes from BattleConfigForm */
  const [basket, setBasket] = useState<Record<string, BasketEntry>>({});

  /* quick helpers */
  const basketArr = Object.values(basket);
  const totalCost = basketArr.reduce((s, b) => s + b.qty * b.crate.price, 0);

  /* ------------------------------------------------------------- */
  const handleStartBattle = async () => {
    if (basketArr.length === 0) {
      toast({
        title: 'No crates selected',
        description: 'Please add at least one crate to the battle.',
        variant: 'destructive',
      });
      return;
    }
    if (!profile || profile.balance < totalCost) {
      toast({
        title: 'Insufficient balance',
        description: `You need $${totalCost.toFixed(2)} to create this battle.`,
        variant: 'destructive',
      });
      return;
    }

    // convert basket dict → array<{crate, quantity}>
    const battleCrates = basketArr.map(({ crate, qty }) => ({
      crate,
      quantity: qty,
    }));

    await createBattle(
      rustCrates[0],          // API still expects first-crate param
      onBattleCreated,
      battleCrates
    );
    onOpenChange(false);
  };

  /* ─────────── JSX ─────────── */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        /* prevent Radix from closing when pointer-down occurs outside */
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}   /* Radix v2 alias */
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Create New Online Battle
          </DialogTitle>
        </DialogHeader>

        {/* ------------ crate selection & config form ------------- */}
        <BattleConfigForm
          playerCount={playerCount}
          gameMode={gameMode}
          teamMode={teamMode}
          onPlayerCountChange={setPlayerCount}
          onGameModeChange={setGameMode}
          onTeamModeChange={setTeamMode}
          onStartBattle={(b) => {
            setBasket(b);
            handleStartBattle();
          }}
        />

        {/* Action buttons (modal footer) */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={
              basketArr.length === 0 || !profile || profile.balance < totalCost
            }
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            onClick={handleStartBattle}
          >
            Create Battle (${totalCost.toFixed(2)})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
