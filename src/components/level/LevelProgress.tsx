
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Target, Gift } from 'lucide-react';
import { calculateLevelInfo, formatNumber, getExpRequiredForLevel, getSulfurRewardForLevel } from '@/utils/levelUtils';
import { useLevelUpGifts } from '@/hooks/useLevelUpGifts';
import { LevelUpGift } from './LevelUpGift';

interface LevelProgressProps {
  experience: number;
  level: number;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ experience, level }) => {
  const levelInfo = calculateLevelInfo(experience);
  const { gifts, unclaimedGifts, hasUnclaimedGifts, loading, refreshGifts } = useLevelUpGifts();

  const getMilestones = () => {
    const milestones = [];
    const nextMilestones = [10, 25, 50, 100, 200, 300, 400, 500];
    
    for (const milestone of nextMilestones) {
      if (milestone > level) {
        const expRequired = getExpRequiredForLevel(milestone);
        const expNeeded = expRequired - experience;
        milestones.push({
          level: milestone,
          expNeeded: Math.max(expNeeded, 0)
        });
        if (milestones.length >= 3) break;
      }
    }
    
    return milestones;
  };

  const getRecentAchievements = () => {
    const achievements = [];
    
    if (level >= 500) achievements.push({ name: 'Max Level Master', icon: '👑', color: 'bg-primary' });
    if (level >= 400) achievements.push({ name: 'Elite Player', icon: '💎', color: 'bg-accent' });
    if (level >= 300) achievements.push({ name: 'Expert Trader', icon: '🏆', color: 'bg-primary' });
    if (level >= 200) achievements.push({ name: 'Veteran', icon: '⭐', color: 'bg-accent' });
    if (level >= 100) achievements.push({ name: 'Experienced', icon: '🎖️', color: 'bg-primary' });
    if (level >= 50) achievements.push({ name: 'Skilled', icon: '🔥', color: 'bg-accent' });
    if (level >= 25) achievements.push({ name: 'Rising Star', icon: '✨', color: 'bg-primary' });
    if (level >= 10) achievements.push({ name: 'Getting Started', icon: '🚀', color: 'bg-accent' });
    
    return achievements.slice(0, 3).reverse();
  };

  const getNextLevelCrateReward = () => {
    const nextLevel = level + 1;
    return {
      level: nextLevel,
      sulfurAmount: getSulfurRewardForLevel(nextLevel)
    };
  };

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <Card className="gaming-card-enhanced border-primary/30 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{level}</div>
              <div className="text-sm text-muted-foreground">Current Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formatNumber(experience)}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {level >= 500 ? 'MAX' : formatNumber(levelInfo.expNeededForNextLevel)}
              </div>
              <div className="text-sm text-muted-foreground">
                {level >= 500 ? 'Level' : 'XP to Next'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Up Gifts */}
      {!loading && hasUnclaimedGifts && (
        <Card className="gaming-card-enhanced border-primary/30 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Gift className="mr-2 h-5 w-5 text-primary gaming-text-glow" />
              Level Up Rewards
              <Badge 
                variant="secondary" 
                className="ml-2 bg-primary/20 text-primary border-primary/50 gaming-text-glow"
              >
                {unclaimedGifts.length} New
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unclaimedGifts.slice(0, 3).map((gift) => (
                <LevelUpGift
                  key={gift.id}
                  id={gift.id}
                  level={gift.level}
                  sulfurAmount={gift.sulfur_amount}
                  claimed={gift.claimed}
                  onClaim={refreshGifts}
                />
              ))}
              {unclaimedGifts.length > 3 && (
                <div className="text-center text-sm text-muted-foreground">
                  +{unclaimedGifts.length - 3} more gifts available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Level Crate Progress */}
      {level < 500 && (
        <Card className="gaming-card-enhanced border-primary/30 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Gift className="mr-2 h-5 w-5 text-primary" />
              Level Crate Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress to Level {level + 1}</span>
                  <span className="text-primary font-medium">{Math.round(levelInfo.progressToNextLevel)}%</span>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-3 border border-border">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-300 gaming-glow"
                    style={{ width: `${levelInfo.progressToNextLevel}%` }}
                  />
                </div>
              </div>

              {/* Next Level Crate Target */}
              <div className="flex items-center justify-between p-4 gaming-card-enhanced border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Gift className="h-8 w-8 text-primary gaming-text-glow" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Level {getNextLevelCrateReward().level} Crate Reward
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <img 
                        src="/lovable-uploads/d38d76d8-63f6-4819-a570-d2eea1c2e5d6.png" 
                        alt="Sulfur" 
                        className="h-5 w-5 mr-1"
                      />
                      <span className="text-primary gaming-text-glow">
                        Reward awaits!
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* XP Sources Hint */}
              <div className="text-xs text-muted-foreground text-center p-3 bg-secondary/30 rounded-lg border border-border">
                <span className="text-primary">💡</span> Earn XP by placing bets in games - every $0.01 wagered = 5 XP
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Milestones */}
      {level < 500 && (
        <Card className="gaming-card-enhanced border-primary/30 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Target className="mr-2 h-5 w-5 text-accent" />
              Upcoming Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getMilestones().map((milestone) => (
                <div key={milestone.level} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Level {milestone.level}</Badge>
                    <span className="text-muted-foreground">
                      {milestone.level === 500 ? 'Maximum Level' : 
                       milestone.level >= 400 ? 'Elite Status' :
                       milestone.level >= 300 ? 'Expert Trader' :
                       milestone.level >= 200 ? 'Veteran Status' :
                       milestone.level >= 100 ? 'Experienced Trader' :
                       milestone.level >= 50 ? 'Skilled Player' : 'Milestone'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatNumber(milestone.expNeeded)} XP needed
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Achievements */}
      {getRecentAchievements().length > 0 && (
        <Card className="gaming-card-enhanced border-primary/30 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Award className="mr-2 h-5 w-5 text-accent" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getRecentAchievements().map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg border border-border">
                  <div className={`w-10 h-10 ${achievement.color} rounded-full flex items-center justify-center text-primary-foreground font-bold`}>
                    {achievement.icon}
                  </div>
                  <div>
                    <div className="text-foreground font-medium">{achievement.name}</div>
                    <div className="text-sm text-muted-foreground">Achievement unlocked</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
