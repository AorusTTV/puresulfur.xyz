
import React from 'react';

interface CarouselSelectionIndicatorProps {
  showWinningDot?: boolean;
}

export const CarouselSelectionIndicator: React.FC<CarouselSelectionIndicatorProps> = ({ 
  showWinningDot = false 
}) => {
  return (
    <>
      {/* Green selection line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-green-500 transform -translate-x-0.5 z-20" />
      
      {/* Red winning dot - appears above the winning item after animation */}
      {showWinningDot && (
        <div className="absolute left-1/2 top-2 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 z-30 animate-pulse" />
      )}
    </>
  );
};
