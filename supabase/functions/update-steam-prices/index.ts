
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { processAllItems } from './priceUpdater.ts';
import type { UpdateResult } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('[PRICE-UPDATE] Starting USD-based price update process...');

    const { updatedCount, errorCount, totalItems } = await processAllItems(supabaseClient);

    console.log(`[PRICE-UPDATE] Completed: ${updatedCount} updated, ${errorCount} errors`);

    const result: UpdateResult = {
      success: true, 
      message: `Updated USD-based prices for ${updatedCount} items (${errorCount} errors)`,
      timestamp: new Date().toISOString(),
      itemsProcessed: totalItems,
      successCount: updatedCount,
      errorCount
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[PRICE-UPDATE] Fatal error:', error);
    
    const errorResult: UpdateResult = {
      success: false,
      message: error.message,
      timestamp: new Date().toISOString(),
      itemsProcessed: 0,
      successCount: 0,
      errorCount: 1
    };

    return new Response(
      JSON.stringify(errorResult),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
