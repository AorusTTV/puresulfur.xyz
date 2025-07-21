
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, TrendingUp, Award } from 'lucide-react';

interface AffiliateStatsProps {
  stats: {
    totalReferrals: number;
    totalEarnings: number;
    pendingCommissions: number;
    currentTier: string;
    commissionRate: number;
    totalReferralValue: number;
  };
}

export const AffiliateStats: React.FC<AffiliateStatsProps> = ({ stats }) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond': return 'bg-blue-500';
      case 'Platinum': return 'bg-purple-500';
      case 'Gold': return 'bg-yellow-500';
      case 'Silver': return 'bg-gray-400';
      case 'Bronze': return 'bg-orange-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReferrals}</div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Referral Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalReferralValue.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.pendingCommissions.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge className={`${getTierColor(stats.currentTier)} text-white`}>
              {stats.currentTier}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {(stats.commissionRate * 100).toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
