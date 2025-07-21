import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Package, DollarSign, TrendingUp } from 'lucide-react';

interface SteamDeposit {
  id: string;
  steam_item_id: string;
  market_hash_name: string;
  market_price: number;
  deposit_value: number;
  quantity: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
}

export const DepositHistory = () => {
  const [deposits, setDeposits] = useState<SteamDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDeposits();
    }
  }, [user]);

  const fetchDeposits = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('steam_deposits')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('[DEPOSIT-HISTORY] Error fetching deposits:', error);
        return;
      }

      setDeposits(data || []);
    } catch (error) {
      console.error('[DEPOSIT-HISTORY] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const calculateTotalDeposited = () => {
    return deposits
      .filter(d => d.status === 'completed')
      .reduce((total, deposit) => total + deposit.deposit_value, 0);
  };

  const calculateTotalMarketValue = () => {
    return deposits
      .filter(d => d.status === 'completed')
      .reduce((total, deposit) => total + deposit.market_price, 0);
  };

  if (loading) {
    return (
      <Card className="bg-card/60 border-border backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (deposits.length === 0) {
    return (
      <Card className="bg-card/60 border-border backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Package className="h-5 w-5" />
            Deposit History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No deposits yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Deposit skins to see your history here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/60 border-border backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Package className="h-5 w-5" />
          Recent Deposits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Total Deposited</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                ${calculateTotalDeposited().toFixed(2)}
              </div>
            </div>
            <div className="text-center p-3 bg-accent/10 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">Market Value</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                ${calculateTotalMarketValue().toFixed(2)}
              </div>
            </div>
          </div>

          {/* Deposit List */}
          <div className="space-y-3">
            {deposits.map((deposit) => (
              <div
                key={deposit.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">
                      {deposit.market_hash_name}
                    </span>
                    {deposit.quantity > 1 && (
                      <Badge variant="outline" className="text-xs">
                        x{deposit.quantity}
                      </Badge>
                    )}
                    <Badge 
                      className={`text-xs ${getStatusColor(deposit.status)}`}
                    >
                      {deposit.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Market: ${deposit.market_price.toFixed(2)}</span>
                    <span>Deposit: ${deposit.deposit_value.toFixed(2)}</span>
                    <span className="text-xs">
                      {new Date(deposit.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 