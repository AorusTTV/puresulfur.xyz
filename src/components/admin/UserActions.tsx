
import React from 'react';
import { useUserActionHandlers } from './hooks/useUserActionHandlers';
import { BalanceExperienceActions } from './actions/BalanceExperienceActions';
import { LeaderboardActions } from './actions/LeaderboardActions';
import { BanActions } from './actions/BanActions';
import { DangerousActions } from './actions/DangerousActions';

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

interface UserActionsProps {
  user: User;
  onAdjustBalance: (userId: string, amount: number) => Promise<void>;
  onAdjustExperience: (userId: string, experience: number) => Promise<void>;
  onEditUsername: (user: User) => void;
  onBanUser: (user: User) => void;
  onUnbanUser: (user: User) => Promise<void>;
  onToggleLeaderboard: (user: User) => Promise<void>;
}

export const UserActions: React.FC<UserActionsProps> = ({
  user,
  onAdjustBalance,
  onAdjustExperience,
  onEditUsername,
  onBanUser,
  onUnbanUser,
  onToggleLeaderboard
}) => {
  const {
    handleBalanceAdjustment,
    handleExperienceAdjustment,
    handleDeleteUser,
    handleDeleteAffiliateCode
  } = useUserActionHandlers();

  return (
    <div className="flex gap-2">
      <DangerousActions
        user={user}
        onEditUsername={onEditUsername}
        onDeleteUser={() => handleDeleteUser(user)}
        onDeleteAffiliateCode={() => handleDeleteAffiliateCode(user)}
      />
      <BalanceExperienceActions
        user={user}
        onBalanceClick={() => handleBalanceAdjustment(user, onAdjustBalance)}
        onExperienceClick={() => handleExperienceAdjustment(user, onAdjustExperience)}
      />
      <LeaderboardActions
        user={user}
        onToggleLeaderboard={onToggleLeaderboard}
      />
      <BanActions
        user={user}
        onBanUser={onBanUser}
        onUnbanUser={onUnbanUser}
      />
    </div>
  );
};
