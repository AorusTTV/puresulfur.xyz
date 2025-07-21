
import React from 'react';
import { Button } from '@/components/ui/button';
import { Ban, ShieldOff } from 'lucide-react';

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

interface BanActionsProps {
  user: User;
  onBanUser: (user: User) => void;
  onUnbanUser: (user: User) => Promise<void>;
}

export const BanActions: React.FC<BanActionsProps> = ({
  user,
  onBanUser,
  onUnbanUser
}) => {
  if (user.is_banned) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => onUnbanUser(user)}
        className="border-green-600/40 text-green-400 hover:bg-green-600/20 hover:text-green-300 interactive-glow"
        title="Unban User"
      >
        <ShieldOff className="h-3 w-3" />
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => onBanUser(user)}
      className="border-yellow-600/40 text-yellow-400 hover:bg-yellow-600/20 hover:text-yellow-300 interactive-glow"
      title="Ban User"
    >
      <Ban className="h-3 w-3" />
    </Button>
  );
};
