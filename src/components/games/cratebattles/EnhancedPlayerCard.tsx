
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Crown, Users, Wifi, WifiOff } from 'lucide-react';
import { getLevelColorInfo } from '@/utils/levelColorUtils';

interface EnhancedPlayerCardProps {
  player: any;
  isWinner?: boolean;
  isOnline?: boolean;
  battleStatus: 'waiting' | 'rolling' | 'finished';
  children?: React.ReactNode;
}

export const EnhancedPlayerCard: React.FC<EnhancedPlayerCardProps> = ({ 
  player, 
  isWinner = false,
  isOnline = true,
  battleStatus,
  children 
}) => {
  const colorInfo = getLevelColorInfo(player.level || 1);

  return (
    <Card 
      style={{
        animation: isWinner ? `pulse-ring 1s infinite` : `none`
      }}
      className={`
        relative overflow-hidden border-2 transition-all duration-500 
        ${isWinner 
          ? 'border-yellow-500 shadow-lg shadow-yellow-500/30' 
          : 'border-border/50 hover:border-primary/50'
        }
        ${battleStatus === 'rolling' ? '' : ''}
      `}
    >
      {/* Winner Crown */}
      {isWinner && (
        <div className="absolute top-4 right-4 z-20">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center animate-bounce">
            <Crown className="h-5 w-5 text-yellow-900" />
          </div>
        </div>
      )}
      
      <div className="p-6">
        {/* Player Info Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              {player.avatar ? (
                <img src={player.avatar} alt={player.name} className="w-full h-full rounded-full" />
              ) : (
                <span className="text-white font-bold">
                  {player.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
              
              {/* Bot Indicator */}
              {player.isBot && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="h-3 w-3 text-white" />
                </div>
              )}
              
              {/* Online Status */}
              <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center">
                {isOnline ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
              </div>
            </div>
            
            <div>
              <div className="font-medium flex items-center space-x-2">
                <span className={colorInfo.nameColor}>{player.name || 'Unknown Player'}</span>
                {player.isYou && (
                  <Badge className="bg-primary/20 text-primary border-primary/50">
                    YOU
                  </Badge>
                )}
                {player.isBot && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                    BOT
                  </Badge>
                )}
                {!isOnline && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                    OFFLINE
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground flex items-center space-x-2">
                <Users className="h-3 w-3" />
                <span className={colorInfo.nameColor}>Level {player.level || 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Player Content */}
        {children}
      </div>
      
      {/* Glow Effect for Winner */}
      {isWinner && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10" />
      )}
    </Card>
  );
};
