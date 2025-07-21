
// Minefield multiplier matrix
// multipliers[mines][safeClicks] -> multiplier value
// Based on the Excel table provided
export const MINEFIELD_MULTIPLIERS: Record<number, Record<number, number>> = {
  1: {
    1: 1.03, 2: 1.07, 3: 1.11, 4: 1.15, 5: 1.19, 6: 1.24, 7: 1.29, 8: 1.34, 9: 1.40, 10: 1.46, 
    11: 1.53, 12: 1.60, 13: 1.68, 14: 1.76, 15: 1.85, 16: 1.95, 17: 2.06, 18: 2.18, 19: 2.31, 
    20: 2.46, 21: 2.63, 22: 2.82, 23: 3.04, 24: 3.28
  },
  2: {
    1: 1.07, 2: 1.13, 3: 1.20, 4: 1.28, 5: 1.36, 6: 1.45, 7: 1.55, 8: 1.66, 9: 1.78, 10: 1.91,
    11: 2.06, 12: 2.23, 13: 2.42, 14: 2.63, 15: 2.87, 16: 3.15, 17: 3.47, 18: 3.84, 19: 4.27,
    20: 4.78, 21: 5.38, 22: 6.12, 23: 7.04, 24: 8.21
  },
  3: {
    1: 1.11, 2: 1.20, 3: 1.30, 4: 1.42, 5: 1.55, 6: 1.70, 7: 1.87, 8: 2.07, 9: 2.30, 10: 2.56,
    11: 2.87, 12: 3.23, 13: 3.66, 14: 4.18, 15: 4.81, 16: 5.59, 17: 6.56, 18: 7.78, 19: 9.35,
    20: 11.40, 21: 14.17, 22: 18.11, 23: 24.27, 24: 34.30
  },
  4: {
    1: 1.16, 2: 1.28, 3: 1.42, 4: 1.59, 5: 1.79, 6: 2.02, 7: 2.30, 8: 2.63, 9: 3.04, 10: 3.54,
    11: 4.17, 12: 4.97, 13: 6.02, 14: 7.39, 15: 9.22, 16: 11.73, 17: 15.30, 18: 20.68, 19: 29.32,
    20: 43.98, 21: 73.30, 22: 146.60, 23: 439.80, 24: null
  },
  5: {
    1: 1.21, 2: 1.37, 3: 1.56, 4: 1.79, 5: 2.07, 6: 2.42, 7: 2.85, 8: 3.39, 9: 4.08, 10: 4.96,
    11: 6.10, 12: 7.63, 13: 9.78, 14: 12.93, 15: 17.90, 16: 26.35, 17: 42.16, 18: 73.30, 19: 146.60,
    20: 366.50, 21: 1466.00, 22: null, 23: null, 24: null
  },
  6: {
    1: 1.26, 2: 1.47, 3: 1.72, 4: 2.03, 5: 2.42, 6: 2.92, 7: 3.57, 8: 4.42, 9: 5.53, 10: 7.04,
    11: 9.15, 12: 12.29, 13: 16.99, 14: 24.27, 15: 36.65, 16: 58.64, 17: 102.62, 18: 205.24,
    19: 512.70, 20: 1708.90, 21: null, 22: null, 23: null, 24: null
  },
  7: {
    1: 1.32, 2: 1.58, 3: 1.91, 4: 2.32, 5: 2.85, 6: 3.54, 7: 4.45, 8: 5.68, 9: 7.37, 10: 9.78,
    11: 13.40, 12: 18.96, 13: 27.90, 14: 42.16, 15: 67.30, 16: 115.87, 17: 219.26, 18: 470.14,
    19: 1175.35, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  8: {
    1: 1.38, 2: 1.70, 3: 2.12, 4: 2.68, 5: 3.42, 6: 4.42, 7: 5.80, 8: 7.73, 9: 10.50, 10: 14.67,
    11: 21.00, 12: 31.50, 13: 49.50, 14: 81.00, 15: 141.75, 16: 270.50, 17: 567.05, 18: 1350.12,
    19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  9: {
    1: 1.45, 2: 1.84, 3: 2.37, 4: 3.09, 5: 4.09, 6: 5.48, 7: 7.43, 8: 10.24, 9: 14.36, 10: 20.98,
    11: 31.47, 12: 49.95, 13: 83.25, 14: 149.85, 15: 299.70, 16: 659.34, 17: 1648.35, 18: null,
    19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  10: {
    1: 1.53, 2: 2.00, 3: 2.67, 4: 3.56, 5: 4.85, 6: 6.73, 7: 9.52, 8: 13.88, 9: 20.98, 10: 32.97,
    11: 54.95, 12: 98.91, 13: 197.82, 14: 439.26, 15: 1097.15, 16: null, 17: null, 18: null,
    19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  11: {
    1: 1.62, 2: 2.19, 3: 3.04, 4: 4.28, 5: 6.17, 6: 9.03, 7: 13.54, 8: 20.98, 9: 33.57, 10: 58.64,
    11: 111.09, 12: 235.60, 13: 549.40, 14: 1373.50, 15: null, 16: null, 17: null, 18: null,
    19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  12: {
    1: 1.72, 2: 2.42, 3: 3.48, 4: 5.22, 5: 8.03, 6: 12.81, 7: 21.35, 8: 37.36, 9: 69.30, 10: 138.60,
    11: 308.02, 12: 770.05, 13: 2156.14, 14: null, 15: null, 16: null, 17: null, 18: null,
    19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  13: {
    1: 1.84, 2: 2.69, 3: 4.03, 4: 6.46, 5: 10.77, 6: 18.96, 7: 35.43, 8: 70.86, 9: 152.33,
    10: 365.59, 11: 987.77, 12: 2960.31, 13: null, 14: null, 15: null, 16: null, 17: null,
    18: null, 19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  14: {
    1: 1.98, 2: 3.02, 3: 4.77, 4: 8.15, 5: 14.66, 6: 28.05, 7: 58.64, 8: 135.16, 9: 337.90,
    10: 928.22, 11: 2877.68, 12: null, 13: null, 14: null, 15: null, 16: null, 17: null,
    18: null, 19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  15: {
    1: 2.15, 2: 3.42, 3: 5.71, 4: 10.28, 5: 20.12, 6: 42.16, 7: 98.91, 8: 252.59, 9: 708.85,
    10: 2196.53, 11: null, 12: null, 13: null, 14: null, 15: null, 16: null, 17: null,
    18: null, 19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  16: {
    1: 2.37, 2: 3.92, 3: 6.96, 4: 13.23, 5: 27.90, 6: 64.78, 7: 168.03, 8: 470.14, 9: 1410.42,
    10: null, 11: null, 12: null, 13: null, 14: null, 15: null, 16: null, 17: null,
    18: null, 19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  17: {
    1: 2.63, 2: 4.54, 3: 8.54, 4: 17.37, 5: 39.33, 6: 98.91, 7: 274.53, 8: 823.59, 9: null,
    10: null, 11: null, 12: null, 13: null, 14: null, 15: null, 16: null, 17: null,
    18: null, 19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  18: {
    1: 2.96, 2: 5.32, 3: 10.56, 4: 23.10, 5: 56.64, 6: 154.27, 7: 462.80, 8: null,
    9: null, 10: null, 11: null, 12: null, 13: null, 14: null, 15: null, 16: null, 17: null,
    18: null, 19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  19: {
    1: 3.37, 2: 6.30, 3: 13.23, 4: 31.15, 5: 82.31, 6: 246.93, 7: null, 8: null,
    9: null, 10: null, 11: null, 12: null, 13: null, 14: null, 15: null, 16: null, 17: null,
    18: null, 19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  20: {
    1: 3.88, 2: 7.53, 3: 16.86, 4: 42.16, 5: 123.47, 6: null, 7: null, 8: null,
    9: null, 10: null, 11: null, 12: null, 13: null, 14: null, 15: null, 16: null, 17: null,
    18: null, 19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  21: {
    1: 4.53, 2: 9.15, 3: 21.78, 4: 58.64, 5: null, 6: null, 7: null, 8: null,
    9: null, 10: null, 11: null, 12: null, 13: null, 14: null, 15: null, 16: null, 17: null,
    18: null, 19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  22: {
    1: 5.38, 2: 11.40, 3: 28.60, 4: null, 5: null, 6: null, 7: null, 8: null,
    9: null, 10: null, 11: null, 12: null, 13: null, 14: null, 15: null, 16: null, 17: null,
    18: null, 19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  23: {
    1: 6.56, 2: 14.66, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null,
    9: null, 10: null, 11: null, 12: null, 13: null, 14: null, 15: null, 16: null, 17: null,
    18: null, 19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  },
  24: {
    1: 8.21, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null,
    9: null, 10: null, 11: null, 12: null, 13: null, 14: null, 15: null, 16: null, 17: null,
    18: null, 19: null, 20: null, 21: null, 22: null, 23: null, 24: null
  }
};

// Feature flag for the new multiplier system
export const FEATURE_FLAGS = {
  MINEFIELD_MULTIPLIER_V2: true
};

// Get multiplier for given mines and safe clicks
export const getMinefieldMultiplier = (mines: number, safeClicks: number): number => {
  if (!FEATURE_FLAGS.MINEFIELD_MULTIPLIER_V2) {
    // Fallback to old calculation if feature flag is disabled
    const safeCells = 25 - mines;
    const remainingSafeCells = safeCells - safeClicks;
    const remainingCells = 25 - safeClicks;
    
    if (remainingSafeCells <= 0) return 1;
    
    const baseMultiplier = Math.pow(remainingCells / remainingSafeCells, 0.1);
    return Math.max(1, baseMultiplier);
  }

  // Use new multiplier table
  const mineData = MINEFIELD_MULTIPLIERS[mines];
  if (!mineData) return 1;
  
  const multiplier = mineData[safeClicks];
  return multiplier || 1;
};

// Format multiplier for display
export const formatMultiplier = (multiplier: number): string => {
  return `${multiplier.toFixed(2)}×`;
};
