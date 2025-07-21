
import { Button } from '@/components/ui/button';
import { ShoppingCart, DollarSign } from 'lucide-react';
import { DepositDialog } from './DepositDialog';
import { SulfurIcon } from '@/components/ui/SulfurIcon';

interface StoreHeaderProps {
  user: any;
  onDepositSuccess: () => void;
}

export const StoreHeader = ({ user, onDepositSuccess }: StoreHeaderProps) => {
  return (
    <div 
      className="relative h-64 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(/lovable-uploads/7936cbd2-b2dc-4414-b72c-62f7efe44b09.png)` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Banner Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <ShoppingCart className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-orbitron gaming-text-glow">
              PURESULFUR SKINS STORE
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-4">Buy the best Rust skins and build your collection</p>
          
          {/* Deposit Button - Only Money */}
          {user && (
            <div className="flex justify-center">
              <DepositDialog onDepositSuccess={onDepositSuccess} depositType="money">
                <Button className="gaming-button-enhanced font-bold px-6 py-3 text-lg">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Deposit Money
                </Button>
              </DepositDialog>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
