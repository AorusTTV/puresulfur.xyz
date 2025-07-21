
import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage } from './ChatMessage';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { PlayerProfileModal } from './PlayerProfileModal';
import { useChatMessages } from './useChatMessages';
import { useSocialAccountIcons } from '@/hooks/useSocialAccountIcons';
import { supabase } from '@/integrations/supabase/client';
import { Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { useMuteStatus } from '@/hooks/useMuteStatus';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    id: string;
    username: string;
    nickname?: string;
    avatarUrl?: string;
    level: number;
  } | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  
  const {
    messages,
    loading,
    sendMessage,
    clearAllMessages
  } = useChatMessages(isOpen);

  // Get unique user IDs from messages for social account lookup
  const userIds = [...new Set(messages.map(msg => msg.user_id))];
  const { socialAccounts } = useSocialAccountIcons(userIds);

  // Improved auto-scroll to last message
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Track online users with presence
  useEffect(() => {
    if (!isOpen) return;

    console.log('Setting up presence tracking');
    const channel = supabase.channel('chat_online_users');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        console.log('Online users synced:', count);
        setOnlineCount(count);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        console.log('Presence subscription status:', status);
        if (status === 'SUBSCRIBED' && user) {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      console.log('Cleaning up presence tracking');
      supabase.removeChannel(channel);
    };
  }, [isOpen, user]);

  // Debug: Test Realtime subscription for all chat_messages events
  useEffect(() => {
    const channel = supabase.channel('test_chat_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, payload => {
        console.log('Realtime payload:', payload);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async (message: string, isGlobalMessage?: boolean) => {
    console.log('Sending message:', message, 'isGlobal:', isGlobalMessage);
    return await sendMessage(message, isGlobalMessage || false);
  };

  const handlePlayerClick = (playerData: {
    id: string;
    username: string;
    nickname?: string;
    avatarUrl?: string;
    level: number;
  }) => {
    setSelectedPlayer(playerData);
    setIsPlayerModalOpen(true);
  };

  const handleClosePlayerModal = () => {
    setIsPlayerModalOpen(false);
    setSelectedPlayer(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed left-0 bottom-0 z-40 max-h-[calc(100vh-80px)]"
      style={{ top: '80px', width: 380 }}
    >
      <div className="h-full">
        <Card className="h-full bg-card border-border flex flex-col shadow-2xl border-t-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Chat</span>
              <span className="text-xs text-muted-foreground">({onlineCount} online)</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {/* Chat window on the right */}
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0 px-3 overflow-y-auto">
              <div className="space-y-1 py-2">
                {loading && messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    Loading messages...
                  </div>
                ) : (
                  messages.map((message, idx) => (
                    <div
                      key={message.id}
                      ref={idx === messages.length - 1 ? lastMessageRef : undefined}
                    >
                      <ChatMessage
                        messageId={message.id}
                        message={message.message}
                        username={
                          message.profiles?.steam_username
                            || `player_${message.user_id.slice(0, 6)}`
                        }
                        nickname={message.profiles?.nickname}
                        avatarUrl={message.profiles?.avatar_url}
                        level={message.profiles?.level || 1}
                        timestamp={message.created_at}
                        isOwnMessage={message.user_id === user?.id}
                        userId={message.user_id}
                        isGlobalMessage={message.is_global_message || false}
                        isDeleted={!!message.deleted_at}
                        steamId={message.profiles?.steam_id}
                        socialAccounts={socialAccounts[message.user_id] || []}
                        onPlayerClick={handlePlayerClick}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            {/* Online players count */}
            <div className="px-3 py-2 border-t border-border bg-secondary/30 flex-shrink-0">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-primary">{onlineCount} online</span>
              </div>
            </div>
            {/* Chat input area */}
            <div className="border-t border-border flex-shrink-0">
              {user ? (
                <ChatInput
                  onSendMessage={handleSendMessage}
                  disabled={loading}
                />
              ) : (
                <div className="p-3 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Join the conversation! Log in to start chatting.
                  </p>
                  <LoginDialog>
                    <Button className="w-full" variant="default">
                      Login to Chat
                    </Button>
                  </LoginDialog>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <PlayerProfileModal
        isOpen={isPlayerModalOpen}
        onClose={handleClosePlayerModal}
        playerData={selectedPlayer}
      />
    </div>
  );
};
