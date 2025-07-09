
import React from 'react';
import { WeightedItem } from './carouselUtils';
import { CarouselItem } from './CarouselItem';

interface CarouselContainerProps {
  extendedItems: WeightedItem[];
  translateX: number;
  isRolling: boolean;
  itemWidth: number;
  containerWidth: number;
}

export const CarouselContainer: React.FC<CarouselContainerProps> = ({
  extendedItems,
  translateX,
  isRolling,
  itemWidth,
  containerWidth
}) => {
  return (
    <div 
      className="flex h-full items-center"
      style={{
        transform: `translate3d(${translateX}px, 0, 0)`, // Use translate3d for hardware acceleration
        transition: isRolling ? 'none' : 'transform 400ms ease-out',
        width: `${extendedItems.length * itemWidth}px`,
        willChange: isRolling ? 'transform' : 'auto', // Optimize for animation when rolling
        backfaceVisibility: 'hidden', // Prevent flickering
        perspective: '1000px' // Enable 3D acceleration
      }}
    >
      {extendedItems.map((item, index) => (
        <CarouselItem
          key={`${item.id}-${index}`}
          item={item}
          index={index}
          itemWidth={itemWidth}
          isRolling={isRolling}
          translateX={translateX}
          containerWidth={containerWidth}
        />
      ))}
    </div>
  );
};
