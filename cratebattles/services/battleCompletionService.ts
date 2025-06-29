
import { determineWinner } from '../BattleItemGenerator';
import { CrateItem } from '../types';

export const createBattleCompletionHandler = (
  battleData: any,
  finalItems: { [playerId: string]: CrateItem },
  serverWinningItems: { [playerId: string]: CrateItem },
  animationCompletedPlayers: Set<string>,
  setFinalItems: (items: any) => void,
  setAnimationCompletedPlayers: (players: any) => void,
  setBattleStatus: (status: 'waiting' | 'rolling' | 'finished') => void,
  setWinner: (winner: string | null) => void
) => {
  return (playerId: string, finalItemData: CrateItem) => {
    console.log(`Player ${playerId} carousel completed with VISUAL result:`, finalItemData);
    
    // Use the server-predetermined item as the authoritative result
    const authoritativeResult = serverWinningItems[playerId] || finalItemData;
    console.log(`Using authoritative server result for ${playerId}:`, authoritativeResult);
    
    // Store the authoritative result
    setFinalItems((prev: any) => {
      const updated = { ...prev, [playerId]: authoritativeResult };
      console.log('Updated final items state with server data:', updated);
      return updated;
    });
    
    // Mark this player as completed
    setAnimationCompletedPlayers((prev: Set<string>) => {
      const newSet = new Set(prev);
      newSet.add(playerId);
      
      console.log(`Player ${playerId} completed. Total completed: ${newSet.size}/${battleData.players.length}`);
      
      // Check if all players have completed their animations
      if (newSet.size === battleData.players.length) {
        console.log('All animations completed, determining winner based on SERVER-PREDETERMINED results');
        setTimeout(() => {
          setBattleStatus('finished');
          
          // Use server-predetermined items for winner determination
          const completeFinalItems = { ...finalItems, [playerId]: authoritativeResult };
          console.log('FINAL AUTHORITATIVE ITEMS for winner determination:', completeFinalItems);
          
          // Log each player's result for verification
          Object.entries(completeFinalItems).forEach(([pId, item]) => {
            const playerName = battleData.players.find((p: any) => p.id === pId)?.name || 'Unknown';
            console.log(`Player ${playerName}: Got ${item.name} worth $${item.value} (SERVER AUTHORITATIVE)`);
          });
          
          const winnerId = determineWinner(completeFinalItems, battleData);
          setWinner(winnerId);
          
          const winnerName = battleData.players.find((p: any) => p.id === winnerId)?.name || 'Unknown';
          const winnerValue = completeFinalItems[winnerId]?.value || 0;
          
          console.log(`WINNER: ${winnerName} with ${completeFinalItems[winnerId]?.name} worth $${winnerValue} (AUTHORITATIVE)`);
        }, 500);
      }
      
      return newSet;
    });
  };
};
