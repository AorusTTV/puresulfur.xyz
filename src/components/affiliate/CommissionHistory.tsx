
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, DollarSign } from 'lucide-react';

interface CommissionEntry {
  id: string;
  wager_amount: number;
  commission_rate: number;
  commission_amount: number;
  created_at: string;
  status: 'pending' | 'paid' | 'cancelled';
}

interface CommissionHistoryProps {
  commissions: CommissionEntry[];
}

export const CommissionHistory: React.FC<CommissionHistoryProps> = ({ commissions }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Commission History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {commissions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No commissions yet. Start referring users to earn!
          </p>
        ) : (
          <div className="space-y-4">
            {commissions.map((commission) => (
              <div
                key={commission.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/20">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      ${commission.commission_amount.toFixed(2)} commission
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(commission.commission_rate * 100).toFixed(1)}% of ${commission.wager_amount.toFixed(2)} wager
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(commission.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(commission.status)} text-white`}>
                  {commission.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
