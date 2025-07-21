
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleGetInventory } from './inventoryService.ts';
import { getCorsHeaders } from './corsUtils.ts';

const corsHeaders = getCorsHeaders();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, steamId, apiKey, appId, contextId } = await req.json();
    
    console.log('[STEAM-API] Request received:', { 
      action, 
      steamId: steamId ? `${steamId.substring(0, 8)}...` : 'missing',
      appId,
      contextId
    });

    switch (action) {
      case 'getInventory':
        if (!steamId) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Steam ID is required' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        return await handleGetInventory(
          steamId, 
          apiKey || '', 
          appId || 252490,     // Default to Rust
          contextId || 2       // Default to context 2 for Rust
        );

      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid action' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('[STEAM-API] Request processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid request format',
        details: error.message
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
