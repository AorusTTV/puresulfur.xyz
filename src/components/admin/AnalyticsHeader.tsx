
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, RefreshCw } from 'lucide-react';

interface AnalyticsHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ loading, onRefresh }) => {
  return (
    <div className="border-b border-primary/20 pb-4 p-6">
      <div className="text-foreground flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/20">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold">Analytics Dashboard</span>
          <span className="text-xs text-muted-foreground font-normal">
            Real-time platform performance and user activity
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={onRefresh}
            disabled={loading}
            size="sm"
            variant="outline"
            className="border-primary/30"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
            Live Data
          </span>
        </div>
      </div>
    </div>
  );
};
