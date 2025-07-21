
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { UserSearchFilter } from './UserSearchFilter';
import { UserManagementTable } from './UserManagementTable';
import { BanUserDialog } from './BanUserDialog';
import { EditUsernameDialog } from './EditUsernameDialog';

export const UserManagement: React.FC = () => {
  const {
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
    adjustBalance,
    adjustExperience,
    handleEditUsername,
    toggleLeaderboardParticipation,
    handleBanUser,
    handleUnbanUser,
    users
  } = useUserManagement();

  return (
    <>
      <Card className="bg-gradient-to-br from-card/80 to-secondary/30 border-primary/20 shadow-gaming backdrop-blur-sm">
        <CardHeader className="border-b border-primary/20">
          <CardTitle className="text-foreground flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">User Management</span>
              <span className="text-sm text-muted-foreground font-normal">
                Manage user accounts, balances, and experience
              </span>
            </div>
            <div className="ml-auto">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                {users.length} Total Users
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <UserSearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <UserManagementTable
            users={filteredUsers}
            searchTerm={searchTerm}
            loading={loading}
            copiedUserId={copiedUserId}
            onCopyUserId={copyUserIdToClipboard}
            onAdjustBalance={adjustBalance}
            onAdjustExperience={adjustExperience}
            onEditUsername={handleEditUsername}
            onToggleLeaderboard={toggleLeaderboardParticipation}
            onBanUser={handleBanUser}
            onUnbanUser={handleUnbanUser}
          />
        </CardContent>
      </Card>

      <BanUserDialog
        user={selectedUser}
        open={showBanDialog}
        onOpenChange={setShowBanDialog}
        onBanSuccess={() => {
          setShowBanDialog(false);
        }}
      />

      <EditUsernameDialog
        user={selectedUser}
        open={showEditUsernameDialog}
        onOpenChange={setShowEditUsernameDialog}
        onUpdateSuccess={() => {
          // The real-time subscription will handle updating the user list
        }}
      />
    </>
  );
};
