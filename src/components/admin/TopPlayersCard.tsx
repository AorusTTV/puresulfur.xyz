
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Crown } from 'lucide-react';

interface TopPlayer {
  id: string;
  player_name: string;
  total_wagered: number;
  avatar_url?: string;
  level: number;
}

interface TopPlayersCardProps {
  players: TopPlayer[];
  loading: boolean;
}

export const TopPlayersCard: React.FC<TopPlayersCardProps> = ({ players, loading }) => {
  if (loading) {
    return (
      <Card className="bg-background/80 border-primary/30">
        <CardHeader className="border-b border-primary/20 pb-3">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold">Top Players by Total Wagered</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-background/50 border border-primary/20 animate-pulse">
                <div className="h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/80 border-primary/30">
      <CardHeader className="border-b border-primary/20 pb-3">
        <CardTitle className="text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold">Top Players by Total Wagered</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {players.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No player data available yet</p>
            </div>
          ) : (
            players.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-primary/20 hover:bg-background/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    {index === 0 && (
                      <Crown className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {player.avatar_url && (
                      <img 
                        src={player.avatar_url} 
                        alt={player.player_name}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <div>
                      <span className="text-foreground font-semibold">{player.player_name}</span>
                      <span className="text-muted-foreground text-xs ml-2">Level {player.level}</span>
                    </div>
                  </div>
                </div>
                <span className="text-primary font-bold text-lg">${player.total_wagered.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
