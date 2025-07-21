
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Play, Database, Wrench, AlertTriangle } from 'lucide-react';

export const QuickDiagnosticsRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [storeNamesResults, setStoreNamesResults] = useState<any>(null);
  const [pricingWorkerResults, setPricingWorkerResults] = useState<any>(null);

  const runStoreNamesAnalysis = async () => {
    console.log('[QUICK-DIAG] Running store names analysis...');
    
    try {
      const { data, error } = await supabase.functions.invoke('debug-store-names');
      
      if (error) {
        throw error;
      }
      
      console.log('[QUICK-DIAG] Store Names Analysis Results:', JSON.stringify(data, null, 2));
      setStoreNamesResults(data);
      
      return data;
    } catch (error) {
      console.error('[QUICK-DIAG] Store names analysis error:', error);
      throw error;
    }
  };

  const runPricingWorker = async () => {
    console.log('[QUICK-DIAG] Running pricing worker...');
    
    try {
      const { data, error } = await supabase.functions.invoke('update-steam-prices');
      
      if (error) {
        throw error;
      }
      
      console.log('[QUICK-DIAG] Pricing Worker Results:', JSON.stringify(data, null, 2));
      setPricingWorkerResults(data);
      
      return data;
    } catch (error) {
      console.error('[QUICK-DIAG] Pricing worker error:', error);
      throw error;
    }
  };

  const runBothDiagnostics = async () => {
    setIsRunning(true);
    
    try {
      console.log('[QUICK-DIAG] ==========================================');
      console.log('[QUICK-DIAG] RUNNING COMPREHENSIVE DIAGNOSTICS');
      console.log('[QUICK-DIAG] ==========================================');
      
      // Step 1: Store Names Analysis
      console.log('[QUICK-DIAG] STEP 1: Store Names Analysis');
      const storeData = await runStoreNamesAnalysis();
      
      // Step 2: Manual Pricing Worker Run
      console.log('[QUICK-DIAG] STEP 2: Manual Pricing Worker Run');
      const workerData = await runPricingWorker();
      
      console.log('[QUICK-DIAG] ==========================================');
      console.log('[QUICK-DIAG] DIAGNOSTICS COMPLETE - CHECK LOGS ABOVE');
      console.log('[QUICK-DIAG] ==========================================');
      
      // Log summary for easy review
      console.log('\n[SUMMARY] Store Names Issues Found:');
      if (storeData?.analysis?.heatSeekerItems?.length > 0) {
        storeData.analysis.heatSeekerItems.forEach((item: any) => {
          console.log(`  - Heat Seeker: "${item.name}" (${item.nameLength} chars, ${item.nameBytes} bytes)`);
        });
      } else {
        console.log('  - NO Heat Seeker items found! ❌');
      }
      
      if (storeData?.analysis?.whitespaceIssues?.length > 0) {
        console.log('\n[SUMMARY] Whitespace Issues:');
        storeData.analysis.whitespaceIssues.forEach((issue: any) => {
          console.log(`  - "${issue.name}" → "${issue.trimmed}"`);
        });
      }
      
      if (storeData?.analysis?.duplicateNames?.length > 0) {
        console.log('\n[SUMMARY] Duplicate Names:');
        storeData.analysis.duplicateNames.forEach((dup: any) => {
          console.log(`  - ${dup.name} appears ${dup.count} times`);
        });
      }
      
    } catch (error) {
      console.error('[QUICK-DIAG] Error during diagnostics:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full border-2 border-red-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-6 w-6" />
          🚨 Quick Diagnostics Runner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Critical Pipeline Debug</h3>
          <div className="text-sm text-red-700 space-y-1">
            <div>1. 🔍 Run Store Names Analysis (check for whitespace/encoding issues)</div>
            <div>2. 🔧 Run Pricing Worker (capture [DB-MATCH-DEBUG] logs)</div>
            <div>3. 📊 Review console output for name mismatches</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={runStoreNamesAnalysis}
            disabled={isRunning}
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50"
          >
            <Database className="mr-2 h-4 w-4" />
            Store Names Analysis
          </Button>
          
          <Button 
            onClick={runPricingWorker}
            disabled={isRunning}
            variant="outline"
            className="border-orange-500 text-orange-700 hover:bg-orange-50"
          >
            <Wrench className="mr-2 h-4 w-4" />
            Pricing Worker
          </Button>
          
          <Button 
            onClick={runBothDiagnostics}
            disabled={isRunning}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? 'Running...' : 'Run Both'}
          </Button>
        </div>

        {/* Results Display */}
        {storeNamesResults && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Store Names Analysis Results</h3>
            
            {/* Heat Seeker Items */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-800">
                Heat Seeker Items ({storeNamesResults.analysis?.heatSeekerItems?.length || 0})
              </h4>
              {storeNamesResults.analysis?.heatSeekerItems?.length > 0 ? (
                <div className="space-y-2">
                  {storeNamesResults.analysis.heatSeekerItems.map((item: any, idx: number) => (
                    <div key={idx} className="text-sm bg-white p-2 rounded border">
                      <div><strong>Name:</strong> {item.name}</div>
                      <div><strong>Length:</strong> {item.nameLength} chars ({item.nameBytes} bytes)</div>
                      <div><strong>Price:</strong> ${item.price}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-red-600 font-medium">❌ NO Heat Seeker items found!</div>
              )}
            </div>

            {/* Whitespace Issues */}
            {storeNamesResults.analysis?.whitespaceIssues?.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-yellow-800">
                  Whitespace Issues ({storeNamesResults.analysis.whitespaceIssues.length})
                </h4>
                <div className="space-y-1">
                  {storeNamesResults.analysis.whitespaceIssues.map((issue: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      {issue.name} → {issue.trimmed}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Duplicates */}
            {storeNamesResults.analysis?.duplicateNames?.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-red-800">
                  Duplicate Names ({storeNamesResults.analysis.duplicateNames.length})
                </h4>
                <div className="space-y-1">
                  {storeNamesResults.analysis.duplicateNames.map((dup: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      {dup.name} appears {dup.count} times
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {pricingWorkerResults && (
          <div className="mt-6 bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Pricing Worker Results</h3>
            <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
              {JSON.stringify(pricingWorkerResults, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">📋 Next Steps After Running:</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <div>1. Check browser console for [DB-MATCH-DEBUG] and [PRICE-MISS] logs</div>
            <div>2. Look for exact=0, ilike=1 patterns (whitespace issues)</div>
            <div>3. Check for exact=0, ilike=0 patterns (missing items)</div>
            <div>4. Review Heat Seeker SAR name formatting carefully</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
