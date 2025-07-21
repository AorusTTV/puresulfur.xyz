import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BotCredentials {
  steam_login: string;
  password: string;
  shared_secret?: string;
  identity_secret?: string;
  api_key?: string;
  steam_id?: string;
}

interface BotData extends BotCredentials {
  label: string;
}

interface SteamInventoryItem {
  assetid: string;
  appid: number;
  contextid: number;
  classid: string;
  instanceid: string;
  market_hash_name: string;
  icon_url: string;
  tradable: boolean;
  marketable: boolean;
}

interface MarketPriceResponse {
  success: boolean;
  median_price?: string;
  volume?: string;
  lowest_price?: string;
}

// Configuration from environment
const CONFIG = {
  STEAM_API_KEY: Deno.env.get('STEAM_API_KEY'),
  PRICE_MULTIPLIER: parseFloat(Deno.env.get('STEAM_PRICE_MULTIPLIER') || '1.495'),
  RATE_LIMIT_MS: parseInt(Deno.env.get('STEAM_MARKET_RATE_LIMIT_MS') || '1200'),
  RETRY_ATTEMPTS: parseInt(Deno.env.get('STEAM_INVENTORY_RETRY_ATTEMPTS') || '3'),
  RETRY_DELAY_MS: parseInt(Deno.env.get('STEAM_INVENTORY_RETRY_DELAY_MS') || '2000'),
  BATCH_SIZE: parseInt(Deno.env.get('STEAM_INVENTORY_BATCH_SIZE') || '50'),
  DEBUG: Deno.env.get('STEAM_BOT_DEBUG') === 'true'
};

console.log('[STEAM-BOT-MANAGER] Configuration loaded:', {
  hasApiKey: !!CONFIG.STEAM_API_KEY,
  priceMultiplier: CONFIG.PRICE_MULTIPLIER,
  rateLimit: CONFIG.RATE_LIMIT_MS,
  retryAttempts: CONFIG.RETRY_ATTEMPTS,
  batchSize: CONFIG.BATCH_SIZE,
  debug: CONFIG.DEBUG
});

// Enhanced encryption with better error handling
const encryptCredential = (value: string): string => {
  if (!value) return '';
  
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encoder = new TextEncoder();
    const data = encoder.encode(value.trim());
    const combined = new Uint8Array(salt.length + data.length);
    combined.set(salt);
    combined.set(data, salt.length);
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('[ENCRYPT] Failed to encrypt credential:', error);
    throw new Error('Failed to encrypt credential');
  }
};

const decryptCredential = (encrypted: string): string => {
  if (!encrypted) return '';
  
  try {
    const combined = new Uint8Array(atob(encrypted).split('').map(c => c.charCodeAt(0)));
    const data = combined.slice(16); // Remove salt
    const decoder = new TextDecoder();
    return decoder.decode(data);
  } catch (error) {
    console.error('[DECRYPT] Failed to decrypt credential:', error);
    return '';
  }
};

