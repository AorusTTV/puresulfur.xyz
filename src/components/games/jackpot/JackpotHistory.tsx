
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface JackpotHistoryGame {
  id: string;
  total_value: number;
  winner_id: string | null;
  house_fee: number | null;
  winner_prize: number | null;
  completed_at: string | null;
  created_at: string;
  winner_profile?: {
    steam_username: string;
    avatar_url: string;
  } | null;
}

export const JackpotHistory = () => {
  const [historyGames, setHistoryGames] = useState<JackpotHistoryGame[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      // First get completed games
      const { data: games, error: gamesError } = await supabase
        .from('jackpot_games')
        .select('*')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);

      if (gamesError) {
        console.error('Error fetching jackpot history:', gamesError);
        return;
      }

      // Then get winner profiles separately
      const gamesWithProfiles = await Promise.all(
        (games || []).map(async (game) => {
          if (game.winner_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('steam_username, avatar_url')
              .eq('id', game.winner_id)
              .single();

            return {
              ...game,
              winner_profile: profile
            };
          }
          return game;
        })
      );

      setHistoryGames(gamesWithProfiles);
    } catch (error) {
      console.error('Unexpected error fetching jackpot history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <Card className="bg-slate-800/60 border-slate-700/50">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-slate-400 mt-2">Loading history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/60 border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Recent Winners
        </CardTitle>
      </CardHeader>
      <CardContent>
        {historyGames.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">No completed games yet</p>
            <p className="text-slate-500 text-sm">
              Be the first to win a jackpot!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyGames.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30"
              >
                <div className="flex items-center gap-3">
                  {game.winner_profile?.avatar_url ? (
                    <img
                      src={game.winner_profile.avatar_url}
                      alt={game.winner_profile.steam_username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {game.winner_profile?.steam_username || 'Unknown Player'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {game.completed_at 
                        ? new Date(game.completed_at).toLocaleDateString()
                        : new Date(game.created_at).toLocaleDateString()
                      }
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">
                    ${(game.winner_prize || game.total_value).toFixed(2)}
                  </div>
                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                    Pot: ${game.total_value.toFixed(2)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
