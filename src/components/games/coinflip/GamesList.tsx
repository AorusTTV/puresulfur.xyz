
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RefreshCw, Users, Zap, Clock, Bot } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { CoinflipGame } from '@/types/coinflip';

interface GamesListProps {
  games: CoinflipGame[];
  loading: boolean;
  isJoining: boolean;
  currentUserId?: string;
  onJoinGame: (gameId: string, entryType: 'balance' | 'item', itemId?: string) => Promise<boolean>;
  onPlayAgainstBot: (gameId: string) => Promise<boolean>;
  onRefresh: () => void;
  gameSettings: any;
}

export const GamesList: React.FC<GamesListProps> = ({
  games,
  loading,
  isJoining,
  currentUserId,
  onJoinGame,
  onPlayAgainstBot,
  onRefresh,
  gameSettings
}) => {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Auto-refresh indicator with better timing
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 1000);
    }, 15000); // Every 15 seconds for more responsive updates

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const waitingGames = games.filter(game => game.status === 'waiting');
  const completedGames = games.filter(game => game.status === 'completed').slice(0, 5);

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const gameDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - gameDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold text-foreground">Live Games</h2>
          <div className="flex items-center space-x-2">
            {isRefreshing && (
              <RefreshCw className="h-4 w-4 text-primary animate-spin" />
            )}
            <Badge variant="secondary" className="text-xs">
              {waitingGames.length} Active
            </Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Enhanced Live status indicator */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-3">
        <div className="flex items-center justify-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 font-medium">Live Updates Active</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">Last updated: {formatTimeAgo(lastRefresh.toISOString())}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">Auto-refresh: 15s</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading games...</span>
          </div>
        </div>
      ) : waitingGames.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Active Games</h3>
            <p className="text-sm">Be the first to create a game and start the action!</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {waitingGames.map((game) => (
            <Card key={game.id} className="hover:shadow-lg transition-all duration-200 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${game.creator_id}`} />
                      <AvatarFallback>CF</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-sm">
                        {game.creator_side === 'heads' ? 'SULFUR' : 'SCRAP'} Game
                      </CardTitle>
                      <div className="text-xs text-muted-foreground">
                        Created {formatTimeAgo(game.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={game.creator_side === 'heads' ? 'default' : 'secondary'}>
                      {game.creator_side === 'heads' ? 'SULFUR' : 'SCRAP'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {game.creator_bet_amount} sulfur
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Waiting for opponent...</span>
                  </div>
                  <div className="flex space-x-2">
                    {user && game.creator_id !== user.id && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onJoinGame(game.id, 'balance')}
                          disabled={isJoining}
                          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                        >
                          Join Game
                        </Button>
                        
                      </>
                      
                    )}
                     {user && game.creator_id == user.id && (
                     <Button
                     size="sm"
                     variant="outline"
                     onClick={() => onPlayAgainstBot(game.id)}
                     disabled={isJoining}
                     className="flex items-center space-x-1"
                   >
                     <Bot className="h-3 w-3" />
                     <span>vs Bot</span>
                   </Button>
                    )}
                   
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent completed games */}
      {completedGames.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Results</span>
          </h3>
          <div className="grid gap-3">
            {completedGames.map((game) => (
              <Card key={game.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        game.winning_side === 'heads' ? 'bg-primary' : 'bg-destructive'
                      }`} />
                      <div>
                        <div className="text-sm font-medium">
                          {game.winning_side === 'heads' ? 'SULFUR' : 'SCRAP'} won
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeAgo(game.completed_at || '')}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {game.total_value} sulfur
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
