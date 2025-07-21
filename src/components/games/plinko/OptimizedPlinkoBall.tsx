
import { useEffect, useState, useCallback } from 'react';

interface OptimizedPlinkoBallProps {
  id: number;
  x: number;
  y: number;
  onTrailUpdate: (id: number, trail: Array<{ x: number; y: number; opacity: number }>) => void;
}

export const OptimizedPlinkoBall = ({ id, x, y, onTrailUpdate }: OptimizedPlinkoBallProps) => {
  const [trail, setTrail] = useState<Array<{ x: number; y: number; opacity: number }>>([]);

  const updateTrail = useCallback(() => {
    setTrail(prevTrail => {
      const newTrail = [
        { x, y, opacity: 1 },
        ...prevTrail.slice(0, 6).map((point, index) => ({
          ...point,
          opacity: 1 - (index + 1) * 0.15
        }))
      ];
      
      // Notify parent of trail update
      onTrailUpdate(id, newTrail);
      
      return newTrail;
    });
  }, [x, y, id, onTrailUpdate]);

  useEffect(() => {
    updateTrail();
  }, [x, y, updateTrail]);

  // This component doesn't render anything directly - it just manages trail state
  // The actual rendering is handled by the canvas renderer
  return null;
};
