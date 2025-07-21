
import { supabase } from '@/integrations/supabase/client';

interface WheelSection {
  number: number;
  multiplier: number;
  color: string;
  textColor: string;
}

// Corrected wheel sections to match the actual wheel image
// Starting from top (12 o'clock) going clockwise
export const wheelSections: WheelSection[] = [
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' },  // Section 0: Yellow (top)
  { number: 5, multiplier: 6, color: '#5DADE2', textColor: '#000' },  // Section 1: Blue 
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' },  // Section 2: Yellow
  { number: 3, multiplier: 4, color: '#58D68D', textColor: '#000' },  // Section 3: Green (where pointer shows in image)
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' },  // Section 4: Yellow
  { number: 10, multiplier: 11, color: '#AF7AC5', textColor: '#000' }, // Section 5: Purple
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' },  // Section 6: Yellow
  { number: 5, multiplier: 6, color: '#5DADE2', textColor: '#000' },  // Section 7: Blue
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' },  // Section 8: Yellow
  { number: 3, multiplier: 4, color: '#58D68D', textColor: '#000' },  // Section 9: Green
  { number: 20, multiplier: 21, color: '#F1948A', textColor: '#000' }, // Section 10: Red
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' },  // Section 11: Yellow
  { number: 3, multiplier: 4, color: '#58D68D', textColor: '#000' },  // Section 12: Green
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' },  // Section 13: Yellow
  { number: 5, multiplier: 6, color: '#5DADE2', textColor: '#000' },  // Section 14: Blue
  { number: 1, multiplier: 2, color: '#F4D03F', textColor: '#000' }   // Section 15: Yellow
];

// Updated color mapping to match visual colors with proper names
export const colorMapping = {
  1: 'yellow',
  3: 'green', 
  5: 'blue',
  10: 'purple',
  20: 'red'
};

// Helper function to get color name from number
export const getColorNameFromNumber = (number: number): string => {
  return colorMapping[number as keyof typeof colorMapping] || 'unknown';
};

// Helper function to get display color from color name
export const getDisplayColorFromName = (colorName: string): string => {
  const colorDisplayMapping = {
    yellow: 'Yellow',
    green: 'Green',
    blue: 'Blue', 
    purple: 'Purple',
    red: 'Red'
  };
  return colorDisplayMapping[colorName as keyof typeof colorDisplayMapping] || colorName;
};

export const loadCurrentGame = async (userId?: string) => {
  try {
    console.log('Loading current game...');
    
    const { data: gameData, error: gameError } = await supabase.rpc('get_or_create_active_wheel_game');
    
    if (gameError) {
      console.error('Error getting active game:', gameError);
      return null;
    }
    
    if (gameData) {
      console.log('Active game ID:', gameData);
      
      const { data: game, error: gameDetailsError } = await supabase
        .from('wheel_games')
        .select('*')
        .eq('id', gameData)
        .single();
        
      if (gameDetailsError) {
        console.error('Error getting game details:', gameDetailsError);
        return null;
      }
      
      console.log('Game details:', game);
      
      const { data: bets, error: betsError } = await supabase
        .from('wheel_bets')
        .select('*')
        .eq('game_id', gameData);
        
      if (betsError) {
        console.error('Error getting bets:', betsError);
        return { game, bets: [], uniquePlayerCount: 0 };
      }
      
      console.log('All bets for game:', bets);
      
      const uniquePlayerCount = bets ? new Set(bets.map(bet => bet.user_id)).size : 0;
      
      return { game, bets: bets || [], uniquePlayerCount };
    }
    
    return null;
  } catch (error) {
    console.error('Error loading game:', error);
    return null;
  }
};

export const selectWinningSection = () => {
  const randomIndex = Math.floor(Math.random() * wheelSections.length);
  const selectedWinningSection = wheelSections[randomIndex];
  
  console.log('Winning section:', selectedWinningSection, 'at index:', randomIndex);
  
  return { section: selectedWinningSection, index: randomIndex };
};
