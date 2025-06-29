
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useBalanceOperations } from './useBalanceOperations';

export const useBattleJoining = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { deductBalance } = useBalanceOperations();

  const joinBattle = async (battle: any, onJoinSuccess: (battle: any) => void) => {
    if (!profile) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to join battles.',
        variant: 'destructive'
      });
      return;
    }

    const totalCost = battle.totalValue / battle.playerCount;
    
    if (profile.balance < totalCost) {
      toast({
        title: 'Insufficient Balance',
        description: `You need $${totalCost.toFixed(2)} to join this battle.`,
        variant: 'destructive'
      });
      return;
    }

    try {
      // Deduct the battle cost from player's balance
      await deductBalance(profile.id, totalCost);

      // Determine team for team modes with proper balancing
      let team = null;
      if (battle.teamMode === '2v2') {
        const team1Count = battle.players.filter((p: any) => p.team === 'team1').length;
        const team2Count = battle.players.filter((p: any) => p.team === 'team2').length;
        
        // Assign to the team with fewer players, ensuring team2 gets priority when equal
        team = team1Count > team2Count ? 'team2' : 'team1';
      } else if (battle.teamMode === '3v3') {
        const team1Count = battle.players.filter((p: any) => p.team === 'team1').length;
        const team2Count = battle.players.filter((p: any) => p.team === 'team2').length;
        
        // Assign to the team with fewer players, ensuring balanced 3v3 teams
        team = team1Count > team2Count ? 'team2' : 'team1';
      }
      // For 1v1v1 mode, team remains null (no teams)

      // Add player to battle
      const updatedBattle = {
        ...battle,
        players: [
          ...battle.players,
          {
            id: profile.id,
            name: profile.nickname || 'Player',
            avatar: profile.avatar_url,
            isYou: true,
            isBot: false,
            level: profile.level || 1,
            experience: profile.experience || 0,
            team,
            paidAmount: totalCost // Track how much this player paid
          }
        ],
        onlinePlayerCount: battle.onlinePlayerCount + 1
      };

      toast({
        title: 'Joined Battle',
        description: `$${totalCost.toFixed(2)} deducted from your balance. Battle joined successfully!`,
      });

      onJoinSuccess(updatedBattle);
    } catch (error) {
      toast({
        title: 'Failed to Join Battle',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return {
    joinBattle
  };
};
