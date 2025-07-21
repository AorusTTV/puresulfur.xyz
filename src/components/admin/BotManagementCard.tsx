
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  Power, 
  PowerOff, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Activity,
  Database,
  Edit,
  RotateCcw
} from 'lucide-react';

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

interface BotManagementCardProps {
  bot: SteamBot;
  onBotUpdated: () => void;
}

export const BotManagementCard: React.FC<BotManagementCardProps> = ({ bot, onBotUpdated }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'syncing': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-3 w-3" />;
      case 'syncing': return <RefreshCw className="h-3 w-3 animate-spin" />;
      case 'error': return <AlertCircle className="h-3 w-3" />;
      case 'offline': return <XCircle className="h-3 w-3" />;
      default: return <XCircle className="h-3 w-3" />;
    }
  };

  const handleOperation = async (operation: string, operationFn: () => Promise<void>) => {
    setLoading(operation);
    const startTime = Date.now();
    
    try {
      await operationFn();
      const duration = Date.now() - startTime;
      
      console.log(`[BOT-CARD] ${operation} completed successfully in ${duration}ms`);
      
      // Reset retry count on success
      if (operation === 'sync') {
        setRetryCount(0);
      }
      
      onBotUpdated();
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[BOT-CARD] ${operation} failed after ${duration}ms:`, error);
      
      // Increment retry count for sync operations
      if (operation === 'sync') {
        setRetryCount(prev => prev + 1);
      }
      
      // Enhanced error message with more context
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: `${operation.charAt(0).toUpperCase() + operation.slice(1)} Failed`,
        description: `${errorMessage}${retryCount > 0 ? ` (Attempt ${retryCount + 1})` : ''}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  const toggleBotStatus = async () => {
    await handleOperation('toggle', async () => {
      console.log('[BOT-CARD] Toggling bot status:', { botId: bot.id, currentActive: bot.is_active });

      const { data, error } = await supabase.functions.invoke('steam-bot-manager', {
        body: {
          action: 'toggle_status',
          botId: bot.id,
          isActive: !bot.is_active
        }
      });

      if (error) {
        console.error('[BOT-CARD] Toggle error:', error);
        throw new Error(error.message || 'Failed to update bot status');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to update bot status');
      }

      toast({
        title: 'Success',
        description: data.message || 'Bot status updated successfully'
      });
    });
  };

  const syncInventory = async () => {
    await handleOperation('sync', async () => {
      console.log('[BOT-CARD] Syncing bot inventory:', bot.id);

      const { data, error } = await supabase.functions.invoke('steam-bot-manager', {
        body: {
          action: 'sync_inventory',
          botId: bot.id,
          retryAttempt: retryCount
        }
      });

      if (error) {
        console.error('[BOT-CARD] Sync error:', error);
        throw new Error(error.message || 'Failed to sync bot inventory');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to sync bot inventory');
      }

      toast({
        title: 'Sync Started',
        description: data.message || 'Bot inventory sync initiated successfully'
      });
    });
  };

  const retryLastOperation = async () => {
    console.log('[BOT-CARD] Retrying last failed operation for bot:', bot.id);
    
    // For now, we'll retry the sync operation as it's the most common failure
    await syncInventory();
  };

  const deleteBot = async () => {
    if (!confirm(`Are you sure you want to delete "${bot.label}"? This action cannot be undone and will remove all associated inventory data.`)) {
      return;
    }

    await handleOperation('delete', async () => {
      console.log('[BOT-CARD] Deleting bot:', bot.id);

      const { data, error } = await supabase.functions.invoke('steam-bot-manager', {
        body: {
          action: 'delete_bot',
          botId: bot.id
        }
      });

      if (error) {
        console.error('[BOT-CARD] Delete error:', error);
        throw new Error(error.message || 'Failed to delete bot');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete bot');
      }

      toast({
        title: 'Bot Deleted',
        description: data.message || 'Bot and all associated data removed successfully'
      });
    });
  };

  const shouldShowRetryButton = bot.last_status === 'error' && retryCount < 3;
  const isMaxRetriesReached = retryCount >= 3;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {bot.avatar_url ? (
              <img 
                src={bot.avatar_url} 
                alt={bot.steam_username || bot.label}
                className="w-12 h-12 rounded-full border-2 border-border"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{bot.label}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {bot.steam_username || bot.steam_login}
              </p>
              {bot.steam_id && (
                <p className="text-xs text-muted-foreground">
                  ID: {bot.steam_id}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={bot.is_active ? 'default' : 'secondary'}>
              {bot.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Badge 
              className={`${getStatusColor(bot.last_status)} text-white`}
            >
              {getStatusIcon(bot.last_status)}
              <span className="ml-1 capitalize">{bot.last_status}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            {bot.inventory_count || 0} items
          </div>
          {bot.last_sync && (
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Last sync: {new Date(bot.last_sync).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Error Details Section */}
        {bot.last_status === 'error' && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error Details
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  {bot.error_details || 'An unknown error occurred during the last operation'}
                </p>
                {bot.error_count && bot.error_count > 1 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    Failed {bot.error_count} attempts
                  </p>
                )}
                {bot.last_error_at && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    Last error: {new Date(bot.last_error_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Retry Warning */}
        {isMaxRetriesReached && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Maximum retry attempts reached. Please check bot configuration.
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={toggleBotStatus}
            disabled={loading === 'toggle'}
            variant={bot.is_active ? 'outline' : 'default'}
            size="sm"
          >
            {loading === 'toggle' ? (
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
            onClick={syncInventory}
            disabled={loading === 'sync' || !bot.is_active}
            variant="outline"
            size="sm"
          >
            {loading === 'sync' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                Sync
              </>
            )}
          </Button>

          {/* Retry Button - Only show for error status and under retry limit */}
          {shouldShowRetryButton && (
            <Button
              onClick={retryLastOperation}
              disabled={loading === 'retry'}
              variant="secondary"
              size="sm"
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            >
              {loading === 'retry' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Retry ({3 - retryCount} left)
                </>
              )}
            </Button>
          )}
          
          <Button
            onClick={deleteBot}
            disabled={loading === 'delete'}
            variant="destructive"
            size="sm"
          >
            {loading === 'delete' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </>
            )}
          </Button>
        </div>

        {/* Retry count indicator */}
        {retryCount > 0 && bot.last_status !== 'error' && (
          <div className="mt-2 text-xs text-muted-foreground">
            Previous attempts: {retryCount}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
