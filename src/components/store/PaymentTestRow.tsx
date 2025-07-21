
import { Button } from '@/components/ui/button';
import { PaymentTestStatus } from './PaymentTestStatus';

interface PaymentTestRowProps {
  provider: 'paypal';
  status: 'idle' | 'testing' | 'success' | 'error';
  onTest: (provider: 'paypal') => void;
}

export const PaymentTestRow = ({ provider, status, onTest }: PaymentTestRowProps) => {
  const displayName = 'PayPal';

  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-3">
        <span className="font-medium">{displayName}</span>
        <PaymentTestStatus status={status} />
      </div>
      <Button
        onClick={() => onTest(provider)}
        disabled={status === 'testing'}
        variant="outline"
        size="sm"
      >
        Test {displayName}
      </Button>
    </div>
  );
};
