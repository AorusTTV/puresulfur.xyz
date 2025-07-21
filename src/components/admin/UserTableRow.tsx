
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { formatNumber } from '@/utils/levelUtils';
import { UserActions } from './UserActions';

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

interface UserTableRowProps {
  user: User;
  copiedUserId: string | null;
  onCopyUserId: (userId: string) => Promise<void>;
  onAdjustBalance: (userId: string, amount: number) => Promise<void>;
  onAdjustExperience: (userId: string, experience: number) => Promise<void>;
  onEditUsername: (user: User) => void;
  onToggleLeaderboard: (user: User) => Promise<void>;
  onBanUser: (user: User) => void;
  onUnbanUser: (user: User) => Promise<void>;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  copiedUserId,
  onCopyUserId,
  onAdjustBalance,
  onAdjustExperience,
  onEditUsername,
  onToggleLeaderboard,
  onBanUser,
  onUnbanUser
}) => {
  return (
    <TableRow className="border-primary/10 hover:bg-primary/5 transition-colors">
      <TableCell className="text-foreground font-medium">
        {user.nickname || user.steam_username || 'Unknown User'}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 max-w-[200px]">
          <span className="text-muted-foreground text-xs font-mono truncate" title={user.id}>
            {user.id.substring(0, 8)}...
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onCopyUserId(user.id)}
            className="h-6 w-6 p-0 hover:bg-primary/20"
            title="Copy full User ID"
          >
            {copiedUserId === user.id ? (
              <Check className="h-3 w-3 text-green-400" />
            ) : (
              <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            )}
          </Button>
        </div>
      </TableCell>
      <TableCell>
        {user.is_banned ? (
          <span className="bg-destructive/20 text-destructive px-2 py-1 rounded-full text-xs font-medium">
            Banned
          </span>
        ) : (
          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
            Active
          </span>
        )}
      </TableCell>
      <TableCell className="text-primary font-medium">
        ${user.balance?.toFixed(2) || '0.00'}
      </TableCell>
      <TableCell className="text-accent font-medium">{user.level || 1}</TableCell>
      <TableCell className="text-orange-400 font-medium">
        {formatNumber(user.experience || 0)} XP
      </TableCell>
      <TableCell className="text-yellow-400 font-medium">
        ${user.total_wagered?.toFixed(2) || '0.00'}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(user.created_at).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <UserActions
          user={user}
          onAdjustBalance={onAdjustBalance}
          onAdjustExperience={onAdjustExperience}
          onEditUsername={onEditUsername}
          onToggleLeaderboard={onToggleLeaderboard}
          onBanUser={onBanUser}
          onUnbanUser={onUnbanUser}
        />
      </TableCell>
    </TableRow>
  );
};
