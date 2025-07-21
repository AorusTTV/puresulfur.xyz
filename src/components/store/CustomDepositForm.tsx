
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Coins } from 'lucide-react';

interface CustomDepositFormProps {
  onDeposit: (amount: number) => void;
  loading: boolean;
  selectedProvider: string;
}

export const CustomDepositForm = ({ onDeposit, loading }: CustomDepositFormProps) => {
  const [customAmount, setCustomAmount] = useState('');

  const calculateSulfur = (dollars: number) => Math.floor(dollars * 1.30);

  const handleCustomDeposit = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount < 1) {
      return;
    }
    onDeposit(amount);
  };

  const isValidAmount = customAmount && !isNaN(parseFloat(customAmount)) && parseFloat(customAmount) >= 1;

  return (
    <Card className="bg-card/80 border-2 border-primary/30 shadow-lg">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-400" />
          <span>Custom Deposit</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customAmount" className="text-foreground">
            Amount in Dollars (USD)
          </Label>
          <Input
            id="customAmount"
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Enter amount..."
            min="1"
            step="0.01"
            className="bg-muted/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        {isValidAmount && (
          <div className="bg-muted/30 p-4 rounded-lg border border-border/30 space-y-2">
            <div className="text-foreground text-sm">
              You will receive: <span className="text-yellow-400 font-bold">
                {calculateSulfur(parseFloat(customAmount))} Sulfur
              </span>
            </div>
            <div className="text-muted-foreground text-xs">
              Exchange rate: $1 = 1.30 Sulfur
            </div>
          </div>
        )}

        <Button
          onClick={handleCustomDeposit}
          disabled={loading || !isValidAmount}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold py-3 border border-primary/30 shadow-lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Make Deposit via PayPal
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
