
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, DollarSign, Percent } from 'lucide-react';

interface AffiliateTiersProps {
  currentTier: string;
  totalReferralValue: number;
}

export const AffiliateTiers: React.FC<AffiliateTiersProps> = ({
  currentTier,
  totalReferralValue
}) => {
  const tiers = [
    { name: 'Beginner', value: 0, rate: 1.5, color: 'bg-green-500' },
    { name: 'Bronze', value: 1000, rate: 3, color: 'bg-orange-500' },
    { name: 'Silver', value: 2500, rate: 5, color: 'bg-gray-400' },
    { name: 'Gold', value: 5000, rate: 7, color: 'bg-yellow-500' },
    { name: 'Platinum', value: 7500, rate: 10, color: 'bg-purple-500' },
    { name: 'Diamond', value: 10000, rate: 20, color: 'bg-blue-500' },
  ];

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Affiliate Tiers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tiers.map((tier, index) => {
            const isCurrentTier = tier.name === currentTier;
            const isAchieved = totalReferralValue >= tier.value;
            const nextTier = tiers[index + 1];
            
            return (
              <div
                key={tier.name}
                className={`p-4 rounded-lg border transition-all ${
                  isCurrentTier 
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                    : 'border-border/50 bg-muted/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={`${tier.color} text-white`}>
                      {tier.name}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      ${tier.value}+ referral value
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Percent className="h-4 w-4" />
                      {tier.rate}% commission
                    </div>
                  </div>
                  {isCurrentTier && (
                    <Badge variant="outline" className="text-primary border-primary">
                      Current
                    </Badge>
                  )}
                </div>
                
                {isCurrentTier && nextTier && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Next tier: ${(nextTier.value - totalReferralValue).toFixed(2)} more referral value for {nextTier.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
