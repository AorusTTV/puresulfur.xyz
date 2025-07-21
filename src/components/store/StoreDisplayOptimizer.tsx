
import React, { useMemo } from 'react';
import { StoreItemCard } from './StoreItemCard';

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

interface OptimizedStoreItem extends StoreItem {
  displayCount: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
}

interface StoreDisplayOptimizerProps {
  items: StoreItem[];
  user: any;
  profile: any;
  onPurchase: (item: StoreItem) => void;
  searchTerm: string;
  priceFilter: string;
  purchasing?: boolean;
}

export const StoreDisplayOptimizer: React.FC<StoreDisplayOptimizerProps> = ({
  items,
  user,
  profile,
  onPurchase,
  searchTerm,
  priceFilter,
  purchasing = false
}) => {
  // For bot items, don't optimize/group them since each is unique with its own inventory_item_id
  const optimizedItems = useMemo(() => {
    console.log('[STORE-OPTIMIZER] Processing items for display optimization');
    
    // Don't group bot items since they're unique inventory items
    const botItems = items.filter(item => item.is_bot_item);
    const regularItems = items.filter(item => !item.is_bot_item);
    
    // Group only regular items by cleaned name
    const itemGroups = new Map<string, OptimizedStoreItem>();
    
    regularItems.forEach(item => {
      const cleanName = item.name.trim();
      
      if (itemGroups.has(cleanName)) {
        const existing = itemGroups.get(cleanName)!;
        existing.displayCount += 1;
        
        // Update price range
        existing.priceRange.min = Math.min(existing.priceRange.min, item.price);
        existing.priceRange.max = Math.max(existing.priceRange.max, item.price);
        
        // Recalculate average price
        existing.averagePrice = (existing.averagePrice * (existing.displayCount - 1) + item.price) / existing.displayCount;
      } else {
        itemGroups.set(cleanName, {
          ...item,
          displayCount: 1,
          averagePrice: item.price,
          priceRange: { min: item.price, max: item.price }
        });
      }
    });
    
    // Convert grouped regular items back to array and add bot items
    const groupedRegularItems = Array.from(itemGroups.values());
    const botItemsAsOptimized: OptimizedStoreItem[] = botItems.map(item => ({
      ...item,
      displayCount: 1,
      averagePrice: item.price,
      priceRange: { min: item.price, max: item.price }
    }));
    
    let optimized = [...groupedRegularItems, ...botItemsAsOptimized];
    
    // Apply price filter sorting
    if (priceFilter === 'high-to-low') {
      optimized = optimized.sort((a, b) => b.averagePrice - a.averagePrice);
    } else if (priceFilter === 'low-to-high') {
      optimized = optimized.sort((a, b) => a.averagePrice - b.averagePrice);
    }
    
    console.log('[STORE-OPTIMIZER] Optimized display:', {
      originalItems: items.length,
      optimizedItems: optimized.length,
      botItems: botItems.length,
      regularItems: regularItems.length,
      duplicatesRemoved: regularItems.length - groupedRegularItems.length
    });
    
    return optimized;
  }, [items, priceFilter]);

  // Filter optimized items based on search term
  const filteredOptimizedItems = useMemo(() => {
    if (!searchTerm) return optimizedItems;
    
    const filtered = optimizedItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log('[STORE-OPTIMIZER] Search filtering:', {
      searchTerm,
      beforeFilter: optimizedItems.length,
      afterFilter: filtered.length
    });
    
    return filtered;
  }, [optimizedItems, searchTerm]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredOptimizedItems.map((item) => (
        <StoreItemCard
          key={item.id}
          item={item}
          user={user}
          profile={profile}
          onPurchase={onPurchase}
          duplicateCount={item.displayCount}
          disabled={purchasing}
        />
      ))}
    </div>
  );
};
