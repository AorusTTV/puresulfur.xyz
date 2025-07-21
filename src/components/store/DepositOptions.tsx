
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { paymentService } from '@/services/paymentService';
import { PaymentProviderSelector } from './PaymentProviderSelector';
import { QuickDepositOptions } from './QuickDepositOptions';
import { CustomDepositForm } from './CustomDepositForm';

export const DepositOptions = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>('paypal');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDeposit = async (amount: number) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to make a deposit',
        variant: 'destructive'
      });
      return;
    }

    if (isNaN(amount) || amount < 1) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount (minimum $1)',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await paymentService.createPayment({
        amount,
        provider: 'paypal',
        userId: user.id,
        metadata: {
          sulfur_amount: Math.floor(amount * 1.30),
          dollar_amount: amount
        }
      });

      if (result.success && result.paymentUrl) {
        toast({
          title: 'Payment Created',
          description: 'Redirecting to PayPal checkout...',
        });
        
        // Open payment URL in a new tab
        window.open(result.paymentUrl, '_blank');
      } else {
        throw new Error(result.error || 'Payment creation failed');
      }
    } catch (error) {
      console.error('Error creating deposit:', error);
      toast({
        title: 'Error',
        description: 'Failed to create deposit. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PaymentProviderSelector
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
      />

      <QuickDepositOptions
        onDeposit={handleDeposit}
        loading={loading}
        selectedProvider={selectedProvider}
      />

      <CustomDepositForm
        onDeposit={handleDeposit}
        loading={loading}
        selectedProvider={selectedProvider}
      />
    </div>
  );
};
