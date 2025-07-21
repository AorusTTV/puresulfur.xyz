import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Target, DollarSign, Users, Bot, Loader2 } from 'lucide-react';
import type { DualGame as DualGameType, DualWeapon } from '@/types/dual';

interface GamesListProps {
  games: DualGameType[];
  weapons: DualWeapon[];
  onJoinGame: (gameId: string, side: string, entryType: string, itemId?: string, isBot?: boolean) => void;
  onPlayAgainstBot: (gameId: string) => void;
  loading: boolean;
}

export const GamesList: React.FC<GamesListProps> = ({
  games,
  weapons,
  onJoinGame,
  onPlayAgainstBot,
  loading
}) => {
  const { user, profile } = useAuth();
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);

  const handleJoinGame = async (gameId: string, isBot: boolean = false, game?: DualGameType) => {
    if (!game) return;
    
    // Determine the opposite side from the creator
    const oppositeSide = game.creator_side === 'left' ? 'right' : 'left';
    
    setJoiningGameId(gameId);
    try {
      await onJoinGame(gameId, oppositeSide, 'balance', undefined, isBot);
    } finally {
      setJoiningGameId(null);
    }
  };

  const getPlayerName = (player: any) => {
    return player?.nickname || player?.steam_username || 'Anonymous';
  };

  if (games.length === 0) {
    return (
      <div className="text-center py-16">
        <img 
          src="/lovable-uploads/cf3fd8cd-7299-4f99-84de-f85640d51847.png" 
          alt="No Active Games" 
          className="h-16 w-16 mx-auto opacity-50 mb-4" 
        />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Active Games</h3>
        <p className="text-muted-foreground">Be the first to create a dual game!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Games List */}
      <div className="grid gap-4">
        {games.map((game) => {
          const creator = game.creator as any;
          const isOwnGame = user?.id === game.creator_id;
          const canAfford = profile && profile.balance >= game.creator_bet_amount;

          return (
            <Card key={game.id} className="bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Creator Info */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={creator?.avatar_url} />
                        <AvatarFallback>
                          {getPlayerName(creator).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">
                          {getPlayerName(creator)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Target className="h-3 w-3" />
                          <span>Side: {game.creator_side}</span>
                        </div>
                      </div>
                    </div>

                    {/* VS */}
                    <div className="px-4">
                      <div className="text-2xl font-bold text-muted-foreground">VS</div>
                    </div>

                    {/* Waiting Slot */}
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                        <Users className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground">Waiting...</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Target className="h-3 w-3" />
                          <span>Side: {game.creator_side === 'left' ? 'right' : 'left'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Game Info & Actions */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                        <DollarSign className="h-4 w-4" />
                        {game.creator_bet_amount.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">Each Side</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {isOwnGame ? (
                        <div className="flex flex-col gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Your Game
                          </Badge>
                          <Button
                            onClick={() => onPlayAgainstBot(game.id)}
                            disabled={loading || joiningGameId === game.id}
                            size="sm"
                            className="bg-gradient-to-r from-destructive to-orange-600 hover:from-destructive/90 hover:to-orange-600/90"
                          >
                            <Bot className="h-3 w-3 mr-1" />
                            Call Bot
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleJoinGame(game.id, false, game)}
                          disabled={
                            !canAfford ||
                            loading ||
                            joiningGameId === game.id
                          }
                          className="min-w-24"
                        >
                          {joiningGameId === game.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Join'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {!canAfford && !isOwnGame && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">
                      Insufficient balance. You need ${game.creator_bet_amount.toFixed(2)} to join this game.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};