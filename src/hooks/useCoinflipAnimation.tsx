
import { useState, useEffect, useCallback } from 'react';

export const useCoinflipAnimation = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipResult, setFlipResult] = useState<'heads' | 'tails' | null>(null);

  const startAnimation = (result: 'heads' | 'tails') => {
    setIsFlipping(true);
    setFlipResult(result);
  };

  const stopAnimation = () => {
    setIsFlipping(false);
    setFlipResult(null);
  };

  return {
    isFlipping,
    flipResult,
    startAnimation,
    stopAnimation
  };
};
