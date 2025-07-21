
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';

interface PricingVerificationButtonProps {
  isRunning: boolean;
  onRunVerification: () => Promise<void>;
}

export const PricingVerificationButton = ({ isRunning, onRunVerification }: PricingVerificationButtonProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button 
        onClick={onRunVerification} 
        disabled={isRunning}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isRunning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running Final Verification...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Run Final Verification
          </>
        )}
      </Button>
      
      <div className="text-sm text-slate-500">
        Verifies: rounding fix, DB trigger, price consistency
      </div>
    </div>
  );
};
