
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getLevelColorInfo } from '@/utils/levelColorUtils';
import { TipDialog } from './TipDialog';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerData: {
    id: string;
    username: string;
    nickname?: string;
    avatarUrl?: string;
    level: number;
  } | null;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  playerData
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [copiedUserId, setCopiedUserId] = useState(false);

  // Check if user is admin
  const isAdmin = profile?.nickname === 'admin';
  const canTip = user && playerData && user.id !== playerData.id;

  if (!playerData) return null;

  const displayName = playerData.nickname || playerData.username;
  const colorInfo = getLevelColorInfo(playerData.level);

  const copyUserIdToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(playerData.id);
      setCopiedUserId(true);
      toast({
        title: "Copied!",
        description: "User ID copied to clipboard",
        variant: "default",
      });
      setTimeout(() => setCopiedUserId(false), 2000);
    } catch (error) {
      console.error('Failed to copy user ID:', error);
      toast({
        title: "Error",
        description: "Failed to copy user ID",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/30">
              <AvatarImage src={playerData.avatarUrl || ''} alt={displayName} />
              <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className={`text-lg font-bold ${colorInfo.nameColor}`}>
                {displayName}
              </span>
              <Badge variant="secondary" className="w-fit">
                Level {playerData.level}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Username:</span>
              <p className="font-medium">{playerData.username}</p>
            </div>
            {playerData.nickname && (
              <div>
                <span className="text-muted-foreground">Nickname:</span>
                <p className="font-medium">{playerData.nickname}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Level:</span>
              <p className={`font-medium ${colorInfo.nameColor}`}>
                {playerData.level}
              </p>
            </div>
          </div>

          {/* Tip Button */}
          {canTip && (
            <div className="border-t pt-4">
              <TipDialog playerData={playerData}>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Send Tip
                </Button>
              </TipDialog>
            </div>
          )}

          {isAdmin && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground text-sm">User ID:</span>
                  <p className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                    {playerData.id}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyUserIdToClipboard}
                  className="flex items-center space-x-2"
                >
                  {copiedUserId ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span>{copiedUserId ? 'Copied!' : 'Copy ID'}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
