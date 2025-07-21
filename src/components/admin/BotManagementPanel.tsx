
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Power, 
  PowerOff, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Activity,
  Database
} from 'lucide-react';

interface SteamBot {
  id: string;
  steam_username: string;
  steam_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_sync?: string;
  inventory_count: number;
}

interface BotManagementResponse {
  success: boolean;
  bots?: SteamBot[];
  error?: string;
}

interface BotActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const BotManagementPanel: React.FC = () => {
  const [bots, setBots] = useState<SteamBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      console.log('[BOT-MGMT] Fetching bot overview...');
      
      const { data, error } = await supabase.rpc('get_bot_management_overview' as any);
      
      if (error) {
        console.error('[BOT-MGMT] Error fetching bots:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bot information',
          variant: 'destructive'
        });
        return;
      }

      const response = data as BotManagementResponse;
      
      if (response?.success) {
        setBots(response.bots || []);
        console.log('[BOT-MGMT] Bots loaded:', response.bots?.length || 0);
      } else {
        console.error('[BOT-MGMT] Bot fetch failed:', response?.error);
        toast({
          title: 'Error',
          description: response?.error || 'Failed to load bot information',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('[BOT-MGMT] Exception fetching bots:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bot information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBotStatus = async (botId: string, currentStatus: boolean) => {
    setActionLoading(botId);
    try {
      console.log('[BOT-MGMT] Toggling bot status:', { botId, newStatus: !currentStatus });
      
      const { data, error } = await supabase.rpc('set_bot_active_status' as any, {
        p_bot_id: botId,
        p_is_active: !currentStatus
      });
      
      if (error) {
        console.error('[BOT-MGMT] Error toggling bot status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update bot status',
          variant: 'destructive'
        });
        return;
      }

      const response = data as BotActionResponse;

      if (response?.success) {
        toast({
          title: 'Success',
          description: response.message || 'Bot status updated successfully'
        });
        fetchBots(); // Refresh the list
      } else {
        toast({
          title: 'Error',
          description: response?.error || 'Failed to update bot status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('[BOT-MGMT] Exception toggling bot status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bot status',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteBot = async (botId: string) => {
    if (!confirm('Are you sure you want to delete this bot? This action cannot be undone.')) {
      return;
    }

    setActionLoading(botId);
    try {
      console.log('[BOT-MGMT] Deleting bot:', botId);
      
      const { data, error } = await supabase.rpc('delete_steam_bot' as any, {
        p_bot_id: botId
      });
      
      if (error) {
        console.error('[BOT-MGMT] Error deleting bot:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete bot',
          variant: 'destructive'
        });
        return;
      }

      const response = data as BotActionResponse;

      if (response?.success) {
        toast({
          title: 'Success',
          description: response.message || 'Bot deleted successfully'
        });
        fetchBots(); // Refresh the list
      } else {
        toast({
          title: 'Error',
          description: response?.error || 'Failed to delete bot',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('[BOT-MGMT] Exception deleting bot:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bot',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Bot Management
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Bot Management
          </CardTitle>
          <Button onClick={fetchBots} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {bots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No Steam bots found</p>
            <p className="text-sm">Add bots to manage inventory sync</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bots.map((bot) => (
              <div 
                key={bot.id} 
                className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{bot.steam_username}</h3>
                        <Badge variant={bot.is_active ? 'default' : 'secondary'}>
                          {bot.is_active ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Steam ID: {bot.steam_id}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          {bot.inventory_count} items
                        </span>
                        {bot.last_sync && (
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            Last sync: {new Date(bot.last_sync).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => toggleBotStatus(bot.id, bot.is_active)}
                      disabled={actionLoading === bot.id}
                      variant={bot.is_active ? 'outline' : 'default'}
                      size="sm"
                    >
                      {actionLoading === bot.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : bot.is_active ? (
                        <>
                          <PowerOff className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => deleteBot(bot.id)}
                      disabled={actionLoading === bot.id}
                      variant="destructive"
                      size="sm"
                    >
                      {actionLoading === bot.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
