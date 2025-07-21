
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserX } from 'lucide-react';

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

interface DangerousActionsProps {
  user: User;
  onEditUsername: (user: User) => void;
  onDeleteUser: () => void;
  onDeleteAffiliateCode: (user: User) => void;
}

export const DangerousActions: React.FC<DangerousActionsProps> = ({
  user,
  onEditUsername,
  onDeleteUser,
  onDeleteAffiliateCode
}) => {
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onEditUsername(user)}
        className="border-purple-600/40 text-purple-400 hover:bg-purple-600/20 hover:text-purple-300 interactive-glow"
        title="Edit Username"
      >
        <Edit className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onDeleteAffiliateCode(user)}
        className="border-orange-600/40 text-orange-400 hover:bg-orange-600/20 hover:text-orange-300 interactive-glow"
        title="Delete Affiliate Code"
      >
        <UserX className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onDeleteUser}
        className="border-destructive/40 text-destructive hover:bg-destructive/20 hover:text-destructive interactive-glow"
        title="Delete User Permanently"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </>
  );
};
