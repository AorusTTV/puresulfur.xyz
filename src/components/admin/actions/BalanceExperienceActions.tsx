
import React from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Zap } from 'lucide-react';

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

interface BalanceExperienceActionsProps {
  user: User;
  onBalanceClick: () => void;
  onExperienceClick: () => void;
}

export const BalanceExperienceActions: React.FC<BalanceExperienceActionsProps> = ({
  onBalanceClick,
  onExperienceClick
}) => {
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={onBalanceClick}
        className="border-primary/40 text-primary hover:bg-primary/20 hover:text-primary interactive-glow"
        title="Adjust Balance"
      >
        <DollarSign className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onExperienceClick}
        className="border-blue-600/40 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 interactive-glow"
        title="Adjust Experience"
      >
        <Zap className="h-3 w-3" />
      </Button>
    </>
  );
};
