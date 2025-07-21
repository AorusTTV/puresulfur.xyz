
import { validateSteamId } from './steamIdValidator.ts';
import { tryInventoryUrl } from './inventoryUrlService.ts';
import { getCorsHeaders } from './corsUtils.ts';

export async function handleGetInventory(steamId: string, apiKey: string, appId: number = 252490, contextId: number = 2) {
  try {
    console.log('[STEAM-API] Fetching inventory for Steam ID:', steamId, 'App:', appId, 'Context:', contextId);
    
    // Validate Steam ID format
    const validation = validateSteamId(steamId);
    if (!validation.isValid) {
      console.error('[STEAM-API] Invalid Steam ID format:', steamId);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: validation.error,
          debug: { steamId, format: 'Expected 17 digits' }
        }),
        { headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' } }
      );
    }
    
    // Use the Steam Community inventory endpoint format with correct context
    // For Rust: appid = 252490, contextid = 2 (CRITICAL: not 1 or 6)
    const inventoryUrls = [
      `https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=english&count=5000`,
      `https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=english&count=2000`,
      `https://steamcommunity.com/profiles/${steamId}/inventory/json/${appId}/${contextId}/?l=english&count=5000`
    ];
    
    console.log('[STEAM-API] Trying inventory URLs:', inventoryUrls);
    
    let lastError = null;
    
    for (let i = 0; i < inventoryUrls.length; i++) {
      console.log('[STEAM-API] Attempting URL', i + 1, ':', inventoryUrls[i]);
      const result = await tryInventoryUrl(inventoryUrls[i], i + 1, steamId);
      if (result.success) {
        console.log('[STEAM-API] Successfully fetched inventory from URL', i + 1);
        return result.response;
      }
      lastError = result.error;
      console.log('[STEAM-API] URL', i + 1, 'failed:', lastError);
    }

    // If all URLs failed, return the last error with helpful context
    console.error('[STEAM-API] All inventory URLs failed, last error:', lastError);
    
    let errorMessage = 'Failed to fetch Steam inventory';
    let suggestion = 'Check Steam ID and try again later';
    
    if (lastError?.status === 403) {
      errorMessage = 'Steam inventory is private. Please make your Steam profile and inventory public.';
      suggestion = 'Go to Steam Settings > Privacy Settings > Game Details and Inventory to set them to Public';
    } else if (lastError?.status === 429) {
      errorMessage = 'Steam API rate limit exceeded. Please try again later.';
      suggestion = 'Wait a few minutes before trying again';
    } else if (lastError?.status === 500) {
      errorMessage = 'Steam servers are experiencing issues. Please try again later.';
      suggestion = 'This is usually temporary - try again in a few minutes';
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        debug: {
          steamId,
          appId,
          contextId,
          lastError,
          urlsTried: inventoryUrls.length,
          suggestion
        }
      }),
      { status: lastError?.status || 500, headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[STEAM-API] Error in handleGetInventory:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch inventory',
        details: error.message,
        debug: {
          error: error.message,
          stack: error.stack
        }
      }),
      { status: 500, headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' } }
    );
  }
}
