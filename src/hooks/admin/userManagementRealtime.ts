
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User } from './userManagementTypes';

export const useUserManagementRealtime = (
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
) => {
  const { toast } = useToast();

  useEffect(() => {
    console.log('[USER-MGMT] Setting up real-time subscription...');
    
    // Set up real-time subscription for profile updates
    const channel = supabase
      .channel('user-management-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('[USER-MGMT] New user signed up:', payload);
          // Add the new user to the list
          setUsers(prevUsers => [payload.new as User, ...prevUsers]);
          toast({
            title: 'New User Signed Up',
            description: `${payload.new.nickname || payload.new.steam_username || 'New player'} just joined the site!`,
            variant: 'default'
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('[USER-MGMT] User updated:', payload);
          // Update the user in the list
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.id === payload.new.id ? payload.new as User : user
            )
          );
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      console.log('[USER-MGMT] Cleaning up user management subscription');
      supabase.removeChannel(channel);
    };
  }, [setUsers, toast]);
};
