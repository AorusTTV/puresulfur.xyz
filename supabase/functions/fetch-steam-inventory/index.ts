import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { steamId } = await req.json();
    
    if (!steamId) {
      return new Response(
        JSON.stringify({ error: 'steamId is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Validate Steam ID format (should be 17 digits)
    if (!/^\d{17}$/.test(steamId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Steam ID format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const url = `https://steamcommunity.com/inventory/${steamId}/252490/2?l=english&count=75`;
    console.log(`[FUNCTION] Fetching Steam inventory from: ${url}`);
    
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    
    console.log(`[FUNCTION] Steam API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[FUNCTION] Steam API error: ${errorText}`);
      
      // Handle specific Steam API errors
      if (response.status === 400) {
        return new Response(
          JSON.stringify({ 
            items: [],
            message: 'Steam inventory is private or not accessible. Please make your Steam inventory public to view your Rust items.',
            error: 'private inventory'
          }),
          { 
            status: 200, // Return 200 instead of 400 to avoid frontend error
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch Steam inventory',
          details: `Steam API returned ${response.status}: ${errorText}`
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    const data = await response.json();
    console.log(`[FUNCTION] Steam API response data:`, data);
    
    // Handle null response (no Rust items or private inventory)
    if (!data || data === null) {
      console.log(`[FUNCTION] No Rust inventory found for Steam ID: ${steamId}`);
      return new Response(JSON.stringify({ 
        items: [],
        message: 'No Rust items found in inventory'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Transform the data to match your frontend expectations
    if (data.assets && data.descriptions) {
      const items = data.assets.map((asset: any) => {
        const desc = data.descriptions.find((d: any) =>
          d.classid === asset.classid && d.instanceid === asset.instanceid
        );
        return {
          id: asset.assetid,
          steam_item_id: asset.assetid,
          market_hash_name: desc?.market_hash_name || '',
          icon_url: desc?.icon_url
            ? `https://steamcommunity-a.akamaihd.net/economy/image/${desc.icon_url}/360fx360f`
            : '',
          tradable: desc?.tradable === 1,
          marketable: desc?.marketable === 1,
          exterior: desc?.type || '',
          rarity_color: desc?.name_color ? `#${desc.name_color}` : '',
          bot_id: null,
          last_synced: new Date().toISOString(),
          duplicateCount: 1
        };
      });
      
      console.log(`[FUNCTION] Found ${items.length} Rust items`);
      return new Response(JSON.stringify({ items }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } else {
      console.log(`[FUNCTION] No valid inventory data found`);
      return new Response(JSON.stringify({ 
        items: [],
        message: 'No Rust items found in inventory'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});