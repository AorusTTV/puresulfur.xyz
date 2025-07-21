
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaderboardHeader } from './leaderboard/LeaderboardHeader';
import { PrizePoolTable } from './leaderboard/PrizePoolTable';
import { LeaderboardActions } from './leaderboard/LeaderboardActions';
import { PrizeHistoryTable } from './leaderboard/PrizeHistoryTable';
import { useLeaderboardManagement } from '@/hooks/useLeaderboardManagement';
import { Trophy, History } from 'lucide-react';

export const LeaderboardManagement: React.FC = () => {
  const {
    prizes,
    isLoading,
    isRefreshing,
    handleRefresh,
    handleUpdatePrize,
    handleDistributePrizes,
    handleResetLeaderboard,
    isUpdating,
    isDistributing,
    isResetting,
  } = useLeaderboardManagement();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card/80 to-secondary/30 border-primary/20 shadow-gaming backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="management" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Prize Management
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Prize History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="space-y-4">
            <LeaderboardHeader
              prizesCount={prizes?.length || 0}
              isRefreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
            
            <PrizePoolTable
              prizes={prizes}
              onUpdatePrize={handleUpdatePrize}
              isUpdating={isUpdating}
            />
            
            <LeaderboardActions
              onDistributePrizes={handleDistributePrizes}
              onResetLeaderboard={handleResetLeaderboard}
              isDistributing={isDistributing}
              isResetting={isResetting}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <PrizeHistoryTable />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
