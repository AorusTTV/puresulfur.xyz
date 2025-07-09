
import React, { useEffect, useState } from 'react';
import { rustCrates, RustItem } from './rustCrateData';
import { useCarouselAnimation } from './useCarouselAnimation';
import { CarouselContainer } from './CarouselContainer';
import { CarouselSelectionIndicator } from './CarouselSelectionIndicator';
import { CarouselDebugOverlay } from './CarouselDebugOverlay';


interface RotatingSkinDisplayProps {
  crateId: string;
  isAnimating?: boolean;
  onAnimationComplete?: (finalItem: any) => void;
  // New prop: server-provided winning item
  serverWinningItem?: RustItem | null;
}

export const RotatingSkinDisplay: React.FC<RotatingSkinDisplayProps> = ({
  crateId, 
  isAnimating = false,
  onAnimationComplete,
  serverWinningItem
}) => {
  const crate = rustCrates.find(c => c.id === crateId);
  const items = crate?.contents || [];

  const itemWidth = 80;
  const containerWidth = 400;
  const centerPosition = containerWidth / 2;

  const { translateX, finalItem, isRolling, reelItems, resetAnimation } = useCarouselAnimation({
    isAnimating,
    crateId,
    items,
    itemWidth,
    centerPosition,
    onAnimationComplete,
    serverWinningItem
  });

  // Reset when component unmounts or crate changes
  useEffect(() => {
    resetAnimation();
  }, [crateId, resetAnimation]);

  // Log when server winning item is received
  useEffect(() => {
    if (serverWinningItem) {
      console.log('RotatingSkinDisplay received server winning item:', serverWinningItem);
    }
  }, [serverWinningItem]);

  if (!items.length) return null;

  const showWinningDot = !isRolling && finalItem !== null;

  return (
    <div 
      className="relative w-full h-28 overflow-hidden from-card/50 to-secondary/50"
      style={{
        contain: 'layout style paint',
        willChange: isRolling ? 'auto' : 'auto',
        animation: null != finalItem ? `horizontal-shaking 0.2s 1` : 'none'
      }}
    >
      {/*<CarouselSelectionIndicator showWinningDot={showWinningDot} />*/}
      
      {reelItems.length > 0 && (
        <CarouselContainer
          extendedItems={reelItems}
          translateX={translateX}
          isRolling={isRolling}
          itemWidth={itemWidth}
          containerWidth={containerWidth}
        />
      )}
      
      {/* Fade effects */}
      <div className="absolute left-0 top-0 w-4 h-full bg-gradient-to-r from-stone-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-4 h-full bg-gradient-to-l from-stone-900 to-transparent pointer-events-none" />
      
      {/* <CarouselDebugOverlay isRolling={isRolling} finalItem={finalItem} />*/}
    </div>
  );
};
