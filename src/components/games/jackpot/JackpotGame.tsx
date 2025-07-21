
import React from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { JackpotGameCard } from './JackpotGameCard';
import { JackpotEntriesList } from './JackpotEntriesList';
import { JackpotHistory } from './JackpotHistory';
import { JackpotStats } from './JackpotStats';
import { PlayerInventory } from './PlayerInventory';
import { useJackpotGame } from '@/hooks/useJackpotGame';
import { GameGuard } from '@/components/games/GameGuard';
import { useAuth } from '@/contexts/AuthContext';

interface JackpotGameProps {
  onBackToGames?: () => void;
}

export const JackpotGame: React.FC<JackpotGameProps> = ({ onBackToGames }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentGame,
    entries,
    history,
    userInventory,
    loading,
    refreshGame,
    addBalanceEntry,
    addItemEntry
  } = useJackpotGame();

  // Calculate derived values
  const totalPot = entries.reduce((sum, entry) => sum + entry.value, 0);
  const houseFeePct = 10;
  const houseFeeAmount = totalPot * (houseFeePct / 100);
  const prizeAmount = totalPot - houseFeeAmount;
  const entryCount = entries.length;

  const calculateWinChance = (amount: number) => {
    const newTotal = totalPot + amount;
    return newTotal > 0 ? (amount / newTotal) * 100 : 0;
  };

  const handleJoin = async (amount: number) => {
    if (!user) return false;
    return addBalanceEntry(user.id, amount);
  };

  const handleDepositSkin = async (itemId: string, value: number) => {
    if (!user) return false;
    return addItemEntry(user.id, itemId, value);
  };

  const handleBackToGames = () => {
    if (onBackToGames) {
      onBackToGames();
    } else {
      navigate('/games');
    }
  };

  return (
    <GameGuard gameName="Jackpot">
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={handleBackToGames}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Games
            </Button>
            
            <div className="text-center">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-orbitron gaming-text-glow flex items-center justify-center gap-3">
                <Trophy className="h-8 w-8 text-primary" />
                JACKPOT
              </h1>
              <p className="text-muted-foreground mt-1">Winner takes all</p>
            </div>
            
            <div className="w-32" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Game Area */}
            <div className="xl:col-span-2 space-y-6">
              <JackpotGameCard
                currentGame={currentGame}
                totalPot={totalPot}
                prizeAmount={prizeAmount}
                houseFeeAmount={houseFeeAmount}
                houseFeePct={houseFeePct}
                entryCount={entryCount}
                user={user}
                onJoin={handleJoin}
                isLoading={loading}
                calculateWinChance={calculateWinChance}
              />
              
              <JackpotEntriesList
                entries={entries}
                totalPot={totalPot}
              />
              
              <JackpotHistory />
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              <JackpotStats
                totalPot={totalPot}
                entryCount={entryCount}
                prizeAmount={prizeAmount}
                houseFeeAmount={houseFeeAmount}
                houseFeePct={houseFeePct}
              />
              
              {user && (
                <PlayerInventory
                  userId={user.id}
                  onDepositSkin={handleDepositSkin}
                  isLoading={loading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </GameGuard>
  );
};
