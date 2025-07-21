
import React from 'react';
import { AnalyticsStats } from './AnalyticsStats';
import { RevenueChart } from './RevenueChart';
import { TopPlayersCard } from './TopPlayersCard';

interface AnalyticsContentProps {
  stats: {
    totalRevenue: number;
    activeUsers: number;
    gamesPlayed: number;
    avgBetSize: number;
    deposits: number;
    withdrawals: number;
    newUsers: number;
    profit: number;
  };
  revenueData: Array<{
    date: string;
    revenue: number;
    day: string;
  }>;
  topPlayers: Array<{
    id: string;
    player_name: string;
    total_wagered: number;
    avatar_url?: string;
    level: number;
  }>;
  loading: boolean;
}

export const AnalyticsContent: React.FC<AnalyticsContentProps> = ({
  stats,
  revenueData,
  topPlayers,
  loading
}) => {
  return (
    <div className="p-6">
      {/* Summary Cards */}
      <AnalyticsStats stats={stats} loading={loading} />

      {/* Revenue Chart */}
      <RevenueChart data={revenueData} loading={loading} />

      {/* Top Players */}
      <TopPlayersCard players={topPlayers} loading={loading} />
    </div>
  );
};
