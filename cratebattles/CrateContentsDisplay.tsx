
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Eye, Percent, DollarSign } from 'lucide-react';
import { rustCrates, RustItem } from './rustCrateData';
import { getRarityColor, getRarityIcon } from './crateUtils';

interface CrateContentsDisplayProps {
  crateId: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const CrateContentsDisplay: React.FC<CrateContentsDisplayProps> = ({ 
  crateId, 
  isExpanded = false, 
  onToggle 
}) => {
  // Find the crate data
  const crate = rustCrates.find(c => c.id === crateId);
  
  if (!crate || !crate.contents) {
    return null;
  }

  // Sort items by drop chance (rarest first)
  const sortedItems = [...crate.contents].sort((a, b) => a.dropChance - b.dropChance);

  return (
    <div className="mt-3">
      <Button
        onClick={onToggle}
        variant="ghost"
        size="sm"
        className="w-full flex items-center justify-between p-2 h-auto text-gray-300 hover:text-white hover:bg-white/10"
      >
        <div className="flex items-center space-x-2">
          <Eye className="h-4 w-4" />
          <span className="text-sm">View Contents ({crate.contents.length} items)</span>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isExpanded && (
        <Card className="mt-2 bg-black/40 border-gray-600/50 p-3 max-h-60 overflow-y-auto">
          <div className="space-y-2">
            {sortedItems.map((item, index) => {
              return (
                <div
                  key={`${item.id}-${index}`}
                  className={`flex items-center justify-between p-2 rounded border ${getRarityColor(item.rarity)} bg-opacity-20`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-8 h-8 object-cover rounded border border-gray-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-white truncate">
                          {item.name}
                        </span>
                        {getRarityIcon(item.rarity)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="flex items-center space-x-1 text-green-400">
                      <DollarSign className="h-3 w-3" />
                      <span className="text-sm font-bold">
                        {item.value.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Percent className="h-3 w-3 text-blue-400" />
                      <span className="text-xs text-blue-400 font-medium">
                        {item.dropChance.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Summary Stats */}
          <div className="mt-3 pt-3 border-t border-gray-600/50">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center">
                <div className="text-gray-400">Total Value Range</div>
                <div className="font-bold text-green-400">
                  ${Math.min(...crate.contents.map(i => i.value)).toFixed(2)} - ${Math.max(...crate.contents.map(i => i.value)).toFixed(2)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Average Value</div>
                <div className="font-bold text-blue-400">
                  ${(crate.contents.reduce((sum, item) => sum + (item.value * item.dropChance / 100), 0)).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
