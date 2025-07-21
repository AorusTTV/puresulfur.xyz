
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

const DEFAULT_AVATAR_URL = '/lovable-uploads/17b8992d-84fb-420d-b1e3-83c8a25555fa.png';

interface Player {
  id: string;
  avatar_url: string | null;
  nickname: string | null;
  steam_username: string | null;
  steam_id: string | null;
}

interface PlayerListProps {
  totalBets: number;
  playerCount: number;
  currentGameId?: string;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  totalBets,
  playerCount,
  currentGameId
}) => {
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['wheel-players', currentGameId],
    queryFn: async () => {
      if (!currentGameId) return [];
      
      console.log('Fetching players for game:', currentGameId);
      
      // Get all unique players who have placed bets in the current game
      const { data: bets, error } = await supabase
        .from('wheel_bets')
        .select(`
          user_id,
          profiles!inner(
            id,
            avatar_url,
            nickname,
            steam_username,
            steam_id
          )
        `)
        .eq('game_id', currentGameId);
      
      if (error) {
        console.error('Error fetching players:', error);
        return [];
      }
      
      // Get unique players
      const uniquePlayers = bets?.reduce((acc: Player[], bet) => {
        const profile = bet.profiles as any;
        if (profile && !acc.find(p => p.id === profile.id)) {
          acc.push({
            id: profile.id,
            avatar_url: profile.avatar_url,
            nickname: profile.nickname,
            steam_username: profile.steam_username,
            steam_id: profile.steam_id
          });
        }
        return acc;
      }, []) || [];
      
      console.log('Unique players:', uniquePlayers);
      return uniquePlayers;
    },
    enabled: !!currentGameId,
    refetchInterval: 5000 // Refetch every 5 seconds to get new players
  });

  const displayName = (player: Player) => {
    return player.nickname || player.steam_username || 'Anonymous';
  };

  const getPlayerAvatar = (player: Player) => {
    // Use Steam avatar for Steam users, default crystal for non-Steam users
    return player.steam_id ? player.avatar_url : DEFAULT_AVATAR_URL;
  };

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-foreground font-bold">{playerCount} PLAYERS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-foreground font-bold">{totalBets.toFixed(2)}</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-muted-foreground text-sm">Loading players...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {players.map((player) => (
              <div key={player.id} className="flex flex-col items-center gap-1">
                <Avatar className="w-10 h-10 border-2 border-border">
                  <AvatarImage src={getPlayerAvatar(player) || undefined} alt={displayName(player)} />
                  <AvatarFallback className="bg-secondary text-foreground text-xs">
                    {displayName(player).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground max-w-[60px] truncate">
                  {displayName(player)}
                </span>
              </div>
            ))}
            {playerCount > players.length && (
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 bg-secondary border-2 border-border rounded-full flex items-center justify-center">
                  <span className="text-foreground text-xs font-bold">
                    +{playerCount - players.length}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">more</span>
              </div>
            )}
          </div>
        )}
        
        {!isLoading && players.length === 0 && playerCount === 0 && (
          <div className="text-muted-foreground text-sm text-center py-4">
            No players yet. Be the first to place a bet!
          </div>
        )}
      </CardContent>
    </Card>
  );
};
