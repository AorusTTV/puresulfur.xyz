
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Box, Clock, DollarSign } from 'lucide-react';
import { usePersistentBattles } from './usePersistentBattles';
import { profile } from 'console';

interface AvailableBattlesProps {
  onJoinBattle: (battle: any) => void;
  onCreateBattle: () => void;
}

export const AvailableBattles: React.FC<AvailableBattlesProps> = ({ 
  onJoinBattle, 
  onCreateBattle 
}) => {
  const { 
    availableBattles, 
    loading, 
    joinPersistentBattle, 
    addBotToSlot 
  } = usePersistentBattles();

  const handleJoinBattle = async (battle: any) => {
    const success = await joinPersistentBattle(battle.id);
    if (success) {
      // Convert persistent battle to the format expected by the game logic
      const gameBattle = {
        id: battle.id,
        crates: battle.crates,
        playerCount: battle.player_count,
        gameMode: battle.game_mode,
        teamMode: battle.team_mode,
        players: battle.players,
        status: 'waiting',
        totalValue: battle.total_value,
        isOnline: true,
        isPersistent: true
      };
      onJoinBattle(gameBattle);
    }
  };

  const handleAddBot = async (battleId: string, slotNumber: number) => {
    await addBotToSlot(battleId, slotNumber);
  };

  const getGameModeColor = (mode: string) => {
    switch (mode) {
      case 'terminal': return 'bg-red-500';
      case 'unlucky': return 'bg-purple-500';
      case 'jackpot': return 'bg-orange-500';
      case 'puresulfur': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getTeamModeDisplay = (teamMode: string) => {
    switch (teamMode) {
      case '2v2': return '2v2 Teams';
      case '3v3': return '3v3 Teams';
      case '1v1v1': return '1v1v1 FFA';
      default: return '1v1';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Available Battles</h2>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'hsl(120 80% 55%)' }}>Available Battles</h2>
        <div className="text-sm text-muted-foreground">
          {availableBattles.length} battles available
        </div>
      </div>

      {availableBattles.length === 0 ? (
        // Empty State
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm p-12 text-center">
          <div className="mx-auto max-w-md space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'hsl(120 80% 55%)' }}>
              <Box className="h-10 w-10 text-white" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold" style={{ color: 'hsl(120 80% 55%)' }}>No Active Battles</h3>
              <p className="text-muted-foreground">
                Be the first to create an exciting crate battle! Challenge other players and win amazing rewards.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={onCreateBattle}
                className="text-white font-bold"
                style={{ backgroundColor: 'hsl(120 80% 55%)' }}
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Battle
              </Button>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Multiplayer</span>
                </div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                <div className="flex items-center space-x-1">
                  <Box className="h-4 w-4" />
                  <span>Real Rewards</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        // Battle List
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableBattles.map((battle) => (
            <Card key={battle.id} className="border-border/50 bg-card/60 backdrop-blur-sm p-4 space-y-4">
              {/* Battle Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getGameModeColor(battle.game_mode)}`} />
                  <span className="font-semibold text-sm uppercase tracking-wide">
                    {battle.game_mode}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {getTeamModeDisplay(battle.team_mode)}
                </div>
              </div>

              {/* Battle Value */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" style={{ color: 'hsl(120 80% 55%)' }} />
                  <span className="text-lg font-bold" style={{ color: 'hsl(120 80% 55%)' }}>
                    ${battle.total_value.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Value
                </div>
              </div>

              {/* Players */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Players</span>
                  <span className="text-xs text-muted-foreground">
                    {battle.players.length}/{battle.player_count}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: battle.player_count }).map((_, index) => {
                    const player = battle.players.find(p => p.slot_number === index + 1);
                    return (
                      <div 
                        key={index} 
                        className={`p-2 rounded border text-xs ${
                          player 
                            ? 'border-opacity-50' 
                            : 'bg-muted/20 border-muted/50'
                        }`}
                        style={player ? { 
                          backgroundColor: 'hsl(120 80% 55% / 0.2)', 
                          borderColor: 'hsl(120 80% 55% / 0.5)' 
                        } : {}}
                      >
                        {player ? (
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">
                              {player.name || player.user_id?.slice(0, 6) || 'Player'}
                            </span>
                            {player.team && (
                              <span className={`px-1 rounded text-xs ${
                                player.team === 'team1' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
                              }`}>
                                {player.team === 'team1' ? 'T1' : 'T2'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Empty Slot</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Crates Info */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Crates</span>
                <div className="text-xs text-muted-foreground">
                  {battle.crates?.map((item: any, index: number) => (
                    <div key={index}>
                      {item.quantity}x {item.crate.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleJoinBattle(battle)}
                  className="flex-1 text-white"
                  style={{ backgroundColor: 'hsl(120 80% 55%)' }}
                  size="sm"
                  disabled={battle.players.length >= battle.player_count}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Join Battle
                </Button>
                
                {battle.players.length < battle.player_count && (
                  <Button
                    onClick={() => handleAddBot(battle.id, battle.players.length + 1)}
                    variant="outline"
                    size="sm"
                    className="border-[hsl(120_80%_55%_/_0.5)] text-[hsl(120_80%_55%)] hover:bg-[hsl(120_80%_55%_/_0.1)]"
                  >
                    Add Bot
                  </Button>
                )}
              </div>

              {/* Time Created */}
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  Created {new Date(battle.created_at).toLocaleTimeString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
