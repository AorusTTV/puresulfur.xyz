
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Coins } from 'lucide-react';

interface DepositOption {
  amount: number;
  sulfur: number;
  popular?: boolean;
}

interface QuickDepositOptionsProps {
  onDeposit: (amount: number) => void;
  loading: boolean;
  selectedProvider: string;
}

const quickDepositOptions: DepositOption[] = [
  { amount: 25, sulfur: 32 },
  { amount: 50, sulfur: 65, popular: true },
  { amount: 100, sulfur: 130 },
  { amount: 200, sulfur: 260 }
];

export const QuickDepositOptions = ({ onDeposit, loading, selectedProvider }: QuickDepositOptionsProps) => {
  return (
    <Card className="bg-card/80 border-2 border-primary/30 shadow-lg">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-400" />
          <span>Quick Deposit</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickDepositOptions.map((option) => (
            <div key={option.amount} className="relative">
              {option.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full z-10 font-bold">
                  Popular
                </div>
              )}
              <Button
                onClick={() => onDeposit(option.amount)}
                disabled={loading || !selectedProvider}
                className={`w-full h-20 flex flex-col gap-1 font-bold shadow-lg border ${
                  option.popular 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-orange-400/30' 
                    : 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-primary/30'
                }`}
              >
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-bold">{option.amount}</span>
                </div>
                <div className="text-xs opacity-90">
                  {option.sulfur} Sulfur
                </div>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
