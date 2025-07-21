
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RustCrate } from './rustCrateData';
import { PersistentBattle, DatabaseBattleResponse } from './types/persistentBattleTypes';
import { fetchAvailableBattlesApi } from './services/battleFetchService';
import { 
  createPersistentBattleApi, 
  joinPersistentBattleApi, 
  addBotToSlotApi 
} from './services/battleApiService';
import { supabase } from '@/integrations/supabase/client';

// Helper: robust comparison for battles and players
function battlesChanged(prev: PersistentBattle[], next: PersistentBattle[]) {
  if (prev.length !== next.length) return true;
  const prevMap = new Map(prev.map(b => [b.id, b]));
  const nextMap = new Map(next.map(b => [b.id, b]));
  for (const [id, nextBattle] of nextMap) {
    const prevBattle = prevMap.get(id);
    if (!prevBattle) return true; // new battle
    if (
      prevBattle.status !== nextBattle.status ||
      prevBattle.player_count !== nextBattle.player_count ||
      prevBattle.players.length !== nextBattle.players.length ||
      prevBattle.game_mode !== nextBattle.game_mode ||
      prevBattle.team_mode !== nextBattle.team_mode
    ) return true;
    // Compare player user_ids
    const prevPlayerIds = prevBattle.players.map(p => p.user_id).sort().join(',');
    const nextPlayerIds = nextBattle.players.map(p => p.user_id).sort().join(',');
    if (prevPlayerIds !== nextPlayerIds) return true;
  }
  return false;
}

export const usePersistentBattles = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [availableBattles, setAvailableBattles] = useState<PersistentBattle[]>([]);
  const [loading, setLoading] = useState(false);
  const hasSetupSubscription = useRef(false);

  // Memoize fetchAvailableBattles to keep the effect stable
  const fetchAvailableBattles = useCallback(async () => {
    try {
      setLoading(true);
      const battles = await fetchAvailableBattlesApi();
      // Filter out battles older than 30 minutes
      const now = Date.now();
      const THIRTY_MINUTES = 30 * 60 * 1000;
      const filteredBattles = battles.filter(battle => {
        const createdAt = new Date(battle.created_at).getTime();
        return now - createdAt < THIRTY_MINUTES;
      });
      setAvailableBattles(prev => {
        if (battlesChanged(prev, filteredBattles)) return filteredBattles;
        return prev;
      });
    } catch (error) {
      console.error('Error fetching battles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available battles',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create a new persistent battle
  const createPersistentBattle = async (
    battleCrates: Array<{crate: RustCrate, quantity: number}>,
    playerCount: number,
    gameMode: string,
    teamMode: string
  ) => {
    if (!profile) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create battles.',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const totalCost = battleCrates.reduce((total, item) => total + (item.crate.price * item.quantity), 0);
      
      console.log('Creating persistent battle with preserved modes:', { gameMode, teamMode, playerCount });
      
      const response = await createPersistentBattleApi(
        profile.id,
        battleCrates,
        playerCount,
        gameMode, // Ensure exact game mode is passed
        teamMode  // Ensure exact team mode is passed
      );

      if (!response) {
        toast({
          title: 'Failed to Create Battle',
          description: 'Unknown error occurred',
          variant: 'destructive'
        });
        return null;
      }

      // Optimistic update: add a placeholder battle immediately
      setAvailableBattles(prev => [
        {
          id: typeof response === 'string' ? response : (response?.id || ''), // ensure string id
          creator_id: profile.id,
          total_value: totalCost,
          player_count: playerCount,
          game_mode: gameMode,
          team_mode: teamMode,
          crates: battleCrates,
          status: 'waiting',
          created_at: new Date().toISOString(),
          players: [
            {
              user_id: profile.id,
              name: profile.nickname || 'You',
              avatar: profile.avatar_url,
              isBot: false,
              level: profile.level || 1,
              team: null,
              slot_number: 1
            }
          ]
        },
        ...prev
      ]);

      console.log('Battle created successfully with modes:', { gameMode, teamMode });

      toast({
        title: 'Battle Created!',
        description: `Battle created successfully! Cost: $${totalCost.toFixed(2)}`,
      });

      // Refresh battles list
      fetchAvailableBattles();
      
      return response;
    } catch (error) {
      console.error('Error creating battle:', error);
      toast({
        title: 'Error',
        description: 'Failed to create battle',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Join an existing battle
  const joinPersistentBattle = async (battleId: string) => {
    if (!profile) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to join battles.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const response = await joinPersistentBattleApi(battleId, profile.id);
      console.log(response, 'asdfasdfadsfasdfadf');
      if (!response) {
        toast({
          title: 'Failed to Join Battle',
          description: 'Unknown error occurred',
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Joined Battle!',
        description: `Successfully joined battle!`,
      });

      // Refresh battles list
      fetchAvailableBattles();
      
      return true;
    } catch (error) {
      console.error('Error joining battle:', error);
      toast({
        title: 'Error',
        description: 'Failed to join battle',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Add bot to specific slot
  const addBotToSlot = async (battleId: string, slotNumber: number) => {
    if (!profile) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add bots.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const response = await addBotToSlotApi(battleId, slotNumber, profile.id);

      if (!response) {
        toast({
          title: 'Failed to Add Bot',
          description: 'Unknown error occurred',
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Bot Added!',
        description: `Bot added to slot ${slotNumber}`,
      });

      // Refresh battles list
      fetchAvailableBattles();
      
      return true;
    } catch (error) {
      console.error('Error adding bot:', error);
      toast({
        title: 'Error',
        description: 'Failed to add bot',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Initial fetch - only run once
  React.useEffect(() => {
    if (!hasSetupSubscription.current) {
      fetchAvailableBattles();
      hasSetupSubscription.current = true;
    }
  }, [fetchAvailableBattles]);

  // Real-time subscription for all battles
  useEffect(() => {
    if (hasSetupSubscription.current) return;
    hasSetupSubscription.current = true;

    const channel = supabase
      .channel('crate-battles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crate_battles' }, () => {
        fetchAvailableBattles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      hasSetupSubscription.current = false;
    };
  }, [fetchAvailableBattles]);

  return {
    availableBattles,
    loading,
    createPersistentBattle,
    joinPersistentBattle,
    addBotToSlot,
    fetchAvailableBattles
  };
};
