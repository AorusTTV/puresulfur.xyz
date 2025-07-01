
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RustCrate } from '@/components/games/cratebattles/rustCrateData';
import { useBalanceOperations } from './useBalanceOperations';
import { usePersistentBattles } from './usePersistentBattles';

export const useBattleCreation = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { deductBalance } = useBalanceOperations();
  const { createPersistentBattle } = usePersistentBattles();

  const createBattle = async (
    selectedCrate: RustCrate | null, 
    onStartBattle: (battle: any) => void,
    battleCrates: Array<{crate: RustCrate, quantity: number}> = [],
    playerCount: number,
    gameMode: 'default' | 'terminal' | 'unlucky' | 'jackpot' | 'puresulfur',
    teamMode: string,
    isPersistent: boolean = false
  ) => {
    if (battleCrates.length === 0) {
      toast({
        title: 'No Crates Added',
        description: 'Please add at least one crate to start the battle.',
        variant: 'destructive'
      });
      return;
    }

    const totalCost = battleCrates.reduce((total, item) => total + (item.crate.price * item.quantity), 0);
    
    if (!profile || profile.balance < totalCost) {
      toast({
        title: 'Insufficient Balance',
        description: `You need $${totalCost.toFixed(2)} to start this battle.`,
        variant: 'destructive'
      });
      return;
    }

    if (isPersistent) {
      // Create persistent battle in database with exact game mode preservation
      console.log('Creating persistent battle with game mode:', gameMode, 'and team mode:', teamMode);
      
      const battleId = await createPersistentBattle(
        battleCrates,
        teamMode === '2v2' ? 4 : teamMode === '3v3' ? 6 : teamMode === '1v1v1' ? 3 : playerCount,
        gameMode, // Pass exact game mode to backend
        teamMode // Pass exact team mode to backend
      );

      if (battleId) {
        // Battle created successfully, it will appear in available battles
        toast({
          title: 'Battle Listed!',
          description: 'Your battle has been created and is now available for other players to join.',
        });
      }
    } else {
      // Create temporary in-memory battle (legacy behavior)
      try {
        await deductBalance(profile.id, totalCost);

        const actualPlayerCount = teamMode === '2v2' ? 4 : teamMode === '3v3' ? 6 : teamMode === '1v1v1' ? 3 : playerCount;

        const battle = {
          id: Date.now().toString(),
          crates: battleCrates,
          selectedCrate,
          playerCount: actualPlayerCount,
          gameMode, // Preserve exact game mode
          teamMode, // Preserve exact team mode
          players: [
            {
              id: profile?.id || '0',
              name: profile?.nickname || 'You',
              avatar: profile?.avatar_url,
              isYou: true,
              isBot: false,
              level: profile?.level || 1,
              experience: profile?.experience || 0,
              team: (teamMode === '2v2' || teamMode === '3v3') ? 'team1' : null,
              paidAmount: totalCost
            }
          ],
          status: 'waiting',
          totalValue: totalCost,
          createdAt: Date.now(),
          isOnline: true,
          onlinePlayerCount: 1,
          maxWaitTime: 60,
          allowBots: true,
          battleRegion: 'Global',
          difficulty: gameMode === 'terminal' ? 'Hard' : gameMode === 'unlucky' ? 'Expert' : gameMode === 'jackpot' ? 'Extreme' : gameMode === 'puresulfur' ? 'Ultimate' : 'Normal',
          matchmakingSettings: {
            autoStartWithBots: false,
            maxWaitTime: 60,
            preferredRegion: 'Global',
            skillMatchmaking: false
          },
          battleSettings: {
            enableSpectators: true,
            enableChat: true,
            enableReplay: true
          }
        };

        console.log('Created enhanced battle with preserved game mode:', gameMode, 'and team mode:', teamMode, battle);
        
        toast({
          title: 'Battle Created!',
          description: `$${totalCost.toFixed(2)} deducted from your balance. Searching for players...`,
        });
        
        onStartBattle(battle);
      } catch (error) {
        toast({
          title: 'Failed to Create Battle',
          description: 'There was an error processing your payment. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  return {
    createBattle
  };
};
