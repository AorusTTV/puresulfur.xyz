
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MuteUserResponse } from '@/types/rpcResponses';

interface AdminCommandsProps {
  profile: any;
  onSendMessage: (message: string, isGlobalMessage?: boolean) => Promise<boolean>;
}

export const useAdminCommands = ({ profile, onSendMessage }: AdminCommandsProps) => {
  const { toast } = useToast();

  const handleUnmuteCommand = async (command: string) => {
    console.log('Unmute command received:', command);
    
    const parts = command.trim().split(/\s+/);
    if (parts.length !== 2) {
      toast({
        title: "Invalid Command",
        description: "Usage: /unmute user_id",
        variant: "destructive",
      });
      return;
    }

    const userId = parts[1];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      toast({
        title: "Invalid User ID",
        description: "Please provide a valid user ID (UUID format)",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Looking up user:', userId);
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id, nickname, steam_username')
        .eq('id', userId)
        .limit(1);

      if (userError) {
        console.error('User lookup error:', userError);
        throw userError;
      }

      if (!users || users.length === 0) {
        toast({
          title: "User Not Found",
          description: `Could not find user with ID: ${userId}`,
          variant: "destructive",
        });
        return;
      }

      const targetUser = users[0];
      const displayName = targetUser.nickname || targetUser.steam_username || 'Unknown User';

      console.log('Unmuting user:', displayName);
      const { data, error } = await supabase.rpc('unmute_user', {
        p_user_id: userId
      });

      if (error) {
        console.error('Unmute RPC error:', error);
        throw error;
      }

      const response = data as unknown as { success: boolean; error?: string; message?: string };

      if (response?.success) {
        toast({
          title: "User Unmuted",
          description: `${displayName} has been unmuted`,
          variant: "default",
        });

        // Send notification to chat
        await onSendMessage(`🔊 ${displayName} has been unmuted`, true);
      } else {
        throw new Error(response?.error || 'Failed to unmute user');
      }
    } catch (error) {
      console.error('Error unmuting user:', error);
      toast({
        title: "Error",
        description: `Failed to unmute user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleMuteByUserIdCommand = async (command: string) => {
    console.log('Mute by user ID command received:', command);
    
    const parts = command.trim().split(/\s+/);
    if (parts.length < 3) {
      toast({
        title: "Invalid Command",
        description: "Usage: /mute user_id duration(m/h/d) [reason]",
        variant: "destructive",
      });
      return;
    }

    const userId = parts[1];
    const durationStr = parts[2];
    const reason = parts.slice(3).join(' ') || 'No reason provided';

    console.log('Parsed mute command:', { userId, durationStr, reason });

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      toast({
        title: "Invalid User ID",
        description: "Please provide a valid user ID (UUID format)",
        variant: "destructive",
      });
      return;
    }

    let durationMinutes = 0;
    const durationMatch = durationStr.match(/^(\d+)([mhd])$/i);
    
    if (!durationMatch) {
      toast({
        title: "Invalid Duration",
        description: "Use format like: 30m, 2h, 1d",
        variant: "destructive",
      });
      return;
    }

    const [, amount, unit] = durationMatch;
    const numAmount = parseInt(amount);
    
    switch (unit.toLowerCase()) {
      case 'm':
        durationMinutes = numAmount;
        break;
      case 'h':
        durationMinutes = numAmount * 60;
        break;
      case 'd':
        durationMinutes = numAmount * 60 * 24;
        break;
    }

    console.log('Duration calculated:', durationMinutes, 'minutes');

    try {
      console.log('Looking up user:', userId);
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id, nickname, steam_username')
        .eq('id', userId)
        .limit(1);

      if (userError) {
        console.error('User lookup error:', userError);
        throw userError;
      }

      if (!users || users.length === 0) {
        toast({
          title: "User Not Found",
          description: `Could not find user with ID: ${userId}`,
          variant: "destructive",
        });
        return;
      }

      const targetUser = users[0];
      const displayName = targetUser.nickname || targetUser.steam_username || 'Unknown User';

      console.log('Muting user:', displayName, 'for', durationMinutes, 'minutes');
      const { data, error } = await supabase.rpc('mute_user', {
        p_user_id: userId,
        p_muted_by: profile?.id,
        p_duration_minutes: durationMinutes,
        p_reason: reason
      });

      if (error) {
        console.error('Mute RPC error:', error);
        throw error;
      }

      const response = data as unknown as MuteUserResponse;

      if (response?.success) {
        toast({
          title: "User Muted",
          description: `${displayName} has been muted for ${durationStr}`,
          variant: "default",
        });

        // Send notification to chat
        await onSendMessage(`🔇 ${displayName} has been muted for ${durationStr}. Reason: ${reason}`, true);
      } else {
        throw new Error(response?.error || 'Failed to mute user');
      }
    } catch (error) {
      console.error('Error muting user:', error);
      toast({
        title: "Error",
        description: `Failed to mute user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleMuteCommand = async (command: string) => {
    console.log('Mute by username command received:', command);
    
    const parts = command.trim().split(/\s+/);
    if (parts.length < 3) {
      toast({
        title: "Invalid Command",
        description: "Usage: /mute @username duration(m/h/d) [reason]",
        variant: "destructive",
      });
      return;
    }

    let username = parts[1];
    const durationStr = parts[2];
    const reason = parts.slice(3).join(' ') || 'No reason provided';

    // Remove @ if present
    if (username.startsWith('@')) {
      username = username.substring(1);
    }

    console.log('Parsed mute command:', { username, durationStr, reason });

    let durationMinutes = 0;
    const durationMatch = durationStr.match(/^(\d+)([mhd])$/i);
    
    if (!durationMatch) {
      toast({
        title: "Invalid Duration",
        description: "Use format like: 30m, 2h, 1d",
        variant: "destructive",
      });
      return;
    }

    const [, amount, unit] = durationMatch;
    const numAmount = parseInt(amount);
    
    switch (unit.toLowerCase()) {
      case 'm':
        durationMinutes = numAmount;
        break;
      case 'h':
        durationMinutes = numAmount * 60;
        break;
      case 'd':
        durationMinutes = numAmount * 60 * 24;
        break;
    }

    console.log('Duration calculated:', durationMinutes, 'minutes');

    try {
      console.log('Looking up user by username:', username);
      
      // Fixed query: Use OR condition properly with ilike for case-insensitive search
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id, nickname, steam_username')
        .or(`nickname.ilike.${username},steam_username.ilike.${username}`)
        .limit(1);

      if (userError) {
        console.error('User lookup error:', userError);
        throw userError;
      }

      console.log('User lookup result:', users);

      if (!users || users.length === 0) {
        toast({
          title: "User Not Found",
          description: `Could not find user with username: ${username}`,
          variant: "destructive",
        });
        return;
      }

      const targetUser = users[0];
      const displayName = targetUser.nickname || targetUser.steam_username || username;

      console.log('Muting user:', displayName, 'for', durationMinutes, 'minutes');
      const { data, error } = await supabase.rpc('mute_user', {
        p_user_id: targetUser.id,
        p_muted_by: profile?.id,
        p_duration_minutes: durationMinutes,
        p_reason: reason
      });

      if (error) {
        console.error('Mute RPC error:', error);
        throw error;
      }

      const response = data as unknown as MuteUserResponse;

      if (response?.success) {
        toast({
          title: "User Muted",
          description: `${displayName} has been muted for ${durationStr}`,
          variant: "default",
        });

        // Send notification to chat
        await onSendMessage(`🔇 ${displayName} has been muted for ${durationStr}. Reason: ${reason}`, true);
      } else {
        throw new Error(response?.error || 'Failed to mute user');
      }
    } catch (error) {
      console.error('Error muting user:', error);
      toast({
        title: "Error",
        description: `Failed to mute user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const handleClearCommand = async () => {
    console.log('Clear command received');
    
    const isAdmin = profile?.nickname === 'admin';
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can clear messages",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Clearing all messages');
      const { error } = await supabase.rpc('clear_all_chat_messages', {
        p_admin_id: profile?.id
      });

      if (error) {
        console.error('Clear messages RPC error:', error);
        throw error;
      }

      toast({
        title: "Chat Cleared",
        description: "All chat messages have been cleared",
        variant: "default",
      });

      // Don't send a notification message, but trigger a real-time update
      // by creating a temporary update that gets caught by the realtime listener
      console.log('Chat cleared successfully - triggering real-time update');
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast({
        title: "Error",
        description: `Failed to clear messages: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return {
    handleUnmuteCommand,
    handleMuteByUserIdCommand,
    handleMuteCommand,
    handleClearCommand
  };
};
