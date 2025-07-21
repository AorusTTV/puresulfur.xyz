
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Users, DollarSign, Package, Coins } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { JackpotGameData } from '@/types/jackpot';

interface JackpotGameCardProps {
  currentGame: JackpotGameData;
  totalPot: number;
  prizeAmount: number;
  houseFeeAmount: number;
  houseFeePct: number;
  entryCount: number;
  user: any;
  onJoin: (amount: number) => Promise<boolean>;
  isLoading: boolean;
  calculateWinChance: (amount: number) => number;
}

export const JackpotGameCard = ({
  currentGame,
  totalPot,
  prizeAmount,
  houseFeeAmount,
  houseFeePct,
  entryCount,
  user,
  onJoin,
  isLoading,
  calculateWinChance
}: JackpotGameCardProps) => {
  const [balanceAmount, setBalanceAmount] = useState('');
  const { toast } = useToast();

  const handleBalanceDeposit = async () => {
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0 || amount > 500) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount between $1 and $500.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onJoin(amount);
      toast({
        title: 'Success',
        description: 'Successfully deposited balance to jackpot!',
      });
      setBalanceAmount('');
    } catch (error) {
      console.error('Error depositing balance:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to deposit balance. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Crown className="h-8 w-8 text-yellow-400" />
          Current Jackpot
        </CardTitle>
        
        {/* Pot Value Display */}
        <div className="space-y-2">
          <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
            ${totalPot.toFixed(2)}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="text-slate-400">Winner Gets</div>
              <div className="text-green-400 font-bold text-lg">
                ${prizeAmount.toFixed(2)}
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="text-slate-400">House Fee ({houseFeePct}%)</div>
              <div className="text-orange-400 font-bold text-lg">
                ${houseFeeAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{entryCount}</div>
            <div className="text-slate-400 text-sm">Players</div>
          </div>
          <div className="text-center">
            <DollarSign className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">${totalPot.toFixed(2)}</div>
            <div className="text-slate-400 text-sm">Total Pot</div>
          </div>
        </div>

        {/* Join Options */}
        {user ? (
          <Tabs defaultValue="balance" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
              <TabsTrigger value="balance" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Balance
              </TabsTrigger>
              <TabsTrigger value="skins" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Skins
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="balance" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="balanceAmount">Deposit Balance</Label>
                <div className="flex gap-2">
                  <Input
                    id="balanceAmount"
                    type="number"
                    placeholder="Enter amount ($1-500)"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    min="1"
                    max="500"
                    step="0.01"
                    className="bg-slate-800/50 border-slate-600"
                  />
                  <Button 
                    onClick={handleBalanceDeposit}
                    disabled={!balanceAmount || isLoading}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    {isLoading ? 'Depositing...' : 'Deposit'}
                  </Button>
                </div>
                {balanceAmount && (
                  <div className="text-sm text-slate-400 text-center">
                    Your win chance: {calculateWinChance(parseFloat(balanceAmount)).toFixed(2)}%
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="skins" className="mt-4">
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <Package className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400 mb-2">
                  Deposit skins from your inventory below
                </p>
                <p className="text-slate-500 text-sm">
                  Scroll down to see your inventory
                </p>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center p-6 bg-slate-700/30 rounded-lg">
            <Crown className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Join the Action!</h3>
            <p className="text-slate-400 mb-4">
              Log in to participate in this jackpot game
            </p>
            <Badge variant="outline" className="text-slate-400">
              Login Required
            </Badge>
          </div>
        )}

        {/* Game Status */}
        <div className="text-center">
          <Badge 
            variant="outline" 
            className="bg-green-500/20 text-green-400 border-green-500/50"
          >
            🟢 Game Active
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
