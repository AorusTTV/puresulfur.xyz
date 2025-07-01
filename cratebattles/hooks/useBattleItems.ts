
import { useState } from 'react';
import { CrateItem } from '../types';

export const useBattleItems = () => {
  const [finalItems, setFinalItems] = useState<{ [playerId: string]: CrateItem }>({});
  const [serverWinningItems, setServerWinningItems] = useState<{ [playerId: string]: CrateItem }>({});
  const [winner, setWinner] = useState<string | null>(null);

  return {
    finalItems,
    setFinalItems,
    serverWinningItems,
    setServerWinningItems,
    winner,
    setWinner
  };
};
