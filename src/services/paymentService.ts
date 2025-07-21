
import { supabase } from '@/integrations/supabase/client';

export interface PaymentRequest {
  amount: number;
  provider: 'paypal';
  userId: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  paymentUrl?: string;
  error?: string;
  paymentId?: string;
}

class PaymentService {
  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Create payment record in database
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: request.userId,
          provider: request.provider,
          amount: request.amount,
          status: 'pending',
          metadata: request.metadata
        })
        .select()
        .single();

      if (paymentError) {
        throw paymentError;
      }

      // Route to PayPal payment provider
      if (request.provider === 'paypal') {
        return this.createPayPalPayment(request, payment.id);
      } else {
        throw new Error(`Unsupported payment provider: ${request.provider}`);
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      };
    }
  }

  private async createPayPalPayment(request: PaymentRequest, paymentId: string): Promise<PaymentResult> {
    try {
      // Get the current session to include auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('create-paypal-payment', {
        body: { 
          amount: request.amount,
          paymentId: paymentId,
          sulfurAmount: Math.floor(request.amount * 1.30)
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('PayPal function error:', error);
        throw error;
      }

      return {
        success: true,
        paymentUrl: data.approvalUrl,
        paymentId: paymentId
      };
    } catch (error) {
      console.error('PayPal payment creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create PayPal payment'
      };
    }
  }
}

export const paymentService = new PaymentService();
