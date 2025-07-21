
import { Package, Shield } from 'lucide-react';

interface InventoryHeaderProps {
  uniqueItemsCount: number;
  totalItemsCount: number;
}

export const InventoryHeader = ({ uniqueItemsCount, totalItemsCount }: InventoryHeaderProps) => {
  return (
    <div 
      className="relative h-96 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/lovable-uploads/5953e60c-09c6-409e-9a8f-01cedde88985.png')`
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-orbitron mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary gaming-text-glow">
              STEAM
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary gaming-text-glow">
              INVENTORY
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Your connected Steam account Rust skins
          </p>
          <div className="flex items-center justify-center gap-6 text-muted-foreground">
            <div className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-primary" />
              {uniqueItemsCount} Unique Items
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-accent" />
              {totalItemsCount} Total Items
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
