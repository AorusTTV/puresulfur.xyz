
export interface LevelInfo {
  currentLevel: number;
  currentExp: number;
  expForCurrentLevel: number;
  expForNextLevel: number;
  progressToNextLevel: number;
  expNeededForNextLevel: number;
}

export const calculateLevelInfo = (experience: number): LevelInfo => {
  const currentLevel = calculateLevelFromExp(experience);
  const expForCurrentLevel = getExpRequiredForLevel(currentLevel);
  const expForNextLevel = currentLevel >= 500 ? expForCurrentLevel : getExpRequiredForLevel(currentLevel + 1);
  
  const progressExp = experience - expForCurrentLevel;
  const levelExpRange = expForNextLevel - expForCurrentLevel;
  const progressToNextLevel = currentLevel >= 500 ? 100 : (progressExp / levelExpRange) * 100;
  const expNeededForNextLevel = currentLevel >= 500 ? 0 : expForNextLevel - experience;

  return {
    currentLevel,
    currentExp: experience,
    expForCurrentLevel,
    expForNextLevel,
    progressToNextLevel: Math.min(progressToNextLevel, 100),
    expNeededForNextLevel: Math.max(expNeededForNextLevel, 0)
  };
};

export const calculateLevelFromExp = (exp: number): number => {
  // If experience is 0 or negative, return level 1
  if (exp <= 0) return 1;
  
  // XP needed to level up from each level (matches database table)
  const levelUpRequirements = [
    1000,   // Level 1 to 2
    2500,   // Level 2 to 3
    5000,   // Level 3 to 4
    7500,   // Level 4 to 5
    10000,  // Level 5 to 6
    15000,  // Level 6 to 7
    20000,  // Level 7 to 8
    25000,  // Level 8 to 9
    30000,  // Level 9 to 10
    35000,  // Level 10 to 11
    40000, 50000, 60000, 70000, 80000,
    90000, 100000, 105000, 110000, 115000,
    120000, 125000, 130000, 135000, 140000,
    145000, 150000, 155000, 160000, 165000,
    170000, 175000, 180000, 185000, 190000,
    195000, 200000, 205000, 210000, 215000,
    220000, 225000, 230000, 235000, 240000,
    245000, 250000, 255000, 260000, 265000,
    270000, 275000, 280000, 285000, 290000,
    295000, 300000, 305000, 310000, 315000,
    320000, 325000, 330000, 335000, 340000,
    345000, 350000, 355000, 360000, 365000,
    370000, 375000, 380000, 385000, 390000,
    395000, 400000, 405000, 410000, 415000,
    420000, 425000, 430000, 435000, 440000,
    445000, 450000, 455000, 460000, 465000,
    470000, 475000, 480000, 485000, 490000,
    495000, 500000, 505000, 510000, 
    // Level 100 jump
    1000000
  ];
  
  // Add levels 101-199 (each needs 5000 more than previous)
  for (let i = 101; i <= 199; i++) {
    levelUpRequirements.push(1000000 + (i - 100) * 5000);
  }
  
  // Level 200 jump
  levelUpRequirements.push(2000000);
  
  // Add levels 201-299 (each needs 10000 more than previous)
  for (let i = 201; i <= 299; i++) {
    levelUpRequirements.push(2000000 + (i - 200) * 10000);
  }
  
  // Level 300 jump
  levelUpRequirements.push(4000000);
  
  // Add levels 301-399 (each needs 20000 more than previous)
  for (let i = 301; i <= 399; i++) {
    levelUpRequirements.push(4000000 + (i - 300) * 20000);
  }
  
  // Level 400 jump
  levelUpRequirements.push(7000000);
  
  // Add levels 401-499 (each needs 25000 more than previous)
  for (let i = 401; i <= 499; i++) {
    levelUpRequirements.push(7000000 + (i - 400) * 25000);
  }
  
  // Level 500
  levelUpRequirements.push(10000000);
  
  // Calculate cumulative XP to find current level
  let cumulativeExp = 0;
  let currentLevel = 1;
  
  for (let i = 0; i < levelUpRequirements.length && i < 499; i++) {
    cumulativeExp += levelUpRequirements[i];
    
    // If user's experience is less than cumulative needed for next level
    if (exp < cumulativeExp) {
      return currentLevel;
    }
    
    // User has enough XP for this level, continue to next
    currentLevel++;
    
    // Cap at level 500
    if (currentLevel >= 500) {
      return 500;
    }
  }
  
  // If we've gone through all levels, return max level
  return 500;
};

