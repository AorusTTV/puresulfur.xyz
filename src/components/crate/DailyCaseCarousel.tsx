import React, { useEffect } from 'react';
import { createReelAroundWinningItem, WeightedItem } from '../games/cratebattles/carouselUtils';
import { CarouselContainer } from '../games/cratebattles/CarouselContainer';

export interface CrateItem {
  id: string;
  name: string;
  price: number;
  image: string;
  rarity: string;
  rarityColor: string;
  probability: number;
}

interface DailyCaseCarouselProps {
  items: CrateItem[];
  winningItem: CrateItem;
  isAnimating: boolean;
  onAnimationComplete?: () => void;
}

export const DailyCaseCarousel: React.FC<DailyCaseCarouselProps> = ({
  items,
  winningItem,
  isAnimating,
  onAnimationComplete
}) => {
  // Convert CrateItem[] to WeightedItem[] (add dropChance/value fields, fix rarity type)
  const mapRarity = (rarity: string): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'common';
      case 'uncommon': return 'uncommon';
      case 'rare': return 'rare';
      case 'epic': return 'epic';
      case 'legendary': return 'legendary';
      default: return 'common';
    }
  };
  const convertedItems = React.useMemo(() => items.map(item => ({
    ...item,
    value: item.price,
    dropChance: item.probability,
    rarity: mapRarity(item.rarity),
  })), [items]);

  const convertedWinningItem = React.useMemo(() => ({
    ...winningItem,
    value: winningItem.price,
    dropChance: winningItem.probability,
    rarity: mapRarity(winningItem.rarity),
  }), [winningItem]);

  const itemWidth = 80;
  const containerWidth = 400;
  const centerPosition = containerWidth / 2;

  // Animation state
  const [translateX, setTranslateX] = React.useState(0);
  const [isRolling, setIsRolling] = React.useState(false);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const [reelItems, setReelItems] = React.useState<WeightedItem[]>([]);
  const animationFrameRef = React.useRef<number>();
  const startTimeRef = React.useRef<number>();

  // Build reel when animation starts
  useEffect(() => {
    if (isAnimating && !hasAnimated) {
      const newReelItems = createReelAroundWinningItem(convertedItems, convertedWinningItem);
      setReelItems(newReelItems);
    }
  }, [isAnimating, hasAnimated, convertedItems, convertedWinningItem]);

  // Start animation
  useEffect(() => {
    if (!isAnimating || isRolling || hasAnimated || reelItems.length === 0) return;
    setIsRolling(true);
    setHasAnimated(true);
    const winningItemIndex = Math.floor(reelItems.length / 2);
    const finalDistance = (winningItemIndex * itemWidth) + (itemWidth / 2) - centerPosition;
    const startPosition = 0;
    const animationDuration = 6000;
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
        setTranslateX(-finalDistance);
        setIsRolling(false);
        if (onAnimationComplete) onAnimationComplete();
      }
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    // eslint-disable-next-line
  }, [isAnimating, reelItems.length, itemWidth, centerPosition, onAnimationComplete, isRolling, hasAnimated]);

  // Reset when items or winningItem changes
  useEffect(() => {
    setHasAnimated(false);
    setTranslateX(0);
    setIsRolling(false);
    setReelItems([]);
    startTimeRef.current = undefined;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [JSON.stringify(items), JSON.stringify(winningItem)]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  console.log('DailyCaseCarousel: mounted', { items, winningItem, isAnimating });

  if (!reelItems.length) {
    console.log('DailyCaseCarousel: reelItems is empty, not rendering carousel', { reelItems });
    return null;
  }

  return (
    <div className="relative w-full h-28 overflow-hidden from-card/50 to-secondary/50">
      <CarouselContainer
        extendedItems={reelItems}
        translateX={translateX}
        isRolling={isRolling}
        itemWidth={itemWidth}
        containerWidth={containerWidth}
      />
      {/* Fade effects */}
      <div className="absolute left-0 top-0 w-4 h-full bg-gradient-to-r from-stone-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-4 h-full bg-gradient-to-l from-stone-900 to-transparent pointer-events-none" />
    </div>
  );
}; 