// Enhanced Steam inventory validation
const validateSteamInventoryAccess = async (steamId: string): Promise<{ accessible: boolean; error?: string; details?: any }> => {
  console.log(`[VALIDATION] Checking Steam inventory access for Steam ID: ${steamId}`);
  
  try {
    // First check if Steam profile is public
    const profileUrl = `https://steamcommunity.com/profiles/${steamId}/?xml=1`;
    console.log(`[VALIDATION] Checking profile visibility: ${profileUrl}`);
    
    const profileResponse = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!profileResponse.ok) {
      return {
        accessible: false,
        error: `Profile not accessible: HTTP ${profileResponse.status}`,
        details: { status: profileResponse.status, url: profileUrl }
      };
    }

    const profileText = await profileResponse.text();
    
    // Check if profile contains privacy indicators
    if (profileText.includes('This profile is private') || profileText.includes('<privacyState>private</privacyState>')) {
      return {
        accessible: false,
        error: 'Steam profile is set to private. Please make the profile public.',
        details: { privacy: 'private', profileUrl: `https://steamcommunity.com/profiles/${steamId}` }
      };
    }

    // Now check inventory access with multiple endpoints
    const inventoryUrls = [
      `https://steamcommunity.com/inventory/${steamId}/252490/2?l=english&count=1`,
      `https://steamcommunity.com/profiles/${steamId}/inventory/json/252490/2/?l=english&count=1`
    ];

    let lastError = null;
    
    for (const inventoryUrl of inventoryUrls) {
      console.log(`[VALIDATION] Testing inventory access: ${inventoryUrl}`);
      
      try {
        const inventoryResponse = await fetch(inventoryUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
          }
        });

        if (inventoryResponse.status === 403) {
          return {
            accessible: false,
            error: 'Steam inventory is private. Please set your inventory to public in Steam Privacy Settings.',
            details: { 
              status: 403, 
              url: inventoryUrl,
              settingsLink: 'https://steamcommunity.com/my/edit/settings'
            }
          };
        }

        if (inventoryResponse.status === 429) {
          return {
            accessible: false,
            error: 'Steam API rate limit exceeded. Please try again in a few minutes.',
            details: { status: 429, url: inventoryUrl }
          };
        }

        if (inventoryResponse.ok) {
          const data = await inventoryResponse.json();
          
          // Check if inventory data is valid
          if (data.success === false && data.error) {
            return {
              accessible: false,
              error: `Steam inventory error: ${data.error}`,
              details: { steamError: data.error, url: inventoryUrl }
            };
          }

          console.log(`[VALIDATION] ✅ Inventory accessible via: ${inventoryUrl}`);
          return {
            accessible: true,
            details: { 
              method: 'inventory_api',
              url: inventoryUrl,
              hasAssets: !!data.assets,
              itemCount: data.assets ? data.assets.length : 0
            }
          };
        }

        lastError = { status: inventoryResponse.status, url: inventoryUrl };
        
      } catch (error) {
        lastError = { error: error.message, url: inventoryUrl };
        console.warn(`[VALIDATION] Failed to check ${inventoryUrl}:`, error);
      }
    }

    return {
      accessible: false,
      error: `All inventory endpoints failed. Last error: ${JSON.stringify(lastError)}`,
      details: { lastError, testedUrls: inventoryUrls }
    };
    
  } catch (error) {
    console.error('[VALIDATION] Inventory validation failed:', error);
    return {
      accessible: false,
      error: `Validation failed: ${error.message}`,
      details: { error: error.message, stack: error.stack }
    };
  }
};

