
import React from 'react';
import { Clock } from 'lucide-react';

interface MuteCountdownProps {
  remainingTime: number; // in seconds
  reason?: string;
}

export const MuteCountdown: React.FC<MuteCountdownProps> = ({ remainingTime, reason }) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-red-950/20 border border-red-800/30 rounded-md">
      <Clock className="h-4 w-4 text-red-400" />
      <div className="flex flex-col">
        <span className="text-sm text-red-400 font-medium">
          You are muted for {formatTime(remainingTime)}
        </span>
        {reason && (
          <span className="text-xs text-red-300/70">
            Reason: {reason}
          </span>
        )}
      </div>
    </div>
  );
};
