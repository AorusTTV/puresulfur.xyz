
import { useEffect, useRef, useCallback } from 'react';

interface RenderObject {
  id: number;
  x: number;
  y: number;
  radius: number;
  trail?: Array<{ x: number; y: number; opacity: number }>;
}

interface Peg {
  x: number;
  y: number;
  radius: number;
}

interface PlinkoCanvasRendererProps {
  width: number;
  height: number;
  objects: RenderObject[];
  pegs: Peg[];
  className?: string;
}

export const PlinkoCanvasRenderer = ({ width, height, objects, pegs, className }: PlinkoCanvasRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Render pegs
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    
    for (const peg of pegs) {
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    // Render balls and trails
    for (const obj of objects) {
      // Render trail if it exists
      if (obj.trail) {
        for (let i = obj.trail.length - 1; i >= 0; i--) {
          const point = obj.trail[i];
          const size = 6 - i * 0.5;
          const opacity = point.opacity * 0.8;
          
          ctx.fillStyle = i === 0 ? '#10b981' : '#059669';
          ctx.globalAlpha = opacity;
          
          ctx.beginPath();
          ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Render main ball
      ctx.globalAlpha = 1;
      
      // Create radial gradient for ball
      const gradient = ctx.createRadialGradient(
        obj.x - 2, obj.y - 2, 0,
        obj.x, obj.y, obj.radius
      );
      gradient.addColorStop(0, '#ef4444');
      gradient.addColorStop(0.5, '#dc2626');
      gradient.addColorStop(1, '#10b981');
      
      ctx.fillStyle = gradient;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, [width, height, objects, pegs]);

  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}
    />
  );
};
