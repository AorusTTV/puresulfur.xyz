
import { useState } from 'react';
import { RustCrate } from '@/components/games/cratebattles/rustCrateData';
import { useBattleCreation } from './useBattleCreation';
import { useBattleJoining } from './useBattleJoining';

export const useCrateBattle = () => {
  const [playerCount, setPlayerCount] = useState(2);
  const [gameMode, setGameMode] = useState<'default' | 'terminal' | 'unlucky' | 'jackpot' | 'puresulfur'>('default');
  const [teamMode, setTeamMode] = useState('1v1');

  const { createBattle: createBattleCore } = useBattleCreation();
  const { joinBattle } = useBattleJoining();

  const createBattle = async (
    selectedCrate: RustCrate | null, 
    onStartBattle: (battle: any) => void,
    battleCrates: Array<{crate: RustCrate, quantity: number}> = [],
    playerCountOverride?: number,
    gameModeOverride?: string,
    teamModeOverride?: string,
    isPersistent?: boolean
  ) => {
    return createBattleCore(
      selectedCrate,
      onStartBattle,
      battleCrates,
      playerCountOverride ?? playerCount,
      (gameModeOverride as any) ?? gameMode,
      teamModeOverride ?? teamMode,
      isPersistent
    );
  };

  return {
    playerCount,
    setPlayerCount,
    gameMode,
    setGameMode,
    teamMode,
    setTeamMode,
    createBattle,
    joinBattle
  };
};
