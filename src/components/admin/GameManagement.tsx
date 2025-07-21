import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Gamepad2, RefreshCw, Gift } from 'lucide-react';
import { GameSettings } from './GameSettings';

interface WheelGame {
  id: string;
  status: string;
  total_bets: number;
  created_at: string;
  game_round: string;
  winning_color?: string;
  winning_number?: number;
}

interface CoinflipGame {
  id: string;
  creator_id: string;
  status: string;
  total_value: number;
  created_at: string;
  winner_id?: string;
  winning_side?: string;
}

interface JackpotGame {
  id: string;
  status: string;
  total_value: number;
  created_at: string;
  winner_id?: string;
  winner_prize?: number;
}

interface CrateBattle {
  id: string;
  creator_id: string;
  status: string;
  total_value: number;
  player_count: number;
  created_at: string;
  winner_id?: string;
}

interface MinefieldGame {
  id: string;
  user_id: string;
  bet_amount: number;
  multiplier: number;
  status: string;
  created_at: string;
  completed_at?: string;
}

interface PlinkoGame {
  id: string;
  user_id: string;
  bet_amount: number;
  multiplier: number;
  win_amount: number;
  created_at: string;
}

export const GameManagement: React.FC = () => {
  const [wheelGames, setWheelGames] = useState<WheelGame[]>([]);
  const [coinflipGames, setCoinflipGames] = useState<CoinflipGame[]>([]);
  const [jackpotGames, setJackpotGames] = useState<JackpotGame[]>([]);
  const [crateBattles, setCrateBattles] = useState<CrateBattle[]>([]);
  const [minefieldGames, setMinefieldGames] = useState<MinefieldGame[]>([]);
  const [plinkoGames, setPlinkoGames] = useState<PlinkoGame[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      // Fetch wheel games
      const { data: wheelData, error: wheelError } = await supabase
        .from('wheel_games')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (wheelError) throw wheelError;
      setWheelGames(wheelData || []);

      // Fetch all other game types
      await fetchAllGames();
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: 'Error',
        description: 'Failed to load games',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllGames = async () => {
    try {
      // Fetch coinflip games
      const { data: coinflipData, error: coinflipError } = await supabase
        .from('coinflip_games')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (coinflipError) throw coinflipError;
      setCoinflipGames(coinflipData || []);

      // Fetch jackpot games
      const { data: jackpotData, error: jackpotError } = await supabase
        .from('jackpot_games')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (jackpotError) throw jackpotError;
      setJackpotGames(jackpotData || []);

      // Fetch crate battles
      const { data: crateData, error: crateError } = await supabase
        .from('crate_battles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (crateError) throw crateError;
      setCrateBattles(crateData || []);

      // Fetch minefield games from user_wagers (since there's no dedicated minefield table)
      const { data: minefieldData, error: minefieldError } = await supabase
        .from('user_wagers')
        .select('*')
        .eq('game_type', 'minefield')
        .order('created_at', { ascending: false })
        .limit(50);

      if (minefieldError) throw minefieldError;
      // Transform minefield data to match our interface
      const transformedMinefield = minefieldData?.map(wager => ({
        id: wager.id,
        user_id: wager.user_id,
        bet_amount: wager.amount,
        multiplier: 1, // Default since we don't have this data
        status: 'completed',
        created_at: wager.created_at,
      })) || [];
      setMinefieldGames(transformedMinefield);

      // Fetch plinko games from user_wagers (since there's no dedicated plinko table)
      const { data: plinkoData, error: plinkoError } = await supabase
        .from('user_wagers')
        .select('*')
        .eq('game_type', 'plinko')
        .order('created_at', { ascending: false })
        .limit(50);

      if (plinkoError) throw plinkoError;
      // Transform plinko data to match our interface
      const transformedPlinko = plinkoData?.map(wager => ({
        id: wager.id,
        user_id: wager.user_id,
        bet_amount: wager.amount,
        multiplier: 1, // Default since we don't have this data
        win_amount: wager.amount, // Default since we don't have this data
        created_at: wager.created_at,
      })) || [];
      setPlinkoGames(transformedPlinko);

    } catch (error) {
      console.error('Error fetching all games:', error);
    }
  };

  const resetDailyCase = async () => {
    if (!confirm('Are you sure you want to reset the daily case? This will allow all users to open it again today.')) {
      return;
    }

    try {
      localStorage.setItem('dailyCaseReset', Date.now().toString());
      
      toast({
        title: 'Success',
        description: 'Daily case has been reset. All users can now open it again today.',
      });
    } catch (error) {
      console.error('Error resetting daily case:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset daily case',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="text-foreground">Loading games...</div>;
  }

  const completedWheelGames = wheelGames.filter(g => g.status === 'completed');
  const totalGames = wheelGames.length + coinflipGames.length + jackpotGames.length + crateBattles.length + minefieldGames.length + plinkoGames.length;

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Game Management
          </div>
          <div className="flex gap-2">
            <Button
              onClick={resetDailyCase}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Gift className="h-4 w-4 mr-2" />
              Reset Daily Case
            </Button>
            <Button
              onClick={fetchGames}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Match History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="bg-purple-900/50 border-purple-700">
                <CardContent className="p-4">
                  <h3 className="text-purple-400 font-semibold mb-2">Total Games</h3>
                  <p className="text-2xl font-bold text-foreground">{totalGames}</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-900/50 border-blue-700">
                <CardContent className="p-4">
                  <h3 className="text-blue-400 font-semibold mb-2">Completed Wheels</h3>
                  <p className="text-2xl font-bold text-foreground">{completedWheelGames.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-900/50 border-green-700">
                <CardContent className="p-4">
                  <h3 className="text-green-400 font-semibold mb-2">Total Wheel Bets</h3>
                  <p className="text-2xl font-bold text-foreground">
                    ${completedWheelGames.reduce((sum, g) => sum + g.total_bets, 0).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Add the Game Settings component here */}
            <GameSettings />

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-muted-foreground">Game Type</TableHead>
                      <TableHead className="text-muted-foreground">Game ID</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Value</TableHead>
                      <TableHead className="text-muted-foreground">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...wheelGames.slice(0, 10)].map((game) => (
                      <TableRow key={`wheel-${game.id}`}>
                        <TableCell className="text-foreground font-medium">Sulfur Wheel</TableCell>
                        <TableCell className="text-foreground font-mono text-xs">{game.game_round}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            game.status === 'completed' ? 'bg-green-500 text-white' :
                            'bg-yellow-500 text-black'
                          }`}>
                            {game.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-green-400">${game.total_bets.toFixed(2)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(game.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card className="bg-blue-900/50 border-blue-700">
                <CardContent className="p-4">
                  <h3 className="text-blue-400 font-semibold mb-2">Sulfur Wheel</h3>
                  <p className="text-2xl font-bold text-foreground">{wheelGames.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-900/50 border-green-700">
                <CardContent className="p-4">
                  <h3 className="text-green-400 font-semibold mb-2">Coinflip</h3>
                  <p className="text-2xl font-bold text-foreground">{coinflipGames.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-yellow-900/50 border-yellow-700">
                <CardContent className="p-4">
                  <h3 className="text-yellow-400 font-semibold mb-2">Jackpot</h3>
                  <p className="text-2xl font-bold text-foreground">{jackpotGames.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-purple-900/50 border-purple-700">
                <CardContent className="p-4">
                  <h3 className="text-purple-400 font-semibold mb-2">Crate Battles</h3>
                  <p className="text-2xl font-bold text-foreground">{crateBattles.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-red-900/50 border-red-700">
                <CardContent className="p-4">
                  <h3 className="text-red-400 font-semibold mb-2">Minefield</h3>
                  <p className="text-2xl font-bold text-foreground">{minefieldGames.length}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="wheel" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="wheel">Sulfur Wheel</TabsTrigger>
                <TabsTrigger value="coinflip">Coinflip</TabsTrigger>
                <TabsTrigger value="jackpot">Jackpot</TabsTrigger>
                <TabsTrigger value="crate-battles">Crate Battles</TabsTrigger>
                <TabsTrigger value="minefield">Minefield</TabsTrigger>
                <TabsTrigger value="plinko">Plinko</TabsTrigger>
              </TabsList>

              <TabsContent value="wheel">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Game Round</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Bets</TableHead>
                        <TableHead>Winning Color</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wheelGames.map((game) => (
                        <TableRow key={game.id}>
                          <TableCell>{game.game_round}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              game.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}>
                              {game.status}
                            </span>
                          </TableCell>
                          <TableCell>${game.total_bets.toFixed(2)}</TableCell>
                          <TableCell>{game.winning_color || 'N/A'}</TableCell>
                          <TableCell>{new Date(game.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="coinflip">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Game ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Winning Side</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coinflipGames.map((game) => (
                        <TableRow key={game.id}>
                          <TableCell className="font-mono text-xs">{game.id.slice(0, 8)}...</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              game.status === 'completed' ? 'bg-green-500' : 
                              game.status === 'waiting' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}>
                              {game.status}
                            </span>
                          </TableCell>
                          <TableCell>${game.total_value.toFixed(2)}</TableCell>
                          <TableCell>{game.winning_side || 'N/A'}</TableCell>
                          <TableCell>{new Date(game.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="jackpot">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Game ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Winner Prize</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jackpotGames.map((game) => (
                        <TableRow key={game.id}>
                          <TableCell className="font-mono text-xs">{game.id.slice(0, 8)}...</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              game.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}>
                              {game.status}
                            </span>
                          </TableCell>
                          <TableCell>${game.total_value.toFixed(2)}</TableCell>
                          <TableCell>${(game.winner_prize || 0).toFixed(2)}</TableCell>
                          <TableCell>{new Date(game.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="crate-battles">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Battle ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Players</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {crateBattles.map((battle) => (
                        <TableRow key={battle.id}>
                          <TableCell className="font-mono text-xs">{battle.id.slice(0, 8)}...</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              battle.status === 'completed' ? 'bg-green-500' : 
                              battle.status === 'waiting' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}>
                              {battle.status}
                            </span>
                          </TableCell>
                          <TableCell>{battle.player_count}</TableCell>
                          <TableCell>${battle.total_value.toFixed(2)}</TableCell>
                          <TableCell>{new Date(battle.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="minefield">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Game ID</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Bet Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {minefieldGames.map((game) => (
                        <TableRow key={game.id}>
                          <TableCell className="font-mono text-xs">{game.id.slice(0, 8)}...</TableCell>
                          <TableCell className="font-mono text-xs">{game.user_id.slice(0, 8)}...</TableCell>
                          <TableCell>${game.bet_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500">
                              {game.status}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(game.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="plinko">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Game ID</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Bet Amount</TableHead>
                        <TableHead>Win Amount</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plinkoGames.map((game) => (
                        <TableRow key={game.id}>
                          <TableCell className="font-mono text-xs">{game.id.slice(0, 8)}...</TableCell>
                          <TableCell className="font-mono text-xs">{game.user_id.slice(0, 8)}...</TableCell>
                          <TableCell>${game.bet_amount.toFixed(2)}</TableCell>
                          <TableCell className="text-green-400">${game.win_amount.toFixed(2)}</TableCell>
                          <TableCell>{new Date(game.created_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
