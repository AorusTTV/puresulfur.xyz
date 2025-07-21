
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles } from 'lucide-react';

interface CrateItem {
  id: string;
  name: string;
  price: number;
  image: string;
  rarity: string;
  rarityColor: string;
}

interface DailyCaseResultProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wonItem: CrateItem | null;
  onClaim: () => void;
}

export const DailyCaseResult: React.FC<DailyCaseResultProps> = ({
  open,
  onOpenChange,
  wonItem,
  onClaim
}) => {
  if (!wonItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center text-xl">
            <Gift className="mr-2 h-6 w-6 text-primary" />
            Daily Case Opened!
          </DialogTitle>
          <DialogDescription className="text-center">
            Congratulations! You won:
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-6">
          {/* Animated Item Display */}
          <div className="relative animate-scale-in">
            <div className={`w-32 h-32 rounded-xl bg-gradient-to-br ${wonItem.rarityColor} p-1 shadow-lg`}>
              <div className="w-full h-full bg-card/90 rounded-lg flex items-center justify-center">
                <img 
                  src={wonItem.image} 
                  alt={wonItem.name}
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-6 w-6 text-accent animate-pulse" />
            </div>
          </div>

          {/* Item Details */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-foreground">{wonItem.name}</h3>
            <Badge className={`bg-gradient-to-r ${wonItem.rarityColor} text-white border-0`}>
              {wonItem.rarity}
            </Badge>
            <div className="flex items-center justify-center text-primary text-lg font-medium">
              <img 
                src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                alt="Currency" 
                className="h-5 w-5 mr-1" 
              />
              {wonItem.price.toFixed(2)}
            </div>
          </div>

          {/* Claim Button */}
          <Button
            onClick={onClaim}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Gift className="mr-2 h-4 w-4" />
            Claim Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
