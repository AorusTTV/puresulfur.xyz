
import React from 'react';

export const CarouselFadeEffects: React.FC = () => {
  return (
    <>
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
    </>
  );
};
