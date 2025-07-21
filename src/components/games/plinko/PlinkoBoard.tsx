
import { useEffect, useRef, useState, useCallback } from 'react';
import { PayoutSlots } from './PayoutSlots';
import { PlinkoBall } from './PlinkoBall';

interface PlinkoBoardProps {
  onBallLanded: (slotIndex: number, multiplier: number) => void;
  activeBallsCount: number;
  betAmount: number;
  multipliers: number[];
}

interface ActiveBall {
  id: number;
  key: string;
}

export const PlinkoBoard = ({ onBallLanded, activeBallsCount, betAmount, multipliers }: PlinkoBoardProps) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardDimensions, setBoardDimensions] = useState({ width: 800, height: 700 });
  const [activeBalls, setActiveBalls] = useState<ActiveBall[]>([]);
  const ballIdCounter = useRef(0);
  const lastActiveBallsCount = useRef(0);

  // More rows for better gameplay like the reference
  const rows = 17;
  const slotsCount = multipliers.length;

  useEffect(() => {
    const updateDimensions = () => {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        const newDimensions = {
          width: Math.min(rect.width, 800),
          height: 700
        };
        setBoardDimensions(newDimensions);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Generate peg positions in a perfect triangular pattern
  const generatePegs = useCallback(() => {
    const pegs = [];
    const pegSpacing = 40;
    
    // Get the exact center of the board
    const boardCenterX = boardDimensions.width / 2;
    
    for (let row = 0; row < rows; row++) {
      const pegsInRow = row + 3;
      
      // Calculate the total width of this row of pegs
      const rowTotalWidth = (pegsInRow - 1) * pegSpacing;
      
      // Calculate the starting X position to center this row perfectly
      const rowStartX = boardCenterX - (rowTotalWidth / 2);
      
      for (let col = 0; col < pegsInRow; col++) {
        const x = rowStartX + (col * pegSpacing);
        const y = 100 + row * 30; // Tighter vertical spacing
        
        pegs.push({
          id: `peg-${row}-${col}`,
          x,
          y,
          row,
          col
        });
      }
    }
    
    return pegs;
  }, [boardDimensions.width, rows]);

  const pegs = generatePegs();

  // Handle adding new balls when activeBallsCount increases - fixed to only add one ball at a time
  useEffect(() => {
    // Only add one ball if the count increased by exactly 1
    if (activeBallsCount > lastActiveBallsCount.current && activeBallsCount === lastActiveBallsCount.current + 1) {
      const newBall: ActiveBall = {
        id: ballIdCounter.current++,
        key: `ball-${Date.now()}-${ballIdCounter.current}`
      };
      
      setActiveBalls(prev => [...prev, newBall]);
      console.log(`Added new ball with ID: ${newBall.id}, total active balls: ${activeBallsCount}`);
    }
    
    // Update the last count
    lastActiveBallsCount.current = activeBallsCount;
  }, [activeBallsCount]);

  // Handle ball landing
  const handleBallLanded = useCallback((ballId: number, slotIndex: number, multiplier: number) => {
    console.log(`Ball ${ballId} landed in slot ${slotIndex} with multiplier ${multiplier}x`);
    
    // Remove the ball from active balls
    setActiveBalls(prev => prev.filter(ball => ball.id !== ballId));
    
    // Call the parent handler
    onBallLanded(slotIndex, multiplier);
  }, [onBallLanded]);

  // Calculate the exact center position for drop zone
  const dropZoneCenterX = boardDimensions.width / 2;

  return (
    <div 
      ref={boardRef}
      className="relative bg-gradient-to-b from-card to-muted rounded-xl overflow-hidden"
      style={{ height: boardDimensions.height }}
    >
      {/* Dark background with design system colors */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/80 to-muted/80" />

      {/* Pegs */}
      {pegs.map((peg) => (
        <div
          key={peg.id}
          className="absolute w-2 h-2 bg-white rounded-full shadow-md z-10"
          style={{
            left: peg.x - 4,
            top: peg.y - 4,
          }}
        />
      ))}

      {/* Drop Zone - Perfectly centered using exact board center calculation */}
      <div 
        className="absolute top-8 flex flex-col items-center z-20"
        style={{ 
          left: dropZoneCenterX,
          transform: 'translateX(-50%)'
        }}
      >
        <div className="text-muted-foreground text-sm font-medium mb-3 tracking-wide">Drop here</div>
        <div className="flex items-center justify-center space-x-1.5">
          <div className="w-2 h-2 bg-border rounded-full opacity-60"></div>
          <div className="w-2 h-2 bg-border rounded-full opacity-60"></div>
          <div className="w-2 h-2 bg-border rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Active Balls */}
      {activeBalls.map((ball) => (
        <PlinkoBall
          key={ball.key}
          boardWidth={boardDimensions.width}
          boardHeight={boardDimensions.height}
          pegs={pegs}
          onLanded={(slotIndex, multiplier) => handleBallLanded(ball.id, slotIndex, multiplier)}
          slotsCount={slotsCount}
          multipliers={multipliers}
        />
      ))}

      {/* Payout Slots */}
      <PayoutSlots
        width={boardDimensions.width}
        multipliers={multipliers}
        betAmount={betAmount}
      />
    </div>
  );
};
