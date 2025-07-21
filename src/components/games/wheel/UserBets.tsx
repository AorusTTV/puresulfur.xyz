
import React from 'react';

interface UserBet {
  id: string;
  bet_color: string;
  multiplier: number;
  bet_amount: number;
}

interface UserBetsProps {
  userBets: UserBet[];
}

export const UserBets: React.FC<UserBetsProps> = ({ userBets }) => {
  // This component now just passes the bets data to the MultiplierButtons
  // The actual display is handled there
  return null;
};
