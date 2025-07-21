
import { runDebugPricingTest } from '@/utils/debugPricingTest';

export const executeDebugTest = async () => {
  console.log('[PRICING-TEST] Starting end-to-end verification...');
  
  try {
    const results = await runDebugPricingTest();
    
    // Log the full JSON for user review
    console.log('\n=== FULL JSON TRACE FOR REVIEW ===\n');
    console.log(JSON.stringify(results, null, 2));
    
    return results;
  } catch (error) {
    console.error('[PRICING-TEST] Test execution failed:', error);
    throw error;
  }
};
