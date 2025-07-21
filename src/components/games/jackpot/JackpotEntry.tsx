
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { JackpotEntryData } from '@/types/jackpot';

interface JackpotEntryProps {
  entry: JackpotEntryData;
  totalPot: number;
}

export const JackpotEntry = ({ entry, totalPot }: JackpotEntryProps) => {
  const winChance = totalPot > 0 ? (entry.value / totalPot) * 100 : 0;
  const ticketCount = entry.ticket_end - entry.ticket_start + 1;

  return (
    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={entry.profiles?.avatar_url} />
          <AvatarFallback className="bg-slate-600 text-white text-xs">
            {entry.profiles?.steam_username?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="text-sm font-medium text-white">
            {entry.profiles?.steam_username || 'Unknown User'}
          </div>
          <div className="text-xs text-slate-400">
            {ticketCount} tickets
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-yellow-400">
          ${entry.value.toFixed(2)}
        </div>
        <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
          {winChance.toFixed(1)}%
        </Badge>
      </div>
    </div>
  );
};
