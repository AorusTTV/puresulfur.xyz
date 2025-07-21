
import { supabase } from '@/integrations/supabase/client';
import { DebugPricingResults } from '@/types/debugPricing';

export const runDebugPricingTest = async (): Promise<DebugPricingResults> => {
  console.log('[DEBUG-PRICING-TEST] Starting comprehensive pricing trace for sample items...');
  
  const testItems = ['Heat Seeker SAR', 'Carbon Fiber Pick Axe'];
  const results: DebugPricingResults = {};
  
  for (const itemName of testItems) {
    try {
      console.log(`[DEBUG-PRICING-TEST] Testing item: ${itemName}`);
      
      const { data, error } = await supabase.functions.invoke('debug-pricing', {
        body: { market_hash_name: itemName }
      });
      
      if (error) {
        console.error(`[DEBUG-PRICING-TEST] Error for ${itemName}:`, error);
        results[itemName] = { 
          error: error.message, 
          success: false,
          item: itemName,
          item_id: '',
          requested_name: itemName,
          timestamp: new Date().toISOString(),
          layers: {},
          analysis: {
            item_lookup_successful: false,
            steam_request_valid: false,
            computation_correct: false,
            db_update_successful: false,
            price_verification_passed: false,
            consistency_check_passed: false,
            overall_pipeline_health: 'Error occurred'
          }
        };
      } else {
        console.log(`[DEBUG-PRICING-TEST] Success for ${itemName}`);
        results[itemName] = data;
      }
      
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err) {
      console.error(`[DEBUG-PRICING-TEST] Exception for ${itemName}:`, err);
      results[itemName] = { 
        error: err instanceof Error ? err.message : 'Unknown error',
        success: false,
        item: itemName,
        item_id: '',
        requested_name: itemName,
        timestamp: new Date().toISOString(),
        layers: {},
        analysis: {
          item_lookup_successful: false,
          steam_request_valid: false,
          computation_correct: false,
          db_update_successful: false,
          price_verification_passed: false,
          consistency_check_passed: false,
          overall_pipeline_health: 'Exception occurred'
        }
      };
    }
  }
  
  // Output formatted results
  console.log('\n=== COMPREHENSIVE PRICING TRACE RESULTS ===\n');
  
  for (const [itemName, result] of Object.entries(results)) {
    console.log(`\n--- ${itemName.toUpperCase()} ---`);
    console.log(JSON.stringify(result, null, 2));
    console.log('\n' + '='.repeat(60));
  }
  
  // Analyze results against pass criteria
  console.log('\n=== PASS CRITERIA ANALYSIS ===\n');
  
  for (const [itemName, result] of Object.entries(results)) {
    if (result.error) {
      console.log(`❌ ${itemName}: ERROR - ${result.error}`);
      continue;
    }
    
    console.log(`\n📊 ${itemName} Analysis:`);
    
    // Layer 1: Steam Request
    const layer1 = result.layers?.['1_steam_request'];
    if (layer1?.currency_used === 'USD (currency=1)' && layer1?.lowest_sell_order_cents) {
      console.log('✅ Layer 1 (Steam): currency=1, lowest_sell_order present');
    } else {
      console.log('❌ Layer 1 (Steam): Missing currency=1 or lowest_sell_order');
    }
    
    // Layer 2: Worker Math
    const layer2 = result.layers?.['2_worker_computation'];
    if (layer2?.calculation_correct) {
      console.log('✅ Layer 2 (Math): Formula calculation correct');
    } else {
      console.log(`⚠️ Layer 2 (Math): Expected $28.69, got $${layer2?.final_price}`);
    }
    
    // Layer 3-4: DB Write/Verify
    const layer3 = result.layers?.['3_db_write'];
    const layer4 = result.layers?.['4_db_verification'];
    if (layer3?.update_success && layer4?.verification_success) {
      console.log('✅ Layer 3-4 (DB): Write and verification successful');
    } else {
      console.log('❌ Layer 3-4 (DB): Write or verification failed');
    }
    
    // Layer 5: Cache
    const layer5 = result.layers?.['5_cache_simulation'];
    if (layer5?.cache_status === 'SET') {
      console.log('✅ Layer 5 (Cache): Cache set successfully');
    } else {
      console.log('❌ Layer 5 (Cache): Cache not set properly');
    }
    
    // Layer 6: API Output
    const layer6 = result.layers?.['6_api_output'];
    if (layer6?.price_consistency) {
      console.log('✅ Layer 6 (API): Price consistency maintained');
    } else {
      console.log('❌ Layer 6 (API): Price inconsistency detected');
    }
    
    // Layer 7: Frontend
    const layer7 = result.layers?.['7_frontend_data'];
    if (layer7?.frontend_consistency) {
      console.log('✅ Layer 7 (Frontend): Frontend data consistent');
    } else {
      console.log('❌ Layer 7 (Frontend): Frontend data inconsistent');
    }
    
    // Overall analysis
    const overallHealth = result.analysis?.overall_pipeline_health;
    console.log(`\n🎯 Overall Pipeline Health: ${overallHealth}`);
  }
  
  return results;
};
