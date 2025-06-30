
import { RustItem } from './rustCrateData';

export interface WeightedItem extends RustItem {
  id: string;
  originalIndex: number;
}

// Create a randomized weighted array of items based on drop chances
export const createRandomizedWeightedItems = (items: RustItem[]): WeightedItem[] => {
  const weightedItems: WeightedItem[] = [];
  
  items.forEach((item, originalIndex) => {
    // Add multiple copies based on drop chance (higher chance = more copies)
    const copies = Math.max(1, Math.round((item.dropChance / 100) * 20));
    for (let i = 0; i < copies; i++) {
      weightedItems.push({
        ...item,
        id: `${item.id}-${i}`,
        originalIndex
      });
    }
  });
  
  // Shuffle the array for randomness
  for (let i = weightedItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [weightedItems[i], weightedItems[j]] = [weightedItems[j], weightedItems[i]];
  }
  
  return weightedItems;
};

// Create a reel with the winning item placed exactly in the center
export const createReelAroundWinningItem = (items: RustItem[], winningItem: RustItem): WeightedItem[] => {
  const reelLength = 200; // Total reel length
  const centerIndex = Math.floor(reelLength / 2); // Center position where animation will stop
  
  console.log('Creating reel around winning item:', winningItem.name);
  
  // Create array of weighted items for filler positions
  const fillerItems: WeightedItem[] = [];
  
  // Generate filler items based on drop chances
  items.forEach((item, originalIndex) => {
    const slots = Math.max(1, Math.round((item.dropChance / 100) * 50)); // Reduced slots for filler
    for (let i = 0; i < slots; i++) {
      fillerItems.push({
        ...item,
        id: `${item.id}-filler-${i}`,
        originalIndex
      });
    }
  });
  
  // Shuffle filler items
  for (let i = fillerItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fillerItems[i], fillerItems[j]] = [fillerItems[j], fillerItems[i]];
  }
  
  // Build final reel with winning item in center
  const finalReel: WeightedItem[] = [];
  
  for (let i = 0; i < reelLength; i++) {
    if (i === centerIndex) {
      // Place winning item exactly in center
      finalReel.push({
        ...winningItem,
        id: `${winningItem.id}-winner`,
        originalIndex: items.findIndex(item => item.id === winningItem.id)
      });
    } else {
      // Use filler items for all other positions
      const fillerIndex = i % fillerItems.length;
      finalReel.push({
        ...fillerItems[fillerIndex],
        id: `${fillerItems[fillerIndex].id}-pos-${i}`
      });
    }
  }
  
  console.log(`Reel created: ${reelLength} items with winner "${winningItem.name}" at index ${centerIndex}`);
  
  return finalReel;
};

export const selectWinningItem = (items: RustItem[]): RustItem => {
  const randomValue = Math.random() * 100;
  let currentChance = 0;
  
  for (const item of items) {
    currentChance += item.dropChance;
    if (randomValue <= currentChance) {
      return item;
    }
  }
  
  return items[0]; // fallback
};
