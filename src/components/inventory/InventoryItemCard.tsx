
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Shield } from 'lucide-react';

interface SteamInventoryItem {
  id: string;
  steam_item_id: string;
  market_hash_name: string;
  icon_url: string;
  tradable: boolean;
  marketable: boolean;
  exterior: string;
  rarity_color: string;
  bot_id: string;
  last_synced: string;
  itemIds: string[];
  totalQuantity: number;
}

interface InventoryItemCardProps {
  item: SteamInventoryItem;
  onDepositSkin: (item: SteamInventoryItem) => void;
}

export const InventoryItemCard = ({ item, onDepositSkin }: InventoryItemCardProps) => {
  const getRarityColorStyle = (rarityColor: string) => {
    if (!rarityColor) return {};
    return {
      borderColor: rarityColor,
      boxShadow: `0 0 10px ${rarityColor}40, 0 0 20px ${rarityColor}20, 0 0 30px ${rarityColor}10`
    };
  };

  return (
    <Card 
      className="bg-card/60 border-border/50 backdrop-blur-sm hover:border-primary/70 transition-all duration-300 cursor-pointer hover:scale-105 group relative gaming-card-enhanced h-full"
      style={getRarityColorStyle(item.rarity_color)}
    >
      {/* STUCK Label for duplicates - Green background */}
      {item.totalQuantity > 1 && (
        <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-2 py-1 rounded-md shadow-lg gaming-glow">
          STUCK x{item.totalQuantity}
        </div>
      )}
      
      <CardContent className="p-6 h-full flex flex-col">
        <div className="aspect-square rounded-xl mb-4 flex items-center justify-center group-hover:scale-105 transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-secondary to-muted">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <img 
            src={item.icon_url} 
            alt={item.market_hash_name} 
            className="w-32 h-32 object-cover drop-shadow-lg relative z-10"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          {item.tradable && <Shield className="absolute top-2 left-2 h-4 w-4 text-accent" />}
        </div>
        
        <h3 className="font-semibold text-foreground text-base mb-3 line-clamp-2 min-h-[3rem]">
          {item.market_hash_name}
        </h3>
        
        <div className="flex flex-col gap-3 mb-4 flex-grow">
          {item.exterior && (
            <div className="w-full">
              <Badge 
                variant="outline" 
                className="text-xs w-full justify-center py-2 px-3 min-h-[2rem] whitespace-normal text-center leading-tight" 
                style={{ 
                  color: item.rarity_color, 
                  borderColor: item.rarity_color,
                  backgroundColor: `${item.rarity_color}15`
                }}
              >
                {item.exterior}
              </Badge>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {item.tradable && (
              <Badge variant="default" className="text-xs flex-1 justify-center min-w-0">
                Tradable
              </Badge>
            )}
            {item.marketable && (
              <Badge variant="secondary" className="text-xs flex-1 justify-center min-w-0">
                Marketable
              </Badge>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-4">
          Steam ID: {item.steam_item_id}
          {item.totalQuantity > 1 && (
            <div className="mt-1 text-primary font-medium">
              Quantity: {item.totalQuantity}
            </div>
          )}
        </div>

        <Button 
          onClick={() => onDepositSkin(item)}
          disabled={!item.tradable}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:opacity-50 disabled:cursor-not-allowed gaming-button-enhanced mt-auto"
        >
          <Upload className="mr-2 h-4 w-4" />
          {item.tradable ? 'DEPOSIT SKIN' : 'Not Tradable'}
        </Button>
      </CardContent>
    </Card>
  );
};
