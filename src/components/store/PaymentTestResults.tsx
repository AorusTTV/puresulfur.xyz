
interface PaymentTestResultsProps {
  error?: string;
  provider: 'paypal';
}

export const PaymentTestResults = ({ error, provider }: PaymentTestResultsProps) => {
  return (
    <>
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {provider === 'paypal' ? 'PayPal' : 'PayPal'} Error: {error}
        </div>
      )}
    </>
  );
};
