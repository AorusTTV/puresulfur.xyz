
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';

interface SteamTrade {
  id: string;
  trade_id: string | null;
  trade_type: string;
  status: string;
  items: any;
  total_value: number;
  created_at: string;
  updated_at: string;
  profiles: {
    nickname: string;
    steam_username: string;
    steam_id: string;
  };
  steam_bots: {
    steam_username: string;
  };
}

export const SteamTradesManagement: React.FC = () => {
  const [trades, setTrades] = useState<SteamTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('steam_trades')
        .select(`
          *,
          profiles:user_id(nickname, steam_username, steam_id),
          steam_bots:bot_id(steam_username)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch Steam trades',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTradeStatus = async (tradeId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('steam_trades')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'accepted' ? { completed_at: new Date().toISOString() } : {})
        })
        .eq('id', tradeId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Trade status updated to ${newStatus}`
      });

      fetchTrades();
    } catch (error) {
      console.error('Error updating trade:', error);
      toast({
        title: 'Error',
        description: 'Failed to update trade status',
        variant: 'destructive'
      });
    }
  };

  const refreshTradeStatuses = async () => {
    setRefreshing(true);
    try {
      // In a real implementation, this would check each pending trade's status via Steam API
      const pendingTrades = trades.filter(trade => 
        trade.status === 'pending' || trade.status === 'sent'
      );

      for (const trade of pendingTrades) {
        if (trade.trade_id) {
          // Check trade status via Steam API
          try {
            const { data } = await supabase.functions.invoke('steam-api', {
              body: {
                action: 'getTradeOfferStatus',
                tradeOfferId: trade.trade_id
              }
            });

            if (data.success && data.status !== trade.status) {
              await updateTradeStatus(trade.id, data.status);
            }
          } catch (error) {
            console.error(`Failed to refresh trade ${trade.id}:`, error);
          }
        }
      }

      toast({
        title: 'Refresh Complete',
        description: 'Trade statuses have been updated'
      });
    } catch (error) {
      console.error('Error refreshing trades:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh trade statuses',
        variant: 'destructive'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <ArrowUpCircle className="h-4 w-4 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'declined':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'sent': return 'bg-blue-500';
      case 'accepted': return 'bg-green-500';
      case 'declined':
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getItemCount = (items: any) => {
    if (Array.isArray(items)) {
      return items.length;
    }
    if (typeof items === 'object' && items !== null) {
      return Object.keys(items).length;
    }
    return 0;
  };

  const filterTradesByStatus = (status: string[]) => {
    return trades.filter(trade => status.includes(trade.status));
  };

  const liveTrades = filterTradesByStatus(['pending', 'sent']);
  const canceledTrades = filterTradesByStatus(['declined', 'cancelled']);
  const completedTrades = filterTradesByStatus(['accepted']);

  const renderTradeCard = (trade: SteamTrade) => (
    <Card key={trade.id} className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {trade.trade_type === 'deposit' ? (
                <ArrowDownCircle className="h-5 w-5 text-green-500" />
              ) : (
                <ArrowUpCircle className="h-5 w-5 text-blue-500" />
              )}
              <div>
                <h3 className="font-semibold text-foreground">
                  {trade.trade_type === 'deposit' ? 'Deposit' : 'Withdrawal'} - ${trade.total_value.toFixed(2)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  User: {trade.profiles?.nickname || trade.profiles?.steam_username || 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Steam ID: {trade.profiles?.steam_id || 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Bot: {trade.steam_bots?.steam_username || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getStatusIcon(trade.status)}
              <Badge className={`${getStatusColor(trade.status)} text-white`}>
                {trade.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created: {new Date(trade.created_at).toLocaleString()}
              </span>
              {trade.status !== 'pending' && (
                <span className="text-sm text-muted-foreground">
                  Updated: {new Date(trade.updated_at).toLocaleString()}
                </span>
              )}
            </div>

            {trade.trade_id && (
              <p className="text-xs text-muted-foreground">
                Steam Trade ID: {trade.trade_id}
              </p>
            )}

            <div className="text-sm text-muted-foreground">
              Items: {getItemCount(trade.items)} item(s)
            </div>
          </div>

          <div className="flex gap-2">
            {trade.status === 'pending' && (
              <>
                <Button
                  onClick={() => updateTradeStatus(trade.id, 'sent')}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Mark as Sent
                </Button>
                <Button
                  onClick={() => updateTradeStatus(trade.id, 'cancelled')}
                  size="sm"
                  variant="destructive"
                >
                  Cancel
                </Button>
              </>
            )}

            {trade.status === 'sent' && (
              <>
                <Button
                  onClick={() => updateTradeStatus(trade.id, 'accepted')}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Mark Accepted
                </Button>
                <Button
                  onClick={() => updateTradeStatus(trade.id, 'declined')}
                  size="sm"
                  variant="destructive"
                >
                  Mark Declined
                </Button>
              </>
            )}

            <Button
              onClick={() => console.log('Trade details:', trade)}
              size="sm"
              variant="outline"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading trades...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpCircle className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-foreground">Steam Trades Management</h2>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refreshTradeStatuses}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {trades.filter(t => t.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-500">
              {trades.filter(t => t.status === 'sent').length}
            </div>
            <div className="text-sm text-muted-foreground">Sent</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">
              {trades.filter(t => t.status === 'accepted').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              ${trades.reduce((sum, t) => sum + t.total_value, 0).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Live Trades ({liveTrades.length})
          </TabsTrigger>
          <TabsTrigger value="canceled" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Canceled Trades ({canceledTrades.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed Trades ({completedTrades.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-6">
          <div className="grid gap-4">
            {liveTrades.length > 0 ? (
              liveTrades.map(renderTradeCard)
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Live Trades</h3>
                  <p className="text-muted-foreground">Live trades will appear here when they are pending or sent</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="canceled" className="mt-6">
          <div className="grid gap-4">
            {canceledTrades.length > 0 ? (
              canceledTrades.map(renderTradeCard)
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Canceled Trades</h3>
                  <p className="text-muted-foreground">Canceled or declined trades will appear here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4">
            {completedTrades.length > 0 ? (
              completedTrades.map(renderTradeCard)
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Completed Trades</h3>
                  <p className="text-muted-foreground">Successfully completed trades will appear here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
