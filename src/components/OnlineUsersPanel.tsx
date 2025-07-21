import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface OnlineUser {
  id: string;
  nickname?: string;
  steam_username?: string;
  avatar_url?: string;
  role?: string;
}

export const OnlineUsersPanel: React.FC = () => {
  const { profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  // Fetch user profiles for given IDs
  const fetchProfiles = async (userIds: string[]) => {
    if (!userIds.length) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, steam_username, avatar_url')
      .in('id', userIds);
    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch online users', variant: 'destructive' });
      return [];
    }
    return data;
  };

  useEffect(() => {
    console.log('Setting up presence tracking for online users panel');
    const channel = supabase.channel('online_users_panel');
    
    channel
      .on('presence', { event: 'sync' }, async () => {
        const state = channel.presenceState();
        const userIds = Object.keys(state);
        const profiles = await fetchProfiles(userIds);
        setOnlineUsers(profiles);
      })
      .on('presence', { event: 'join' }, async () => {
        const state = channel.presenceState();
        const userIds = Object.keys(state);
        const profiles = await fetchProfiles(userIds);
        setOnlineUsers(profiles);
      })
      .on('presence', { event: 'leave' }, async () => {
        const state = channel.presenceState();
        const userIds = Object.keys(state);
        const profiles = await fetchProfiles(userIds);
        setOnlineUsers(profiles);
      })
      .subscribe();

    return () => {
      console.log('Cleaning up online users panel presence tracking');
      supabase.removeChannel(channel);
    };
  }, []);

  // Admin actions
  const handleBan = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: true })
      .eq('id', userId);
    if (error) {
      toast({ title: 'Error', description: 'Failed to ban user', variant: 'destructive' });
    } else {
      toast({ title: 'User Banned', description: 'User has been banned.' });
    }
  };

  return (
    <div className="p-4 bg-card rounded shadow">
      <h3 className="text-lg font-bold mb-4">Online Users ({onlineUsers.length})</h3>
      <div className="flex flex-wrap gap-4">
        {onlineUsers.map(user => (
          <div key={user.id} className="flex flex-col items-center">
            <Avatar className="w-12 h-12 mb-2">
              <AvatarImage src={user.avatar_url || undefined} alt={user.nickname || user.steam_username || 'User'} />
              <AvatarFallback>
                {(user.nickname || user.steam_username || 'U').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{user.nickname || user.steam_username || 'User'}</span>
            {profile?.nickname === 'admin' && (
              <Button
                size="sm"
                variant="destructive"
                className="mt-1"
                onClick={() => handleBan(user.id)}
              >
                Ban
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 