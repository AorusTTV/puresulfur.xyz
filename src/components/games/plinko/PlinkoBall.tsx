
import { useEffect, useState } from 'react';

interface Peg {
  id: string;
  x: number;
  y: number;
  row: number;
  col: number;
}

interface PlinkoBallProps {
  boardWidth: number;
  boardHeight: number;
  pegs: Peg[];
  onLanded: (slotIndex: number, multiplier: number) => void;
  slotsCount: number;
  multipliers: number[];
}

export const PlinkoBall = ({ 
  boardWidth, 
  boardHeight, 
  pegs, 
  onLanded, 
  slotsCount, 
  multipliers 
}: PlinkoBallProps) => {
  const [position, setPosition] = useState({ x: boardWidth / 2, y: 50 });
  const [velocity, setVelocity] = useState({ x: (Math.random() - 0.5) * 0.5, y: 0 });
  const [isAnimating, setIsAnimating] = useState(true);
  const [trail, setTrail] = useState<Array<{ x: number; y: number; opacity: number }>>([]);

  useEffect(() => {
    if (!isAnimating) return;

    let animationFrame: number;
    const ballRadius = 6;
    const pegRadius = 4;
    
    const animate = () => {
      setPosition(prevPos => {
        const gravity = 0.4;
        const friction = 0.98;
        const bounceForce = 0.7;
        const randomness = 0.4;

        let newVelX = velocity.x * friction;
        let newVelY = velocity.y + gravity;
        
        let newX = prevPos.x + newVelX;
        let newY = prevPos.y + newVelY;

        // Bounce off side walls
        if (newX <= ballRadius || newX >= boardWidth - ballRadius) {
          newVelX = -newVelX * bounceForce;
          newX = Math.max(ballRadius, Math.min(boardWidth - ballRadius, newX));
        }

        // Check collision with pegs
        let collisionDetected = false;
        for (const peg of pegs) {
          const dx = newX - peg.x;
          const dy = newY - peg.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < ballRadius + pegRadius && !collisionDetected) {
            collisionDetected = true;
            const angle = Math.atan2(dy, dx);
            const force = 1.2 + Math.random() * 0.6;
            
            // Add randomness to bounce direction
            const bounceAngle = angle + (Math.random() - 0.5) * randomness;
            
            newVelX = Math.cos(bounceAngle) * force;
            newVelY = Math.abs(Math.sin(bounceAngle)) * force + 0.2;
            
            // Move ball away from peg
            newX = peg.x + Math.cos(angle) * (ballRadius + pegRadius + 2);
            newY = peg.y + Math.sin(angle) * (ballRadius + pegRadius + 2);
            
            break; // Only handle one collision per frame
          }
        }

        // Limit velocities to prevent balls from moving too fast
        newVelX = Math.max(-5, Math.min(5, newVelX));
        newVelY = Math.min(newVelY, 7);

        setVelocity({ x: newVelX, y: newVelY });

        // Update trail
        setTrail(prevTrail => {
          const newTrail = [
            { x: newX, y: newY, opacity: 1 },
            ...prevTrail.slice(0, 5).map((point, index) => ({
              ...point,
              opacity: Math.max(0, 1 - (index + 1) * 0.2)
            }))
          ];
          return newTrail;
        });

        // Check if ball reached bottom
        if (newY >= boardHeight - 80) {
          setIsAnimating(false);
          
          // Calculate which slot the ball landed in
          const slotWidth = boardWidth / slotsCount;
          const slotIndex = Math.floor(Math.max(0, Math.min(newX / slotWidth, slotsCount - 1)));
          const multiplier = multipliers[slotIndex];
          
          // Small delay before calling onLanded to show the ball reaching the bottom
          setTimeout(() => {
            onLanded(slotIndex, multiplier);
          }, 100);
        }

        return { x: newX, y: newY };
      });

      if (isAnimating) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isAnimating, boardWidth, boardHeight, pegs, onLanded, slotsCount, multipliers, velocity]);

  if (!isAnimating && position.y >= boardHeight - 80) {
    return null; // Don't render the ball after it has landed
  }

  return (
    <>
      {/* Ball Trail */}
      {trail.map((point, index) => (
        <div
          key={index}
          className="absolute rounded-full transition-opacity duration-75"
          style={{
            left: point.x - (3 - index * 0.3),
            top: point.y - (3 - index * 0.3),
            width: Math.max(2, 6 - index * 0.5),
            height: Math.max(2, 6 - index * 0.5),
            backgroundColor: index === 0 ? '#10b981' : '#059669',
            opacity: point.opacity * 0.6,
            zIndex: 15 - index,
            pointerEvents: 'none',
          }}
        />
      ))}
      
      {/* Main Ball */}
      <div
        className="absolute rounded-full shadow-lg z-20"
        style={{
          left: position.x - 6,
          top: position.y - 6,
          width: 12,
          height: 12,
          background: 'radial-gradient(circle at 30% 30%, #ef4444, #dc2626, #10b981)',
          border: '1px solid rgba(255,255,255,0.4)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
};
