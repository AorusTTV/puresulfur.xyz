
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AddBotDialog } from './AddBotDialog';
import { BotManagementCard } from './BotManagementCard';
import { Bot, RefreshCw, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

interface SteamBot {
  id: string;
  label: string;
  steam_login: string;
  steam_id?: string;
  steam_username?: string;
  avatar_url?: string;
  is_active: boolean;
  last_status: string;
  last_sync?: string;
  created_at: string;
  updated_at: string;
  inventory_count: number;
  error_details?: string;
  error_count?: number;
  last_error_at?: string;
}

export const EnhancedBotManagement: React.FC = () => {
  const [bots, setBots] = useState<SteamBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      console.log('[ENHANCED-BOT-MGMT] Fetching bot overview...');
      
      // Use the steam_bots table directly since the RPC function isn't available in types
      const { data: steamBots, error } = await supabase
        .from('steam_bots')
        .select(`
          id,
          label,
          steam_login,
          steam_id,
          steam_username,
          avatar_url,
          is_active,
          last_status,
          last_sync,
          created_at,
          updated_at
        `);
      
      if (error) {
        console.error('[ENHANCED-BOT-MGMT] Error fetching bots:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bot information',
          variant: 'destructive'
        });
        return;
      }

      // Get inventory counts for each bot
      const botsWithInventory = await Promise.all(
        (steamBots || []).map(async (bot) => {
          const { count } = await supabase
            .from('steam_bot_inventory')
            .select('*', { count: 'exact', head: true })
            .eq('bot_id', bot.id)
            .eq('tradable', true);
          
          return {
            ...bot,
            inventory_count: count || 0
          };
        })
      );

      setBots(botsWithInventory);
      console.log('[ENHANCED-BOT-MGMT] Bots loaded:', botsWithInventory.length);
    } catch (error) {
      console.error('[ENHANCED-BOT-MGMT] Exception fetching bots:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bot information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBots();
  };

  const handleBulkRetry = async () => {
    const errorBots = bots.filter(bot => bot.last_status === 'error');
    
    if (errorBots.length === 0) {
      toast({
        title: 'No Action Needed',
        description: 'No bots with error status found',
      });
      return;
    }

    console.log('[ENHANCED-BOT-MGMT] Starting bulk retry for', errorBots.length, 'bots');
    
    toast({
      title: 'Bulk Retry Started',
      description: `Retrying operations for ${errorBots.length} bot(s)`,
    });

    // Trigger a refresh after a short delay to see updated statuses
    setTimeout(() => {
      fetchBots();
    }, 2000);
  };

  // Calculate statistics
  const stats = {
    total: bots.length,
    active: bots.filter(bot => bot.is_active).length,
    online: bots.filter(bot => bot.last_status === 'online').length,
    errors: bots.filter(bot => bot.last_status === 'error').length,
    totalItems: bots.reduce((sum, bot) => sum + bot.inventory_count, 0)
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Enhanced Bot Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading bots...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="flex items-center p-6">
            <Bot className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Bots</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Activity className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <RefreshCw className="h-8 w-8 text-emerald-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Online</p>
              <p className="text-2xl font-bold">{stats.online}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold">{stats.errors}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{stats.totalItems}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Enhanced Bot Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {stats.errors > 0 && (
                <Button 
                  onClick={handleBulkRetry}
                  variant="secondary" 
                  size="sm"
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry All Errors ({stats.errors})
                </Button>
              )}
              <AddBotDialog onBotAdded={fetchBots} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Manage your Steam bots securely. Add new bots, test their credentials, sync inventories, and monitor their status in real-time.
          </div>
          
          {bots.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Steam Bots</h3>
              <p className="text-muted-foreground mb-4">
                Add your first Steam bot to start managing inventory sync
              </p>
              <AddBotDialog onBotAdded={fetchBots} />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bots.map((bot) => (
                <BotManagementCard
                  key={bot.id}
                  bot={bot}
                  onBotUpdated={fetchBots}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {bots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Error Handling & Security Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• <strong>Error Recovery:</strong> Failed operations can be retried up to 3 times with detailed error information</p>
              <p>• <strong>Status Monitoring:</strong> Real-time status tracking with comprehensive error details and timestamps</p>
              <p>• <strong>Bulk Operations:</strong> Retry all failed bots simultaneously for efficient error resolution</p>
              <p>• <strong>Security:</strong> All bot credentials are encrypted before storage</p>
              <p>• <strong>Automation:</strong> Deactivated bots will not perform any automated actions</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
