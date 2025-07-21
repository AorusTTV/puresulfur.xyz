
import React from 'react';

export const WheelCenter: React.FC = () => {
  // Simple center dot without styling
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
      <div className="w-8 h-8 bg-foreground rounded-full" />
    </div>
  );
};
