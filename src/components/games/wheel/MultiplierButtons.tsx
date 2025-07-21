
import React from 'react';
import { Button } from '@/components/ui/button';

interface UserBet {
  id: string;
  bet_color: string;
  multiplier: number;
  bet_amount: number;
}

interface MultiplierButtonsProps {
  selectedMultiplier: number | null;
  onMultiplierSelect: (multiplier: number) => void;
  disabled?: boolean;
  userBets?: UserBet[];
}

const multiplierData = [
  { number: 1, multiplier: 2, color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-600', text: 'YELLOW', colorName: 'yellow' },
  { number: 3, multiplier: 4, color: 'bg-green-500', hoverColor: 'hover:bg-green-600', text: 'GREEN', colorName: 'green' },
  { number: 5, multiplier: 6, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600', text: 'BLUE', colorName: 'blue' },
  { number: 10, multiplier: 11, color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600', text: 'PURPLE', colorName: 'purple' },
  { number: 20, multiplier: 21, color: 'bg-red-500', hoverColor: 'hover:bg-red-600', text: 'RED', colorName: 'red' },
];

export const MultiplierButtons: React.FC<MultiplierButtonsProps> = ({
  selectedMultiplier,
  onMultiplierSelect,
  disabled = false,
  userBets = []
}) => {
  const getBetForColor = (colorName: string) => {
    return userBets.find(bet => bet.bet_color === colorName);
  };

  return (
    <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
      {multiplierData.map((item) => {
        const userBet = getBetForColor(item.colorName);
        
        return (
          <Button
            key={item.number}
            onClick={() => !disabled && onMultiplierSelect(item.number)}
            className={`
              relative h-20 flex flex-col items-center justify-center text-white font-bold
              ${selectedMultiplier === item.number ? 
                `${item.color} ring-2 ring-white` : 
                `${item.color} ${disabled ? 'opacity-50 cursor-not-allowed' : item.hoverColor}`
              }
              transition-all duration-200
            `}
            disabled={disabled}
          >
            <div className="text-lg">{item.multiplier}x</div>
            <div className="text-xs mt-1">{item.text}</div>
            
            {/* User bet display */}
            {userBet && (
              <div className="absolute top-1 right-1 bg-black/70 rounded px-2 py-1 flex items-center gap-1">
                <img 
                  src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                  alt="Sulfur" 
                  className="h-3 w-3" 
                />
                <span className="text-xs text-white font-bold">{userBet.bet_amount}</span>
              </div>
            )}
            
            {/* Pulsing effect for selected button */}
            {selectedMultiplier === item.number && (
              <div className="absolute inset-0 rounded animate-pulse opacity-60 bg-white pointer-events-none"></div>
            )}
          </Button>
        );
      })}
    </div>
  );
};
