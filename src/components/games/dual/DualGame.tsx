import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, Zap, Clock } from 'lucide-react';
import { SideSelector } from './SideSelector';
import { CreateGameForm } from './CreateGameForm';
import { GamesList } from './GamesList';
import { BattleAnimation } from './BattleAnimation';
import { GameHistory } from './GameHistory';
import { DualService } from '@/services/dualService';
import { useDualRealtimeSync } from '@/hooks/dual/useDualRealtimeSync';
import { useDualGameTracking } from '@/hooks/dual/useDualGameTracking';
import type { DualGame as DualGameType, DualWeapon } from '@/types/dual';
import { useToast } from '@/hooks/use-toast';

interface DualGameProps {
  onBackToGames: () => void;
}

export const DualGame: React.FC<DualGameProps> = ({ onBackToGames }) => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'games' | 'create' | 'battle' | 'history'>('games');
  const [activeGames, setActiveGames] = useState<DualGameType[]>([]);
  const [weapons, setWeapons] = useState<DualWeapon[]>([]);
  const [selectedSide, setSelectedSide] = useState<string>('right');
  const [battleResult, setBattleResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pendingBattle, setPendingBattle] = useState<any>(null);

  useEffect(() => {
    loadData();
    // Faster refresh for more responsive updates
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [gamesData, weaponsData] = await Promise.all([
        DualService.getActiveGames(),
        DualService.getWeapons()
      ]);
      setActiveGames(gamesData);
      setWeapons(weaponsData);
    } catch (error) {
      console.error('Error loading dual game data:', error);
    }
  };

  const handleCreateGame = async (betAmount: number, entryType: string, itemId?: string) => {
    setLoading(true);
    try {
      const result = await DualService.createGame(
        selectedSide,
        betAmount,
        entryType,
        itemId
      );

      if (result.success) {
        toast({
          title: "Game Created!",
          description: "Your dual game has been created and is waiting for an opponent",
        });
        setActiveView('games');
        loadData();
      } else {
        toast({
          title: "Failed to Create Game",
          description: result.error || "An error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create game. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleJoinGame = async (gameId: string, side: string, entryType: string, itemId?: string, isBot: boolean = false) => {
    setLoading(true);
    try {
      const result = await DualService.joinGame(gameId, side, entryType, itemId, isBot);
      
      if (result.success) {
        setBattleResult(result);
        setActiveView('battle');
        loadData();
      } else {
        toast({
          title: "Failed to Join Game",
          description: result.error || "An error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join game. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handlePlayAgainstBot = async (gameId: string) => {
    // Find the game
    const game = activeGames.find(g => g.id === gameId);
    if (!game) return;
    
    // Determine the opposite side from the creator
    const oppositeSide = game.creator_side === 'left' ? 'right' : 'left';
    
    await handleJoinGame(gameId, oppositeSide, 'balance', undefined, true);
  };

  const handleBattleComplete = () => {
    setActiveView('games');
    setBattleResult(null);
    loadData();
    // Refresh user profile to update balance in real-time
    refreshProfile();
  };

  // Handle real-time game completion
  const handleGameCompleted = (gameResult: any) => {
    setPendingBattle(null); // Clear pending state
    setBattleResult(gameResult);
    setActiveView('battle');
  };

  // Handle real-time battle start (pending state)
  const handleBattleStart = (pending: any) => {
    setPendingBattle(pending);
    setBattleResult(null);
    setActiveView('battle');
  };

  // Set up real-time sync for dual games
  useDualRealtimeSync(loadData, handleGameCompleted, user?.id, handleBattleStart);

  // Track user's games for better status
  const { getUserActiveGame, getUserCompletedGames } = useDualGameTracking(user?.id);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Please log in to play Dual.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted">
      {/* Header */}
      <div className="bg-card/60 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBackToGames}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Games
              </Button>
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/cf3fd8cd-7299-4f99-84de-f85640d51847.png" 
                  alt="Dual Game" 
                  className="h-8 w-8" 
                />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">DUAL</h1>
                  <p className="text-sm text-muted-foreground">Battle with weapons</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={activeView === 'games' ? 'default' : 'outline'}
                onClick={() => setActiveView('games')}
                size="sm"
                className="flex items-center gap-2"
              >
                Active Games
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeView === 'games' 
                    ? 'bg-primary-foreground text-primary' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {activeGames.length}
                </span>
              </Button>
              {getUserActiveGame() && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Your Game Active</span>
                </div>
              )}
              <Button
                variant={activeView === 'create' ? 'default' : 'outline'}
                onClick={() => setActiveView('create')}
                size="sm"
              >
                Create Game
              </Button>
              <Button
                variant={activeView === 'history' ? 'default' : 'outline'}
                onClick={() => setActiveView('history')}
                size="sm"
              >
                History
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        {activeView === 'battle' && (battleResult || pendingBattle) ? (
          <BattleAnimation
            battleResult={battleResult || pendingBattle}
            onComplete={handleBattleComplete}
            pending={!!pendingBattle && !battleResult}
          />
        ) : activeView === 'create' ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <SideSelector
              selectedSide={selectedSide}
              onSideSelect={setSelectedSide}
            />
            <CreateGameForm
              selectedSide={selectedSide}
              onCreateGame={handleCreateGame}
              loading={loading}
            />
          </div>
        ) : activeView === 'history' ? (
          <GameHistory />
        ) : (
          <div className="max-w-6xl mx-auto">
            <GamesList
              games={activeGames}
              weapons={weapons}
              onJoinGame={handleJoinGame}
              onPlayAgainstBot={handlePlayAgainstBot}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
};