
import React from 'react';
import { WeightedItem } from './carouselUtils';

interface CarouselItemProps {
  item: WeightedItem;
  index: number;
  itemWidth: number;
  isRolling?: boolean;
  translateX: number;
  containerWidth: number;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'radial-gradient-gray';
    case 'uncommon': return 'radial-gradient-green';
    case 'rare': return 'radial-gradient-blue';
    case 'epic': return 'radial-gradient-purple';
    case 'legendary': return 'radial-gradient-orange';
    default: return 'shadow-gray';
  }
};

export const CarouselItem: React.FC<CarouselItemProps> = ({ 
  item, 
  index, 
  itemWidth, 
  isRolling = false,
  translateX,
  containerWidth
}) => {
  // Get current item index, so we can apply effects. (note: 4 is arbitrary, just to adjust on center)
  //                                                    center                   item half                   arbitrary
  let currentIndex = Math.abs(Math.trunc((translateX + (containerWidth / 2) - (itemWidth / 2)) / itemWidth)) + 4;

  return (
    <div
      className={`min-w-[72px] h-16 m-1 ${getRarityColor(item.rarity)} flex flex-col items-center justify-center p-1`}
      style={{ 
        width: `${itemWidth - 8}px`,
        margin: index == currentIndex ? `0rem 2rem` : `0.26rem`,
        transform: index == currentIndex ? `scale(2.5)` : `scale(1)`,
        opacity: index == currentIndex ? `1` : `0.25`,
        transition: `transform 80ms ease-out, opacity 80ms ease-out`,
        flexShrink: 0,
        // Optimize rendering during animation
        contain: isRolling ? 'layout style paint' : 'none',
        // Better image rendering
        imageRendering: 'crisp-edges',
        animation: !isRolling && index == currentIndex ? 'icon-impact 0.2s 1' : 'none'
      }}
    >
      <img 
        src={item.image} 
        alt={item.name}
        className="w-8 h-8 object-cover rounded mb-1"
        style={{
          // Optimize image loading and rendering
          willChange: isRolling ? 'auto' : 'auto',
          backfaceVisibility: 'hidden'
        }}
        loading="lazy"
        decoding="async"
      />
      {/*
      <div className="text-xs text-center font-medium truncate w-full text-foreground">
        ${item.value.toFixed(0)}
      </div>
      */}
    </div>
  );
};
