
import { useRef, useEffect, useState } from 'react';

interface UseWheelAnimationProps {
  isSpinning: boolean;
  winningIndex?: number | null;
  onSpinComplete: () => void;
  sectionsLength: number;
}

export const useWheelAnimation = ({
  isSpinning,
  winningIndex,
  onSpinComplete,
  sectionsLength
}: UseWheelAnimationProps) => {
  const [rotation, setRotation] = useState(0);
  const animationStartedRef = useRef(false);
  const currentSpinRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSpinningRef = useRef(false);

  // Corrected angle mapping based on the actual wheel image
  // Starting from top (12 o'clock) clockwise - each section is 22.5 degrees (360/16)
  // Based on the actual wheel image order
  const sectionAngles = [
    0,     // Section 0: 1 (yellow) - top position  
    22.5,  // Section 1: 5 (blue)
    45,    // Section 2: 1 (yellow)
    67.5,  // Section 3: 3 (green) - This should be the winning section in the image
    90,    // Section 4: 1 (yellow)
    112.5, // Section 5: 10 (purple)
    135,   // Section 6: 1 (yellow)
    157.5, // Section 7: 5 (blue)
    180,   // Section 8: 1 (yellow)
    202.5, // Section 9: 3 (green)
    225,   // Section 10: 20 (red)
    247.5, // Section 11: 1 (yellow)
    270,   // Section 12: 3 (green)
    292.5, // Section 13: 1 (yellow)
    315,   // Section 14: 5 (blue)
    337.5  // Section 15: 1 (yellow)
  ];

  useEffect(() => {
    // Clear previous timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Start animation only if spinning, not already started, and valid winning index
    if (isSpinning && !animationStartedRef.current && !isSpinningRef.current && winningIndex !== null && winningIndex !== undefined) {
      // Check if already spinning for same index to prevent duplicate animations
      if (currentSpinRef.current === winningIndex && isSpinningRef.current) {
        console.log('Already spinning for this winning index, skipping animation...');
        return;
      }

      // Prevent multiple animations
      animationStartedRef.current = true;
      isSpinningRef.current = true;
      currentSpinRef.current = winningIndex;
      
      console.log('Starting wheel animation for winning index:', winningIndex);
      
      // Get exact angle for winning section
      const targetAngle = sectionAngles[winningIndex] || 0;
      
      // The pointer is at top (0 degrees), so we need to rotate the wheel
      // so the winning section aligns with the pointer
      const adjustedTargetAngle = 360 - targetAngle;
      
      // Add full rotations for dramatic effect (4-5 full rotations)
      const fullRotations = 4 + Math.random(); // 4-5 rotations
      const totalRotation = (fullRotations * 360) + adjustedTargetAngle;
      
      // Set final rotation
      setRotation(prev => prev + totalRotation);
      
      console.log('Wheel animation details:', {
        winningIndex,
        targetAngle,
        adjustedTargetAngle,
        totalRotation,
        finalRotation: rotation + totalRotation
      });
      
      // Complete spin after animation time (3 seconds) - ONLY ONCE
      timeoutRef.current = setTimeout(() => {
        console.log('Wheel animation completed for index:', winningIndex);
        animationStartedRef.current = false;
        isSpinningRef.current = false;
        currentSpinRef.current = null;
        timeoutRef.current = null;
        onSpinComplete();
      }, 3000);
    }
  }, [isSpinning, winningIndex, onSpinComplete, rotation]);

  // Reset when not spinning
  useEffect(() => {
    if (!isSpinning) {
      // Clear timeout if exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Reset animation state only after animation is fully complete
      setTimeout(() => {
        animationStartedRef.current = false;
        isSpinningRef.current = false;
        currentSpinRef.current = null;
      }, 100);
    }
  }, [isSpinning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { 
    rotation, 
    spinning: isSpinning && animationStartedRef.current 
  };
};
