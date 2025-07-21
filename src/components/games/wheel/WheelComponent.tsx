
import React from 'react';
import { WheelPointer } from './WheelPointer';
import { WheelAnimation } from './WheelAnimation';
import { WheelCenter } from './WheelCenter';
import { WheelRim } from './WheelRim';
import { WheelImage } from './WheelImage';
import { useWheelAnimation } from '@/hooks/useWheelAnimation';

interface WheelSection {
  number: number;
  multiplier: number;
  color: string;
  textColor: string;
}

interface WheelComponentProps {
  sections: WheelSection[];
  isSpinning: boolean;
  winningIndex?: number | null;
  onSpinComplete: () => void;
}

export const WheelComponent: React.FC<WheelComponentProps> = ({
  sections,
  isSpinning,
  winningIndex,
  onSpinComplete
}) => {
  const { rotation, spinning } = useWheelAnimation({
    isSpinning,
    winningIndex,
    onSpinComplete,
    sectionsLength: sections.length
  });

  return (
    <div className="flex justify-center">
      <div className="relative">
        <WheelPointer />
        
        <WheelImage rotation={rotation} spinning={spinning} />
        
        <WheelRim />
        
        <WheelAnimation isSpinning={isSpinning} />
        
        <WheelCenter />
      </div>
    </div>
  );
};
