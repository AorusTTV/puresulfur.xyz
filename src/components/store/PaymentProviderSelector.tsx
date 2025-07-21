
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote } from 'lucide-react';

interface PaymentProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
}

export const PaymentProviderSelector = ({ selectedProvider, onProviderChange }: PaymentProviderSelectorProps) => {
  return (
    <Card className="bg-card/80 border-2 border-primary/30 shadow-lg">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Banknote className="h-5 w-5 text-blue-400" />
          <span>Payment Method</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Banknote className="h-4 w-4 text-blue-600" />
          <span className="text-blue-700 dark:text-blue-300 font-medium">PayPal</span>
          <span className="text-xs text-blue-600 dark:text-blue-400 ml-auto">Selected</span>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          PayPal is currently the only available payment method. More options will be added in the future.
        </div>
      </CardContent>
    </Card>
  );
};
