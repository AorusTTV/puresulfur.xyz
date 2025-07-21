
import { Button } from '@/components/ui/button';
import { Package, RefreshCw, Zap } from 'lucide-react';

interface InventoryEmptyStateProps {
  hasItems: boolean;
  onSync: () => void;
  isLoading: boolean;
}

export const InventoryEmptyState = ({ hasItems, onSync, isLoading }: InventoryEmptyStateProps) => {
  if (hasItems) {
    return (
      <div className="text-center py-16">
        <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
        <div className="text-muted-foreground text-xl mb-4">
          No items match your current filters
        </div>
        <p className="text-muted-foreground mb-6">
          Try adjusting your search or filter settings to see more items.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
      <div className="text-muted-foreground text-xl mb-4">
        No Real Steam Items Found
      </div>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Your REAL Steam inventory appears to be empty or hasn't been synced yet. 
        Click the sync button to fetch your actual Steam items with Hebrew pricing.
      </p>
      <div className="space-y-4">
        <Button 
          onClick={onSync}
          disabled={isLoading}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Syncing Real Inventory...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Sync Real Steam Inventory
            </>
          )}
        </Button>
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Features of real inventory sync:</p>
          <ul className="list-disc list-inside space-y-1 text-left max-w-sm mx-auto">
            <li>Connects to your actual Steam account</li>
            <li>Fetches real Rust skins from Steam API</li>
            <li>Applies Hebrew pricing (USD × 1.495)</li>
            <li>Real-time updates and notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
