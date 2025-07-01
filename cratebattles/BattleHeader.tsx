
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Globe, Target, Zap, Crown, Flame } from 'lucide-react';

interface BattleHeaderProps {
  battleData: any;
  battleStatus: 'waiting' | 'rolling' | 'finished';
  playersJoined: number;
}

export const BattleHeader: React.FC<BattleHeaderProps> = ({
  battleData,
  battleStatus,
  playersJoined
}) => {
  const getGameModeInfo = (mode: string) => {
    switch (mode) {
      case 'terminal':
        return { name: 'Terminal', icon: <Target className="h-4 w-4" />, color: 'from-red-400 to-red-600' };
      case 'unlucky':
        return { name: 'Unlucky', icon: <Zap className="h-4 w-4" />, color: 'from-purple-400 to-purple-600' };
      case 'jackpot':
        return { name: 'Jackpot', icon: <Crown className="h-4 w-4" />, color: 'from-yellow-400 to-orange-600' };
      case 'puresulfur':
        return { name: 'PureSulfur', icon: <Flame className="h-4 w-4" />, color: 'from-yellow-400 to-orange-500' };
      case 'default':
        return { name: 'Default', icon: <Target className="h-4 w-4" />, color: 'from-blue-400 to-blue-600' };
      default:
        // Log unexpected modes for debugging
        console.warn('Unknown game mode in BattleHeader:', mode);
        return { name: mode || 'Unknown', icon: <Target className="h-4 w-4" />, color: 'from-gray-400 to-gray-600' };
    }
  };

  // Use the exact game mode from battleData, with logging for debugging
  const actualGameMode = battleData?.gameMode || battleData?.game_mode || 'default';
  const actualTeamMode = battleData?.teamMode || battleData?.team_mode || '1v1';
  
  console.log('BattleHeader displaying modes:', { 
    gameMode: actualGameMode, 
    teamMode: actualTeamMode,
    rawBattleData: { gameMode: battleData?.gameMode, game_mode: battleData?.game_mode, teamMode: battleData?.teamMode, team_mode: battleData?.team_mode }
  });

  const gameModeInfo = getGameModeInfo(actualGameMode);

  return (
    <Card className="bg-card/60 border-border/50 p-6">
      <div className="space-y-4">
        {/* Main Battle Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Crate Battle #{battleData?.id?.slice(-6) || 'XXXXXX'}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>{battleData?.battleRegion || 'Global'}</span>
                <span>•</span>
                <span>{battleData?.isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: 'hsl(120 80% 55%)' }}>
              ${battleData?.totalValue?.toFixed(2) || battleData?.total_value?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-muted-foreground">Total Prize Pool</div>
          </div>
        </div>

        {/* Battle Configuration */}
        <div className="flex items-center space-x-4">
          <Badge 
            className={`bg-gradient-to-r ${gameModeInfo.color} text-white border-none flex items-center space-x-1`}
          >
            {gameModeInfo.icon}
            <span>{gameModeInfo.name}</span>
          </Badge>
          
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{actualTeamMode}</span>
          </Badge>

          <Badge variant="outline" className="flex items-center space-x-1">
            <span>{playersJoined}/{battleData?.playerCount || battleData?.player_count || 2} Players</span>
          </Badge>

          {battleData?.difficulty && (
            <Badge variant="outline">
              {battleData.difficulty}
            </Badge>
          )}
        </div>

        {/* Crate Info */}
        {battleData?.crates?.[0]?.crate && (
          <div className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg">
            <img 
              src={battleData.crates[0].crate.image} 
              alt={battleData.crates[0].crate.name}
              className="w-12 h-12 object-cover rounded border-2"
              style={{ borderColor: 'hsl(120 80% 55% / 0.2)' }}
            />
            <div>
              <div className="font-medium text-foreground">
                {battleData.crates[0].crate.name}
              </div>
              <div className="text-sm text-muted-foreground">
                ${battleData.crates[0].crate.price} per crate
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
