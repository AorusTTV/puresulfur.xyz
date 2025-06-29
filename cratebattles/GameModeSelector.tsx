
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Zap, Skull, Target, Flame } from 'lucide-react';

interface GameModeSelectorProps {
  gameMode: 'default' | 'terminal' | 'unlucky' | 'jackpot' | 'puresulfur';
  setGameMode: (mode: 'default' | 'terminal' | 'unlucky' | 'jackpot' | 'puresulfur') => void;
  teamMode: string;
  setTeamMode: (mode: string) => void;
  playerCount: number;
  setPlayerCount: (count: number) => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  gameMode,
  setGameMode,
  teamMode,
  setTeamMode,
  playerCount,
  setPlayerCount
}) => {
  const gameModes = [
    {
      id: 'default',
      name: 'Default',
      description: 'Standard crate battle - highest value wins',
      icon: Crown,
      color: 'bg-blue-500'
    },
    {
      id: 'terminal',
      name: 'Terminal',
      description: 'High stakes battle with terminal items',
      icon: Zap,
      color: 'bg-yellow-500'
    },
    {
      id: 'unlucky',
      name: 'Unlucky',
      description: 'Lowest value wins - reverse battle',
      icon: Skull,
      color: 'bg-gray-500'
    },
    {
      id: 'jackpot',
      name: 'Jackpot',
      description: 'Winner decided by probability roulette',
      icon: Target,
      color: 'bg-green-500'
    },
    {
      id: 'puresulfur',
      name: 'PureSulfur',
      description: 'Special sulfur bonus rules apply',
      icon: Flame,
      color: 'bg-orange-500'
    }
  ];

  const teamModes = [
    { id: '1v1', name: '1v1', players: 2, description: 'Classic head-to-head battle' },
    { id: '1v1v1', name: '1v1v1', players: 3, description: 'Three-way free-for-all' },
    { id: '2v2', name: '2v2', players: 4, description: 'Team battle with 2 players each' },
    { id: '3v3', name: '3v3', players: 6, description: 'Large team battle with 3 players each' }
  ];

  return (
    <div className="space-y-6">
      {/* Game Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5" />
            <span>Game Mode</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {gameModes.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <Button
                  key={mode.id}
                  variant={gameMode === mode.id ? "default" : "outline"}
                  onClick={() => setGameMode(mode.id as any)}
                  className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                    gameMode === mode.id ? mode.color : ''
                  }`}
                >
                  <IconComponent className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">{mode.name}</div>
                    <div className="text-xs opacity-80">{mode.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Battle Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Battle Format</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {teamModes.map((mode) => (
              <Button
                key={mode.id}
                variant={teamMode === mode.id ? "default" : "outline"}
                onClick={() => {
                  setTeamMode(mode.id);
                  setPlayerCount(mode.players);
                }}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Users className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-semibold">{mode.name}</div>
                  <div className="text-xs opacity-80">{mode.description}</div>
                  <Badge variant="secondary" className="mt-1">
                    {mode.players} Players
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Selection Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-primary">
                {gameModes.find(m => m.id === gameMode)?.name} • {teamMode.toUpperCase()}
              </div>
              <div className="text-sm text-muted-foreground">
                {playerCount} players • {gameModes.find(m => m.id === gameMode)?.description}
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground">
              {playerCount} Players
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
