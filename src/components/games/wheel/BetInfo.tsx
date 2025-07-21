
import React from 'react';
import { SulfurIcon } from '@/components/ui/SulfurIcon';

interface BetInfoProps {
  selectedMultiplier: number | null;
  betAmount: string;
  wheelSections: Array<{ number: number; multiplier: number }>;
}

export const BetInfo: React.FC<BetInfoProps> = ({
  selectedMultiplier,
  betAmount,
  wheelSections
}) => {
  if (!selectedMultiplier) return null;

  const selectedSection = wheelSections.find(s => s.number === selectedMultiplier);
  const potentialPayout = betAmount && selectedSection ? 
    (parseFloat(betAmount) * selectedSection.multiplier).toFixed(2) : '0.00';

  // Get color class based on multiplier number
  const getColorClass = () => {
    switch(selectedMultiplier) {
      case 1: return 'bg-yellow-500';
      case 3: return 'bg-green-500';
      case 5: return 'bg-blue-500';
      case 10: return 'bg-purple-500';
      case 20: return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="bg-muted/30 border border-border p-3 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-full ${getColorClass()}`}></div>
          <div className="text-foreground text-sm">
            <span className="font-bold">{selectedMultiplier}x</span> SELECTED
          </div>
        </div>
        <div className="text-muted-foreground text-xs">
          Potential payout: <span className="font-bold text-primary flex items-center gap-1">
            <SulfurIcon className="h-3 w-3" />
            {potentialPayout}
          </span>
        </div>
      </div>
    </div>
  );
};
