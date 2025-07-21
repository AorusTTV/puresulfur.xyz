
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentProvider {
  id: string;
  name: string;
  display_name: string;
  is_enabled: boolean;
}

export const usePaymentProviders = () => {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_providers')
        .select('*')
        .eq('is_enabled', true)
        .eq('name', 'paypal') // Only load PayPal
        .order('display_name');

      if (error) {
        console.error('Error fetching payment providers:', error);
        return;
      }

      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching payment providers:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    providers,
    loading,
    refetch: fetchProviders
  };
};
