
import { supabase } from '@/integrations/supabase/client';

export interface PricingTestResult {
  success: boolean;
  itemsProcessed: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  timestamp: string;
  averageProcessingTime: number;
  priorityResults?: Array<{
    name: string;
    oldPrice?: number;
    newPrice?: number;
    updated: boolean;
    processingTime: number;
  }>;
  errorSamples?: Array<{
    itemName: string;
    error: string;
  }>;
}

export const runComprehensivePricingTest = async (): Promise<PricingTestResult> => {
  console.log('[PRICING-TEST] 🚀 Starting comprehensive price update test...');
  console.log('[PRICING-TEST] Target: ≥98% success rate with <2s average processing time');
  
  const startTime = Date.now();
  
  try {
    // Get sample of high-priority items for detailed tracking
    // Note: Using correct column names from steam_bot_inventory table
    const { data: priorityItems } = await supabase
      .from('steam_bot_inventory')
      .select('id, market_hash_name')
      .or('market_hash_name.ilike.%AK-47%,market_hash_name.ilike.%M4A1%,market_hash_name.ilike.%AWP%')
      .eq('tradable', true)
      .limit(10);

    console.log('[PRICING-TEST] Before update - priority items:', priorityItems?.length || 0);

    // Trigger comprehensive inventory sync for all active bots
    const { data: activeBots } = await supabase
      .from('steam_bots')
      .select('id, label')
      .eq('is_active', true);

    if (!activeBots || activeBots.length === 0) {
      throw new Error('No active Steam bots found for testing');
    }

    console.log(`[PRICING-TEST] Testing with ${activeBots.length} active bot(s)...`);

    const botResults = [];
    for (const bot of activeBots) {
      console.log(`[PRICING-TEST] Syncing inventory for bot: ${bot.label}`);
      
      const botStartTime = Date.now();
      
      try {
        const { data: result, error } = await supabase.functions.invoke('steam-bot-manager', {
          body: {
            action: 'sync_inventory',
            botId: bot.id,
            retryAttempt: 0
          }
        });

        const botProcessingTime = Date.now() - botStartTime;

        if (error || !result?.success) {
          console.error(`[PRICING-TEST] Bot ${bot.label} sync failed:`, error || result?.error);
          botResults.push({
            botId: bot.id,
            botLabel: bot.label,
            success: false,
            error: error?.message || result?.error || 'Unknown error',
            processingTime: botProcessingTime
          });
        } else {
          console.log(`[PRICING-TEST] ✅ Bot ${bot.label} sync successful: ${result.itemCount} items in ${botProcessingTime}ms`);
          botResults.push({
            botId: bot.id,
            botLabel: bot.label,
            success: true,
            itemCount: result.itemCount || 0,
            processingTime: botProcessingTime
          });
        }
      } catch (error) {
        const botProcessingTime = Date.now() - botStartTime;
        console.error(`[PRICING-TEST] Bot ${bot.label} sync exception:`, error);
        botResults.push({
          botId: bot.id,
          botLabel: bot.label,
          success: false,
          error: error.message,
          processingTime: botProcessingTime
        });
      }
    }

    // Wait a moment for database updates to propagate
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get updated priority items for comparison
    // Note: steam_bot_inventory doesn't have a price_usd column, so we'll work with what's available
    const { data: updatedPriorityItems } = await supabase
      .from('steam_bot_inventory')
      .select('id, market_hash_name, last_synced')
      .or('market_hash_name.ilike.%AK-47%,market_hash_name.ilike.%M4A1%,market_hash_name.ilike.%AWP%')
      .eq('tradable', true)
      .limit(10);

    // Analyze results
    const successfulBots = botResults.filter(r => r.success);
    const failedBots = botResults.filter(r => !r.success);
    
    const totalItemsProcessed = successfulBots.reduce((sum, bot) => sum + (bot.itemCount || 0), 0);
    const successCount = successfulBots.length;
    const errorCount = failedBots.length;
    const successRate = botResults.length > 0 ? (successCount / botResults.length) * 100 : 0;
    const averageProcessingTime = botResults.length > 0 ? 
      botResults.reduce((sum, bot) => sum + bot.processingTime, 0) / botResults.length : 0;

    // Compare priority items based on sync timestamp
    const priorityResults = updatedPriorityItems?.map(updatedItem => {
      const originalItem = priorityItems?.find(p => p.market_hash_name === updatedItem.market_hash_name);
      const processingTime = originalItem ? 
        (new Date(updatedItem.last_synced).getTime() - startTime) : 0;
      
      return {
        name: updatedItem.market_hash_name,
        oldPrice: undefined, // No price data available in steam_bot_inventory
        newPrice: undefined, // No price data available in steam_bot_inventory
        updated: !originalItem || new Date(updatedItem.last_synced).getTime() > startTime,
        processingTime: Math.max(0, processingTime)
      };
    }) || [];

    // Collect error samples
    const errorSamples = failedBots.slice(0, 5).map(bot => ({
      itemName: bot.botLabel,
      error: bot.error || 'Unknown error'
    }));

    const totalProcessingTime = Date.now() - startTime;

    const testResult: PricingTestResult = {
      success: successRate >= 98,
      itemsProcessed: totalItemsProcessed,
      successCount,
      errorCount,
      successRate: Number(successRate.toFixed(1)),
      timestamp: new Date().toISOString(),
      averageProcessingTime: Number((averageProcessingTime / 1000).toFixed(2)),
      priorityResults,
      errorSamples: errorSamples.length > 0 ? errorSamples : undefined
    };

    // Enhanced logging for analysis
    console.log('\n🎯 ===== COMPREHENSIVE PRICING TEST RESULTS =====');
    console.log(`📊 Success Rate: ${testResult.successRate}% (Target: ≥98%)`);
    console.log(`⚡ Average Processing Time: ${testResult.averageProcessingTime}s (Target: <2s)`);
    console.log(`📦 Total Items Processed: ${testResult.itemsProcessed}`);
    console.log(`✅ Successful Bots: ${testResult.successCount}`);
    console.log(`❌ Failed Bots: ${testResult.errorCount}`);
    console.log(`⏱️ Total Test Duration: ${(totalProcessingTime / 1000).toFixed(2)}s`);
    
    console.log('\n🔍 ===== PRIORITY ITEM ANALYSIS =====');
    priorityResults.forEach(item => {
      const status = item.updated ? '✅ UPDATED' : '⚠️ NO CHANGE';
      const timing = item.processingTime > 0 ? ` (${(item.processingTime/1000).toFixed(1)}s)` : '';
      console.log(`${status} ${item.name}${timing}`);
    });

    if (errorSamples.length > 0) {
      console.log('\n🚨 ===== ERROR SAMPLES =====');
      errorSamples.forEach(error => {
        console.log(`❌ ${error.itemName}: ${error.error}`);
      });
    }

    console.log('\n📋 ===== PERFORMANCE ASSESSMENT =====');
    if (testResult.successRate >= 98 && testResult.averageProcessingTime < 2) {
      console.log('🎉 EXCELLENT! All targets achieved');
      console.log('✅ Ready for production deployment');
    } else if (testResult.successRate >= 95) {
      console.log('⚠️ GOOD but can be improved');
      console.log('Consider optimizing rate limiting and retry logic');
    } else if (testResult.successRate >= 90) {
      console.log('⚠️ NEEDS IMPROVEMENT');
      console.log('Check bot credentials and Steam API connectivity');
    } else {
      console.log('❌ SIGNIFICANT ISSUES DETECTED');
      console.log('Review bot configuration and error logs');
    }

    console.log('\n🔧 ===== BOT PERFORMANCE BREAKDOWN =====');
    botResults.forEach(bot => {
      const status = bot.success ? '✅' : '❌';
      const items = bot.success ? ` (${bot.itemCount} items)` : '';
      const time = `${(bot.processingTime / 1000).toFixed(1)}s`;
      const error = bot.success ? '' : ` - ${bot.error}`;
      console.log(`${status} ${bot.botLabel}: ${time}${items}${error}`);
    });

    return testResult;

  } catch (error) {
    console.error('[PRICING-TEST] ❌ Test failed with exception:', error);
    
    return {
      success: false,
      itemsProcessed: 0,
      successCount: 0,
      errorCount: 1,
      successRate: 0,
      timestamp: new Date().toISOString(),
      averageProcessingTime: 0,
      errorSamples: [{
        itemName: 'Test Framework',
        error: error.message || 'Unknown test error'
      }]
    };
  }
};

export const runPricingTest = runComprehensivePricingTest; // Maintain backward compatibility
