
export interface CrateItem {
  id: string;
  name: string;
  image: string;
  value: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  dropChance?: number;
}

// Add compatibility alias for RustItem
export type RustItem = CrateItem & {
  dropChance: number; // Make dropChance required for RustItem
};
