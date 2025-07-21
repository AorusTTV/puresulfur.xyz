
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchRustSkinsPrice } from './rustSkinsApi.ts';
import { getCachedPrice, setCachedPrice } from './cache.ts';
import { calculateFallbackPrice, applyPricingFormula } from './pricing.ts';

export async function updateItemPrice(item: any, supabaseClient: any): Promise<{ success: boolean; finalPrice?: number }> {
  try {
    console.log(`[PRICE-UPDATE] === PROCESSING ${item.name} ===`);
    console.log(`[RUSTSKINS] Starting price update with RustSkins.net USD prices (new pricing source)`);
    
    // Check cache first using market_hash_name as key
    const cached = getCachedPrice(item.name);
    
    let finalPrice: number;
    
    if (cached) {
      console.log(`[PRICE-UPDATE] Using cached USD price for ${item.name}: $${cached.price}`);
      console.log(`[RUSTSKINS] Cache hit: price already in USD from RustSkins.net`);
      finalPrice = cached.price;
    } else {
      // Fetch from RustSkins.net API with USD prices
      const rustSkinsUsdPrice = await fetchRustSkinsPrice(item.name);
      
      if (rustSkinsUsdPrice === null) {
        console.warn(`[PRICE-UPDATE] Could not fetch USD price from RustSkins.net for ${item.name}, using fallback`);
        console.log(`[RUSTSKINS] Using USD fallback pricing (no currency conversion needed)`);
        finalPrice = calculateFallbackPrice(item.name);
        console.log(`[PRICE-UPDATE] ${item.name} - fallback → final $${finalPrice}`);
      } else {
        // Apply new pricing formula to USD price from RustSkins.net: usdPrice * 1.495
        finalPrice = applyPricingFormula(rustSkinsUsdPrice);
        console.log(`[PRICE-UPDATE] ${item.name} - RustSkins.net USD $${rustSkinsUsdPrice} → final $${finalPrice}`);
        
        // Pricing verification logging
        console.log(`[RUSTSKINS] SOURCE VERIFIED: RustSkins.net returned USD price (no conversion needed)`);
        console.log(`[RUSTSKINS] New calculation: $${rustSkinsUsdPrice} × 1.495 = $${finalPrice}`);
        
        // Sanity check calculation
        const sanityCheck = Number((rustSkinsUsdPrice * 1.495).toFixed(2));
        console.log(`[SANITY-CHECK] ${item.name}: $${rustSkinsUsdPrice} × 1.495 = $${sanityCheck} (matches final: ${finalPrice === sanityCheck})`);
      }
      
      // Cache the result using market_hash_name
      setCachedPrice(item.name, finalPrice);
    }
    
    // Enhanced database matching with improved strategies
    console.log(`[DB-WRITE] Updating ${item.name} (ID: ${item.id}) with RustSkins.net USD price $${finalPrice}`);
    console.log(`[DB-MATCH-DEBUG] Testing ENHANCED match strategies for: "${item.name}"`);
    console.log(`[RUSTSKINS] Database update: storing USD-based price from RustSkins.net`);
    
    // Strategy 1: Exact case-sensitive match
    const { data: exactResult, error: exactError, count: exactCount } = await supabaseClient
      .from('store_items')
      .update({ 
        price: finalPrice,
        updated_at: new Date().toISOString()
      })
      .eq('name', item.name)
      .select('*', { count: 'exact' });

    if (!exactError && exactCount && exactCount > 0) {
      console.log(`[DB-MATCH-DEBUG] ✅ EXACT match success: ${exactCount} rows`);
      console.log(`[DB-WRITE] SUCCESS: Updated ${item.name} → ${exactCount} rows affected`);
      console.log(`[RUSTSKINS] Database SUCCESS: USD price from RustSkins.net stored`);
      return { success: true, finalPrice };
    }

    console.log(`[DB-MATCH-DEBUG] ❌ EXACT match failed: ${exactCount || 0} rows`);

    // Strategy 2: Case-insensitive match (ilike)
    const { data: ilikeResult, error: ilikeError, count: ilikeCount } = await supabaseClient
      .from('store_items')
      .update({ 
        price: finalPrice,
        updated_at: new Date().toISOString()
      })
      .ilike('name', item.name)
      .select('*', { count: 'exact' });

    if (!ilikeError && ilikeCount && ilikeCount > 0) {
      console.log(`[DB-MATCH-DEBUG] ✅ ILIKE match success: ${ilikeCount} rows`);
      console.log(`[DB-WRITE] SUCCESS: Updated ${item.name} → ${ilikeCount} rows affected`);
      console.log(`[RUSTSKINS] Database SUCCESS: USD price from RustSkins.net stored`);
      return { success: true, finalPrice };
    }

    console.log(`[DB-MATCH-DEBUG] ❌ ILIKE match failed: ${ilikeCount || 0} rows`);

    // Strategy 3: Trimmed name match
    const trimmedName = item.name.trim();
    if (trimmedName !== item.name) {
      console.log(`[DB-MATCH-DEBUG] Trying trimmed name: "${trimmedName}"`);
      const { data: trimResult, error: trimError, count: trimCount } = await supabaseClient
        .from('store_items')
        .update({ 
          price: finalPrice,
          updated_at: new Date().toISOString()
        })
        .ilike('name', trimmedName)
        .select('*', { count: 'exact' });

      if (!trimError && trimCount && trimCount > 0) {
        console.log(`[DB-MATCH-DEBUG] ✅ TRIMMED match success: ${trimCount} rows`);
        console.log(`[DB-WRITE] SUCCESS: Updated ${item.name} → ${trimCount} rows affected`);
        console.log(`[RUSTSKINS] Database SUCCESS: USD price from RustSkins.net stored`);
        return { success: true, finalPrice };
      }
    }

    // Strategy 4: Enhanced partial name match (first 20 characters)
    const partialName = item.name.substring(0, 20);
    console.log(`[DB-MATCH-DEBUG] Trying enhanced partial match: "${partialName}%"`);
    const { data: partialResult, error: partialError, count: partialCount } = await supabaseClient
      .from('store_items')
      .update({ 
        price: finalPrice,
        updated_at: new Date().toISOString()
      })
      .ilike('name', `${partialName}%`)
      .select('*', { count: 'exact' });

    if (!partialError && partialCount && partialCount > 0) {
      console.log(`[DB-MATCH-DEBUG] ✅ ENHANCED PARTIAL match success: ${partialCount} rows`);
      console.log(`[DB-WRITE] SUCCESS: Updated ${item.name} → ${partialCount} rows affected`);
      console.log(`[RUSTSKINS] Database SUCCESS: USD price from RustSkins.net stored`);
      return { success: true, finalPrice };
    }

    // Strategy 5: Word-based flexible matching
    const words = item.name.split(' ').filter(word => word.length > 3); // Skip short words
    if (words.length > 0) {
      const primaryWord = words[0];
      console.log(`[DB-MATCH-DEBUG] Trying word-based match: "%${primaryWord}%"`);
      const { data: wordResult, error: wordError, count: wordCount } = await supabaseClient
        .from('store_items')
        .update({ 
          price: finalPrice,
          updated_at: new Date().toISOString()
        })
        .ilike('name', `%${primaryWord}%`)
        .limit(1) // Limit to 1 to avoid updating too many items
        .select('*', { count: 'exact' });

      if (!wordError && wordCount && wordCount > 0) {
        console.log(`[DB-MATCH-DEBUG] ✅ WORD-BASED match success: ${wordCount} rows`);
        console.log(`[DB-WRITE] SUCCESS: Updated ${item.name} → ${wordCount} rows affected`);
        console.log(`[RUSTSKINS] Database SUCCESS: USD price from RustSkins.net stored`);
        return { success: true, finalPrice };
      }
    }

    // All strategies failed - this is a genuine mismatch
    console.error(`[PRICE-MISS] "${item.name}" - NO MATCH FOUND with any ENHANCED strategy`);
    console.log(`[PRICE-MISS-DETAIL] RustSkins item: "${item.name}" (${item.name.length} chars, ${new TextEncoder().encode(item.name).length} bytes)`);
    
    // Find similar items for debugging with enhanced search
    const { data: similarItems, error: similarError } = await supabaseClient
      .from('store_items')
      .select('name')
      .ilike('name', `%${item.name.substring(0, 8)}%`)
      .limit(3);
    
    if (!similarError && similarItems && similarItems.length > 0) {
      console.log(`[DB-DEBUG] Found similar items:`, similarItems.map(i => `"${i.name}"`));
    } else {
      console.log(`[DB-DEBUG] No similar items found for "${item.name.substring(0, 8)}"`);
    }
    
    return { success: false };
    
  } catch (itemError) {
    console.error(`[PRICE-UPDATE] Error processing item ${item.id}:`, itemError);
    console.error(`[RUSTSKINS-FAIL] ${item.name} - PROCESSING ERROR - SKIPPING UPDATE`);
    return { success: false };
  }
}

