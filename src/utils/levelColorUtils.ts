
export interface LevelColorInfo {
  nameColor: string;
  iconColor: string;
  bgColor?: string;
}

export const getLevelColorInfo = (level: number): LevelColorInfo => {
  // Level ranges based on the provided table
  if (level >= 400) {
    return {
      nameColor: 'text-blue-400',
      iconColor: 'text-blue-400'
    };
  }
  if (level >= 300) {
    return {
      nameColor: 'text-green-400',
      iconColor: 'text-green-400'
    };
  }
  if (level >= 200) {
    return {
      nameColor: 'text-purple-400',
      iconColor: 'text-purple-400'
    };
  }
  if (level >= 100) {
    return {
      nameColor: 'text-pink-400',
      iconColor: 'text-pink-400'
    };
  }
  if (level >= 90) {
    return {
      nameColor: 'text-green-600',
      iconColor: 'text-green-600'
    };
  }
  if (level >= 80) {
    return {
      nameColor: 'text-black',
      iconColor: 'text-black'
    };
  }
  if (level >= 70) {
    return {
      nameColor: 'text-yellow-400',
      iconColor: 'text-yellow-400'
    };
  }
  if (level >= 60) {
    return {
      nameColor: 'text-red-400',
      iconColor: 'text-red-400'
    };
  }
  if (level >= 50) {
    return {
      nameColor: 'text-purple-600',
      iconColor: 'text-purple-600'
    };
  }
  if (level >= 40) {
    return {
      nameColor: 'text-purple-500',
      iconColor: 'text-purple-500'
    };
  }
  if (level >= 30) {
    return {
      nameColor: 'text-red-500',
      iconColor: 'text-red-500'
    };
  }
  if (level >= 20) {
    return {
      nameColor: 'text-orange-500',
      iconColor: 'text-orange-500'
    };
  }
  if (level >= 10) {
    return {
      nameColor: 'text-blue-500',
      iconColor: 'text-blue-500'
    };
  }
  if (level >= 1) {
    return {
      nameColor: 'text-gray-400',
      iconColor: 'text-gray-400'
    };
  }
  
  // Default for level 0 or below
  return {
    nameColor: 'text-muted-foreground',
    iconColor: 'text-muted-foreground'
  };
};
