
import React from 'react';
import { AnalyticsHeader } from './AnalyticsHeader';
import { AnalyticsContent } from './AnalyticsContent';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

export const Analytics: React.FC = () => {
  const { stats, revenueData, topPlayers, loading, refresh } = useAnalyticsData();

  return (
    <div className="w-full max-w-none">
      <div className="bg-gradient-to-br from-card/80 to-secondary/30 border border-primary/20 shadow-gaming backdrop-blur-sm rounded-lg">
        <AnalyticsHeader loading={loading} onRefresh={refresh} />
        <AnalyticsContent 
          stats={stats}
          revenueData={revenueData}
          topPlayers={topPlayers}
          loading={loading}
        />
      </div>
    </div>
  );
};
