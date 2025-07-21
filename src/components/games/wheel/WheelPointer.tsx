
import React from 'react';

export const WheelPointer: React.FC = () => {
  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
      <div 
        className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-red-500"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          // Position the pointer to point downward into the wheel sections from above
          marginTop: '2px'
        }}
      />
    </div>
  );
};
