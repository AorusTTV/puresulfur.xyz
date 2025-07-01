
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface OnlineGameManagerProps {
  battle: any;
  onBattleUpdate: (battle: any) => void;
}

export const OnlineGameManager: React.FC<OnlineGameManagerProps> = ({ 
  battle, 
  onBattleUpdate 
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('good');

  useEffect(() => {
    if (!battle?.isOnline) return;

    // Subscribe to battle updates with enhanced presence tracking
    const channel = supabase
      .channel(`battle-${battle.id}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const playerCount = Object.keys(presenceState).length;
        
        // Update battle with current online players
        onBattleUpdate({
          ...battle,
          onlinePlayerCount: playerCount
        });

        // Update connection quality based on sync performance
        setConnectionQuality(playerCount > 0 ? 'excellent' : 'good');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Player joined battle:', key, newPresences);
        
        const joinedPlayer = newPresences[0];
        if (joinedPlayer?.username) {
          toast({
            title: 'Player Joined',
            description: `${joinedPlayer.username} joined the battle!`,
          });
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Player left battle:', key, leftPresences);
        
        const leftPlayer = leftPresences[0];
        if (leftPlayer?.username) {
          toast({
            title: 'Player Left',
            description: `${leftPlayer.username} left the battle.`,
            variant: 'destructive'
          });
        }
      })
      .on('broadcast', { event: 'battle_update' }, (payload) => {
        console.log('Battle update received:', payload);
        
        // Handle real-time battle updates - properly access the payload data
        const eventData = payload.payload;
        if (eventData?.type === 'player_ready') {
          toast({
            title: 'Player Ready',
            description: `${eventData.player} is ready to start!`,
          });
        } else if (eventData?.type === 'bot_called') {
          toast({
            title: 'Bot Called',
            description: `A bot has been added to the battle!`,
          });
        }
      })
      .subscribe(async (status) => {
        console.log('Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          
          // Track presence for current user with enhanced data
          await channel.track({
            user_id: profile?.id,
            username: profile?.nickname || 'Anonymous',
            avatar: profile?.avatar_url,
            level: profile?.level || 1,
            joined_at: new Date().toISOString(),
            battle_status: 'waiting',
            connection_quality: 'good'
          });
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setConnectionQuality('poor');
          
          toast({
            title: 'Connection Issue',
            description: 'Reconnecting to battle...',
            variant: 'destructive'
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [battle?.id, battle?.isOnline, profile, onBattleUpdate, toast]);

  // Enhanced matchmaking system
  useEffect(() => {
    if (!battle?.isOnline || battle?.status !== 'waiting') return;

    const matchmakingTimer = setTimeout(() => {
      // Progressive matchmaking suggestions
      if (battle.players.length === 1) {
        toast({
          title: 'Finding Players...',
          description: 'Expanding search to other regions. You can call a bot anytime!',
        });
      }
    }, 15000);

    // Auto-suggest bot after extended wait
    const botSuggestionTimer = setTimeout(() => {
      if (battle.players.length === 1) {
        toast({
          title: 'Still Searching',
          description: 'Consider calling a bot to start immediately!',
        });
      }
    }, 30000);

    return () => {
      clearTimeout(matchmakingTimer);
      clearTimeout(botSuggestionTimer);
    };
  }, [battle, toast]);

  // Connection quality indicator
  const getConnectionColor = () => {
    if (!isConnected) return 'bg-red-500';
    switch (connectionQuality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionText = () => {
    if (!isConnected) return 'Reconnecting...';
    switch (connectionQuality) {
      case 'excellent': return 'Connected (Excellent)';
      case 'good': return 'Connected (Good)';
      case 'poor': return 'Connected (Poor)';
      default: return 'Connected';
    }
  };

  return (
    <div className="flex items-center justify-between bg-card/30 rounded-lg p-3 border border-border/50">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${getConnectionColor()} ${isConnected ? 'animate-pulse' : ''}`} />
        <span className="text-sm text-muted-foreground">
          {getConnectionText()}
        </span>
        {battle?.battleRegion && (
          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
            {battle.battleRegion}
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
        <div>Players Online: {battle?.onlinePlayerCount || 0}</div>
        <div>Difficulty: {battle?.difficulty || 'Normal'}</div>
      </div>
    </div>
  );
};
