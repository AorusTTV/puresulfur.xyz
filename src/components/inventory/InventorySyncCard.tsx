
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Zap, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InventorySyncCardProps {
  onSync: () => void;
  isLoading: boolean;
}

export const InventorySyncCard = ({ onSync, isLoading }: InventorySyncCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Activity className="h-5 w-5" />
          Real Steam Inventory Sync
          <Badge variant="outline" className="ml-auto">
            <Zap className="h-3 w-3 mr-1" />
            Hebrew Pricing
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Real Steam Web API integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Hebrew pricing (USD × 1.495)</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Real-time inventory updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Automatic store integration</span>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              This will fetch your REAL Steam inventory using the Steam Web API and sync it to the store with Hebrew pricing
            </p>
          </div>
          
          <Button 
            onClick={onSync}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing Real Steam Inventory...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Real Steam Inventory
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
