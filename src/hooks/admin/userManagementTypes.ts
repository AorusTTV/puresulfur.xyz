
export interface User {
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

export interface UserManagementState {
  users: User[];
  searchTerm: string;
  loading: boolean;
  selectedUser: User | null;
  showBanDialog: boolean;
  showEditUsernameDialog: boolean;
  copiedUserId: string | null;
}
