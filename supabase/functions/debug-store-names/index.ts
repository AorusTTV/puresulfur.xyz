
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    console.log('[DEBUG-STORE-NAMES] Analyzing store_items table for name matching issues...');

    // Get all bot items
    const { data: botItems, error: botError } = await supabaseClient
      .from('store_items')
      .select('id, name, price, updated_at, is_bot_item')
      .eq('is_bot_item', true)
      .order('name');

    if (botError) {
      throw botError;
    }

    // Look for Heat Seeker items specifically
    const heatSeekerItems = botItems?.filter(item => 
      item.name.toLowerCase().includes('heat seeker')
    ) || [];

    // Check for duplicates
    const nameCount = {};
    botItems?.forEach(item => {
      const name = item.name;
      nameCount[name] = (nameCount[name] || 0) + 1;
    });

    const duplicates = Object.entries(nameCount).filter(([name, count]) => count > 1);

    // Check for whitespace/case issues
    const trimmedNames = botItems?.map(item => ({
      original: item.name,
      trimmed: item.name.trim(),
      lower: item.name.toLowerCase(),
      hasLeadingSpace: item.name !== item.name.trimStart(),
      hasTrailingSpace: item.name !== item.name.trimEnd(),
    })) || [];

    const whitespaceIssues = trimmedNames.filter(item => 
      item.hasLeadingSpace || item.hasTrailingSpace
    );

    const result = {
      success: true,
      analysis: {
        totalBotItems: botItems?.length || 0,
        heatSeekerItems: heatSeekerItems.map(item => ({
          id: item.id,
          name: `"${item.name}"`,
          price: item.price,
          updated_at: item.updated_at,
          nameLength: item.name.length,
          nameBytes: new TextEncoder().encode(item.name).length
        })),
        duplicateNames: duplicates.map(([name, count]) => ({ name: `"${name}"`, count })),
        whitespaceIssues: whitespaceIssues.map(item => ({
          name: `"${item.original}"`,
          hasLeadingSpace: item.hasLeadingSpace,
          hasTrailingSpace: item.hasTrailingSpace,
          trimmed: `"${item.trimmed}"`
        })),
        sampleNames: botItems?.slice(0, 10).map(item => `"${item.name}"`) || []
      },
      timestamp: new Date().toISOString()
    };

    console.log('[DEBUG-STORE-NAMES] Analysis complete:', JSON.stringify(result.analysis, null, 2));

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[DEBUG-STORE-NAMES] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
