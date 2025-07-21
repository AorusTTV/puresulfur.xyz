
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Zap } from 'lucide-react';
import { calculateLevelInfo, formatNumber } from '@/utils/levelUtils';
import { getLevelColorInfo } from '@/utils/levelColorUtils';

interface LevelDisplayProps {
  experience: number;
  level: number;
  compact?: boolean;
  showDetails?: boolean;
}

export const LevelDisplay: React.FC<LevelDisplayProps> = ({
  experience,
  level,
  compact = false,
  showDetails = false
}) => {
  const levelInfo = calculateLevelInfo(experience);
  const colorInfo = getLevelColorInfo(level);

  const getLevelColor = (level: number) => {
    if (level >= 400) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (level >= 300) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    if (level >= 200) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (level >= 100) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (level >= 50) return 'bg-gradient-to-r from-orange-500 to-red-500';
    return 'bg-gradient-to-r from-slate-500 to-gray-500';
  };

  const getLevelIcon = (level: number) => {
    if (level >= 400) return <Star className={`h-4 w-4 ${colorInfo.iconColor}`} />;
    if (level >= 200) return <Trophy className={`h-4 w-4 ${colorInfo.iconColor}`} />;
    return <Zap className={`h-4 w-4 ${colorInfo.iconColor}`} />;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Badge className={`${getLevelColor(level)} text-white border-0 flex items-center space-x-1`}>
          {getLevelIcon(level)}
          <span>{level}</span>
        </Badge>
        <div className="text-xs text-slate-400">
          {formatNumber(experience)} XP
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-slate-800/60 border-slate-700/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge className={`${getLevelColor(level)} text-white border-0 flex items-center space-x-1 text-base px-3 py-1`}>
              {getLevelIcon(level)}
              <span className={colorInfo.nameColor}>Level {level}</span>
            </Badge>
            {level >= 500 && (
              <Badge className="bg-gradient-to-r from-gold-400 to-yellow-500 text-black border-0">
                MAX
              </Badge>
            )}
          </div>
          <div className="text-sm text-slate-300">
            {formatNumber(experience)} XP
          </div>
        </div>

        {level < 500 && (
          <>
            <Progress 
              value={levelInfo.progressToNextLevel} 
              className="h-2 mb-2"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>{formatNumber(levelInfo.expNeededForNextLevel)} XP to next level</span>
              <span>{levelInfo.progressToNextLevel.toFixed(1)}%</span>
            </div>
          </>
        )}

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Current Level XP</div>
                <div className="text-white">{formatNumber(levelInfo.expForCurrentLevel)}</div>
              </div>
              {level < 500 && (
                <div>
                  <div className="text-slate-400">Next Level XP</div>
                  <div className="text-white">{formatNumber(levelInfo.expForNextLevel)}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
