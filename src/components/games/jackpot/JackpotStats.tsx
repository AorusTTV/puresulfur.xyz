
import { Users, TrendingUp } from 'lucide-react';

interface JackpotStatsProps {
  totalPot: number;
  prizeAmount: number;
  houseFeeAmount: number;
  houseFeePct: number;
  entryCount: number;
}

export const JackpotStats = ({ 
  totalPot, 
  prizeAmount, 
  houseFeeAmount, 
  houseFeePct, 
  entryCount 
}: JackpotStatsProps) => {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-yellow-400 mb-2">
        ${totalPot.toFixed(2)}
      </div>
      <div className="text-sm text-slate-400 space-y-1">
        <div>Prize Pool: ${prizeAmount.toFixed(2)}</div>
        <div>House Fee ({houseFeePct}%): ${houseFeeAmount.toFixed(2)}</div>
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 text-slate-300">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {entryCount} Players
        </div>
      </div>
    </div>
  );
};
