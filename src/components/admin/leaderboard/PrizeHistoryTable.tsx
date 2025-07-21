import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { History, RefreshCw, Trophy, Calendar, User, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface PrizeDistribution {
  id: string;
  rank: number;
  prize_amount: number;
  distributed_at: string;
  period_id: string;
  user_id: string;
  user_profile: {
    nickname: string;
    avatar_url: string;
    steam_username: string;
  };
  period: {
    start_date: string;
    end_date: string;
    status: string;
  };
}

export const PrizeHistoryTable: React.FC = () => {
  const [distributions, setDistributions] = useState<PrizeDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchPrizeHistory = async (showRefreshLoader = false) => {
    if (showRefreshLoader) setIsRefreshing(true);
    else setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('prize_distributions')
        .select(`
          *,
          user_profile:profiles!prize_distributions_user_id_fkey (
            nickname,
            avatar_url,
            steam_username
          ),
          period:leaderboard_periods!prize_distributions_period_id_fkey (
            start_date,
            end_date,
            status
          )
        `)
        .order('distributed_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching prize history:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch prize history',
          variant: 'destructive'
        });
        return;
      }

      setDistributions(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch prize history',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrizeHistory();
  }, []);

  const handleRefresh = () => {
    fetchPrizeHistory(true);
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1: return 'default';
      case 2: return 'secondary';
      case 3: return 'outline';
      default: return 'secondary';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className="h-3 w-3" />;
    }
    return null;
  };

  const formatPeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return format(start, 'MMMM yyyy');
    }
    
    return `${format(start, 'MMM')} - ${format(end, 'MMM yyyy')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading prize history...</div>
      </div>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <History className="h-5 w-5 text-primary" />
            Prize Distribution History
          </CardTitle>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {distributions.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No prize distributions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {distributions.map((distribution) => (
                <Card key={distribution.id} className="bg-secondary/20 border-border/30">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={distribution.user_profile?.avatar_url} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {distribution.user_profile?.nickname || 
                             distribution.user_profile?.steam_username || 
                             'Unknown User'}
                          </p>
                        </div>
                      </div>

                      {/* Rank and Prize */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={getRankBadgeVariant(distribution.rank)}
                          className="flex items-center gap-1"
                        >
                          {getRankIcon(distribution.rank)}
                          Rank #{distribution.rank}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                          <DollarSign className="h-3 w-3" />
                          {distribution.prize_amount.toFixed(2)}
                        </div>
                      </div>

                      {/* Period */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {distribution.period 
                            ? formatPeriod(distribution.period.start_date, distribution.period.end_date)
                            : 'Unknown Period'
                          }
                        </span>
                      </div>

                      {/* Distribution Date */}
                      <div className="text-xs text-muted-foreground">
                        Distributed: {format(new Date(distribution.distributed_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {distributions.length >= 100 && (
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing latest 100 distributions
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};