import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Package, Loader2 } from 'lucide-react';
interface CreateGameFormProps {
  selectedSide: string;
  onCreateGame: (betAmount: number, entryType: string, itemId?: string) => void;
  loading: boolean;
}

export const CreateGameForm: React.FC<CreateGameFormProps> = ({
  selectedSide,
  onCreateGame,
  loading
}) => {
  const { profile } = useAuth();
  const [betAmount, setBetAmount] = useState<string>('');
  const [entryType, setEntryType] = useState<string>('balance');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    if (entryType === 'balance' && profile && amount > profile.balance) {
      return;
    }

    onCreateGame(amount, entryType);
  };

  const quickAmounts = [1, 5, 10, 25, 50, 100];

  return (
    <Card className="bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Create Dual Game</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Selected side:</span>
          <span className="font-semibold text-primary capitalize">{selectedSide}</span>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={entryType} onValueChange={setEntryType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="balance" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Balance
              </TabsTrigger>
              <TabsTrigger value="item" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Item
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="balance" className="space-y-4">
              <div>
                <Label htmlFor="bet-amount">Bet Amount</Label>
                <Input
                  id="bet-amount"
                  type="number"
                  step="0.01"
                  min="1"
                  max="2000"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="Enter bet amount..."
                  className="mt-1"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  Balance: ${profile?.balance?.toFixed(2) || '0.00'}
                </div>
              </div>
              
              <div>
                <Label>Quick Amounts</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBetAmount(amount.toString())}
                      disabled={profile && amount > profile.balance}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="item" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Item betting coming soon!</p>
                <p className="text-sm">Use balance betting for now.</p>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            type="submit"
            className="w-full"
            disabled={
              loading ||
              !betAmount ||
              isNaN(parseFloat(betAmount)) ||
              parseFloat(betAmount) <= 0 ||
              (entryType === 'balance' && profile && parseFloat(betAmount) > profile.balance)
            }
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Game...
              </>
            ) : (
              'Create Game'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};