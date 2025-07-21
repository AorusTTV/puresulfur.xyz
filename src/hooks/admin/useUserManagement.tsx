
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserManagementState } from './userManagementTypes';
import { fetchUsers } from './userManagementQueries';
import { useUserActions } from './userManagementActions';
import { useUserManagementRealtime } from './userManagementRealtime';

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showEditUsernameDialog, setShowEditUsernameDialog] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  
  const { user: currentUser } = useAuth();
  const userActions = useUserActions();

  // Set up real-time subscription
  useUserManagementRealtime(setUsers);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userData = await fetchUsers();
        setUsers(userData);
      } catch (error) {
        console.error('[USER-MGMT] Error in fetchUsers:', error);
        userActions.toast({
          title: 'Error Loading Users',
          description: 'Failed to load users. Please check if you have admin privileges.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [userActions.toast]);

  const copyUserIdToClipboard = async (userId: string) => {
    const success = await userActions.copyUserIdToClipboard(userId);
    if (success) {
      setCopiedUserId(userId);
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedUserId(null);
      }, 2000);
    }
  };

  const handleEditUsername = (user: User) => {
    setSelectedUser(user);
    setShowEditUsernameDialog(true);
  };

  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    setShowBanDialog(true);
  };

  const filteredUsers = users.filter(user =>
    user.steam_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    users,
    filteredUsers,
    loading,
    searchTerm,
    setSearchTerm,
    selectedUser,
    showBanDialog,
    setShowBanDialog,
    showEditUsernameDialog,
    setShowEditUsernameDialog,
    copiedUserId,
    copyUserIdToClipboard,
    adjustBalance: userActions.adjustBalance,
    adjustExperience: userActions.adjustExperience,
    handleEditUsername,
    toggleLeaderboardParticipation: userActions.toggleLeaderboardParticipation,
    handleBanUser,
    handleUnbanUser: userActions.handleUnbanUser,
    currentUser,
    toast: userActions.toast
  };
};
