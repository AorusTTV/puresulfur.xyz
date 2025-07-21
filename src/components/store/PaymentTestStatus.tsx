
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PaymentTestStatusProps {
  status: 'idle' | 'testing' | 'success' | 'error';
}

export const PaymentTestStatus = ({ status }: PaymentTestStatusProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'testing':
        return 'Testing...';
      case 'success':
        return 'Success';
      case 'error':
        return 'Failed';
      default:
        return 'Not tested';
    }
  };

  return (
    <div className="flex items-center gap-3">
      {getStatusIcon()}
      <span className="text-sm text-muted-foreground">
        {getStatusText()}
      </span>
    </div>
  );
};
