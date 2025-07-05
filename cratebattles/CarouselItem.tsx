
import React from 'react';
import { WeightedItem } from './carouselUtils';

interface CarouselItemProps {
  item: WeightedItem;
  index: number;
  itemWidth: number;
  isRolling?: boolean;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'border-gray-400 shadow-gray-400/50';
    case 'uncommon': return 'border-green-400 shadow-green-400/50';
    case 'rare': return 'border-blue-400 shadow-blue-400/50';
    case 'epic': return 'border-purple-400 shadow-purple-400/50';
    case 'legendary': return 'border-orange-400 shadow-orange-400/50';
    default: return 'border-gray-400 shadow-gray-400/50';
  }
};

export const CarouselItem: React.FC<CarouselItemProps> = ({ 
  item, 
  index, 
  itemWidth, 
  isRolling = false 
}) => {
  return (
    <div
      className={`min-w-[72px] h-16 m-1 rounded border-2 ${getRarityColor(item.rarity)} flex flex-col items-center justify-center p-1 bg-card/90`}
      style={{ 
        width: `${itemWidth - 8}px`,
        flexShrink: 0,
        // Optimize rendering during animation
        contain: isRolling ? 'layout style paint' : 'none',
        // Better image rendering
        imageRendering: 'crisp-edges'
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
      <div className="text-xs text-center font-medium truncate w-full text-foreground">
        ${item.value.toFixed(0)}
      </div>
    </div>
  );
};
