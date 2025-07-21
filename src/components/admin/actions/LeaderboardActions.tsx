
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

interface User {
  id: string;
  steam_username: string;
  nickname: string;
  balance: number;
  level: number;
  experience: number;
  total_wagered: number;
  is_banned: boolean;
  leaderboard_disabled?: boolean;
  created_at: string;
}

interface LeaderboardActionsProps {
  user: User;
  onToggleLeaderboard: (user: User) => Promise<void>;
}

export const LeaderboardActions: React.FC<LeaderboardActionsProps> = ({
  user,
  onToggleLeaderboard
}) => {
  if (user.leaderboard_disabled) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => onToggleLeaderboard(user)}
        className="border-green-600/40 text-green-400 hover:bg-green-600/20 hover:text-green-300 interactive-glow"
        title="Enable Leaderboard Participation"
      >
        <Trophy className="h-3 w-3" />
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => onToggleLeaderboard(user)}
      className="border-orange-600/40 text-orange-400 hover:bg-orange-600/20 hover:text-orange-300 interactive-glow"
      title="Disable Leaderboard Participation"
    >
      <Trophy className="h-3 w-3 opacity-50" />
    </Button>
  );
};
