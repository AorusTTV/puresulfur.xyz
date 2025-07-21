
import React from 'react';
import { WheelComponent } from './WheelComponent';
import { MultiplierButtons } from './MultiplierButtons';
import { GameTimer } from './GameTimer';
import { wheelSections } from '@/utils/wheelBettingUtils';

interface UserBet {
  id: string;
  bet_color: string;
  multiplier: number;
  bet_amount: number;
}

interface WheelSectionProps {
  timeLeft: number;
  isSpinning: boolean;
  winningSection: number | null;
  selectedMultiplier: number | null;
  onMultiplierSelect: (multiplier: number) => void;
  userBets: UserBet[];
}

export const WheelSection: React.FC<WheelSectionProps> = ({
  timeLeft,
  isSpinning,
  winningSection,
  selectedMultiplier,
  onMultiplierSelect,
  userBets
}) => {
  return (
    <div className="lg:col-span-2">
      <GameTimer timeLeft={timeLeft} isSpinning={isSpinning} />

      <WheelComponent 
        sections={wheelSections} 
        isSpinning={isSpinning}
        winningIndex={winningSection}
        onSpinComplete={() => {}}
      />

      {/* Multiplier Selection */}
      <div className="mt-6">
        <MultiplierButtons 
          selectedMultiplier={selectedMultiplier}
          onMultiplierSelect={onMultiplierSelect}
          disabled={isSpinning}
          userBets={userBets}
        />
      </div>
    </div>
  );
};
