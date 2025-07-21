
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalRevenue: number;
  activeUsers: number;
  gamesPlayed: number;
  avgBetSize: number;
  deposits: number;
  withdrawals: number;
  newUsers: number;
  profit: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  day: string;
}

interface TopPlayer {
  id: string;
  player_name: string;
  total_wagered: number;
  avatar_url?: string;
  level: number;
}

export const useAnalyticsData = () => {
  const [stats, setStats] = useState<AnalyticsData>({
    totalRevenue: 0,
    activeUsers: 0,
    gamesPlayed: 0,
    avgBetSize: 0,
    deposits: 0,
    withdrawals: 0,
    newUsers: 0,
    profit: 0
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Get date ranges
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch total wagered amount (revenue)
      const { data: totalWagers } = await supabase
        .from('user_wagers')
        .select('amount')
        .gte('created_at', lastMonth.toISOString());

      const totalRevenue = totalWagers?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;

      // Fetch active users (users who wagered in last 7 days)
      const { data: activeUsersData } = await supabase
        .from('user_wagers')
        .select('user_id')
        .gte('created_at', lastWeek.toISOString());

      const uniqueActiveUsers = new Set(activeUsersData?.map(w => w.user_id) || []);
      const activeUsers = uniqueActiveUsers.size;

      // Fetch games played (count of completed games)
      const [wheelGames, coinflipGames, jackpotGames] = await Promise.all([
        supabase.from('wheel_games').select('id').eq('status', 'completed'),
        supabase.from('coinflip_games').select('id').eq('status', 'completed'),
        supabase.from('jackpot_games').select('id').eq('status', 'completed')
      ]);

      const gamesPlayed = (wheelGames.data?.length || 0) + 
                         (coinflipGames.data?.length || 0) + 
                         (jackpotGames.data?.length || 0);

      // Calculate average bet size
      const avgBetSize = totalWagers && totalWagers.length > 0 
        ? totalRevenue / totalWagers.length 
        : 0;

      // Fetch deposits and withdrawals from steam trades
      const { data: deposits } = await supabase
        .from('steam_trades')
        .select('total_value')
        .eq('trade_type', 'deposit')
        .gte('created_at', today.toISOString());

      const { data: withdrawals } = await supabase
        .from('steam_trades')
        .select('total_value')
        .eq('trade_type', 'withdrawal')
        .gte('created_at', today.toISOString());

      const totalDeposits = deposits?.reduce((sum, d) => sum + Number(d.total_value), 0) || 0;
      const totalWithdrawals = withdrawals?.reduce((sum, w) => sum + Number(w.total_value), 0) || 0;

      // Fetch new users (registered today)
      const { data: newUsersData } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', today.toISOString());

      const newUsers = newUsersData?.length || 0;

      // Calculate profit (simplified as total revenue minus withdrawals)
      const profit = totalRevenue - totalWithdrawals;

      setStats({
        totalRevenue,
        activeUsers,
        gamesPlayed,
        avgBetSize,
        deposits: totalDeposits,
        withdrawals: totalWithdrawals,
        newUsers,
        profit
      });

      // Fetch daily revenue for the last 7 days
      const dailyRevenuePromises = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        
        return supabase
          .from('user_wagers')
          .select('amount')
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDate.toISOString());
      });

      const dailyRevenueResults = await Promise.all(dailyRevenuePromises);
      
      const revenueByDay = dailyRevenueResults.map((result, i) => {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const revenue = result.data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
        
        return {
          date: date.toISOString().split('T')[0],
          revenue,
          day: date.toLocaleDateString('en-US', { weekday: 'short' })
        };
      }).reverse();

      setRevenueData(revenueByDay);

      // Fetch top players
      const { data: topPlayersData } = await supabase
        .rpc('get_current_month_leaderboard')
        .limit(10);

      setTopPlayers(topPlayersData || []);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchAnalyticsData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    revenueData,
    topPlayers,
    loading,
    refresh: fetchAnalyticsData
  };
};
