
import { CrateItem } from './types';

// Server-side function to select winning item with proper weighted distribution
export const selectWinningItem = (items: any[]): CrateItem => {
  const randomValue = Math.random() * 100;
  let currentChance = 0;
  
  console.log('Server selecting winning item with random value:', randomValue);
  
  for (const item of items) {
    currentChance += item.dropChance;
    console.log(`Checking item ${item.name}: dropChance ${item.dropChance}, cumulative ${currentChance}`);
    if (randomValue <= currentChance) {
      console.log(`Selected winning item: ${item.name} (value: ${item.value})`);
      return {
        id: item.id,
        name: item.name,
        image: item.image,
        value: item.value,
        rarity: item.rarity,
        dropChance: item.dropChance
      };
    }
  }
  
  // Fallback to first item
  console.log('Fallback to first item:', items[0]?.name);
  return {
    id: items[0]?.id || 'fallback',
    name: items[0]?.name || 'Unknown Item',
    image: items[0]?.image || '',
    value: items[0]?.value || 0,
    rarity: items[0]?.rarity || 'common',
    dropChance: items[0]?.dropChance
  };
};

export const generateFinalItems = (battleData: any): { [playerId: string]: CrateItem } => {
  if (!battleData?.crates?.[0]?.crate?.contents) return {};
  
  const newFinalItems: { [playerId: string]: CrateItem } = {};
  
  battleData.players.forEach((player: any) => {
    const selectedItem = selectWinningItem(battleData.crates[0].crate.contents);
    newFinalItems[player.id] = {
      id: `${selectedItem.id}-final`,
      name: selectedItem.name,
      image: selectedItem.image,
      value: selectedItem.value,
      rarity: selectedItem.rarity,
      dropChance: selectedItem.dropChance
    };
  });
  
  return newFinalItems;
};

export const determineWinner = (finalItems: { [playerId: string]: CrateItem }, battleData: any): string => {
  const gameMode = battleData?.gameMode || 'default';
  
  console.log(`Determining winner for game mode: ${gameMode}`, finalItems);
  
  // For team modes, always use team-based logic regardless of game mode
  if (battleData?.teamMode === '2v2' || battleData?.teamMode === '3v3') {
    return determineTeamWinner(finalItems, battleData, gameMode);
  }
  
  switch (gameMode) {
    case 'default':
    case 'terminal':
      // Highest value wins (for both default and terminal since we're using single crate)
      return determineHighestValueWinner(finalItems);
      
    case 'unlucky':
      // Lowest value wins
      return determineLowestValueWinner(finalItems);
      
    case 'jackpot':
      // Probability-based roulette
      return determineJackpotWinner(finalItems, battleData);
      
    case 'puresulfur':
      // PureSulfur mode - custom logic (for now, using highest value)
      return determinePureSulfurWinner(finalItems, battleData);
      
    default:
      return determineHighestValueWinner(finalItems);
  }
};

