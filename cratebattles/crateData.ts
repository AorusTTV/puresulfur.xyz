export interface Crate {
  id: string;
  name: string;
  price: number;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  items: number;
  minValue: number;
  maxValue: number;
  riskLevel?: 'LOW RISK' | 'MIDDLE RISK' | 'HIGH RISK';
  description?: string;
}

// Import the comprehensive Rust crates
import { allRustCrates } from './rustCrateData';

// Convert the Rust crates to the Crate interface format
export const crates: Crate[] = allRustCrates.map(rustCrate => ({
  id: rustCrate.id,
  name: rustCrate.name,
  price: rustCrate.price,
  image: rustCrate.image,
  rarity: rustCrate.rarity,
  items: rustCrate.items,
  minValue: rustCrate.minValue,
  maxValue: rustCrate.maxValue,
  riskLevel: rustCrate.riskLevel,
  description: rustCrate.description
}));

// Keep the original 6 crates for backward compatibility, but add them to the new collection
const originalCrates: Crate[] = [
  {
    id: 'sulfur-starter',
    name: 'Sulfur Starter',
    price: 2.50,
    image: '/lovable-uploads/a39de535-94e1-4e31-941e-48138964331b.png',
    rarity: 'common',
    items: 15,
    minValue: 0.10,
    maxValue: 25.00,
    riskLevel: 'LOW RISK'
  },
  {
    id: 'rust-warrior',
    name: 'Rust Warrior',
    price: 5.00,
    image: '/lovable-uploads/07db274a-c962-47ff-80ed-79d69e0d825d.png',
    rarity: 'rare',
    items: 20,
    minValue: 0.25,
    maxValue: 75.00,
    riskLevel: 'MIDDLE RISK'
  },
  {
    id: 'metal-master',
    name: 'Metal Master',
    price: 10.00,
    image: '/lovable-uploads/0d317b02-f36f-4b24-a49e-cef757628cca.png',
    rarity: 'epic',
    items: 25,
    minValue: 1.00,
    maxValue: 150.00,
    riskLevel: 'MIDDLE RISK'
  },
  {
    id: 'legend-vault',
    name: 'Legend Vault',
    price: 25.00,
    image: '/lovable-uploads/4aee683f-0ccb-44a5-ba80-37eb1f2ccb9f.png',
    rarity: 'legendary',
    items: 30,
    minValue: 5.00,
    maxValue: 500.00,
    riskLevel: 'MIDDLE RISK'
  },
  {
    id: 'ultimate-collection',
    name: 'Ultimate Collection',
    price: 50.00,
    image: '/lovable-uploads/f20ebdb8-3792-4367-a684-0a6283a6efe5.png',
    rarity: 'legendary',
    items: 35,
    minValue: 10.00,
    maxValue: 1000.00,
    riskLevel: 'HIGH RISK'
  },
  {
    id: 'premium-vault',
    name: 'Premium Vault',
    price: 100.00,
    image: '/lovable-uploads/f5b7e033-447c-4430-ba29-c671f5020425.png',
    rarity: 'legendary',
    items: 40,
    minValue: 25.00,
    maxValue: 2500.00,
    riskLevel: 'HIGH RISK'
  }
];

// Combine original crates with new Rust crates for a total collection
export const allCrates = [...originalCrates, ...crates];

// Export functions to filter crates
export const getCratesByRisk = (riskLevel: 'LOW RISK' | 'MIDDLE RISK' | 'HIGH RISK') => {
  return allCrates.filter(crate => crate.riskLevel === riskLevel);
};

export const getCratesByPriceRange = (minPrice: number, maxPrice: number) => {
  return allCrates.filter(crate => crate.price >= minPrice && crate.price <= maxPrice);
};
