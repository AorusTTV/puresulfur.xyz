/* ────────────────────────────────────────────────────────────────
   types.ts  ― shared Crate-Battles interfaces & utility types
   Add more here as the feature-set grows.
   ──────────────────────────────────────────────────────────────── */

/** A single skin or item that can drop from a crate */
export interface CrateItem {
  id:    string;        // unique item ID (can be Rust workshop ID, etc.)
  name:  string;
  image: string;        // URL or local path to thumbnail
  value: number;        // $ value (or sulfur equivalent)
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | string;
  /** Chance to drop, in **percentage points** (e.g. 7.5 → 7.5 %) */
  dropChance: number;
}

/* ───────────── Optional helper aliases ───────────── */

/** What the carousel actually animates – identical to CrateItem today */
export type CarouselCell = CrateItem;

/** Used when you want to attach the item to a player ID */
export interface PlayerFinalItem {
  playerId: string;
  item: CrateItem;
}

/* Add more battle-wide or player-related types here as needed */
