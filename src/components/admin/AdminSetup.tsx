
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, User, UserPlus } from 'lucide-react';

export const AdminSetup: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [userIdToPromote, setUserIdToPromote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <Card className="bg-gradient-to-br from-card/80 to-secondary/30 border-primary/20 shadow-gaming backdrop-blur-sm max-w-md mx-auto">
        <CardContent className="pt-6">
          <p className="text-foreground text-center">Please log in to access admin panel.</p>
        </CardContent>
      </Card>
    );
  }

  const isAlreadyAdmin = profile && (profile.nickname === 'admin');

  const handlePromoteUser = async () => {
    if (!userIdToPromote.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid user ID',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // First, check if the user exists
      const { data: userExists, error: userCheckError } = await supabase
        .from('profiles')
        .select('id, nickname, steam_username')
        .eq('id', userIdToPromote.trim())
        .single();

      if (userCheckError || !userExists) {
        toast({
          title: 'Error',
          description: 'User not found with the provided ID',
          variant: 'destructive'
        });
        return;
      }

      // Check if user is already an admin
      if (userExists.nickname === 'admin') {
        toast({
          title: 'Info',
          description: 'This user is already an admin',
          variant: 'default'
        });
        return;
      }

      // Promote user to admin by setting their nickname to 'admin'
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ nickname: 'admin' })
        .eq('id', userIdToPromote.trim());

      if (updateError) {
        console.error('Error promoting user:', updateError);
        toast({
          title: 'Error',
          description: 'Failed to promote user to admin',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Success',
        description: `User ${userExists.steam_username || 'Unknown'} has been promoted to admin`,
      });

      setUserIdToPromote('');
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (isAlreadyAdmin) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Admin Access Card */}
        <Card className="bg-gradient-to-br from-card/80 to-secondary/30 border-primary/20 shadow-gaming backdrop-blur-sm">
          <CardHeader className="border-b border-primary/20">
            <CardTitle className="text-foreground flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold">Admin Access</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-secondary/40 rounded-lg border border-primary/10">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-foreground font-medium">Admin User</p>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
              </div>

              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-green-400 font-medium">You have admin access!</p>
                </div>
                <p className="text-muted-foreground text-sm">
                  The Admin tab is available in the navigation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promote User to Admin Card */}
        <Card className="bg-gradient-to-br from-card/80 to-secondary/30 border-primary/20 shadow-gaming backdrop-blur-sm">
          <CardHeader className="border-b border-primary/20">
            <CardTitle className="text-foreground flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold">Promote User to Admin</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-foreground font-medium">
                  User ID
                </Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="Enter user ID (UUID format)"
                  value={userIdToPromote}
                  onChange={(e) => setUserIdToPromote(e.target.value)}
                  className="bg-secondary/40 border-primary/20 text-foreground placeholder:text-muted-foreground focus:border-primary/40"
                />
                <p className="text-muted-foreground text-sm">
                  Enter the UUID of the user you want to promote to admin status.
                </p>
              </div>

              <Button
                onClick={handlePromoteUser}
                disabled={loading || !userIdToPromote.trim()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Promoting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Promote to Admin
                  </div>
                )}
              </Button>

              <div className="p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  <strong>Warning:</strong> This action will immediately grant full admin privileges to the specified user. 
                  Make sure you trust this user before proceeding.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card/80 to-secondary/30 border-primary/20 shadow-gaming backdrop-blur-sm max-w-md mx-auto">
      <CardHeader className="border-b border-primary/20">
        <CardTitle className="text-foreground flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold">Access Denied</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-center">
          <p className="text-foreground mb-4">
            You do not have admin privileges for this system.
          </p>
          <p className="text-muted-foreground text-sm">
            Contact the system administrator if you believe this is an error.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
