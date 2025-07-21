
export interface MineFieldCell {
  id: number;
  isRevealed: boolean;
  isMine: boolean;
  isSelected: boolean;
}

export interface MineFieldGame {
  id: string;
  cells: MineFieldCell[];
  totalCells: number;
  mineCount: number;
  revealedCount: number;
  betAmount: number;
  currentMultiplier: number;
  gameStatus: 'waiting' | 'playing' | 'won' | 'lost';
  profit: number;
}

export interface MineFieldBet {
  amount: number;
  mineCount: number;
}
