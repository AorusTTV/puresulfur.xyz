/**  Rust crate + item typings  */
export interface RustItem {
  id: string;
  name: string;
  image: string;
  value: number;
  dropChance: number;          // 0-100 %
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

/* ─────────────────────────────  CRATES  ────────────────────────────── */

export const rustCrates: RustCrate[] = [
  {
    id: 'toxic-crate',
    name: 'Toxic Crate',
    price: 2.0,
    image: '/lovable-uploads/d7d367f0-706f-42c6-9383-70be8477961c.png',
    rarity: 'rare',
    items: 4,
    minValue: 0.08,
    maxValue: 55.0,
    riskLevel: 'MIDDLE RISK',
    description: 'Toxic-themed items with green designs',
    contents: [
      { id: 'atomic-lr', name: 'Atomic LR', image: '/lovable-uploads/d23780a6-d245-43e3-b0ea-8804ecfa51ab.png',  value: 4.65, dropChance: 4,  rarity: 'rare'       },
      { id: 'slime-sar', name: 'Slime Monster SAR', image: '/lovable-uploads/f3429fb7-707e-4529-8ac9-df3bf4081777.png', value: 2.38, dropChance: 25, rarity: 'uncommon'  },
      { id: 'forest-helmet', name: 'Forest Raider Coffee Can', image: '/lovable-uploads/c641c342-3c49-43e2-b3ac-38e6069e0ede.png',  value: 55.0, dropChance: 1, rarity: 'legendary' },
      { id: 'green-cap', name: 'Green Cap', image: '/lovable-uploads/b254dbdd-0afc-4ce1-928b-fa7a851e52c4.png',  value: 0.08, dropChance: 70, rarity: 'common'    }
    ]
  },

  /* ── NEW SAMPLE CRATE ─────────────────────────────────────────────── */
  {
    id: 'ghostly-graves',
    name: 'Ghostly Graves',
    price: 0.20,
    image: '/lovable-uploads/ghostly_graves.png',
    rarity: 'epic',
    items: 5,
    minValue: 0.05,
    maxValue: 18.06,
    riskLevel: 'HIGH RISK',
    description: 'Spooky cosmetics with very low drop rates!',
    contents: [
      { id: 'scarecrow',  name: 'Scarecrow',           image: '/lovable-uploads/scarecrow.png',      value: 18.06, dropChance: 0.2, rarity: 'legendary' },
      { id: 'meat-mask',  name: 'Meat Mask',           image: '/lovable-uploads/meat_mask.png',      value: 14.19, dropChance: 0.3, rarity: 'legendary' },
      { id: 'wrapped-brain', name: 'Wrapped Brain',    image: '/lovable-uploads/wrapped_brain.png',  value: 0.90, dropChance: 7.5, rarity: 'rare'      },
      { id: 'desert-balala', name: 'Desert Camo Balaclava', image: '/lovable-uploads/desert_camo.png', value: 0.11, dropChance: 32, rarity: 'uncommon'  },
      { id: 'dud',        name: 'Dud!',                image: '/lovable-uploads/dud.png',            value: 0.0,  dropChance: 60, rarity: 'common'     }
    ]
  },

  /* add more crates here … */
];

export const allRustCrates = rustCrates;
