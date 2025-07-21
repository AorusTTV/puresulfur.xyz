
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';
import { UserTableRow } from './UserTableRow';

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

interface UserManagementTableProps {
  users: User[];
  searchTerm: string;
  loading: boolean;
  copiedUserId: string | null;
  onCopyUserId: (userId: string) => Promise<void>;
  onAdjustBalance: (userId: string, amount: number) => Promise<void>;
  onAdjustExperience: (userId: string, experience: number) => Promise<void>;
  onEditUsername: (user: User) => void;
  onToggleLeaderboard: (user: User) => Promise<void>;
  onBanUser: (user: User) => void;
  onUnbanUser: (user: User) => Promise<void>;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  searchTerm,
  loading,
  copiedUserId,
  onCopyUserId,
  onAdjustBalance,
  onAdjustExperience,
  onEditUsername,
  onToggleLeaderboard,
  onBanUser,
  onUnbanUser
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-primary/20">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/5 border-primary/20 hover:bg-primary/10">
            <TableHead className="text-foreground font-semibold">Username</TableHead>
            <TableHead className="text-foreground font-semibold">User ID</TableHead>
            <TableHead className="text-foreground font-semibold">Status</TableHead>
            <TableHead className="text-foreground font-semibold">Balance</TableHead>
            <TableHead className="text-foreground font-semibold">Level</TableHead>
            <TableHead className="text-foreground font-semibold">Experience</TableHead>
            <TableHead className="text-foreground font-semibold">Total Wagered</TableHead>
            <TableHead className="text-foreground font-semibold">Joined</TableHead>
            <TableHead className="text-foreground font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              copiedUserId={copiedUserId}
              onCopyUserId={onCopyUserId}
              onAdjustBalance={onAdjustBalance}
              onAdjustExperience={onAdjustExperience}
              onEditUsername={onEditUsername}
              onToggleLeaderboard={onToggleLeaderboard}
              onBanUser={onBanUser}
              onUnbanUser={onUnbanUser}
            />
          ))}
        </TableBody>
      </Table>

      {users.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            {searchTerm ? 'No users found matching your search.' : 'No users found.'}
          </p>
        </div>
      )}
    </div>
  );
};
