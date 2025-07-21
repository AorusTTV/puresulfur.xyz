
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Trophy, Star, Crown, Shield, Gem, Zap, Target, Award, Medal, Flame, Trash2, Copy } from 'lucide-react';
import { getLevelColorInfo } from '@/utils/levelColorUtils';
import { AdminMessage } from './AdminMessage';
import { SocialAccountIcons } from './SocialAccountIcons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { DeleteMessageResponse } from '@/types/rpcResponses';

const DEFAULT_AVATAR_URL = '/lovable-uploads/17b8992d-84fb-420d-b1e3-83c8a25555fa.png';

interface ChatMessageProps {
  messageId: string;
  message: string;
  username: string;
  nickname?: string;
  avatarUrl?: string;
  level: number;
  timestamp: string;
  isOwnMessage: boolean;
  userId: string;
  isGlobalMessage?: boolean;
  isDeleted?: boolean;
  steamId?: string;
  socialAccounts?: Array<{ platform: string }>;
  onPlayerClick?: (playerData: {
    id: string;
    username: string;
    nickname?: string;
    avatarUrl?: string;
    level: number;
  }) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  messageId,
  message,
  username,
  nickname,
  avatarUrl,
  level,
  timestamp,
  isOwnMessage,
  userId,
  isGlobalMessage = false,
  isDeleted = false,
  steamId,
  socialAccounts = [],
  onPlayerClick
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState(false);
  
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  
  // Prioritize nickname over username, fallback to 'Player' if both are missing
  const displayName = nickname || username || 'Player';
  const colorInfo = getLevelColorInfo(level || 1);
  
  // Check if user is admin
  const isAdmin = profile?.nickname === 'admin';

  // If it's a global message, render the admin message component
  if (isGlobalMessage) {
    return (
      <AdminMessage
        message={message}
        username={username}
        nickname={nickname}
        avatarUrl={avatarUrl}
        timestamp={timestamp}
      />
    );
  }

  // Use Steam avatar for Steam users, default crystal for non-Steam users
  const chatAvatarUrl = steamId ? avatarUrl : DEFAULT_AVATAR_URL;

  const getLevelIcon = (level: number) => {
    // Trophy icon appears at level 50 and stays forever
    if (level >= 50) return <Trophy className={`h-4 w-4 ${colorInfo.iconColor}`} />;
    
    // No icon for levels 0-4
    if (level < 5) return null;
    
    // Calculate which icon to show based on level ranges (every 5 levels)
    const iconIndex = Math.floor(level / 5) % 10;
    
    const iconProps = `h-4 w-4 ${colorInfo.iconColor}`;
    
    switch (iconIndex) {
      case 1: return <Crown className={iconProps} />; // Levels 5-9
      case 2: return <Shield className={iconProps} />; // Levels 10-14
      case 3: return <Gem className={iconProps} />; // Levels 15-19
      case 4: return <Zap className={iconProps} />; // Levels 20-24
      case 5: return <Target className={iconProps} />; // Levels 25-29
      case 6: return <Award className={iconProps} />; // Levels 30-34
      case 7: return <Medal className={iconProps} />; // Levels 35-39
      case 8: return <Flame className={iconProps} />; // Levels 40-44
      case 9: return <Star className={iconProps} />; // Levels 45-49
      default: return null;
    }
  };

  const handlePlayerClick = () => {
    if (onPlayerClick) {
      onPlayerClick({
        id: userId,
        username: username || 'Player',
        nickname,
        avatarUrl: chatAvatarUrl,
        level: level || 1
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (!isAdmin || isDeleting) return;
    
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.rpc('delete_chat_message', {
        p_message_id: messageId,
        p_deleted_by: profile?.id
      });

      if (error) throw error;

      const response = data as unknown as DeleteMessageResponse;
      
      if (response?.success) {
        toast({
          title: "Message Deleted",
          description: "The message has been deleted successfully",
          variant: "default",
        });
      } else {
        throw new Error(response?.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error('[CHAT] Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const copyUserIdToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopiedUserId(true);
      toast({
        title: "Copied!",
        description: "User ID copied to clipboard",
        variant: "default",
      });
      setTimeout(() => setCopiedUserId(false), 2000);
    } catch (error) {
      console.error('[CHAT] Failed to copy user ID:', error);
      toast({
        title: "Error",
        description: "Failed to copy user ID",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="flex items-start space-x-2 py-1.5 px-2 hover:bg-secondary/50 rounded transition-colors group">
      <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5 ring-2 ring-primary/30">
        <AvatarImage 
          src={chatAvatarUrl || ''} 
          alt={displayName}
          onError={(e) => {
            console.log('[CHAT-MESSAGE] Avatar failed to load:', chatAvatarUrl);
          }}
          onLoad={() => {
            console.log('[CHAT-MESSAGE] Avatar loaded successfully:', chatAvatarUrl);
          }}
        />
        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center space-x-2 mb-0.5">
          <span 
            className={`text-base font-bold truncate ${colorInfo.nameColor} cursor-pointer hover:underline`}
            onClick={handlePlayerClick}
          >
            {displayName}
          </span>
          <SocialAccountIcons socialAccounts={socialAccounts} />
          {getLevelIcon(level) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center cursor-help">
                    {getLevelIcon(level)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Level {level}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isAdmin && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyUserIdToClipboard}
                      className="h-5 w-5 p-0 hover:bg-primary/20"
                    >
                      <Copy className={`h-3 w-3 ${copiedUserId ? 'text-green-400' : 'text-muted-foreground'}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy User ID</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDeleteMessage}
                      disabled={isDeleting || isDeleted}
                      className="h-5 w-5 p-0 hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        
        <div className="text-sm text-foreground leading-relaxed break-words text-left">
          {isDeleted ? (
            <span className="text-muted-foreground/70 font-mono text-xs font-light italic tracking-wide opacity-60">
              [message removed]
            </span>
          ) : (
            message
          )}
        </div>
      </div>
    </div>
  );
};
