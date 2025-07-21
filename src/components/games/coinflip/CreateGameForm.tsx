
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Coins, Plus, Bot } from 'lucide-react';
import { SulfurIcon } from '@/components/ui/SulfurIcon';

interface CreateGameFormProps {
  onCreateGame: (side: 'heads' | 'tails', betAmount: number, entryType: 'balance' | 'item', itemId?: string) => Promise<boolean>;
  onPlayAgainstBot: (gameId: string) => Promise<boolean>;
  isCreating: boolean;
  isJoining: boolean;
  userBalance: number;
  isLoggedIn: boolean;
}

export const CreateGameForm: React.FC<CreateGameFormProps> = ({
  onCreateGame,
  onPlayAgainstBot,
  isCreating,
  isJoining,
  userBalance,
  isLoggedIn
}) => {
  const [betAmount, setBetAmount] = useState('');
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    if (amount > userBalance) {
      return;
    }

    // Always create a regular game that can be joined by other players
    const success = await onCreateGame(selectedSide, amount, 'balance');
    if (success) {
      setBetAmount('');
    }
  };

  const quickAmounts = [1, 5, 10, 25, 50, 100];

  const getSideLabel = (side: 'heads' | 'tails') =>  {
    return side === 'heads' ? 'SULFUR' : 'SCRAP';
  };

  const getSideEmoji = (side: 'heads' | 'tails') => {
    return side === 'heads' ? '💎' : '🔧';
  };

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Game
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isLoggedIn ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You must be logged in to create a coinflip game</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Choose Side */}
            <div>
              <Label className="text-foreground mb-3 block">Choose Your Side</Label>
              <div className="grid grid-cols-2 gap-8 justify-items-center">
                <button
                  type="button"
                  onClick={() => setSelectedSide('heads')}
                  className={`relative w-24 h-24 rounded-full border-4 transition-all overflow-hidden ${
                    selectedSide === 'heads'
                      ? 'border-primary ring-4 ring-primary/50 shadow-lg shadow-primary/30'
                      : 'border-border hover:border-border/80 hover:shadow-lg'
                  }`}
                  style={{
                    backgroundImage: 'url(/lovable-uploads/bbf53329-0f1e-46fd-84d6-bf6a91cf30d6.png)',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: 'hsl(var(--muted))'
                  }}
                >
                  <div className="absolute inset-0 bg-background/20 rounded-full" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSide('tails')}
                  className={`relative w-24 h-24 rounded-full border-4 transition-all overflow-hidden ${
                    selectedSide === 'tails'
                      ? 'border-destructive ring-4 ring-destructive/50 shadow-lg shadow-destructive/30'
                      : 'border-border hover:border-border/80 hover:shadow-lg'
                  }`}
                  style={{
                    backgroundImage: 'url(/lovable-uploads/9beac9f2-e7da-479a-a7e7-3a62035be1e5.png)',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: 'hsl(var(--muted))'
                  }}
                >
                  <div className="absolute inset-0 bg-background/20 rounded-full" />
                </button>
              </div>
            </div>

            {/* Bet Amount */}
            <div>
              <Label htmlFor="betAmount" className="text-foreground mb-2 block">
                Bet Amount
              </Label>
              <div className="relative">
                <SulfurIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                <Input
                  id="betAmount"
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="pl-10 bg-muted border-border text-foreground"
                  min="0.01"
                  step="0.01"
                  max={userBalance}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  Balance: <SulfurIcon className="h-3 w-3" /> {userBalance.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => setBetAmount(userBalance.toString())}
                  className="text-primary hover:text-primary/80"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <Label className="text-foreground mb-2 block">Quick Amounts</Label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setBetAmount(amount.toString())}
                    disabled={amount > userBalance}
                    className={`p-2 text-sm rounded border transition-all ${
                      amount <= userBalance
                        ? 'border-border bg-muted text-muted-foreground hover:border-border/80 hover:bg-muted/80'
                        : 'border-border/50 bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Potential Winnings */}
            {betAmount && !isNaN(parseFloat(betAmount)) && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Potential Winnings:</span>
                  <span className="text-accent font-bold flex items-center gap-1">
                    <SulfurIcon className="h-3 w-3" />
                    {(parseFloat(betAmount) * 2).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={
                !betAmount || 
                isNaN(parseFloat(betAmount)) || 
                parseFloat(betAmount) <= 0 || 
                parseFloat(betAmount) > userBalance || 
                isCreating ||
                isJoining
              }
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                  Creating Game...
                </div>
              ) : (
                `Create ${getSideLabel(selectedSide)} Game`
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Your game will be available for other players to join, or you can use the "Call Bot" option on any game for instant play.
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
