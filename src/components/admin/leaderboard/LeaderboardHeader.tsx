
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCw } from 'lucide-react';

interface LeaderboardHeaderProps {
  prizesCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({
  prizesCount,
  isRefreshing,
  onRefresh
}) => {
  return (
    <CardHeader className="border-b border-primary/20">
      <CardTitle className="text-foreground flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/20">
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold">Monthly Leaderboard Management</span>
          <span className="text-sm text-muted-foreground font-normal">
            Manage monthly prize pool and distribution
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-primary/40 text-primary hover:bg-primary/20 hover:text-primary"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            {prizesCount} Prize Tiers
          </span>
        </div>
      </CardTitle>
    </CardHeader>
  );
};
