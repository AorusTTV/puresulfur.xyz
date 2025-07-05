
import { useState, useEffect } from 'react';
import { RustItem } from './rustCrateData';
import { createRandomizedWeightedItems, WeightedItem } from './carouselUtils';

interface UseCarouselItemsProps {
  items: RustItem[];
  crateId: string;
  isAnimating: boolean;
}

export const useCarouselItems = ({ items, crateId, isAnimating }: UseCarouselItemsProps) => {
  const [randomizedItems, setRandomizedItems] = useState<WeightedItem[]>(() => 
    createRandomizedWeightedItems(items)
  );

  // Create extended array for smooth carousel effect
  const extendedItems = [...randomizedItems, ...randomizedItems, ...randomizedItems, ...randomizedItems];

  // Reset when crate changes
  useEffect(() => {
    setRandomizedItems(createRandomizedWeightedItems(items));
  }, [crateId, items]);

  // Regenerate items when animation starts
  useEffect(() => {
    if (isAnimating) {
      setRandomizedItems(createRandomizedWeightedItems(items));
    }
  }, [isAnimating, items]);

  return {
    randomizedItems,
    extendedItems
  };
};
