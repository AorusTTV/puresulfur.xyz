
// This file has been simplified to remove duplicate XP calls
// All XP handling is now done in the database functions

export const coinflipUtils = {
  getResultMessage(isWinner: boolean, winningPayout?: number, winningSide?: string, isBot?: boolean): {
    title: string;
    description: string;
    variant?: 'destructive';
  } {
    const sideLabel = winningSide === 'heads' ? 'SULFUR' : 'SCRAP';
    
    if (isWinner) {
      const prefix = isBot ? 'You beat the bot! Won' : 'You won';
      return {
        title: 'Congratulations! 🎉',
        description: `${prefix} ${winningPayout} sulfur! The coin landed on ${sideLabel}.`
      };
    } else {
      const prefix = isBot ? 'The house won' : 'You lost';
      return {
        title: isBot ? 'Bot wins this round!' : 'Better luck next time!',
        description: `${prefix}. The coin landed on ${sideLabel}.`,
        variant: 'destructive' as const
      };
    }
  }
};
