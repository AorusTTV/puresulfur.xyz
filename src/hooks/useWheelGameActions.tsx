
import { supabase } from '@/integrations/supabase/client';
import { wheelSections, colorMapping, selectWinningSection, getDisplayColorFromName } from '@/utils/wheelGameUtils';

interface UseWheelGameActionsProps {
  currentGame: any;
  userBets: any[];
  setIsSpinning: (value: boolean) => void;
  setTimeLeft: (value: number) => void;
  setUserBets: (value: any[]) => void;
  setWinningSection: (value: number | null) => void;
  refreshProfile: () => Promise<void>;
  loadCurrentGame: () => Promise<void>;
}

export const useWheelGameActions = ({
  currentGame,
  userBets,
  setIsSpinning,
  setTimeLeft,
  setUserBets,
  setWinningSection,
  refreshProfile,
  loadCurrentGame
}: UseWheelGameActionsProps) => {

  const handleSpin = async () => {
    if (!currentGame) {
      console.log('No current game available for spinning - creating new game');
      await loadCurrentGame();
      return;
    }

    // Prevent multiple spins - check if already spinning or completed
    if (currentGame.status === 'spinning' || currentGame.status === 'completed') {
      console.log('Game is already spinning or completed, ignoring spin request');
      return;
    }
    
    console.log('Starting wheel spin for game:', currentGame.id);
    
    // Store current round bets before starting spin
    const currentRoundBets = [...userBets];
    
    try {
      // Update game status to spinning immediately
      const { error: updateError } = await supabase
        .from('wheel_games')
        .update({ status: 'spinning' })
        .eq('id', currentGame.id);
        
      if (updateError) {
        console.error('Error updating game status:', updateError);
        throw updateError;
      }
      
      // Select winning section
      const { section: selectedWinningSection, index: randomIndex } = selectWinningSection();
      
      console.log('Selected winning section:', selectedWinningSection, 'at index:', randomIndex);
      console.log('Winning section details:', {
        number: selectedWinningSection.number,
        multiplier: selectedWinningSection.multiplier,
        color: selectedWinningSection.color
      });
      
      // Set winning section and start animation
      setWinningSection(randomIndex);
      setIsSpinning(true);
      setTimeLeft(0);
      
      // Wait for wheel animation to complete (3 seconds exactly)
      setTimeout(async () => {
        try {
          const winningColor = colorMapping[selectedWinningSection.number as keyof typeof colorMapping];
          const displayColor = getDisplayColorFromName(winningColor);
          
          console.log('Completing game with:', {
            winningNumber: selectedWinningSection.number,
            winningColor: winningColor,
            displayColor: displayColor,
            gameId: currentGame.id
          });
          
          const { data, error } = await supabase.rpc('complete_wheel_game', {
            p_game_id: currentGame.id,
            p_winning_number: selectedWinningSection.number,
            p_winning_color: winningColor
          });
          
          if (error) {
            console.error('Error completing game:', error);
            throw error;
          }
          
          console.log('Game completion response:', data);
          
          const response = data as unknown as { success: boolean; winners_paid?: number; total_paid?: number };
          
          // Reset state
          setIsSpinning(false);
          setWinningSection(null);
          setUserBets([]); // Clear user bets for new round
          
          // Check winning bets based on winning color
          const userWinningBets = currentRoundBets.filter(bet => bet.bet_color === winningColor);
          const userHadBets = currentRoundBets.length > 0;
          
          console.log('User betting results:', {
            totalUserBets: currentRoundBets.length,
            winningBets: userWinningBets.length,
            winningColor: winningColor,
            displayColor: displayColor,
            userBets: currentRoundBets.map(bet => ({ color: bet.bet_color, amount: bet.bet_amount }))
          });
          
          await refreshProfile();
          
          // Start new game after short delay - BUT DON'T START A NEW TIMER
          setTimeout(async () => {
            await loadCurrentGame();
            // Start fresh 30-second timer for the new game
            setTimeLeft(30);
          }, 2000);
          
        } catch (error) {
          console.error('Error in spin completion:', error);
          setIsSpinning(false);
          setWinningSection(null);
        }
      }, 3000); // Match exactly to animation time
      
    } catch (error) {
      console.error('Error starting spin:', error);
      setIsSpinning(false);
    }
  };

  return {
    handleSpin
  };
};
