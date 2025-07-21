
import { runDebugPricingTest } from '@/utils/debugPricingTest';

export const verifyPricingFixes = async () => {
  console.log('[PRICING-VERIFICATION] Starting final verification after fixes...');
  
  try {
    // Clear any existing cache first (simulated)
    console.log('[PRICING-VERIFICATION] Simulating cache flush: redis-cli DEL price:usd:*');
    
    // Run the comprehensive debug test
    const results = await runDebugPricingTest();
    
    console.log('\n=== FINAL VERIFICATION RESULTS ===\n');
    
    // Check each item against the pass criteria
    for (const [itemName, result] of Object.entries(results)) {
      console.log(`\n--- ${itemName.toUpperCase()} VERIFICATION ---`);
      
      if (result.error) {
        console.log(`❌ ${itemName}: ERROR - ${result.error}`);
        continue;
      }
      
      const layers = result.layers || {};
      const analysis = result.analysis || {};
      
      // Check specific criteria
      const checks = {
        rows_affected: (layers['3_db_write']?.rows_affected || 0) > 0,
        verification_success: layers['4_db_verification']?.verification_success === true,
        calculation_correct: layers['2_worker_computation']?.calculation_correct === true,
        unique_prices_correct: layers['6_api_output']?.unique_prices?.length === 1 && 
                              layers['6_api_output']?.unique_prices?.[0] === 28.7,
        frontend_consistency: layers['7_frontend_data']?.frontend_consistency === true
      };
      
      console.log('\n📊 Pass Criteria Check:');
      console.log(`✅ rows_affected > 0: ${checks.rows_affected ? 'PASS' : 'FAIL'} (${layers['3_db_write']?.rows_affected || 0})`);
      console.log(`✅ verification_success = true: ${checks.verification_success ? 'PASS' : 'FAIL'}`);
      console.log(`✅ calculation_correct = true: ${checks.calculation_correct ? 'PASS' : 'FAIL'}`);
      console.log(`✅ unique_prices = [28.7]: ${checks.unique_prices_correct ? 'PASS' : 'FAIL'} (${JSON.stringify(layers['6_api_output']?.unique_prices)})`);
      console.log(`✅ frontend_consistency = true: ${checks.frontend_consistency ? 'PASS' : 'FAIL'}`);
      
      // Overall status
      const allPassed = Object.values(checks).every(check => check === true);
      console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'}`);
      
      // Show detailed pricing trace
      if (layers['2_worker_computation']) {
        const comp = layers['2_worker_computation'];
        console.log(`\n💰 Pricing Details:`);
        console.log(`   Formula: ${comp.formula}`);
        console.log(`   Expected: ${comp.expected_result}`);
        console.log(`   Actual: $${comp.final_price}`);
        console.log(`   Match: ${comp.calculation_correct ? '✅' : '❌'}`);
      }
      
      // Show database update details
      if (layers['4_db_verification']) {
        const verify = layers['4_db_verification'];
        console.log(`\n📝 Database Update:`);
        console.log(`   Price Before: $${verify.price_before}`);
        console.log(`   Price After: $${verify.price_after}`);
        console.log(`   Updated At: ${verify.updated_at}`);
        console.log(`   Verification: ${verify.verification_success ? '✅' : '❌'}`);
      }
    }
    
    // Final summary
    const allItemsPassed = Object.values(results).every(result => {
      if (result.error) return false;
      const layers = result.layers || {};
      return (
        (layers['3_db_write']?.rows_affected || 0) > 0 &&
        layers['4_db_verification']?.verification_success === true &&
        layers['2_worker_computation']?.calculation_correct === true &&
        layers['6_api_output']?.unique_prices?.length === 1 &&
        layers['6_api_output']?.unique_prices?.[0] === 28.7 &&
        layers['7_frontend_data']?.frontend_consistency === true
      );
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`🚀 FINAL VERDICT: ${allItemsPassed ? 'READY FOR PRODUCTION' : 'NEEDS ATTENTION'}`);
    
    if (allItemsPassed) {
      console.log('✅ All pricing pipeline checks passed!');
      console.log('✅ Rounding formula working correctly ($19.20 → $28.70)');
      console.log('✅ Database updates working with trigger');
      console.log('✅ Price consistency across all layers');
      console.log('🎯 Ready to reactivate 30-minute cron job!');
    } else {
      console.log('❌ Some checks failed - please review the details above');
    }
    
    return results;
    
  } catch (error) {
    console.error('[PRICING-VERIFICATION] Test execution failed:', error);
    throw error;
  }
};
