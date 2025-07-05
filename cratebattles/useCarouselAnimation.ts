
import { useState, useEffect, useCallback, useRef } from 'react';
import { RustItem } from './rustCrateData';
import { WeightedItem, createReelAroundWinningItem } from './carouselUtils';

interface UseCarouselAnimationProps {
  isAnimating: boolean;
  crateId: string;
  items: RustItem[];
  itemWidth: number;
  centerPosition: number;
  onAnimationComplete?: (finalItem: RustItem) => void;
  // New prop: server-provided winning item
  serverWinningItem?: RustItem | null;
}

export const useCarouselAnimation = ({
  isAnimating,
  crateId,
  items,
  itemWidth,
  centerPosition,
  onAnimationComplete,
  serverWinningItem
}: UseCarouselAnimationProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [finalItem, setFinalItem] = useState<RustItem | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [reelItems, setReelItems] = useState<WeightedItem[]>([]);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Build reel around server-provided winning item when animation starts
  useEffect(() => {
    if (isAnimating && serverWinningItem && !hasAnimated) {
      console.log('Building reel around server winning item:', serverWinningItem);
      const newReelItems = createReelAroundWinningItem(items, serverWinningItem);
      setReelItems(newReelItems);
    }
  }, [isAnimating, serverWinningItem, items, hasAnimated]);

  const startAnimation = useCallback(() => {
    if (!isAnimating || isRolling || hasAnimated || reelItems.length === 0 || !serverWinningItem) {
      return;
    }

    console.log(`Starting carousel animation for crate ${crateId} with predetermined winning item:`, serverWinningItem);
    setIsRolling(true);
    setHasAnimated(true);
    
    // Calculate final position to stop exactly at the winning item (center of reel)
    const winningItemIndex = Math.floor(reelItems.length / 2); // Winner is always in the center
    const finalDistance = (winningItemIndex * itemWidth) + (itemWidth / 2) - centerPosition;
    
    const startPosition = 0;
    const animationDuration = 3200;
    startTimeRef.current = undefined;
    
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) startTimeRef.current = currentTime;
      const elapsed = currentTime - startTimeRef.current;
      
      if (elapsed < animationDuration) {
        const progress = elapsed / animationDuration;
        const easeOut = 1 - Math.pow(1 - progress, 2.5);
        
        const currentPosition = startPosition + (finalDistance * easeOut);
        setTranslateX(-currentPosition);
        
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - use server-provided winning item directly
        setTranslateX(-finalDistance);
        setIsRolling(false);
        
        console.log(`Animation completed - Final item from server:`, serverWinningItem);
        
        setFinalItem(serverWinningItem);
        onAnimationComplete?.(serverWinningItem);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isAnimating, reelItems.length, itemWidth, centerPosition, onAnimationComplete, isRolling, crateId, hasAnimated, serverWinningItem]);

  const resetAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setHasAnimated(false);
    setTranslateX(0);
    setFinalItem(null);
    setIsRolling(false);
    setReelItems([]);
    startTimeRef.current = undefined;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  return {
    translateX,
    finalItem,
    isRolling,
    reelItems,
    resetAnimation
  };
};
