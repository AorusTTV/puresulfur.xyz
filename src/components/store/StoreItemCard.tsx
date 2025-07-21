
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Bot, Package } from 'lucide-react';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  rarity: string;
  category: string;
  in_stock: number;
  is_bot_item?: boolean;
  inventory_item_id?: string;
}

interface StoreItemCardProps {
  item: StoreItem;
  user: any;
  profile: any;
  onPurchase: (item: StoreItem) => void;
  duplicateCount?: number;
  disabled?: boolean;
}

export const StoreItemCard: React.FC<StoreItemCardProps> = ({
  item,
  user,
  profile,
  onPurchase,
  duplicateCount = 1,
  disabled = false
}) => {
  const canAfford = profile && profile.balance >= item.price;
  const isLoggedIn = !!user;
  const hasTradeUrl = profile?.steam_trade_url && profile.steam_trade_url.trim() !== '';
  const needsTradeUrl = item.is_bot_item && !hasTradeUrl;
  
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'covert': return 'bg-red-500';
      case 'classified': return 'bg-pink-500';
      case 'restricted': return 'bg-purple-500';
      case 'mil-spec': return 'bg-blue-500';
      case 'industrial': return 'bg-cyan-500';
      case 'consumer': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getButtonText = () => {
    if (disabled) return 'Processing...';
    if (!isLoggedIn) return 'Login to Buy';
    if (!canAfford) return 'Insufficient Balance';
    if (item.in_stock <= 0) return 'Out of Stock';
    if (needsTradeUrl) return 'Trade URL Required';
    return 'Purchase';
  };

  const isDisabled = disabled || !isLoggedIn || !canAfford || item.in_stock <= 0 || needsTradeUrl;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-300 group">
      <CardContent className="p-4">
        {/* Item Image */}
        <div className="aspect-square rounded-lg mb-3 flex items-center justify-center bg-secondary/20 overflow-hidden">
          <img 
            src={item.image_url} 
            alt={item.name} 
            className="w-20 h-20 object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
        </div>
        
        {/* Item Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
              {item.name}
            </h3>
            {item.is_bot_item && (
              <Bot className="h-4 w-4 text-blue-400 flex-shrink-0" />
            )}
          </div>
          
          {/* Rarity Badge */}
          <Badge 
            className={`${getRarityColor(item.rarity)} text-white text-xs`}
          >
            {item.rarity}
          </Badge>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-primary font-bold">
              <DollarSign className="h-4 w-4 mr-1" />
              {item.price.toFixed(2)}
            </div>
            
            {/* Stock info */}
            <div className="flex items-center text-xs text-muted-foreground">
              <Package className="h-3 w-3 mr-1" />
              {duplicateCount > 1 ? `${duplicateCount}x` : `${item.in_stock} left`}
            </div>
          </div>

          {/* Item Type Badge */}
          {item.is_bot_item && (
            <Badge variant="outline" className="text-xs">
              Steam Item
            </Badge>
          )}
          
          {/* Purchase Button */}
          <Button
            onClick={() => onPurchase(item)}
            disabled={isDisabled}
            className="w-full mt-3"
            size="sm"
          >
            {getButtonText()}
          </Button>
          
          {/* Trade URL Warning for bot items */}
          {needsTradeUrl && isLoggedIn && (
            <p className="text-xs text-yellow-400 text-center">
              Add Steam Trade URL in Profile
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