export const getExpRequiredForLevel = (targetLevel: number): number => {
  // Level 1 requires 0 XP (you start at level 1)
  if (targetLevel <= 1) return 0;
  
  // Cap at level 500
  if (targetLevel > 500) targetLevel = 500;
  
  // XP needed to level up from each level (matches database table)
  const levelUpRequirements = [
    1000,   // Level 1 to 2
    2500,   // Level 2 to 3
    5000,   // Level 3 to 4
    7500,   // Level 4 to 5
    10000,  // Level 5 to 6
    15000,  // Level 6 to 7
    20000,  // Level 7 to 8
    25000,  // Level 8 to 9
    30000,  // Level 9 to 10
    35000,  // Level 10 to 11
    40000, 50000, 60000, 70000, 80000,
    90000, 100000, 105000, 110000, 115000,
    120000, 125000, 130000, 135000, 140000,
    145000, 150000, 155000, 160000, 165000,
    170000, 175000, 180000, 185000, 190000,
    195000, 200000, 205000, 210000, 215000,
    220000, 225000, 230000, 235000, 240000,
    245000, 250000, 255000, 260000, 265000,
    270000, 275000, 280000, 285000, 290000,
    295000, 300000, 305000, 310000, 315000,
    320000, 325000, 330000, 335000, 340000,
    345000, 350000, 355000, 360000, 365000,
    370000, 375000, 380000, 385000, 390000,
    395000, 400000, 405000, 410000, 415000,
    420000, 425000, 430000, 435000, 440000,
    445000, 450000, 455000, 460000, 465000,
    470000, 475000, 480000, 485000, 490000,
    495000, 500000, 505000, 510000, 
    // Level 100 jump
    1000000
  ];
  
  // Add levels 101-199 (each needs 5000 more than previous)
  for (let i = 101; i <= 199; i++) {
    levelUpRequirements.push(1000000 + (i - 100) * 5000);
  }
  
  // Level 200 jump
  levelUpRequirements.push(2000000);
  
  // Add levels 201-299 (each needs 10000 more than previous)
  for (let i = 201; i <= 299; i++) {
    levelUpRequirements.push(2000000 + (i - 200) * 10000);
  }
  
  // Level 300 jump
  levelUpRequirements.push(4000000);
  
  // Add levels 301-399 (each needs 20000 more than previous)
  for (let i = 301; i <= 399; i++) {
    levelUpRequirements.push(4000000 + (i - 300) * 20000);
  }
  
  // Level 400 jump
  levelUpRequirements.push(7000000);
  
  // Add levels 401-499 (each needs 25000 more than previous)
  for (let i = 401; i <= 499; i++) {
    levelUpRequirements.push(7000000 + (i - 400) * 25000);
  }
  
  // Level 500
  levelUpRequirements.push(10000000);
  
  // Calculate cumulative XP needed for target level
  let cumulativeExp = 0;
  
  for (let i = 0; i < targetLevel - 1 && i < levelUpRequirements.length; i++) {
    cumulativeExp += levelUpRequirements[i];
  }
  
  return cumulativeExp;
};

export const getSulfurRewardForLevel = (level: number): number => {
  // Level 1 has no reward
  if (level <= 1) return 0;
  
  // Use the exact values from the provided table
  switch (level) {
    case 2: return 0.55;
    case 3: return 0.6;
    case 4: return 0.65;
    case 5: return 0.7;
    case 6: return 0.75;
    case 7: return 0.8;
    case 8: return 0.85;
    case 9: return 0.9;
    case 10: return 1;
    case 11: return 1.05;
    case 12: return 1.1;
    case 13: return 1.15;
    case 14: return 1.2;
    case 15: return 1.25;
    case 16: return 1.3;
    case 17: return 1.35;
    case 18: return 1.4;
    case 19: return 1.45;
    case 20: return 1.5;
    case 21: return 1.55;
    case 22: return 1.6;
    case 23: return 1.65;
    case 24: return 1.7;
    case 25: return 1.75;
    case 26: return 1.8;
    case 27: return 1.85;
    case 28: return 1.9;
    case 29: return 1.95;
    case 30: return 2;
    case 31: return 2.05;
    case 32: return 2.1;
    case 33: return 2.15;
    case 34: return 2.2;
    case 35: return 2.25;
    case 36: return 2.3;
    case 37: return 2.35;
    case 38: return 2.4;
    case 39: return 2.45;
    case 40: return 2.5;
    case 41: return 2.55;
    case 42: return 2.6;
    case 43: return 2.65;
    case 44: return 2.7;
    case 45: return 2.75;
    case 46: return 2.8;
    case 47: return 2.85;
    case 48: return 2.9;
    case 49: return 2.95;
    case 50: return 5;
    case 100: return 10;
    case 200: return 15;
    case 250: return 20;
    case 500: return 50;
    default:
      // Calculate based on ranges
      if (level >= 51 && level <= 99) {
        return 5 + (level - 50) * 0.05;
      } else if (level >= 101 && level <= 199) {
        return 10 + (level - 100) * 0.05;
      } else if (level >= 201 && level <= 249) {
        return 15 + (level - 200) * 0.05;
      } else if (level >= 251 && level <= 499) {
        return 20 + (level - 250) * 0.05;
      }
      return 0;
  }
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};