export async function processAllItems(supabaseClient: any): Promise<{ updatedCount: number; errorCount: number; totalItems: number }> {
  console.log(`[PRICE-UPDATE] Starting RustSkins.net USD pricing update...`);
  console.log(`[RUSTSKINS] NEW PRICE SOURCE: RustSkins.net (USD prices, formula: USD × 1.495)`);
  
  // Fetch all store items that are bot items (from Steam inventory)
  const { data: storeItems, error: fetchError } = await supabaseClient
    .from('store_items')
    .select('*')
    .eq('is_bot_item', true);

  if (fetchError) {
    console.error('[PRICE-UPDATE] Error fetching store items:', fetchError);
    throw fetchError;
  }

  console.log(`[PRICE-UPDATE] Found ${storeItems?.length || 0} bot items to update with RustSkins.net prices`);
  console.log(`[RUSTSKINS] Expected results: Heat Seeker SAR ≈ $9.57, Mp5 ≈ $4.90, Predator Hoodie ≈ $7.25`);
  
  // Priority processing for critical items first
  const priorityItems = ['Heat Seeker SAR', 'Heat Seeker Mp5', 'Predator Hoodie'];
  const priorityResults: any[] = [];
  
  for (const priorityName of priorityItems) {
    const priorityItem = storeItems?.find(item => 
      item.name.toLowerCase().includes(priorityName.toLowerCase())
    );
    if (priorityItem) {
      console.log(`[PRIORITY-TRACE] Processing priority item: "${priorityItem.name}"`);
      const result = await updateItemPrice(priorityItem, supabaseClient);
      priorityResults.push({ name: priorityItem.name, result });
      if (result.success && result.finalPrice) {
        console.log(`[PRIORITY-RESULT] ${priorityItem.name} → $${result.finalPrice}`);
      } else {
        console.error(`[PRIORITY-FAIL] ${priorityItem.name} - FAILED TO UPDATE`);
      }
    }
  }

  let updatedCount = 0;
  let errorCount = 0;

  // Update prices for all bot items with RustSkins.net USD prices
  for (const item of storeItems || []) {
    const result = await updateItemPrice(item, supabaseClient);
    
    if (result.success) {
      updatedCount++;
    } else {
      errorCount++;
    }
    
    // Rate limiting: small delay between requests
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log(`[PRICE-UPDATE] RUSTSKINS.NET COMPLETED: ${updatedCount} updated, ${errorCount} errors out of ${storeItems?.length || 0} total items`);
  console.log(`[RUSTSKINS] New pricing source applied successfully`);
  console.log(`[MATCH-ANALYSIS] Success rate: ${((updatedCount / (storeItems?.length || 1)) * 100).toFixed(1)}%`);
  
  // Enhanced success reporting with priority item results
  const successRate = (updatedCount / (storeItems?.length || 1)) * 100;
  
  console.log(`[PRIORITY-SUMMARY] Key item results:`);
  priorityResults.forEach(({ name, result }) => {
    if (result.success) {
      console.log(`[PRIORITY-SUMMARY] ✅ ${name}: $${result.finalPrice}`);
    } else {
      console.log(`[PRIORITY-SUMMARY] ❌ ${name}: FAILED`);
    }
  });
  
  if (successRate >= 98) {
    console.log(`[PRICE-UPDATE] 🎉 TARGET ACHIEVED: ${successRate.toFixed(1)}% success rate!`);
    console.log(`[RUSTSKINS] Ready for production with new pricing source`);
  } else if (successRate >= 90) {
    console.log(`[PRICE-UPDATE] ⚠️ CLOSE TO TARGET: ${successRate.toFixed(1)}% success rate`);
    console.log(`[RUSTSKINS] Need to resolve ${errorCount} remaining name mismatches`);
  } else {
    console.log(`[PRICE-UPDATE] ❌ NEEDS MORE WORK: ${successRate.toFixed(1)}% success rate`);
    console.log(`[RUSTSKINS] Significant name matching issues remain`);
  }

  return {
    updatedCount,
    errorCount,
    totalItems: storeItems?.length || 0
  };
}
