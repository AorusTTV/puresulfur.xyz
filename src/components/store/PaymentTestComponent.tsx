
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { paymentService } from '@/services/paymentService';
import { PaymentTestRow } from './PaymentTestRow';
import { PaymentTestResults } from './PaymentTestResults';

export const PaymentTestComponent = () => {
  const [testResults, setTestResults] = useState<{
    paypal: 'idle' | 'testing' | 'success' | 'error';
  }>({
    paypal: 'idle'
  });
  const [testErrors, setTestErrors] = useState<{
    paypal?: string;
  }>({});
  
  const { user } = useAuth();
  const { toast } = useToast();

  const testPaymentProvider = async (provider: 'paypal') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to test payments',
        variant: 'destructive'
      });
      return;
    }

    setTestResults(prev => ({ ...prev, [provider]: 'testing' }));
    setTestErrors(prev => ({ ...prev, [provider]: undefined }));

    try {
      console.log(`[PAYMENT-TEST] Testing ${provider} payment creation...`);
      
      const result = await paymentService.createPayment({
        amount: 1, // Test with $1
        provider,
        userId: user.id,
        metadata: {
          sulfur_amount: 1,
          dollar_amount: 1,
          test_payment: true
        }
      });

      if (result.success && result.paymentUrl) {
        console.log(`[PAYMENT-TEST] ${provider} test successful:`, result.paymentUrl);
        setTestResults(prev => ({ ...prev, [provider]: 'success' }));
        
        toast({
          title: `${provider.toUpperCase()} Test Successful`,
          description: `Payment URL generated successfully`,
        });
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error(`[PAYMENT-TEST] ${provider} test failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setTestResults(prev => ({ ...prev, [provider]: 'error' }));
      setTestErrors(prev => ({ ...prev, [provider]: errorMessage }));
      toast({
        title: `${provider.toUpperCase()} Test Failed`,
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  if (!user) {
    return (
      <Card className="bg-card/80 border-2 border-primary/30">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please log in to test payment methods</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 border-2 border-primary/30">
      <CardHeader>
        <CardTitle className="text-foreground">Payment System Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Test the PayPal payment provider to ensure it's working correctly with your API credentials.
        </div>
        
        {/* PayPal Test */}
        <PaymentTestRow
          provider="paypal"
          status={testResults.paypal}
          onTest={testPaymentProvider}
        />
        <PaymentTestResults
          provider="paypal"
          error={testErrors.paypal}
        />

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> This test creates an actual PayPal payment session but doesn't process real payments.
            <br />
            PayPal supports payments globally and is currently the only available payment method.
            More payment options will be added in the future.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
