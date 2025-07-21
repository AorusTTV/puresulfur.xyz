
import React from 'react';
import { Card } from '@/components/ui/card';
import { BattleHeader } from './BattleHeader';
import { BattleStatusManager } from './BattleStatusManager';
import { PlayerBattleCard } from './PlayerBattleCard';
import { useBattleGameLogic } from './BattleGameLogic';
import { useBattleSubscriptions } from './hooks/useBattleSubscriptions';

interface BattleRoomProps {
  battle: any;
  onLeaveBattle: () => void;
}

interface GroupedPlayers {
  isTeamMode: boolean;
  players?: any[];
  team1?: any[];
  team2?: any[];
}

export const BattleRoom: React.FC<BattleRoomProps> = ({ battle, onLeaveBattle }) => {
  const {
    battleStatus,
    finalItems,
    winner,
    countdown,
    battleData,
    waitingTime,
    playerAnimationStates,
    playersJoined,
    needsMorePlayers,
    serverWinningItems,
    callBot,
    startBattle,
    handleCarouselComplete,
    setBattleData,
    setBattleStatus
  } = useBattleGameLogic(battle);

  useBattleSubscriptions(
    battle?.id || null,
    (payload) => {
      console.log('Battle update payload:', payload);
      const newBattle = payload.new;
      setBattleData(newBattle);
      console.log('Updated battleData.players:', newBattle.players);
      if (payload.old.status !== 'rolling' && newBattle.status === 'rolling') {
        setBattleStatus('rolling');
      }
      if (payload.old.status !== 'finished' && newBattle.status === 'finished') {
        setBattleStatus('finished');
      }
    },
    () => {} // onPlayerJoin can be left as is or handled as needed
  );

  const maxPlayers = battleData?.playerCount || 2;

  // Group players by team for team modes
  const getGroupedPlayers = (): GroupedPlayers => {
    if (!battleData?.players) return { isTeamMode: false, players: [] };
    
    if (battleData?.teamMode === '2v2' || battleData?.teamMode === '3v3') {
      const team1Players = battleData.players.filter((p: any) => p.team === 'team1');
      const team2Players = battleData.players.filter((p: any) => p.team === 'team2');
      
      return {
        isTeamMode: true,
        team1: team1Players,
        team2: team2Players
      };
    }
    
    return {
      isTeamMode: false,
      players: battleData.players
    };
  };

  const groupedPlayers = getGroupedPlayers();

  const renderTeamPlayers = () => {
    if (!groupedPlayers.isTeamMode) {
      // Regular grid for non-team modes
      return (
        <div className={`grid gap-4 ${
          maxPlayers === 2 ? 'grid-cols-1 md:grid-cols-2' :
          maxPlayers === 3 ? 'grid-cols-1 md:grid-cols-3' :
          maxPlayers === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
          maxPlayers === 6 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {groupedPlayers.players?.map((player: any, index: number) => (
            <PlayerBattleCard
              key={player.id}
              player={player}
              playerIndex={index}
              battleData={battleData}
              battleStatus={battleStatus}
              needsMorePlayers={needsMorePlayers}
              winner={winner}
              finalItems={finalItems}
              playerAnimationStates={playerAnimationStates}
              onAnimationComplete={handleCarouselComplete}
              serverWinningItems={serverWinningItems}
            />
          ))}
        </div>
      );
    }

    // Team-based layout
    return (
      <div className="space-y-6">
        {/* Team 1 */}
        <div>
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-blue-500">TEAM 1</h3>
          </div>
          <div className={`grid gap-4 ${
            battleData?.teamMode === '2v2' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
          }`}>
            {groupedPlayers.team1?.map((player: any, index: number) => (
              <PlayerBattleCard
                key={player.id}
                player={player}
                playerIndex={index}
                battleData={battleData}
                battleStatus={battleStatus}
                needsMorePlayers={needsMorePlayers}
                winner={winner}
                finalItems={finalItems}
                playerAnimationStates={playerAnimationStates}
                onAnimationComplete={handleCarouselComplete}
                serverWinningItems={serverWinningItems}
              />
            ))}
          </div>
        </div>

        {/* VS Divider */}
        <div className="text-center">
          <div className="text-3xl font-bold text-muted-foreground">VS</div>
        </div>

        {/* Team 2 */}
        <div>
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-red-500">TEAM 2</h3>
          </div>
          <div className={`grid gap-4 ${
            battleData?.teamMode === '2v2' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
          }`}>
            {groupedPlayers.team2?.map((player: any, index: number) => (
              <PlayerBattleCard
                key={player.id}
                player={player}
                playerIndex={index + (groupedPlayers.team1?.length || 0)}
                battleData={battleData}
                battleStatus={battleStatus}
                needsMorePlayers={needsMorePlayers}
                winner={winner}
                finalItems={finalItems}
                playerAnimationStates={playerAnimationStates}
                onAnimationComplete={handleCarouselComplete}
                serverWinningItems={serverWinningItems}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <BattleHeader 
        battleData={battleData}
        battleStatus={battleStatus}
        playersJoined={playersJoined}
      />

      <Card className="bg-card/60 border-border/50 p-6">
        <BattleStatusManager
          needsMorePlayers={needsMorePlayers}
          battleStatus={battleStatus}
          waitingTime={waitingTime}
          countdown={countdown}
          onCallBot={callBot}
          onStartBattle={startBattle}
        />
      </Card>

      {/* Players Layout */}
      {renderTeamPlayers()}
    </div>
  );
};
