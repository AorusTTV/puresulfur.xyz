
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, RefreshCw, AlertTriangle, CheckCircle, Info, Shield, Settings } from 'lucide-react';
import { useSteamInventorySync } from '@/hooks/useSteamInventorySync';

export const SteamInventoryStatus: React.FC = () => {
  const { syncInventory, loading, lastSync, itemCount, debugInfo } = useSteamInventorySync();

  const handleSyncClick = () => {
    syncInventory();
  };

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="h-5 w-5 text-blue-400" />
              <Shield className="h-3 w-3 text-green-400 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Enhanced Steam Bot Inventory</span>
                {itemCount > 0 ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {itemCount} items
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Syncing...
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  Hebrew Pricing
                </Badge>
              </div>
              {lastSync && (
                <p className="text-xs text-muted-foreground">
                  Last sync: {lastSync.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleSyncClick}
            disabled={loading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
        
        {itemCount === 0 && !loading && !lastSync && (
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-600">
                <p className="font-medium">Enhanced sync in progress</p>
                <p className="text-xs mt-1">
                  Steam inventory is being synchronized with enhanced privacy validation and error handling.
                </p>
              </div>
            </div>
          </div>
        )}

        {debugInfo && (
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-600">
                <p className="font-medium">Enhanced Sync Information</p>
                <div className="text-xs mt-1 space-y-1">
                  <p>Steam ID: {debugInfo.steamId}</p>
                  {debugInfo.itemsProcessed && (
                    <p>Items Processed: {debugInfo.itemsProcessed}</p>
                  )}
                  {debugInfo.debugInfo?.privacyValidation && (
                    <p className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Privacy Validation: {debugInfo.debugInfo.privacyValidation}
                    </p>
                  )}
                  {debugInfo.debugInfo?.errorHandling && (
                    <p className="flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      Error Handling: {debugInfo.debugInfo.errorHandling}
                    </p>
                  )}
                  {debugInfo.debugInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">Enhanced Debug Data</summary>
                      <pre className="mt-1 text-xs bg-black/20 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(debugInfo.debugInfo, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced troubleshooting section */}
        <div className="mt-3 p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">Common Issues & Solutions:</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>HTTP_400 Error:</strong> Steam profile or inventory is private</li>
              <li>• <strong>Rate Limit:</strong> Too many requests - wait 5 minutes</li>
              <li>• <strong>Access Denied:</strong> Set Steam profile to public</li>
              <li>• <strong>No Items Found:</strong> Inventory may be empty or trade-locked</li>
            </ul>
            <p className="mt-2 text-xs">
              Need help? Check your Steam Privacy Settings at: 
              <span className="text-blue-400 ml-1">steamcommunity.com/my/edit/settings</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
