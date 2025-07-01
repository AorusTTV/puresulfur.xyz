/*  src/components/games/cratebattles/hooks/useBattleAnimations.ts
    Keeps per-player reel + current frame, and tracks who has finished         */

    import { useState, useEffect } from 'react';
    import type { CrateItem } from '../types';
    
    /** what each player needs for the animation */
    export interface AnimationState {
      reel : CrateItem[];   // the prepared strip of items
      index: number;        // current frame (0-based)
    }
    
    /** advance speed (ms per frame) – adjust to taste                   */
    const TICK_MS = 120;
    
    export const useBattleAnimations = () => {
      /*  playerId  →  { reel, index }                                   */
      const [playerAnimationStates,
             setPlayerAnimationStates] = useState<Record<string, AnimationState>>({});
    
      /*  players that already reached the last frame                    */
      const [animationCompletedPlayers,
             setAnimationCompletedPlayers] = useState<Set<string>>(new Set());
    
      /*  global ticker – every TICK_MS advance every player one frame   */
      useEffect(() => {
        if (!Object.keys(playerAnimationStates).length) return;
        const timer = setInterval(() => {
          setPlayerAnimationStates(prev => {
            const next: Record<string, AnimationState> = { ...prev };
    
            Object.entries(prev).forEach(([pid, state]) => {
              if (state.index < state.reel.length - 1) {
                next[pid] = { ...state, index: state.index + 1 };
              } else {
                /* reached the end → mark complete once                   */
                setAnimationCompletedPlayers(old => {
                  if (old.has(pid)) return old;
                  const set = new Set(old);
                  set.add(pid);
                  return set;
                });
              }
            });
    
            return next;
          });
        }, TICK_MS);
    
        return () => clearInterval(timer);
      }, [playerAnimationStates]);
    
      return {
        playerAnimationStates,
        setPlayerAnimationStates,
        animationCompletedPlayers,
        setAnimationCompletedPlayers,
      };
    };
    