
import React from 'react';
import { BattleAnimations } from './BattleAnimations';
import { EnhancedPlayerCard } from './EnhancedPlayerCard';
import { RotatingSkinDisplay } from './RotatingSkinDisplay';
import { CrateItem, RustItem } from './types';

interface PlayerBattleCardProps {
  player: any;
  playerIndex: number;
  battleData: any;
  battleStatus: 'waiting' | 'rolling' | 'finished';
  needsMorePlayers: boolean;
  winner: string | null;
  finalItems: { [playerId: string]: CrateItem };
  playerAnimationStates: { [playerId: string]: boolean };
  onAnimationComplete: (playerId: string, finalItem: RustItem) => void;
  serverWinningItems?: { [playerId: string]: CrateItem };
}

export const PlayerBattleCard: React.FC<PlayerBattleCardProps> = ({
  player,
  playerIndex,
  battleData,
  battleStatus,
  needsMorePlayers,
  winner,
  finalItems,
  playerAnimationStates,
  onAnimationComplete,
  serverWinningItems = {}
}) => {
  // Check if this player is a winner (for individual mode or team mode)
  const isWinner = () => {
    if (!winner) return false;
    
    if (battleData?.teamMode === '2v2' || battleData?.teamMode === '3v3') {
      // In team modes, all team members should be winners if their team wins
      const winningPlayer = battleData.players.find((p: any) => p.id === winner);
      return winningPlayer && winningPlayer.team === player.team;
    } else {
      // In 1v1 and 1v1v1 mode, only the specific winner
      return winner === player.id;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-400/20';
      case 'uncommon': return 'border-green-400 bg-green-400/20';
      case 'rare': return 'border-blue-400 bg-blue-400/20';
      case 'epic': return 'border-purple-400 bg-purple-400/20';
      case 'legendary': return 'border-orange-400 bg-orange-400/20';
      default: return 'border-gray-400 bg-gray-400/20';
    }
  };

  // Convert CrateItem to RustItem by ensuring dropChance is present
  const convertToRustItem = (item: CrateItem): RustItem => ({
    ...item,
    dropChance: item.dropChance ?? 0
  });

  const renderContent = () => {
    return (
      <div className="relative h-24">
        {battleData?.crates?.[0]?.crate && (
          <RotatingSkinDisplay 
            crateId={battleData.crates[0].crate.id}
            isAnimating={playerAnimationStates[player.id] || false}
            onAnimationComplete={(finalItem) => {
              // Convert CrateItem to RustItem by ensuring dropChance is present
              const rustItem: RustItem = {
                ...finalItem,
                dropChance: finalItem.dropChance ?? 0
              };
              onAnimationComplete(player.id, rustItem);
            }}
            serverWinningItem={serverWinningItems[player.id] ? convertToRustItem(serverWinningItems[player.id]) : null}
          />
        )}
        
        {/* Waiting State Overlay */}
        {needsMorePlayers && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="text-center text-white">
              <div className="text-sm font-medium animate-pulse">Waiting for players...</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add team indicator for team modes only (not for 1v1v1)
  const teamIndicator = (battleData?.teamMode === '2v2' || battleData?.teamMode === '3v3') && player.team ? (
    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${
      player.team === 'team1' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
    }`}>
      {player.team === 'team1' ? 'TEAM 1' : 'TEAM 2'}
    </div>
  ) : null;

  // Get the authoritative item data - prefer server winning items, fallback to final items
  const getAuthoritativeItem = () => {
    return serverWinningItems[player.id] || finalItems[player.id] || null;
  };

  return (
    <div className="relative">
      {teamIndicator}
      <EnhancedPlayerCard
        key={player.id}
        player={player}
        isWinner={isWinner()}
        isOnline={!player.isBot && battleData?.isOnline}
        battleStatus={battleStatus}
      >
        {renderContent()}

        {/* Final Result - Use single source of truth */}
        {battleStatus === 'finished' && getAuthoritativeItem() && (
          <div className="mt-4 text-center">
            <div className="text-lg font-bold text-primary">
              ${getAuthoritativeItem()!.value.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {getAuthoritativeItem()!.name}
            </div>
          </div>
        )}
      </EnhancedPlayerCard>
    </div>
  );
};
