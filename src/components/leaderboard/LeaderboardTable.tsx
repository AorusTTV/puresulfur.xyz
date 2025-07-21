
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
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

const DEFAULT_AVATAR_URL = '/lovable-uploads/17b8992d-84fb-420d-b1e3-83c8a25555fa.png';

interface LeaderboardEntry {
  id: string;
  player_name: string;
  avatar_url: string | null;
  steam_id: string | null;
  total_wagered: number;
  level: number | null;
  rank: number;
}

export const LeaderboardTable: React.FC = () => {
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      console.log('[LEADERBOARD] Fetching leaderboard data...');
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('id, player_name, avatar_url, steam_id, total_wagered, level, rank')
        .order('total_wagered', { ascending: false });
      
      if (error) {
        console.error('[LEADERBOARD] Error fetching leaderboard:', error);
        throw error;
      }
      
      console.log('[LEADERBOARD] Raw leaderboard data:', data);
      
      // Debug avatar URLs
      const avatarDebug = data?.map(player => ({
        id: player.id,
        player_name: player.player_name,
        avatar_url: player.avatar_url,
        steam_id: player.steam_id,
        has_avatar: !!player.avatar_url
      }));
      console.log('[LEADERBOARD] Avatar debug info:', avatarDebug);
      
      return data as LeaderboardEntry[];
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

  const getPrize = (rank: number) => {
    switch (rank) {
      case 1:
        return { amount: 1000, color: 'bg-gradient-to-r from-primary to-accent' };
      case 2:
        return { amount: 500, color: 'bg-gradient-to-r from-accent to-primary/80' };
      case 3:
        return { amount: 250, color: 'bg-gradient-to-r from-primary/80 to-accent/80' };
      default:
        return { amount: 50, color: 'bg-gradient-to-r from-primary/60 to-accent/60' };
    }
  };

  // Helper function to get avatar URL based on user type
  const getPlayerAvatar = (player: LeaderboardEntry) => {
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

  // Calculate total wagered across all users
  const totalWageredAllUsers = leaderboard?.reduce((sum, player) => sum + (player.total_wagered || 0), 0) || 0;

  if (isLoading) {
    return (
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center text-slate-400">Loading leaderboard...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('[LEADERBOARD] Leaderboard error:', error);
    return (
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center text-red-400">Failed to load leaderboard</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Wagered Stats */}
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            COMMUNITY STATS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent flex items-center justify-center gap-2">
                <img 
                  src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                  alt="Currency" 
                  className="h-6 w-6" 
                />
                {totalWageredAllUsers.toFixed(2)}
              </div>
              <div className="text-slate-400 text-sm">Total Wagered by All Players</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {leaderboard?.length || 0}
              </div>
              <div className="text-slate-400 text-sm">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent flex items-center justify-center gap-2">
                <img 
                  src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                  alt="Currency" 
                  className="h-6 w-6" 
                />
                {leaderboard && leaderboard.length > 0 ? (leaderboard[0].total_wagered || 0).toFixed(2) : '0.00'}
              </div>
              <div className="text-slate-400 text-sm">Top Player Wagered</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary text-xl font-bold">
            🏆 TOP PLAYERS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Rank</TableHead>
                <TableHead className="text-slate-300">Player</TableHead>
                <TableHead className="text-slate-300">Level</TableHead>
                <TableHead className="text-slate-300">Total Wagered</TableHead>
                <TableHead className="text-slate-300">Prize</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard?.map((player) => {
                const prize = getPrize(player.rank);
                const avatarUrl = getPlayerAvatar(player);
                const playerInitials = getPlayerInitials(player.player_name || 'Unknown Player');
                
                
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
                            src={avatarUrl} 
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
                    <TableCell>
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
                    <TableCell>
                      <Badge className={`${prize.color} text-white border-0`}>
                        <img 
                          src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                          alt="Currency" 
                          className="h-3 w-3 mr-1" 
                        />
                        {prize.amount}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!leaderboard || leaderboard.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                    No players found. Start wagering to appear on the leaderboard!
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
