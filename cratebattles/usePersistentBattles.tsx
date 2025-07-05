
import React, { useState, useCallback, useRef } from 'react';
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

export const usePersistentBattles = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [availableBattles, setAvailableBattles] = useState<PersistentBattle[]>([]);
  const [loading, setLoading] = useState(false);
  const hasSetupSubscription = useRef(false);

  // Fetch available battles
  const fetchAvailableBattles = useCallback(async () => {
    try {
      setLoading(true);
      const battles = await fetchAvailableBattlesApi();
      console.log('Setting available battles with modes:', battles.map(b => ({ id: b.id, game_mode: b.game_mode, team_mode: b.team_mode })));
      setAvailableBattles(battles);
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

      if (!response?.success) {
        toast({
          title: 'Failed to Create Battle',
          description: response?.error || 'Unknown error occurred',
          variant: 'destructive'
        });
        return null;
      }

      console.log('Battle created successfully with modes:', { gameMode, teamMode });

      toast({
        title: 'Battle Created!',
        description: `Battle created successfully! Cost: $${totalCost.toFixed(2)}`,
      });

      // Refresh battles list
      fetchAvailableBattles();
      
      return response.battle_id;
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

      if (!response?.success) {
        toast({
          title: 'Failed to Join Battle',
          description: response?.error || 'Unknown error occurred',
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Joined Battle!',
        description: `Successfully joined battle in slot ${response.slot_number}`,
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

      if (!response?.success) {
        toast({
          title: 'Failed to Add Bot',
          description: response?.error || 'Unknown error occurred',
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Bot Added!',
        description: `${response.bot_name} added to slot ${response.slot_number}`,
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

  return {
    availableBattles,
    loading,
    createPersistentBattle,
    joinPersistentBattle,
    addBotToSlot,
    fetchAvailableBattles
  };
};
