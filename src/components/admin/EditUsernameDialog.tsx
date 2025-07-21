
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

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

interface EditUsernameDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSuccess: () => void;
}

export const EditUsernameDialog: React.FC<EditUsernameDialogProps> = ({
  user,
  open,
  onOpenChange,
  onUpdateSuccess
}) => {
  const [newUsername, setNewUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const { profile } = useAuth();

  // Check if current user is admin
  const isCurrentUserAdmin = profile?.nickname === 'admin';

  React.useEffect(() => {
    if (user) {
      setNewUsername(user.nickname || user.steam_username || '');
      setError('');
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!user || !newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    // Only prevent "admin" nickname for non-admin users
    if (newUsername.toLowerCase() === 'admin' && !isCurrentUserAdmin) {
      setError('Username "admin" is not allowed');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('profiles')
        .update({ nickname: newUsername.trim() })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating username:', error);
        setError('Failed to update username. Please try again.');
        return;
      }

      onUpdateSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating username:', error);
      setError('Failed to update username. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Username</DialogTitle>
          <DialogDescription>
            Update the display name for {user?.steam_username || 'this user'}.
            {isCurrentUserAdmin && (
              <span className="block mt-2 text-sm text-orange-400">
                As an admin, you can set any username including "admin".
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              disabled={isUpdating}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isUpdating || !newUsername.trim()}
            >
              {isUpdating ? 'Updating...' : 'Update Username'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
