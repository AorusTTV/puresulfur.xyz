
import { useEffect, useRef } from 'react';

interface UseWheelGameTimerProps {
  timeLeft: number;
  setTimeLeft: (value: number | ((prev: number) => number)) => void;
  isSpinning: boolean;
  currentGame: any;
  onTimerComplete: () => void;
}

export const useWheelGameTimer = ({
  timeLeft,
  setTimeLeft,
  isSpinning,
  currentGame,
  onTimerComplete
}: UseWheelGameTimerProps) => {
  const timerCompletedRef = useRef(false);

  useEffect(() => {
    // Reset timer completed flag when new game starts
    if (currentGame && !isSpinning && timeLeft === 30) {
      timerCompletedRef.current = false;
    }
  }, [currentGame, isSpinning, timeLeft]);

  useEffect(() => {
    if (timeLeft > 0 && !isSpinning) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSpinning && currentGame && !timerCompletedRef.current) {
      // Prevent multiple timer completions
      timerCompletedRef.current = true;
      onTimerComplete();
    }
  }, [timeLeft, isSpinning, currentGame, setTimeLeft, onTimerComplete]);
};
