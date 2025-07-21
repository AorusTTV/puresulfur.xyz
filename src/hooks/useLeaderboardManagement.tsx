
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeaderboardPrize {
  id: string;
  rank: number;
  prize_amount: number;
}

interface DistributeResult {
  success: boolean;
  total_distributed: number;
  players_rewarded: number;
  period_id: string;
}

interface ResetResult {
  success: boolean;
  message: string;
  wagers_cleared: number;
}

export const useLeaderboardManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: prizes, isLoading } = useQuery({
    queryKey: ['leaderboard-prizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_prizes')
        .select('*')
        .order('rank');
      if (error) throw error;
      return data as LeaderboardPrize[];
    },
  });

  const updatePrizeMutation = useMutation({
    mutationFn: async ({ rank, amount }: { rank: number; amount: number }) => {
      const { error } = await supabase
        .from('leaderboard_prizes')
        .update({ prize_amount: amount, updated_at: new Date().toISOString() })
        .eq('rank', rank);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard-prizes'] });
      toast({
        title: 'Success',
        description: 'Prize amounts updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update prize amounts',
        variant: 'destructive',
      });
      console.error('Error updating prizes:', error);
    },
  });

  const distributePrizesMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('distribute_monthly_prizes');
      if (error) throw error;
      return data as unknown as DistributeResult;
    },
    onSuccess: (data) => {
      toast({
        title: 'Prizes Distributed!',
        description: `Distributed ${data.total_distributed} to ${data.players_rewarded} players`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to distribute prizes',
        variant: 'destructive',
      });
      console.error('Error distributing prizes:', error);
    },
  });

  const resetLeaderboardMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('reset_monthly_leaderboard');
      if (error) throw error;
      return data as unknown as ResetResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard-prizes'] });
      toast({
        title: 'Monthly Leaderboard Reset Complete!',
        description: `${data.message}. Cleared ${data.wagers_cleared} wager entries from this month.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Reset Failed',
        description: 'An error occurred while resetting the monthly leaderboard. Please try again.',
        variant: 'destructive',
      });
      console.error('Error resetting monthly leaderboard:', error);
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['leaderboard-prizes'] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      await queryClient.invalidateQueries({ queryKey: ['monthly-leaderboard'] });
      toast({
        title: 'Refreshed',
        description: 'Leaderboard data has been refreshed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh leaderboard data',
        variant: 'destructive',
      });
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdatePrize = async (rank: number, amount: number) => {
    await updatePrizeMutation.mutateAsync({ rank, amount });
  };

  const handleDistributePrizes = () => {
    distributePrizesMutation.mutate();
  };

  const handleResetLeaderboard = () => {
    resetLeaderboardMutation.mutate();
  };

  return {
    prizes,
    isLoading,
    isRefreshing,
    handleRefresh,
    handleUpdatePrize,
    handleDistributePrizes,
    handleResetLeaderboard,
    isUpdating: updatePrizeMutation.isPending,
    isDistributing: distributePrizesMutation.isPending,
    isResetting: resetLeaderboardMutation.isPending,
  };
};
