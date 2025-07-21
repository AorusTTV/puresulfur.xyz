
import React from 'react';

interface WheelImageProps {
  rotation: number;
  spinning: boolean;
}

export const WheelImage: React.FC<WheelImageProps> = ({ rotation, spinning }) => {
  return (
    <div 
      className="relative w-[400px] h-[400px] rounded-full overflow-hidden"
      style={{ 
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        transition: spinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
      }}
    >
      <img 
        src="/lovable-uploads/240f0b1b-62a7-491b-b8cd-6ff6f3d36c8b.png"
        alt="Wheel of Fortune"
        className="w-full h-full object-cover rounded-full"
        draggable={false}
        style={{
          // Ensure the image is perfectly centered and aligned
          display: 'block',
          margin: 0,
          padding: 0
        }}
      />
    </div>
  );
};