const determineTeamWinner = (finalItems: { [playerId: string]: CrateItem }, battleData: any, gameMode: string): string => {
  const teamValues: { [teamId: string]: { totalValue: number; players: string[] } } = {
    team1: { totalValue: 0, players: [] },
    team2: { totalValue: 0, players: [] }
  };
  
  // Calculate team totals using exact item values
  battleData.players.forEach((player: any) => {
    if (player.team && finalItems[player.id]) {
      let itemValue = finalItems[player.id].value;
      
      // Apply game mode modifiers
      if (gameMode === 'puresulfur' && finalItems[player.id].name.toLowerCase().includes('sulfur')) {
        itemValue *= 1.5; // 50% bonus for sulfur items
      }
      
      teamValues[player.team].totalValue += itemValue;
      teamValues[player.team].players.push(player.id);
    }
  });
  
  console.log(`TEAM TOTALS - Team 1: $${teamValues.team1.totalValue.toFixed(2)} (${teamValues.team1.players.length} players)`);
  console.log(`TEAM TOTALS - Team 2: $${teamValues.team2.totalValue.toFixed(2)} (${teamValues.team2.players.length} players)`);
  
  let winningTeam: string;
  
  // Determine winning team based on game mode - ALWAYS highest value wins for default/terminal
  switch (gameMode) {
    case 'unlucky':
      // Team with lowest total value wins
      winningTeam = teamValues.team1.totalValue <= teamValues.team2.totalValue ? 'team1' : 'team2';
      console.log(`UNLUCKY MODE: Team with LOWEST value wins - ${winningTeam}`);
      break;
    case 'jackpot':
      // Probability-based on team values
      const totalValue = teamValues.team1.totalValue + teamValues.team2.totalValue;
      if (totalValue === 0) {
        winningTeam = 'team1'; // Fallback
      } else {
        const team1Probability = teamValues.team1.totalValue / totalValue;
        const randomValue = Math.random();
        winningTeam = randomValue < team1Probability ? 'team1' : 'team2';
        console.log(`JACKPOT MODE: Team1 probability: ${(team1Probability * 100).toFixed(1)}%, random: ${(randomValue * 100).toFixed(1)}%`);
      }
      break;
    default:
      // DEFAULT/TERMINAL: Team with HIGHEST total value wins
      winningTeam = teamValues.team1.totalValue >= teamValues.team2.totalValue ? 'team1' : 'team2';
      console.log(`DEFAULT/TERMINAL MODE: Team with HIGHEST value wins - ${winningTeam}`);
      break;
  }
  
  console.log(`FINAL WINNER: ${winningTeam} with $${teamValues[winningTeam].totalValue.toFixed(2)}`);
  
  // Return a random player from the winning team (used for display purposes)
  const winningPlayers = teamValues[winningTeam].players;
  return winningPlayers[Math.floor(Math.random() * winningPlayers.length)];
};

const determineHighestValueWinner = (finalItems: { [playerId: string]: CrateItem }): string => {
  let highestValue = 0;
  let winnerId = '';
  
  Object.entries(finalItems).forEach(([playerId, item]) => {
    if (item.value > highestValue) {
      highestValue = item.value;
      winnerId = playerId;
    }
  });
  
  return winnerId;
};

const determineLowestValueWinner = (finalItems: { [playerId: string]: CrateItem }): string => {
  let lowestValue = Infinity;
  let winnerId = '';
  
  Object.entries(finalItems).forEach(([playerId, item]) => {
    if (item.value < lowestValue) {
      lowestValue = item.value;
      winnerId = playerId;
    }
  });
  
  return winnerId;
};

const determineJackpotWinner = (finalItems: { [playerId: string]: CrateItem }, battleData: any): string => {
  // Calculate total value for each team/player
  const playerValues: { [playerId: string]: number } = {};
  let totalValue = 0;
  
  Object.entries(finalItems).forEach(([playerId, item]) => {
    playerValues[playerId] = item.value;
    totalValue += item.value;
  });
  
  // 1v1 - probability based on individual values
  const players = Object.keys(playerValues);
  const probabilities: number[] = [];
  
  players.forEach(playerId => {
    probabilities.push(playerValues[playerId] / totalValue);
  });
  
  const randomValue = Math.random();
  let cumulativeProbability = 0;
  
  for (let i = 0; i < players.length; i++) {
    cumulativeProbability += probabilities[i];
    if (randomValue <= cumulativeProbability) {
      console.log(`Jackpot 1v1: Player ${players[i]} wins with ${probabilities[i] * 100}% probability`);
      return players[i];
    }
  }
  
  // Fallback to first player
  return players[0];
};

const determinePureSulfurWinner = (finalItems: { [playerId: string]: CrateItem }, battleData: any): string => {
  // PureSulfur mode - special logic
  // For now, implementing as highest value with sulfur bonus
  let highestValue = 0;
  let winnerId = '';
  
  Object.entries(finalItems).forEach(([playerId, item]) => {
    let adjustedValue = item.value;
    
    // Bonus for sulfur-related items (items with "sulfur" in name)
    if (item.name.toLowerCase().includes('sulfur')) {
      adjustedValue *= 1.5; // 50% bonus for sulfur items
    }
    
    if (adjustedValue > highestValue) {
      highestValue = adjustedValue;
      winnerId = playerId;
    }
  });
  
  console.log(`PureSulfur mode: Winner ${winnerId} with adjusted value ${highestValue}`);
  return winnerId;
};
