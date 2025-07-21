
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface RevenueData {
  date: string;
  revenue: number;
  day: string;
}

interface RevenueChartProps {
  data: RevenueData[];
  loading: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card className="bg-background/80 border-primary/30 mb-6">
        <CardHeader className="border-b border-primary/20 pb-3">
          <CardTitle className="text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold">Daily Revenue (Last 7 Days)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-48 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <Card className="bg-background/80 border-primary/30 mb-6">
      <CardHeader className="border-b border-primary/20 pb-3">
        <CardTitle className="text-foreground flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold">Daily Revenue (Last 7 Days)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-48 flex items-end justify-between gap-2">
          {data.map((day, index) => (
            <div key={day.date} className="flex flex-col items-center flex-1">
              <div 
                className="bg-gradient-to-t from-primary to-primary/60 rounded-t w-full min-w-[40px] transition-all hover:from-primary/90 hover:to-primary/80"
                style={{ height: `${maxRevenue > 0 ? (day.revenue / maxRevenue) * 150 : 10}px` }}
                title={`$${day.revenue.toLocaleString()}`}
              />
              <p className="text-muted-foreground text-xs mt-2 font-medium">
                {day.day}
              </p>
              <p className="text-foreground text-xs font-bold">${day.revenue.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
