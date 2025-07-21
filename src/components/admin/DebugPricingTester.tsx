
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { runDebugPricingTest } from '@/utils/debugPricingTest';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DebugPricingResults, DebugPricingResult } from '@/types/debugPricing';

export const DebugPricingTester = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DebugPricingResults | null>(null);
  const [jsonTrace, setJsonTrace] = useState<string>('');

  const handleRunTest = async () => {
    setIsRunning(true);
    setResults(null);
    setJsonTrace('');
    
    try {
      console.log('[PRICING-TEST] Starting end-to-end verification...');
      const testResults = await runDebugPricingTest();
      
      // Set results for UI display
      setResults(testResults);
      
      // Generate formatted JSON trace for user review
      const jsonOutput = JSON.stringify(testResults, null, 2);
      setJsonTrace(jsonOutput);
      
      console.log('\n=== FULL JSON TRACE FOR REVIEW ===\n');
      console.log(jsonOutput);
      
    } catch (error) {
      console.error('Error running debug pricing test:', error);
      setJsonTrace(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const analyzeResults = () => {
    if (!results) return null;

    const analysis = [];
    
    for (const [itemName, result] of Object.entries(results)) {
      if (result.error) {
        analysis.push({
          item: itemName,
          status: 'error' as const,
          message: result.error
        });
        continue;
      }

      const layers = result.layers || {};
      const layerChecks = [
        {
          name: 'Layer 1 (Steam)',
          pass: layers['1_steam_request']?.currency_used === 'USD (currency=1)' && 
                layers['1_steam_request']?.lowest_sell_order_cents
        },
        {
          name: 'Layer 2 (Math)',
          pass: layers['2_worker_computation']?.calculation_correct === true
        },
        {
          name: 'Layer 3-4 (DB)',
          pass: layers['3_db_write']?.update_success && layers['4_db_verification']?.verification_success
        },
        {
          name: 'Layer 5 (Cache)',
          pass: layers['5_cache_simulation']?.cache_status === 'SET'
        },
        {
          name: 'Layer 6 (API)',
          pass: layers['6_api_output']?.price_consistency === true
        },
        {
          name: 'Layer 7 (Frontend)',
          pass: layers['7_frontend_data']?.frontend_consistency === true
        }
      ];

      analysis.push({
        item: itemName,
        status: 'analyzed' as const,
        layers: layerChecks,
        overallHealth: result.analysis?.overall_pipeline_health
      });
    }

    return analysis;
  };

  const analysisResults = analyzeResults();

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Debug Pricing Pipeline Tester - End-to-End Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleRunTest} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running 7-Layer Trace...
              </>
            ) : (
              'Run Debug Pricing Test'
            )}
          </Button>
          
          <div className="text-sm text-slate-400">
            Tests: Heat Seeker SAR & Carbon Fiber Pick Axe
          </div>
        </div>

        {/* Layer Analysis */}
        {analysisResults && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Layer Analysis:</h3>
            {analysisResults.map((item, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {item.status === 'error' ? (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        {item.item} - ERROR
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                        {item.item}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {item.status === 'error' ? (
                    <div className="text-red-600">{item.message}</div>
                  ) : (
                    <div className="space-y-2">
                      {item.layers?.map((layer, layerIndex) => (
                        <div key={layerIndex} className="flex items-center gap-2 text-sm">
                          {getStatusIcon(layer.pass)}
                          <span className={layer.pass ? 'text-green-600' : 'text-red-600'}>
                            {layer.name}
                          </span>
                        </div>
                      ))}
                      <div className="mt-3 p-2 bg-slate-100 rounded text-sm">
                        <strong>Overall Health:</strong> {item.overallHealth}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Full JSON Trace */}
        {jsonTrace && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Full JSON Trace for Review:</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(jsonTrace)}
              >
                Copy JSON
              </Button>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-xs text-green-400 whitespace-pre-wrap">
                {jsonTrace}
              </pre>
            </div>
            
            <div className="text-xs text-slate-500">
              Full JSON trace copied above. Check browser console for detailed layer-by-layer analysis.
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-slate-800 rounded-lg">
          <h4 className="font-medium mb-2 text-white">Expected Pass Criteria:</h4>
          <div className="text-sm space-y-1 text-slate-300">
            <div>✅ <strong>Layer 1:</strong> currency=1, lowest_sell_order present</div>
            <div>✅ <strong>Layer 2:</strong> final_price = (lowest_sell_order / 100) * 1.495</div>
            <div>✅ <strong>Layer 3-4:</strong> One row per market_hash_name, price matches Layer 2</div>
            <div>✅ <strong>Layer 5:</strong> Cache key contains same price</div>
            <div>✅ <strong>Layer 6:</strong> API returns identical price for duplicates</div>
            <div>✅ <strong>Layer 7:</strong> Frontend displays exact price</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-medium mb-2 text-amber-800">Production Deployment Checklist:</h4>
          <div className="text-sm space-y-1 text-amber-700">
            <div>📋 Remove mock items from production code</div>
            <div>📋 Verify real item_nameid mapping table populated</div>
            <div>📋 Re-enable 30min cron worker schedule</div>
            <div>📋 Flush Redis cache: <code>redis-cli DEL price:*</code></div>
            <div>📋 Test /store page for identical prices on duplicate skins</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
