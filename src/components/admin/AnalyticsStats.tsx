
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, Activity, Target, TrendingUp } from 'lucide-react';

interface AnalyticsStatsProps {
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
  loading: boolean;
}

export const AnalyticsStats: React.FC<AnalyticsStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="bg-background/80 border-primary/30 animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'primary',
      change: '+12.5% from last month'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: Users,
      color: 'blue-500',
      change: '+8.2% from last week'
    },
    {
      title: 'Games Played',
      value: stats.gamesPlayed.toLocaleString(),
      icon: Activity,
      color: 'green-500',
      change: '+15.3% from yesterday'
    },
    {
      title: 'Avg. Bet Size',
      value: `$${stats.avgBetSize.toFixed(2)}`,
      icon: Target,
      color: 'orange-500',
      change: stats.avgBetSize > 50 ? '+2.1% from last week' : '-2.1% from last week'
    },
    {
      title: 'Deposits',
      value: `$${stats.deposits.toLocaleString()}`,
      icon: DollarSign,
      color: 'emerald-500',
      change: '+18.7% today'
    },
    {
      title: 'Withdrawals',
      value: `$${stats.withdrawals.toLocaleString()}`,
      icon: DollarSign,
      color: 'amber-500',
      change: '+5.2% today'
    },
    {
      title: 'New Users',
      value: stats.newUsers.toLocaleString(),
      icon: Users,
      color: 'cyan-500',
      change: '+22.1% today'
    },
    {
      title: 'Profit',
      value: `$${stats.profit.toLocaleString()}`,
      icon: Target,
      color: 'purple-500',
      change: '+14.8% today'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-background/80 border-primary/30 hover:bg-background/90 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-${stat.color}/20`}>
                <stat.icon className={`h-4 w-4 text-${stat.color === 'primary' ? 'primary' : stat.color}`} />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
            <p className={`text-${stat.color === 'primary' ? 'primary' : stat.color} text-xs flex items-center gap-1`}>
              <TrendingUp className={`h-3 w-3 ${stat.change.includes('-') ? 'rotate-180' : ''}`} />
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
