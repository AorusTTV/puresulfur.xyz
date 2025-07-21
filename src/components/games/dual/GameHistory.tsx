import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Target, DollarSign, Clock } from 'lucide-react';
import { DualService } from '@/services/dualService';
import type { DualGame as DualGameType } from '@/types/dual';

export const GameHistory: React.FC = () => {
  const [history, setHistory] = useState<DualGameType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await DualService.getGameHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading game history:', error);
    }
    setLoading(false);
  };

  const getPlayerName = (player: any) => {
    return player?.nickname || player?.steam_username || 'Anonymous';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Games Yet</h3>
        <p className="text-muted-foreground">Battle history will appear here once games are completed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Battles
          </CardTitle>
        </CardHeader>
      </Card>

      {history.map((game) => {
        const creator = game.creator as any;
        const joiner = game.joiner as any;
        const winner = game.winner as any;
        const creatorWeapon = game.battle_result?.creator_weapon;
        const joinerWeapon = game.battle_result?.joiner_weapon;

        return (
          <Card key={game.id} className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Creator */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={creator?.avatar_url} />
                      <AvatarFallback>
                        {getPlayerName(creator).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {getPlayerName(creator)}
                        </p>
                        {game.winner_id === game.creator_id && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-3 w-3" />
                        <span>{creatorWeapon?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  {/* VS */}
                  <div className="px-4">
                    <div className="text-2xl font-bold text-muted-foreground">VS</div>
                  </div>

                  {/* Joiner */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={joiner?.avatar_url} />
                      <AvatarFallback>
                        {joiner ? getPlayerName(joiner).charAt(0).toUpperCase() : 'H'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {joiner ? getPlayerName(joiner) : 'House'}
                        </p>
                        {game.winner_id === game.joiner_id && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                        {!game.winner_id && !joiner && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-3 w-3" />
                        <span>{joinerWeapon?.name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Info */}
                <div className="text-right space-y-2">
                  <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                    <DollarSign className="h-4 w-4" />
                    {game.total_value.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(game.completed_at || game.created_at)}
                  </div>
                  <Badge variant={game.winner_id ? 'default' : 'secondary'}>
                    {game.winner_id ? 'Player Won' : 'House Won'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};