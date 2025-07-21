
import React from 'react';
import { Card } from '@/components/ui/card';

interface BattleAnimationsProps {
  children: React.ReactNode;
  isWinner?: boolean;
  isRolling?: boolean;
  animationDelay?: number;
}

export const BattleAnimations: React.FC<BattleAnimationsProps> = ({
  children,
  isWinner = false,
  isRolling = false,
  animationDelay = 0
}) => {
  return (
    <div 
      className={`
        transition-all duration-500 ease-in-out transform
        ${isWinner ? 'scale-105 animate-pulse' : ''}
        ${isRolling ? 'animate-bounce' : ''}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {isWinner && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg animate-pulse" />
      )}
      {children}
    </div>
  );
};

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ seconds, onComplete }) => {
  return (
    <div className="relative">
      <div className="text-6xl font-bold text-orange-500">
        {seconds}
      </div>
    </div>
  );
};

interface StaticCrateProps {
  imageUrl: string;
  isGlowing?: boolean;
}

export const StaticCrate: React.FC<StaticCrateProps> = ({ imageUrl, isGlowing = false }) => {
  return (
    <div className="relative w-20 h-20">
      <img 
        src={imageUrl}
        alt="Crate"
        className={`w-full h-full object-cover rounded-lg transition-all duration-500 ${
          isGlowing ? 'shadow-lg shadow-primary/50' : ''
        }`}
      />
      {isGlowing && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse rounded-lg" />
      )}
    </div>
  );
};
