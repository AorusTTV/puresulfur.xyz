
import { useToast } from '@/hooks/use-toast';
import { useBattleStatus } from './useBattleStatus';
import { useBattleItems } from './useBattleItems';
import { useBattleAnimations } from './useBattleAnimations';
import { useBattleWaitingEffects } from './useBattleWaitingEffects';
import { callBotService } from '../services/battleBotService';
import { startCarouselBattleService } from '../services/battleCarouselService';
import { createBattleCompletionHandler } from '../services/battleCompletionService';
// import { useBattleSubscriptions } from '../hooks/useBattleSubscriptions';

export const useBattleGameLogic = (initialBattle: any) => {
  const { toast } = useToast();
  
  const {
    battleStatus,
    setBattleStatus,
    battleData,
    setBattleData,
    countdown,
    setCountdown,
    waitingTime,
    setWaitingTime,
    playersJoined,
    needsMorePlayers
  } = useBattleStatus(initialBattle);

  const {
    finalItems,
    setFinalItems,
    serverWinningItems,
    setServerWinningItems,
    winner,
    setWinner
  } = useBattleItems();

  const {
    playerAnimationStates,
    setPlayerAnimationStates,
    animationCompletedPlayers,
    setAnimationCompletedPlayers
  } = useBattleAnimations();

  const callBot = () => {
    const botsNeeded = callBotService(battleData, setBattleData);
    
    toast({
      title: 'Bots Called!',
      description: `Added ${botsNeeded} bot${botsNeeded > 1 ? 's' : ''} to the battle!`,
    });
  };

  const startBattle = () => {
    console.log(`Starting battle with game mode: ${battleData?.gameMode}`);
    startCarouselBattle();
  };

  const startCarouselBattle = () => {
    setBattleStatus('rolling');
    setAnimationCompletedPlayers(new Set());
    setFinalItems({}); // Clear any previous results
    
    startCarouselBattleService(
      battleData,
      setServerWinningItems,
      setPlayerAnimationStates
    );
  };

  const handleCarouselComplete = createBattleCompletionHandler(
    battleData,
    finalItems,
    serverWinningItems,
    animationCompletedPlayers,
    setFinalItems,
    setAnimationCompletedPlayers,
    setBattleStatus,
    setWinner
  );

  // Use waiting effects hook
  useBattleWaitingEffects(
    waitingTime,
    needsMorePlayers,
    countdown,
    battleStatus,
    startBattle
  );

  // useBattleSubscriptions(
  //   initialBattle?.id || null,
  //   (payload) => {
  //     const newBattle = payload.new;
  //     setBattleData(newBattle);
  //     if (payload.old.status !== 'rolling' && newBattle.status === 'rolling') {
  //       setBattleStatus('rolling');
  //     }
  //     if (payload.old.status !== 'finished' && newBattle.status === 'finished') {
  //       setBattleStatus('finished');
  //     }
  //   },
  //   () => {} // onPlayerJoin can be left as is or handled as needed
  // );

  return {
    // State
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
    
    // Actions
    callBot,
    startBattle,
    handleCarouselComplete,
    setBattleData,
    setBattleStatus
  };
};
