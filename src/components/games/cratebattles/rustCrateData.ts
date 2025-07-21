
export interface RustItem {
  id: string;
  name: string;
  image: string;
  value: number;
  dropChance: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface RustCrate {
  id: string;
  name: string;
  price: number;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  items: number;
  minValue: number;
  maxValue: number;
  riskLevel: 'LOW RISK' | 'MIDDLE RISK' | 'HIGH RISK';
  description: string;
  contents: RustItem[];
}

export const rustCrates: RustCrate[] = [
  {
    id: 'toxic-crate',
    name: 'Toxic Crate',
    price: 2.00,
    image: '/lovable-uploads/d7d367f0-706f-42c6-9383-70be8477961c.png',
    rarity: 'rare',
    items: 4,
    minValue: 0.08,
    maxValue: 55.00,
    riskLevel: 'MIDDLE RISK',
    description: 'Toxic-themed items with green designs',
    contents: [
      { 
        id: 'atomic-lr', 
        name: 'Atomic LR', 
        image: '/lovable-uploads/d23780a6-d245-43e3-b0ea-8804ecfa51ab.png', 
        value: 4.65, 
        dropChance: 4, 
        rarity: 'rare'
      },
      { 
        id: 'slime-monster-sar', 
        name: 'Slime Monster SAR', 
        image: '/lovable-uploads/f3429fb7-707e-4529-8ac9-df3bf4081777.png', 
        value: 2.38, 
        dropChance: 25, 
        rarity: 'uncommon'
      },
      { 
        id: 'forest-raider-coffee-can-helmet', 
        name: 'Forest Raider Coffe Can Helmet', 
        image: '/lovable-uploads/c641c342-3c49-43e2-b3ac-38e6069e0ede.png', 
        value: 55.00, 
        dropChance: 1, 
        rarity: 'legendary'
      },
      { 
        id: 'green-cap', 
        name: 'Green Cap', 
        image: '/lovable-uploads/b254dbdd-0afc-4ce1-928b-fa7a851e52c4.png', 
        value: 0.08, 
        dropChance: 70, 
        rarity: 'common'
      }
    ]
  }
];

export const allRustCrates = rustCrates;
