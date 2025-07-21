
import type { ProcessedInventoryItem } from './types.ts';
import { getEstimatedPrice } from './priceEstimator.ts';
import { getCorsHeaders } from './corsUtils.ts';

interface UrlAttemptResult {
  success: boolean;
  response?: Response;
  error?: { status: number; message: string };
}

export async function tryInventoryUrl(
  inventoryUrl: string, 
  attemptNumber: number, 
  steamId: string
): Promise<UrlAttemptResult> {
  console.log(`[STEAM-API] Trying inventory URL ${attemptNumber}:`, inventoryUrl);
  
  try {
    const response = await fetch(inventoryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    console.log(`[STEAM-API] Response ${attemptNumber} status:`, response.status);

    if (response.status === 403) {
      console.log(`[STEAM-API] URL ${attemptNumber}: Private inventory (403)`);
      return { success: false, error: { status: 403, message: 'Private inventory' } };
    }

    if (response.status === 429) {
      console.log(`[STEAM-API] URL ${attemptNumber}: Rate limited (429)`);
      return { success: false, error: { status: 429, message: 'Rate limited' } };
    }

    if (!response.ok) {
      console.log(`[STEAM-API] URL ${attemptNumber}: Failed with status ${response.status}`);
      return { success: false, error: { status: response.status, message: `HTTP ${response.status}` } };
    }

    const rawResponseText = await response.text();
    console.log(`[STEAM-API] URL ${attemptNumber}: Raw response length:`, rawResponseText.length);

    // Check if response is empty or contains error
    if (!rawResponseText || rawResponseText.trim() === '') {
      console.log(`[STEAM-API] URL ${attemptNumber}: Empty response`);
      return { success: false, error: { status: response.status, message: 'Empty response' } };
    }

    // Check for Steam error messages
    if (rawResponseText.includes('Profile not found') || rawResponseText.includes('This profile is private')) {
      console.log(`[STEAM-API] URL ${attemptNumber}: Profile private/not found`);
      return { success: false, error: { status: response.status, message: 'Profile private or not found' } };
    }

    // Process the inventory response
    const processResult = await processInventoryResponse(rawResponseText, attemptNumber, steamId, inventoryUrl);
    return processResult;

  } catch (fetchError) {
    console.error(`[STEAM-API] URL ${attemptNumber}: Fetch error:`, fetchError);
    return { success: false, error: { status: 500, message: fetchError.message } };
  }
}

async function processInventoryResponse(
  rawResponseText: string,
  attemptNumber: number,
  steamId: string,
  inventoryUrl: string
): Promise<UrlAttemptResult> {
  let data;
  try {
    data = JSON.parse(rawResponseText);
  } catch (parseError) {
    console.error(`[STEAM-API] URL ${attemptNumber}: JSON parse error:`, parseError);
    return { success: false, error: { status: 500, message: 'Invalid JSON response' } };
  }

  console.log(`[STEAM-API] URL ${attemptNumber}: Parsed data structure:`, {
    success: data.success,
    hasAssets: !!data.assets,
    assetsLength: data.assets?.length || 0,
    hasDescriptions: !!data.descriptions,
    descriptionsLength: data.descriptions?.length || 0,
    error: data.error
  });
  
  if (!data.success && data.error) {
    console.log(`[STEAM-API] URL ${attemptNumber}: Steam API error:`, data.error);
    return { success: false, error: { status: 500, message: data.error } };
  }

  if (!data.assets || !data.descriptions) {
    console.log(`[STEAM-API] URL ${attemptNumber}: Missing assets or descriptions`);
    if (data.assets && data.assets.length === 0) {
      // Empty inventory but valid response
      console.log(`[STEAM-API] URL ${attemptNumber}: Empty inventory (valid)`);
      return {
        success: true,
        response: new Response(
          JSON.stringify({ 
            success: true, 
            items: [],
            debug: {
              message: 'Empty inventory',
              steamId,
              urlUsed: inventoryUrl,
              rawResponseLength: rawResponseText.length
            }
          }),
          { headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' } }
        )
      };
    }
    return { success: false, error: { status: 500, message: 'Missing inventory data' } };
  }

  console.log(`[STEAM-API] URL ${attemptNumber}: Processing assets:`, data.assets.length);

  // Combine assets with descriptions
  const items: ProcessedInventoryItem[] = data.assets.map(asset => {
    const description = data.descriptions?.find(
      desc => desc.classid === asset.classid && desc.instanceid === asset.instanceid
    );
    
    return {
      assetid: asset.assetid,
      classid: asset.classid,
      instanceid: asset.instanceid,
      market_hash_name: description?.market_hash_name || 'Unknown Item',
      icon_url: description?.icon_url || '',
      tradable: description?.tradable === 1,
      marketable: description?.marketable === 1,
      name: description?.name || 'Unknown Item',
      type: description?.type || '',
      estimated_value: getEstimatedPrice(description?.market_hash_name)
    };
  }).filter(item => item.tradable); // Only return tradable items

  console.log(`[STEAM-API] URL ${attemptNumber}: SUCCESS - Processed items:`, {
    totalAssets: data.assets.length,
    tradableItems: items.length,
    urlUsed: inventoryUrl,
    firstFewItems: items.slice(0, 3).map(item => ({
      name: item.name,
      tradable: item.tradable,
      marketable: item.marketable
    }))
  });

  return {
    success: true,
    response: new Response(
      JSON.stringify({ 
        success: true, 
        items,
        debug: {
          totalAssets: data.assets.length,
          tradableItems: items.length,
          rawResponseLength: rawResponseText.length,
          urlUsed: inventoryUrl
        }
      }),
      { headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' } }
    )
  };
}