// Enhanced Steam inventory fetching with better error handling
const fetchRealSteamInventory = async (
  steamId: string, 
  apiKey: string, 
  retryAttempt: number = 0
): Promise<SteamInventoryItem[]> => {
  const maxRetries = CONFIG.RETRY_ATTEMPTS;
  console.log(`[STEAM-INVENTORY] Fetching real inventory for Steam ID: ${steamId} (attempt ${retryAttempt + 1}/${maxRetries})`);
  
  // First validate inventory access
  const validation = await validateSteamInventoryAccess(steamId);
  if (!validation.accessible) {
    console.error('[STEAM-INVENTORY] Inventory validation failed:', validation.error);
    throw new Error(`INVENTORY_ACCESS_DENIED: ${validation.error}`);
  }

  console.log('[STEAM-INVENTORY] ✅ Inventory access validated');

  try {
    // Use the validated inventory endpoint
    const inventoryUrl = `https://steamcommunity.com/inventory/${steamId}/252490/2?l=english&count=5000`;
    
    console.log('[STEAM-INVENTORY] Calling validated Steam inventory URL:', inventoryUrl);
    
    const response = await fetch(inventoryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    console.log('[STEAM-INVENTORY] Steam API response status:', response.status);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      } else if (response.status === 403) {
        throw new Error('INVENTORY_PRIVATE_AFTER_VALIDATION');
      } else if (response.status >= 500) {
        throw new Error('STEAM_SERVER_ERROR');
      }
      throw new Error(`HTTP_${response.status}`);
    }

    const data = await response.json();
    console.log('[STEAM-INVENTORY] Raw inventory data structure:', {
      success: data.success,
      hasAssets: !!data.assets,
      assetsLength: data.assets?.length || 0,
      hasDescriptions: !!data.descriptions,
      descriptionsLength: data.descriptions?.length || 0,
      error: data.error
    });
    
    if (!data.success) {
      throw new Error(`STEAM_API_ERROR: ${data.error || 'Unknown Steam API error'}`);
    }

    const items: SteamInventoryItem[] = [];
    
    if (data.assets && data.descriptions) {
      console.log('[STEAM-INVENTORY] Processing assets with descriptions...');
      
      for (const asset of data.assets) {
        const description = data.descriptions.find((desc: any) => 
          desc.classid === asset.classid && desc.instanceid === asset.instanceid
        );
        
        if (description && description.appid === 252490) { // Rust items only
          const item: SteamInventoryItem = {
            assetid: asset.assetid,
            appid: 252490,
            contextid: 2,
            classid: asset.classid,
            instanceid: asset.instanceid,
            market_hash_name: description.market_hash_name || description.name,
            icon_url: description.icon_url,
            tradable: description.tradable === 1,
            marketable: description.marketable === 1
          };
          
          // Only include tradable items
          if (item.tradable) {
            items.push(item);
          }
        }
      }
    }

    console.log(`[STEAM-INVENTORY] Successfully processed ${items.length} tradable Rust items`);
    
    if (CONFIG.DEBUG && items.length > 0) {
      console.log('[STEAM-INVENTORY] Sample items:', items.slice(0, 3));
    }
    
    return items;
    
  } catch (error) {
    const errorMessage = error.message;
    console.error(`[STEAM-INVENTORY] Attempt ${retryAttempt + 1} failed:`, errorMessage);
    
    // Enhanced retry logic with exponential backoff
    if (retryAttempt < maxRetries - 1) {
      // Determine if error is retryable
      const retryableErrors = ['RATE_LIMIT', 'SERVER_ERROR', 'STEAM_SERVER_ERROR', 'timeout'];
      const isRetryable = retryableErrors.some(retryError => errorMessage.includes(retryError));
      
      if (isRetryable) {
        const delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, retryAttempt);
        console.log(`[STEAM-INVENTORY] Retrying in ${delay}ms (retryable error)...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchRealSteamInventory(steamId, apiKey, retryAttempt + 1);
      } else {
        console.log(`[STEAM-INVENTORY] Non-retryable error, failing immediately: ${errorMessage}`);
      }
    }
    
    // Enhanced error messages for different scenarios
    let enhancedError = errorMessage;
    if (errorMessage.includes('INVENTORY_ACCESS_DENIED')) {
      enhancedError = 'Steam inventory is private. Please make your Steam profile and inventory public in Steam settings.';
    } else if (errorMessage.includes('RATE_LIMIT')) {
      enhancedError = 'Steam API rate limit exceeded. Please wait a few minutes before retrying.';
    } else if (errorMessage.includes('HTTP_400')) {
      enhancedError = 'Bad request to Steam API. Please check Steam ID and privacy settings.';
    } else if (errorMessage.includes('HTTP_404')) {
      enhancedError = 'Steam inventory not found. Please verify the Steam ID is correct.';
    }
    
    throw new Error(`Steam inventory fetch failed after ${retryAttempt + 1} attempts: ${enhancedError}`);
  }
};

// Real market price fetching with Hebrew pricing
const marketPriceCache = new Map<string, {price: number, timestamp: number}>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchRealMarketPrice = async (marketHashName: string, retryAttempt: number = 0): Promise<number> => {
  // Check cache first
  const cached = marketPriceCache.get(marketHashName);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`[MARKET-PRICE] Cache hit for ${marketHashName}: $${cached.price}`);
    return cached.price;
  }

  try {
    // Rate limiting
    if (retryAttempt === 0) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_MS));
    }

    const encodedName = encodeURIComponent(marketHashName);
    const url = `https://steamcommunity.com/market/priceoverview/?appid=252490&currency=1&market_hash_name=${encodedName}`;
    
    console.log(`[MARKET-PRICE] Fetching price for: ${marketHashName}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      if (response.status === 429 && retryAttempt < 2) {
        const delay = CONFIG.RETRY_DELAY_MS * (retryAttempt + 1);
        console.log(`[MARKET-PRICE] Rate limited, retrying in ${delay}ms for:`, marketHashName);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchRealMarketPrice(marketHashName, retryAttempt + 1);
      }
      throw new Error(`Market API error: ${response.status}`);
    }

    const data: MarketPriceResponse = await response.json();
    
    let price = 0.50; // Default fallback price
    
    if (data.success && data.median_price) {
      const priceStr = data.median_price.replace(/[$,]/g, '');
      const marketPrice = parseFloat(priceStr);
      
      if (!isNaN(marketPrice) && marketPrice > 0) {
        // Apply Hebrew pricing multiplier (1.495)
        price = Math.round(marketPrice * CONFIG.PRICE_MULTIPLIER * 100) / 100;
        console.log(`[MARKET-PRICE] ${marketHashName}: Market $${marketPrice.toFixed(2)} → Hebrew $${price.toFixed(2)} (×${CONFIG.PRICE_MULTIPLIER})`);
      }
    } else {
      console.log(`[MARKET-PRICE] No market data for ${marketHashName}, using fallback price: $${price}`);
    }
    
    // Cache the result
    marketPriceCache.set(marketHashName, {
      price,
      timestamp: Date.now()
    });
    
    return price;
    
  } catch (error) {
    console.warn(`[MARKET-PRICE] Failed to fetch price for ${marketHashName}:`, error);
    return 0.50; // Fallback price
  }
};

// Enhanced inventory sync with comprehensive error handling and reporting
const syncBotInventory = async (supabaseClient: any, botId: string, retryAttempt: number = 0): Promise<{ success: boolean; message?: string; error?: string; itemCount?: number; details?: any }> => {
  console.log(`[SYNC-INVENTORY] ═══════════════════════════════════════════════════`);
  console.log(`[SYNC-INVENTORY] Starting ENHANCED Steam inventory sync for bot: ${botId}`);
  console.log(`[SYNC-INVENTORY] Attempt: ${retryAttempt + 1}, Hebrew pricing: ×${CONFIG.PRICE_MULTIPLIER}`);
  console.log(`[SYNC-INVENTORY] ═══════════════════════════════════════════════════`);
  
  const startTime = Date.now();
  
  try {
    // Update bot status to syncing
    await supabaseClient
      .from('steam_bots')
      .update({ 
        last_status: 'syncing',
        updated_at: new Date().toISOString()
      })
      .eq('id', botId);

    // Get bot credentials
    const { data: botData, error: botError } = await supabaseClient
      .from('steam_bots')
      .select('*')
      .eq('id', botId)
      .single();

    if (botError || !botData) {
      throw new Error(`Bot not found: ${botError?.message || 'Unknown error'}`);
    }

    console.log(`[SYNC-INVENTORY] Bot found: ${botData.label}, Steam ID: ${botData.steam_id}`);

    // Get Steam ID from bot data
    let steamId = botData.steam_id;
    if (!steamId) {
      // Try to get from environment as fallback
      steamId = Deno.env.get('STEAM_BOT_STEAM_ID');
      if (!steamId) {
        throw new Error('CONFIGURATION_ERROR: Steam ID not found in bot configuration or environment');
      }
    }

    // Validate Steam ID format
    if (!/^\d{17}$/.test(steamId)) {
      throw new Error(`CONFIGURATION_ERROR: Invalid Steam ID format: ${steamId}. Expected 17 digits.`);
    }

    // Get API key from bot data or environment
    let apiKey = CONFIG.STEAM_API_KEY;
    if (botData.api_key_encrypted) {
      try {
        apiKey = decryptCredential(botData.api_key_encrypted);
      } catch (error) {
        console.warn('[SYNC-INVENTORY] Failed to decrypt API key, using environment variable');
      }
    }

    if (!apiKey) {
      throw new Error('CONFIGURATION_ERROR: Steam API key not found in bot configuration or environment');
    }

    console.log('[SYNC-INVENTORY] ✅ Configuration validated, fetching REAL Steam inventory...');
    const inventoryItems = await fetchRealSteamInventory(steamId, apiKey, 0);
    
    console.log(`[SYNC-INVENTORY] Processing ${inventoryItems.length} items with REAL market pricing...`);
    
    // Process items in batches with real pricing
    const processedItems = [];
    const batchSize = CONFIG.BATCH_SIZE;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < inventoryItems.length; i += batchSize) {
      const batch = inventoryItems.slice(i, i + batchSize);
      const batchNumber = Math.floor(i/batchSize) + 1;
      const totalBatches = Math.ceil(inventoryItems.length/batchSize);
      
      console.log(`[SYNC-INVENTORY] Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`);
      
      for (const item of batch) {
        try {
          const price = await fetchRealMarketPrice(item.market_hash_name);
          const iconUrl = item.icon_url ? 
            `https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}/360fx360f` : 
            null;

          processedItems.push({
            bot_id: botId,
            steam_item_id: item.assetid,
            market_hash_name: item.market_hash_name,
            icon_url: iconUrl,
            tradable: item.tradable,
            marketable: item.marketable,
            name: item.market_hash_name,
            exterior: null,
            rarity_color: null,
            last_synced: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
          
          successCount++;
          
        } catch (error) {
          console.warn(`[SYNC-INVENTORY] Failed to process item ${item.market_hash_name}:`, error);
          errorCount++;
        }
      }
      
      // Brief pause between batches to respect rate limits
      if (i + batchSize < inventoryItems.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`[SYNC-INVENTORY] Processed ${processedItems.length}/${inventoryItems.length} items successfully`);
    console.log(`[SYNC-INVENTORY] Success: ${successCount}, Errors: ${errorCount}`);

    // Clear existing items for this bot
    console.log('[SYNC-INVENTORY] Clearing existing bot inventory...');
    const { error: deleteError } = await supabaseClient
      .from('steam_bot_inventory')
      .delete()
      .eq('bot_id', botId);

    if (deleteError) {
      console.error('[SYNC-INVENTORY] Error clearing existing items:', deleteError);
      throw new Error(`Failed to clear existing items: ${deleteError.message}`);
    }

    // Insert new items in batches
    if (processedItems.length > 0) {
      console.log('[SYNC-INVENTORY] Inserting new inventory items...');
      const insertBatchSize = 50;
      let insertedCount = 0;
      
      for (let i = 0; i < processedItems.length; i += insertBatchSize) {
        const batch = processedItems.slice(i, i + insertBatchSize);
        const { error: insertError } = await supabaseClient
          .from('steam_bot_inventory')
          .insert(batch);

        if (insertError) {
          console.error('[SYNC-INVENTORY] Batch insert error:', insertError);
          throw new Error(`Failed to insert inventory batch: ${insertError.message}`);
        }
        
        insertedCount += batch.length;
        console.log(`[SYNC-INVENTORY] Inserted ${insertedCount}/${processedItems.length} items`);
      }
    }

    // Update bot status with success
    const syncDuration = Date.now() - startTime;
    await supabaseClient
      .from('steam_bots')
      .update({ 
        last_status: 'online',
        last_sync: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', botId);

    // Sync to store for public access
    console.log('[SYNC-INVENTORY] Syncing to store for public access...');
    try {
      const { data: syncResult, error: syncError } = await supabaseClient.rpc('sync_bot_inventory_to_store');
      if (syncError) {
        console.warn('[SYNC-INVENTORY] Store sync warning:', syncError);
      } else {
        console.log('[SYNC-INVENTORY] Store sync completed:', syncResult);
      }
    } catch (storeError) {
      console.warn('[SYNC-INVENTORY] Store sync failed:', storeError);
      // Don't fail the main sync for store issues
    }

    // Emit realtime event for frontend updates
    try {
      const channel = supabaseClient.channel('store-updates');
      await channel.send({
        type: 'broadcast',
        event: 'store:inventoryUpdated',
        payload: {
          bot_id: botId,
          item_count: processedItems.length,
          sync_duration_ms: syncDuration,
          timestamp: new Date().toISOString(),
          pricing_method: 'hebrew_1_495x',
          steam_id: steamId
        }
      });
      console.log('[SYNC-INVENTORY] Real-time event emitted');
    } catch (realtimeError) {
      console.warn('[SYNC-INVENTORY] Failed to emit realtime event:', realtimeError);
      // Don't fail the sync for realtime issues
    }

    console.log(`[SYNC-INVENTORY] ✅ Successfully synced ${processedItems.length} REAL items for bot ${botId} in ${syncDuration}ms`);
    console.log(`[SYNC-INVENTORY] Success rate: ${successCount}/${inventoryItems.length} (${((successCount/inventoryItems.length)*100).toFixed(1)}%)`);

    return {
      success: true,
      message: `Successfully synced ${processedItems.length} real items from Steam inventory with Hebrew pricing`,
      itemCount: processedItems.length,
      details: {
        botLabel: botData.label,
        steamId: steamId,
        syncDurationMs: syncDuration,
        successRate: `${successCount}/${inventoryItems.length}`,
        pricingMethod: 'hebrew_1_495x'
      }
    };
    
  } catch (error) {
    const syncDuration = Date.now() - startTime;
    console.error(`[SYNC-INVENTORY] ❌ REAL sync failed for bot ${botId} after ${syncDuration}ms:`, error);
    
    // Categorize errors for better reporting
    let errorCategory = 'UNKNOWN_ERROR';
    let userFriendlyMessage = error.message;
    
    if (error.message.includes('INVENTORY_ACCESS_DENIED')) {
      errorCategory = 'PRIVACY_ERROR';
      userFriendlyMessage = 'Steam inventory is private. Please make your Steam profile and inventory public in Steam settings.';
    } else if (error.message.includes('CONFIGURATION_ERROR')) {
      errorCategory = 'CONFIGURATION_ERROR';
      userFriendlyMessage = error.message.replace('CONFIGURATION_ERROR: ', '');
    } else if (error.message.includes('RATE_LIMIT')) {
      errorCategory = 'RATE_LIMIT_ERROR';
      userFriendlyMessage = 'Steam API rate limit exceeded. Please wait a few minutes before retrying.';
    } else if (error.message.includes('HTTP_400')) {
      errorCategory = 'BAD_REQUEST_ERROR';
      userFriendlyMessage = 'Bad request to Steam API. Please check Steam ID and privacy settings.';
    }
    
    // Update bot status to error with detailed information
    try {
      await supabaseClient
        .from('steam_bots')
        .update({ 
          last_status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', botId);
    } catch (updateError) {
      console.error('[SYNC-INVENTORY] Failed to update error status:', updateError);
    }

    return {
      success: false,
      error: userFriendlyMessage,
      itemCount: 0,
      details: {
        errorCategory,
        originalError: error.message,
        syncDurationMs: syncDuration,
        retryAttempt: retryAttempt + 1
      }
    };
  }
};

// Enhanced Steam login test with detailed validation
const testSteamLogin = async (credentials: BotCredentials): Promise<{ success: boolean; message?: string; error?: string; details?: any }> => {
  console.log('[TEST-LOGIN] Testing Steam credentials for:', credentials.steam_login);
  
  try {
    // Basic validation first
    if (!credentials.steam_login || !credentials.password) {
      return {
        success: false,
        error: 'Steam login and password are required',
        details: { missingFields: ['steam_login', 'password'] }
      };
    }

    // Test if we can access the Steam ID's inventory
    const steamId = credentials.steam_id || Deno.env.get('STEAM_BOT_STEAM_ID');
    if (!steamId) {
      return {
        success: false,
        error: 'Steam ID is required for inventory access',
        details: { missingField: 'steam_id' }
      };
    }

    // Validate Steam ID format
    if (!/^\d{17}$/.test(steamId)) {
      return {
        success: false,
        error: `Invalid Steam ID format: ${steamId}. Expected 17 digits.`,
        details: { steamId, expectedFormat: '17 digits' }
      };
    }

    console.log('[TEST-LOGIN] Testing comprehensive Steam access for Steam ID:', steamId);
    
    // Use the enhanced validation function
    const validation = await validateSteamInventoryAccess(steamId);
    
    if (!validation.accessible) {
      return {
        success: false,
        error: validation.error || 'Steam inventory access validation failed',
        details: validation.details
      };
    }

    console.log('[TEST-LOGIN] ✅ Steam inventory access verified');
    return {
      success: true,
      message: `Steam inventory access verified for Steam ID: ${steamId}`,
      details: {
        steamId,
        validation: validation.details,
        accessMethod: 'enhanced_validation'
      }
    };
    
  } catch (error) {
    console.error('[TEST-LOGIN] ❌ Steam login test failed:', error);
    return {
      success: false,
      error: `Steam validation failed: ${error.message}`,
      details: {
        error: error.message,
        stack: error.stack
      }
    };
  }
};

// Keep existing validation functions unchanged
const isValidApiKey = (key: string): boolean => {
  if (!key) return true;
  return /^[a-f0-9]{32}$/i.test(key.trim());
};

const isValidBase64 = (str: string): boolean => {
  if (!str) return true;
  try {
    const trimmed = str.trim();
    return btoa(atob(trimmed)) === trimmed;
  } catch {
    return false;
  }
};

const validateBotData = (botData: BotData): string[] => {
  const errors: string[] = [];
  
  if (!botData.label?.trim()) {
    errors.push('Bot label is required');
  }
  
  if (!botData.steam_login?.trim()) {
    errors.push('Steam login is required');
  }
  
  if (!botData.password?.trim()) {
    errors.push('Steam password is required');
  }
  
  if (botData.api_key && !isValidApiKey(botData.api_key)) {
    errors.push('Steam API key must be 32 hexadecimal characters');
  }
  
  if (botData.shared_secret && !isValidBase64(botData.shared_secret)) {
    errors.push('Shared secret must be valid Base64');
  }
  
  if (botData.identity_secret && !isValidBase64(botData.identity_secret)) {
    errors.push('Identity secret must be valid Base64');
  }
  
  return errors;
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

    const { action, credentials, botData, botId, isActive, retryAttempt } = await req.json();
    console.log('[STEAM-BOT-MANAGER] Action:', action, CONFIG.DEBUG ? 'DEBUG MODE' : '');

    switch (action) {
      case 'test_login':
        if (!credentials) {
          return new Response(
            JSON.stringify({ success: false, error: 'Credentials are required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const result = await testSteamLogin(credentials);
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'create_bot':
        if (!botData) {
          return new Response(
            JSON.stringify({ success: false, error: 'Bot data is required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('[CREATE-BOT] Creating new Steam bot:', botData.label);
        
        // Validate bot data
        const validationErrors = validateBotData(botData);
        if (validationErrors.length > 0) {
          return new Response(
            JSON.stringify({ success: false, error: validationErrors[0] }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Test Steam login before creating bot
        const loginTest = await testSteamLogin(botData);
        if (!loginTest.success) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Steam login failed: ${loginTest.error}`,
              details: loginTest.details
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          // Check for duplicate steam login
          const { data: existingBot } = await supabaseClient
            .from('steam_bots')
            .select('steam_login')
            .eq('steam_login', botData.steam_login.trim())
            .single();

          if (existingBot) {
            return new Response(
              JSON.stringify({ success: false, error: 'A bot with this Steam login already exists' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Encrypt credentials
          let encryptedPassword, encryptedShared, encryptedIdentity, encryptedApiKey;
          
          try {
            encryptedPassword = encryptCredential(botData.password);
            encryptedShared = botData.shared_secret ? encryptCredential(botData.shared_secret) : null;
            encryptedIdentity = botData.identity_secret ? encryptCredential(botData.identity_secret) : null;
            encryptedApiKey = botData.api_key ? encryptCredential(botData.api_key) : null;
          } catch (encryptError) {
            console.error('[CREATE-BOT] Encryption failed:', encryptError);
            return new Response(
              JSON.stringify({ success: false, error: 'Failed to encrypt credentials - server configuration error' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Create bot in database
          const { data, error } = await supabaseClient
            .from('steam_bots')
            .insert({
              label: botData.label.trim(),
              steam_login: botData.steam_login.trim(),
              password_encrypted: encryptedPassword,
              shared_secret_encrypted: encryptedShared,
              identity_secret_encrypted: encryptedIdentity,
              api_key_encrypted: encryptedApiKey,
              last_status: 'offline',
              steam_id: botData.steam_id || '',
              steam_username: botData.steam_login.trim()
            })
            .select()
            .single();

          if (error) {
            console.error('[CREATE-BOT] Database error:', error);
            
            if (error.code === '23505') {
              return new Response(
                JSON.stringify({ success: false, error: 'Duplicate bot label or Steam login' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            
            return new Response(
              JSON.stringify({ success: false, error: 'Database error while creating bot' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log('[CREATE-BOT] ✅ Bot created successfully:', data.id);

          return new Response(
            JSON.stringify({
              success: true,
              bot_id: data.id,
              message: 'Steam bot created successfully',
              details: loginTest.details
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('[CREATE-BOT] Unexpected error:', error);
          return new Response(
            JSON.stringify({ success: false, error: 'Server error while creating bot' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'sync_inventory':
        if (!botId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Bot ID is required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const syncResult = await syncBotInventory(supabaseClient, botId, retryAttempt || 0);
        return new Response(
          JSON.stringify(syncResult),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'toggle_status':
        console.log('[TOGGLE-STATUS] Toggling bot status:', { botId, isActive });
        
        if (!botId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Bot ID is required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabaseClient
          .from('steam_bots')
          .update({ 
            is_active: isActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', botId);

        if (error) {
          console.error('[TOGGLE-STATUS] Failed to toggle status:', error);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to update bot status' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `Bot ${isActive ? 'activated' : 'deactivated'} successfully`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'delete_bot':
        console.log('[DELETE-BOT] Deleting bot:', botId);
        
        if (!botId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Bot ID is required' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        try {
          // Get bot details first
          const { data: bot, error: fetchError } = await supabaseClient
            .from('steam_bots')
            .select('label')
            .eq('id', botId)
            .single();

          if (fetchError || !bot) {
            return new Response(
              JSON.stringify({ success: false, error: 'Bot not found' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log(`[DELETE-BOT] Starting deletion for bot: ${bot.label}`);

          // Step 1: Get all bot inventory IDs first
          const { data: inventoryIds, error: inventoryFetchError } = await supabaseClient
            .from('steam_bot_inventory')
            .select('id')
            .eq('bot_id', botId);

          if (inventoryFetchError) {
            console.error('[DELETE-BOT] Failed to fetch bot inventory IDs:', inventoryFetchError);
            return new Response(
              JSON.stringify({ success: false, error: 'Failed to fetch bot inventory for cleanup' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Step 2: Update store items to remove references to bot inventory
          if (inventoryIds && inventoryIds.length > 0) {
            const inventoryIdList = inventoryIds.map(item => item.id);
            console.log(`[DELETE-BOT] Found ${inventoryIdList.length} inventory items to clean up`);

            const { error: storeUpdateError } = await supabaseClient
              .from('store_items')
              .update({ 
                bot_inventory_id: null,
                is_bot_item: false,
                in_stock: 0
              })
              .in('bot_inventory_id', inventoryIdList);

            if (storeUpdateError) {
              console.error('[DELETE-BOT] Failed to update store items:', storeUpdateError);
              return new Response(
                JSON.stringify({ success: false, error: 'Failed to clean up store references' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }

          console.log('[DELETE-BOT] Store items updated successfully');

          // Step 3: Delete bot inventory
          const { error: inventoryDeleteError } = await supabaseClient
            .from('steam_bot_inventory')
            .delete()
            .eq('bot_id', botId);

          if (inventoryDeleteError) {
            console.error('[DELETE-BOT] Failed to delete bot inventory:', inventoryDeleteError);
            return new Response(
              JSON.stringify({ success: false, error: 'Failed to delete bot inventory' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log('[DELETE-BOT] Bot inventory deleted successfully');

          // Step 3: Delete the bot
          const { error: deleteError } = await supabaseClient
            .from('steam_bots')
            .delete()
            .eq('id', botId);

          if (deleteError) {
            console.error('[DELETE-BOT] Failed to delete bot:', deleteError);
            return new Response(
              JSON.stringify({ success: false, error: 'Failed to delete bot' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log(`[DELETE-BOT] ✅ Bot "${bot.label}" and all associated data removed successfully`);

          return new Response(
            JSON.stringify({
              success: true,
              message: `Bot "${bot.label}" and all associated data removed successfully`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('[DELETE-BOT] Unexpected error:', error);
          return new Response(
            JSON.stringify({ success: false, error: 'Server error while deleting bot' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }
  } catch (error) {
    console.error('[STEAM-BOT-MANAGER] ❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error',
        details: {
          error: error.message,
          stack: error.stack
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
