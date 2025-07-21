
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  is_global_message: boolean;
  deleted_at?: string | null;
  profiles: {
    nickname: string | null;
    steam_username: string | null;
    avatar_url: string | null;
    level: number;
    steam_id: string | null;
  };
}

export const useChatMessages = (isOpen: boolean = true) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = async () => {
    try {
      console.log('[CHAT] Fetching chat messages with profile data...');
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          message,
          created_at,
          user_id,
          is_global_message,
          deleted_at,
          profiles(
            nickname, 
            steam_username, 
            avatar_url, 
            level,
            steam_id
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[CHAT] Error fetching messages:', error);
        return;
      }

      console.log('[CHAT] Fetched messages:', data?.length || 0);
      setMessages(data?.reverse() || []);
    } catch (error) {
      console.error('[CHAT] Error in fetchMessages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    console.log('[CHAT] Setting up chat messages real-time subscription');

    channelRef.current = supabase
      .channel('chat_messages_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload) => {
          console.log('[CHAT] Real-time handler fired! Payload:', payload);
          console.log('[CHAT] New message received via real-time:', payload);
          
          try {
            // Fetch the complete message with profile data
            const { data: newMessage, error } = await supabase
              .from('chat_messages')
              .select(`
                id,
                message,
                created_at,
                user_id,
                is_global_message,
                deleted_at,
                profiles(
                  nickname, 
                  steam_username, 
                  avatar_url, 
                  level,
                  steam_id
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('[CHAT] Error fetching new message details:', error);
              return;
            }

            if (newMessage) {
              console.log('[CHAT] Adding new message to chat:', newMessage);
              setMessages(prev => [...prev, newMessage]);
            }
          } catch (error) {
            console.error('[CHAT] Error processing new message:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          console.log('[CHAT] Message updated via real-time:', payload);
          
          // Handle message deletions (soft delete)
          if (payload.new.deleted_at) {
            console.log('[CHAT] Message deleted, removing from UI:', payload.new.id);
            setMessages(prev => prev.filter(msg => msg.id !== payload.new.id));
          }
        }
      )
      .subscribe((status, error) => {
        console.log('[CHAT] Messages subscription status:', status);
        
        if (error) {
          console.error('[CHAT] Messages subscription error:', error);
          // Attempt to reconnect after a delay
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[CHAT] Attempting to reconnect messages subscription...');
            setupRealtimeSubscription();
          }, 5000);
        }
        
        if (status === 'SUBSCRIBED') {
          console.log('[CHAT] Successfully subscribed to chat messages updates');
          // Clear any pending reconnection attempts
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        }
      });
  };

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    if (isOpen) {
      console.log('[CHAT] useEffect: fetchMessages called due to isOpen change');
      fetchMessages();
      setupRealtimeSubscription();
      pollInterval = setInterval(() => {
        fetchMessages();
      }, 2000);
    }
    return () => {
      if (channelRef.current) {
        console.log('[CHAT] Cleaning up chat messages subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isOpen]);

  const sendMessage = async (message: string, isGlobalMessage: boolean = false) => {
    if (!user || !message.trim()) return false;

    try {
      console.log('[CHAT] Sending message:', message, 'isGlobal:', isGlobalMessage);
      
      const { data, error } = await supabase.rpc('send_chat_message', {
        p_message: message.trim(),
        p_is_global: isGlobalMessage
      });

      if (error) {
        console.error('[CHAT] Error sending message:', error);
        return false;
      }

      // Type assertion for the RPC response
      const response = data as { success?: boolean; error?: string };
      
      if (!response?.success) {
        console.error('[CHAT] Failed to send message:', response?.error);
        return false;
      }

      console.log('[CHAT] Message sent successfully');
      // Fetch messages immediately after sending
      fetchMessages();
      return true;
    } catch (error) {
      console.error('[CHAT] Error in sendMessage:', error);
      return false;
    }
  };

  const clearAllMessages = async () => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('clear_all_chat_messages', {
        p_admin_id: user.id
      });

      if (error) {
        console.error('[CHAT] Error clearing messages:', error);
        return false;
      }

      // Clear local messages immediately for real-time effect
      setMessages([]);
      console.log('[CHAT] Messages cleared locally for immediate effect');
      return true;
    } catch (error) {
      console.error('[CHAT] Error in clearAllMessages:', error);
      return false;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    clearAllMessages,
    refetch: fetchMessages,
  };
};
