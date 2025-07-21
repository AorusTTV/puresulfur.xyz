
import React from 'react';

interface SulfurIconProps {
  className?: string;
  size?: number;
  alt?: string;
}

export const SulfurIcon: React.FC<SulfurIconProps> = ({ 
  className = "h-4 w-4", 
  size,
  alt = "Sulfur" 
}) => {
  const style = size ? { width: size, height: size } : undefined;
  
  return (
    <img 
      src="/lovable-uploads/0dfb4836-73f0-4c1b-8f93-220e5f1025a4.png" 
      alt={alt}
      className={className}
      style={style}
    />
  );
};
