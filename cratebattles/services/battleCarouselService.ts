
import { selectWinningItem } from '../BattleItemGenerator';
import { CrateItem } from '../types';

export const startCarouselBattleService = (
  battleData: any,
  setServerWinningItems: (items: { [playerId: string]: CrateItem }) => void,
  setPlayerAnimationStates: (states: any) => void
) => {
  console.log('Starting carousel battle animation with game mode:', battleData?.gameMode);
  
  // SERVER-SIDE LOGIC: Pre-determine winning items for all players
  const crateContents = battleData?.crates?.[0]?.crate?.contents || [];
  const predeterminedWinnings: { [playerId: string]: CrateItem } = {};
  
  battleData.players.forEach((player: any) => {
    // Server determines winning item using proper weighted selection
    const winningItem = selectWinningItem(crateContents);
    predeterminedWinnings[player.id] = {
      id: `${winningItem.id}-final-${player.id}`,
      name: winningItem.name,
      image: winningItem.image,
      value: winningItem.value,
      rarity: winningItem.rarity,
      dropChance: winningItem.dropChance
    };
    console.log(`Server pre-determined winning item for ${player.name}:`, predeterminedWinnings[player.id]);
  });
  
  // Store server-determined items
  setServerWinningItems(predeterminedWinnings);
  
  // Start carousel animations for all players with staggered timing
  battleData.players.forEach((player: any, index: number) => {
    setTimeout(() => {
      console.log(`Starting animation for player ${player.id} (${player.name}) with predetermined item:`, predeterminedWinnings[player.id]);
      setPlayerAnimationStates((prev: any) => ({
        ...prev,
        [player.id]: true
      }));
    }, index * 200);
  });
};
