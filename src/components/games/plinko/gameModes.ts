
export type GameMode = 'low' | 'medium' | 'high';

export interface GameModeConfig {
  name: string;
  multipliers: number[];
}

export const gameModes: Record<GameMode, GameModeConfig> = {
  low: {
    name: 'Low Risk',
    multipliers: [50, 7.5, 2.25, 1.3, 1.22, 1.12, 1.06, 0.97, 0.80, 0.60, 0.80, 0.97, 1.06, 1.12, 1.22, 1.3, 2.25, 7.5, 50]
  },
  medium: {
    name: 'Medium Risk',
    multipliers: [100, 25, 5, 1.75, 1.45, 1.12, 0.90, 0.70, 0.50, 0.40, 0.50, 0.70, 0.90, 1.12, 1.45, 1.75, 5, 25, 100]
  },
  high: {
    name: 'High Risk',
    multipliers: [1000, 100, 25, 0.99, 0.90, 0.75, 0.50, 0.40, 0.30, 0.20, 0.30, 0.40, 0.50, 0.75, 0.90, 0.99, 25, 100, 1000]
  }
};

// Helper function to get multipliers for a specific mode
export const getMultipliersForMode = (mode: GameMode): number[] => {
  return gameModes[mode].multipliers;
};

// Helper function to get the max multiplier for potential win calculation
export const getMaxMultiplierForMode = (mode: GameMode): number => {
  return Math.max(...gameModes[mode].multipliers);
};

// Helper function to get the min multiplier for potential win calculation
export const getMinMultiplierForMode = (mode: GameMode): number => {
  return Math.min(...gameModes[mode].multipliers);
};
