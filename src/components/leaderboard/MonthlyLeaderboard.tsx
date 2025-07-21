
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Calendar, Clock } from 'lucide-react';

const DEFAULT_AVATAR_URL = '/lovable-uploads/17b8992d-84fb-420d-b1e3-83c8a25555fa.png';

interface MonthlyLeaderboardEntry {
  id: string;
  player_name: string;
  avatar_url: string | null;
  steam_id: string | null;
  total_wagered: number;
  level: number | null;
  rank: number;
}

export const MonthlyLeaderboard: React.FC = () => {
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['monthly-leaderboard'],
    queryFn: async () => {
      console.log('[MONTHLY-LEADERBOARD] Fetching monthly leaderboard data...');
      const { data, error } = await supabase.rpc('get_current_month_leaderboard');
      
      if (error) {
        console.error('[MONTHLY-LEADERBOARD] Error fetching monthly leaderboard:', error);
        throw error;
      }
      
      console.log('[MONTHLY-LEADERBOARD] Raw monthly leaderboard data:', data);
      
      // Debug avatar URLs
      const avatarDebug = data?.map(player => ({
        id: player.id,
        player_name: player.player_name,
        avatar_url: player.avatar_url,
        steam_id: player.steam_id,
        has_avatar: !!player.avatar_url
      }));
      console.log('[MONTHLY-LEADERBOARD] Avatar debug info:', avatarDebug);
      
      return data as MonthlyLeaderboardEntry[];
    },
  });

  const { data: daysUntilReset } = useQuery({
    queryKey: ['days-until-reset'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_days_until_reset');
      if (error) throw error;
      return data as number;
    },
  });

  const { data: prizes } = useQuery({
    queryKey: ['leaderboard-prizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_prizes')
        .select('*')
        .order('rank');
      if (error) throw error;
      return data;
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-primary" />;
      case 2:
        return <Medal className="h-5 w-5 text-accent" />;
      case 3:
        return <Award className="h-5 w-5 text-primary/80" />;
      default:
        return <span className="text-slate-400 font-bold">#{rank}</span>;
    }
  };

  const getPrizeAmount = (rank: number) => {
    const prize = prizes?.find(p => p.rank === rank);
    return prize?.prize_amount || 0;
  };

  // Helper function to get avatar URL based on user type
  const getPlayerAvatar = (player: MonthlyLeaderboardEntry) => {
    // Return Steam avatar URL directly for Steam users, let Avatar component handle CORS proxy
    if (player.steam_id && player.avatar_url) {
      return player.avatar_url;
    }
    
    return DEFAULT_AVATAR_URL;
  };

  // Generate fallback initials from player name
  const getPlayerInitials = (playerName: string) => {
    if (!playerName) return '??';
    
    const words = playerName.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return playerName.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center text-slate-400">Loading monthly leaderboard...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('[MONTHLY-LEADERBOARD] Monthly leaderboard error:', error);
    return (
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center text-red-400">Failed to load monthly leaderboard</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timer and Info */}
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            MONTHLY LEADERBOARD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent flex items-center justify-center gap-2">
                <Clock className="h-6 w-6" />
                {daysUntilReset || 0} days
              </div>
              <div className="text-slate-400 text-sm">Until Monthly Reset</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                <img 
                  src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                  alt="Currency" 
                  className="h-6 w-6" 
                />
                {prizes?.reduce((sum, p) => sum + Number(p.prize_amount), 0)?.toFixed(2) || '0.00'}
              </div>
              <div className="text-slate-400 text-sm">Total Monthly Prizes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 10 Monthly Leaderboard */}
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary text-xl font-bold">
            🏆 TOP 10 MONTHLY PLAYERS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Rank</TableHead>
                <TableHead className="text-slate-300">Player</TableHead>
                <TableHead className="text-slate-300 text-center">Level</TableHead>
                <TableHead className="text-slate-300">Monthly Wagered</TableHead>
                <TableHead className="text-slate-300 text-center">Prize</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard?.slice(0, 10).map((player) => {
                const prizeAmount = getPrizeAmount(player.rank);
                const avatarUrl = getPlayerAvatar(player);
                console.log(avatarUrl)
                const playerInitials = getPlayerInitials(player.player_name || 'Unknown Player');
                console.log('Rendering avatar for player:', {
                  player_name: player.player_name,
                  steam_id: player.steam_id,
                  original_avatar_url: player.avatar_url,
                  computed_avatar_url: avatarUrl,
                  has_steam_id: !!player.steam_id
                });
                
                return (
                  <TableRow key={player.id} className="border-slate-700 hover:bg-slate-700/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {getRankIcon(player.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={ avatarUrl} 
                            alt={player.player_name || 'Unknown Player'}
                          />
                          <AvatarFallback className="bg-slate-700 text-slate-300">
                            {playerInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white font-medium">
                          {player.player_name || 'Unknown Player'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                        Level {player.level || 1}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-primary font-bold">
                        <img 
                          src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                          alt="Currency" 
                          className="h-4 w-4 mr-1" 
                        />
                        {player.total_wagered?.toFixed(2) || '0.00'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                        <img 
                          src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                          alt="Currency" 
                          className="h-3 w-3 mr-1" 
                        />
                        {prizeAmount.toFixed(2)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!leaderboard || leaderboard.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                    No players found. Start wagering to appear on the monthly leaderboard!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
