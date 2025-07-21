
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

interface StatItem {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

export const LiveStats: React.FC = () => {
  const [stats, setStats] = useState<StatItem[]>([
    {
      id: '1',
      label: 'Active Users',
      value: '12,547',
      change: '+5.2%',
      trend: 'up',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: '2',
      label: 'Volume (24h)',
      value: '$847,392',
      change: '+12.8%',
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      id: '3',
      label: 'Cases Opened',
      value: '3,842',
      change: '+8.1%',
      trend: 'up',
      icon: <TrendingUp className="h-5 w-5" />
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => 
        prevStats.map(stat => ({
          ...stat,
          value: Math.floor(Math.random() * 1000).toLocaleString()
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto bg-card/60 border-primary/30 backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-primary text-xl font-bold flex items-center">
          <TrendingUp className="mr-2 h-6 w-6" />
          LIVE PLATFORM STATISTICS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center">
              <div className="flex items-center justify-center mb-2 text-muted-foreground">
                {stat.icon}
                <span className="ml-2 text-sm">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  stat.trend === 'up' 
                    ? 'bg-primary/20 text-primary border-primary/30' 
                    : 'bg-destructive/20 text-destructive border-destructive/30'
                }`}
              >
                {stat.change}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
