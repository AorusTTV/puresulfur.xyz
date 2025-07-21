
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Verify user authentication
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user?.email) {
      console.error('Authentication error:', authError);
      throw new Error("User not authenticated");
    }

    console.log('User authenticated:', user.email);

    const { amount, paymentId, sulfurAmount } = await req.json();
    
    if (!amount || amount < 1) {
      throw new Error("Invalid amount");
    }

    console.log('Creating PayPal payment for amount:', amount, 'paymentId:', paymentId);

    // Get PayPal credentials from environment
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

    if (!paypalClientId || !paypalClientSecret) {
      console.error('Missing PayPal credentials');
      throw new Error("PayPal credentials not configured");
    }

    // PayPal live API URL
    const paypalBaseUrl = "https://api.paypal.com";

    // Get PayPal access token using live credentials
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('PayPal token error:', tokenError);
      throw new Error(`Failed to get PayPal access token: ${tokenError}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('PayPal access token obtained successfully');

    // Create PayPal payment
    const paymentData = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: amount.toString()
        },
        description: `PureSulfur Deposit - ${sulfurAmount} Sulfur`
      }],
      application_context: {
        return_url: `${req.headers.get("origin")}/store?payment_success=true&provider=paypal&payment_id=${paymentId}&sulfur=${sulfurAmount}`,
        cancel_url: `${req.headers.get("origin")}/store?payment_cancelled=true&provider=paypal`,
        brand_name: "PureSulfur",
        landing_page: "BILLING",
        user_action: "PAY_NOW"
      }
    };

    console.log('Creating PayPal order with data:', JSON.stringify(paymentData, null, 2));

    const paymentResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!paymentResponse.ok) {
      const paymentError = await paymentResponse.text();
      console.error('PayPal payment creation error:', paymentError);
      throw new Error(`PayPal API error: ${paymentError}`);
    }

    const payment = await paymentResponse.json();
    console.log('PayPal order created successfully:', payment.id);

    // Update payment record with PayPal order ID
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({ 
        provider_payment_id: payment.id,
        metadata: { paypal_order: payment }
      })
      .eq('id', paymentId);

    if (updateError) {
      console.error('Failed to update payment record:', updateError);
    } else {
      console.log('Payment record updated with PayPal order ID');
    }

    // Find approval URL
    const approvalUrl = payment.links.find((link: any) => link.rel === "approve")?.href;

    if (!approvalUrl) {
      throw new Error('No approval URL found in PayPal response');
    }

    console.log('PayPal approval URL:', approvalUrl);

    return new Response(JSON.stringify({ approvalUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating PayPal payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
