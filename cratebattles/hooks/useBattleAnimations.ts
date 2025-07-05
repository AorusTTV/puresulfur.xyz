
import { useState } from 'react';

export const useBattleAnimations = () => {
  const [playerAnimationStates, setPlayerAnimationStates] = useState<{ [playerId: string]: boolean }>({});
  const [animationCompletedPlayers, setAnimationCompletedPlayers] = useState<Set<string>>(new Set());

  return {
    playerAnimationStates,
    setPlayerAnimationStates,
    animationCompletedPlayers,
    setAnimationCompletedPlayers
  };
};
