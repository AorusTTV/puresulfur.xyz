/* ──────────────────────────────────────────────────────────────────────────────
   useBattleGameLogic.ts
   Central coordinator hook for a single battle instance.
   ▸ Manages battle status, countdowns, reels, animations and winner logic.
   ▸ New: uses the richer AnimationState object and a single shared reel.
   ─────────────────────────────────────────────────────────────────────────── */

   import { useToast } from '@/hooks/use-toast';

   /* ── local hooks ─────────────────────────────────────────────────────────── */
   import { useBattleStatus }         from './useBattleStatus';
   import { useBattleItems }          from './useBattleItems';
   import { useBattleAnimations }     from './useBattleAnimations';
   import { useBattleWaitingEffects } from './useBattleWaitingEffects';
   
   /* ── server‐side helpers / services ───────────────────────────────────────── */
   import { callBotService }               from '../services/battleBotService';
   import { startCarouselBattleService }   from '../services/battleCarouselService';
   import { createBattleCompletionHandler } from '../services/battleCompletionService';
   
   /* ── shared types ────────────────────────────────────────────────────────── */
   import type { CrateItem }       from '../services/types';
   import type { AnimationState }  from './useBattleAnimations'; // { reel: CrateItem[]; index: number }
   
   /* ───────────────────────────────────────────────────────────────────────────
      Hook
      ───────────────────────────────────────────────────────────────────────── */
   export const useBattleGameLogic = (initialBattle: any) => {
     const { toast } = useToast();
   
     /* Battle‐level state (status, countdown, players, etc.) */
     const {
       battleStatus,
       setBattleStatus,
       battleData,
       setBattleData,
       countdown,
       waitingTime,
       playersJoined,
       needsMorePlayers,
     } = useBattleStatus(initialBattle);
   
     /* Item rolls & winner */
     const {
       finalItems,
       setFinalItems,
       serverWinningItems,
       setServerWinningItems,
       winner,
       setWinner,
     } = useBattleItems();
   
     /* Per‐player reel animation state */
     const {
       playerAnimationStates,
       setPlayerAnimationStates,
       animationCompletedPlayers,
       setAnimationCompletedPlayers,
     } = useBattleAnimations();
   
     /* ────────────────────────── helpers ────────────────────────── */
   
     /** Fill with bots if needed */
     const callBot = () => {
       const needed = callBotService(battleData, setBattleData);
       toast({
         title: 'Bots summoned',
         description: `Added ${needed} bot${needed > 1 ? 's' : ''} to the battle`,
       });
     };
   
     /** Kick off the rolling animation */
     const startBattle = () => {
       console.log(`Starting battle with mode ${battleData?.gameMode}`);
   
       // ① fresh‐start state
       setBattleStatus('rolling');
       setAnimationCompletedPlayers(new Set());
       setFinalItems({});
   
       // ② build a single shared “reel” of CrateItems
       const carousel: CrateItem[] = startCarouselBattleService(battleData);
       if (!carousel.length) {
         console.error('startBattle: carousel is empty — aborting.');
         setBattleStatus('finished');
         return;
       }
   
       // ③ seed every joined player with that same reel & index=0
       const initialMap: Record<string, AnimationState> = {};
       battleData.players.forEach((p: any) => {
         initialMap[p.id] = { reel: carousel, index: 0 };
       });
       setPlayerAnimationStates(initialMap);
   
       // ④ stash the reel if any other hooks need it
       setServerWinningItems(carousel);
     };
   
     /** When all players finish, determine winner and complete */
     const handleCarouselComplete = createBattleCompletionHandler(
       battleData,
       finalItems,
       serverWinningItems,
       animationCompletedPlayers,
       setFinalItems,
       setAnimationCompletedPlayers,
       setBattleStatus,
       setWinner,
     );
   
     /* ───────────────────────── waiting / countdown ───────────────────────── */
     useBattleWaitingEffects(
       waitingTime,
       needsMorePlayers,
       countdown,
       battleStatus,
       startBattle,
     );
   
     /* ──────────────────────────── public API ─────────────────────────────── */
     return {
       // state
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
   
       // actions
       callBot,
       startBattle,
       handleCarouselComplete,
       setBattleData, // for live updates from parent
     };
   };
   