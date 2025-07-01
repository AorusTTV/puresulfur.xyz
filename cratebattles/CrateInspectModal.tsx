
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRarityColor } from './crateUtils';

interface CrateInspectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crate: any;
}

export const CrateInspectModal: React.FC<CrateInspectModalProps> = ({
  open,
  onOpenChange,
  crate
}) => {
  if (!crate || !crate.contents) return null;

  // Sort items by drop chance (rarest first)
  const sortedItems = [...crate.contents].sort((a, b) => a.dropChance - b.dropChance);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95%] max-h-[80vh] bg-[#0d0d0e] border-[#333] overflow-hidden">
        <DialogHeader className="pb-4 border-b border-[#333]">
          <div className="flex items-center space-x-4">
            <img 
              src={crate.image} 
              alt={crate.name}
              className="w-16 h-16 object-cover rounded border border-[#333]"
            />
            <div>
              <DialogTitle className="text-2xl font-bold text-white mb-1">
                {crate.name}
              </DialogTitle>
              <div className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                  alt="Sulfur" 
                  className="h-5 w-5" 
                />
                <span className="text-xl font-bold text-primary">
                  {crate.price?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <h3 className="text-lg font-bold text-red-400 mb-4 tracking-wide">
            ITEMS IN THIS CRATE
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto">
            {sortedItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className={`
                  relative bg-[#1a1a1a] border rounded-lg p-4 
                  ${getRarityColor(item.rarity)} 
                  border-opacity-50 hover:border-opacity-100 transition-all duration-200
                `}
              >
                {/* Drop Chance Badge */}
                <div className="absolute top-2 right-2">
                  <Badge 
                    className="bg-black/70 text-white text-xs font-bold px-2 py-1"
                  >
                    {item.dropChance?.toFixed(1) || '0.0'}%
                  </Badge>
                </div>

                {/* Item Image */}
                <div className="mb-3">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-20 object-contain rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>

                {/* Item Info */}
                <div className="text-center">
                  <h4 className="text-white font-medium text-sm mb-2 truncate" title={item.name}>
                    {item.name}
                  </h4>
                  
                  <div className="flex items-center justify-center space-x-1">
                    <img 
                      src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                      alt="Sulfur" 
                      className="h-4 w-4" 
                    />
                    <span className="text-primary font-bold text-sm">
                      {item.value?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-4 border-t border-[#333]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-gray-400 text-sm">Total Items</div>
                <div className="font-bold text-white text-lg">
                  {crate.contents?.length || 0}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Value Range</div>
                <div className="font-bold text-green-400 text-lg">
                  ${Math.min(...crate.contents.map((i: any) => i.value)).toFixed(2)} - ${Math.max(...crate.contents.map((i: any) => i.value)).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Expected Value</div>
                <div className="font-bold text-blue-400 text-lg">
                  ${(crate.contents.reduce((sum: number, item: any) => sum + (item.value * item.dropChance / 100), 0)).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#333]">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-primary hover:bg-primary/80"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
