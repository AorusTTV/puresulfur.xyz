
import React from 'react';
import { RustItem } from './rustCrateData';

interface CarouselDebugOverlayProps {
  isRolling: boolean;
  finalItem: RustItem | null;
}

export const CarouselDebugOverlay: React.FC<CarouselDebugOverlayProps> = ({ 
  isRolling, 
  finalItem 
}) => {
  if (isRolling || !finalItem) return null;

  return (
    <div className="absolute bottom-1 left-1 text-xs bg-black/80 text-white px-2 py-1 rounded z-30">
      <div>Result: {finalItem.name}</div>
      <div>Value: ${finalItem.value}</div>
    </div>
  );
};
