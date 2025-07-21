
import React from 'react';
import { BettingForm } from './BettingForm';
import { UserBets } from './UserBets';
import { PlayerList } from './PlayerList';

interface WheelSidebarProps {
  betAmount: string;
  selectedMultiplier: number | null;
  userBalance: number;
  isSpinning: boolean;
  isLoggedIn: boolean;
  userBets: any[];
  currentGame: any;
  totalBets: number;
  playerCount: number;
  onBetAmountChange: (value: string) => void;
  onPlaceBet: () => void;
  onClearBet: () => void;
  onMaxBet: () => void;
  onDoubleBet: () => void;
  onDivideBet: () => void;
  onAddToBet: (amount: number) => void;
}

export const WheelSidebar: React.FC<WheelSidebarProps> = ({
  betAmount,
  selectedMultiplier,
  userBalance,
  isSpinning,
  isLoggedIn,
  userBets,
  currentGame,
  totalBets,
  playerCount,
  onBetAmountChange,
  onPlaceBet,
  onClearBet,
  onMaxBet,
  onDoubleBet,
  onDivideBet,
  onAddToBet
}) => {
  return (
    <div className="space-y-6">
      {/* Betting Section */}
      <BettingForm
        betAmount={betAmount}
        selectedMultiplier={selectedMultiplier}
        userBalance={userBalance}
        isSpinning={isSpinning}
        isLoggedIn={isLoggedIn}
        onBetAmountChange={onBetAmountChange}
        onPlaceBet={onPlaceBet}
        onClearBet={onClearBet}
        onMaxBet={onMaxBet}
        onDoubleBet={onDoubleBet}
        onDivideBet={onDivideBet}
        onAddToBet={onAddToBet}
      />

      {/* User Bets */}
      <UserBets userBets={userBets} />

      {/* Players - now showing real player data */}
      <PlayerList 
        totalBets={totalBets} 
        playerCount={playerCount} 
        currentGameId={currentGame?.id}
      />
    </div>
  );
};
