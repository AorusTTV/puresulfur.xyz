
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export const PricingDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnosticResults: DiagnosticResult[] = [];

    try {
      // Step 1: Check if worker ran recently
      console.log('[DIAGNOSTICS] Step 1: Checking worker execution...');
      try {
        // We can't directly access edge function logs from the frontend, 
        // but we can check the database for recent updates
        const { data: recentUpdates, error: updateError } = await supabase
          .from('store_items')
          .select('name, price, updated_at')
          .eq('is_bot_item', true)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (updateError) throw updateError;

        const now = new Date();
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
        const recentlyUpdated = recentUpdates?.filter(item => 
          new Date(item.updated_at) > thirtyMinutesAgo
        );

        if (recentlyUpdated && recentlyUpdated.length > 0) {
          diagnosticResults.push({
            step: 'Worker Execution',
            status: 'success',
            message: `Worker appears to have run recently. Found ${recentlyUpdated.length} items updated in last 30 minutes.`,
            details: `Most recent update: ${recentlyUpdated[0].updated_at}`
          });
        } else {
          diagnosticResults.push({
            step: 'Worker Execution',
            status: 'error',
            message: 'No items updated in the last 30 minutes. Worker may not be running or may be failing.',
            details: `Latest update found: ${recentUpdates?.[0]?.updated_at || 'None'}`
          });
        }
      } catch (error) {
        diagnosticResults.push({
          step: 'Worker Execution',
          status: 'error',
          message: 'Failed to check worker execution status',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Step 2: Check specific item pricing
      console.log('[DIAGNOSTICS] Step 2: Checking database prices...');
      try {
        const { data: heatSeekerItems, error: dbError } = await supabase
          .from('store_items')
          .select('name, price, updated_at')
          .ilike('name', '%Heat Seeker SAR%')
          .limit(3);

        if (dbError) throw dbError;

        if (heatSeekerItems && heatSeekerItems.length > 0) {
          const expectedPrice = 28.70; // Based on $19.20 * 1.495
          const actualPrices = heatSeekerItems.map(item => item.price);
          const hasCorrectPricing = actualPrices.some(price => 
            Math.abs(price - expectedPrice) < 0.01
          );

          if (hasCorrectPricing) {
            diagnosticResults.push({
              step: 'Database Pricing',
              status: 'success',
              message: 'Database contains items with correct pricing formula',
              details: `Found prices: ${actualPrices.join(', ')} (Expected: ~28.70)`
            });
          } else {
            diagnosticResults.push({
              step: 'Database Pricing',
              status: 'error',
              message: 'Database prices do not match expected formula',
              details: `Found prices: ${actualPrices.join(', ')} (Expected: ~28.70 for Heat Seeker SAR)`
            });
          }
        } else {
          diagnosticResults.push({
            step: 'Database Pricing',
            status: 'warning',
            message: 'No Heat Seeker SAR items found in database',
            details: 'Cannot verify pricing formula without test items'
          });
        }
      } catch (error) {
        diagnosticResults.push({
          step: 'Database Pricing',
          status: 'error',
          message: 'Failed to check database pricing',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Step 3: Test worker manually
      console.log('[DIAGNOSTICS] Step 3: Testing worker function...');
      try {
        const { data: workerResult, error: workerError } = await supabase.functions.invoke(
          'update-steam-prices',
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (workerError) throw workerError;

        diagnosticResults.push({
          step: 'Manual Worker Test',
          status: 'success',
          message: 'Worker function executed successfully',
          details: JSON.stringify(workerResult, null, 2)
        });
      } catch (error) {
        diagnosticResults.push({
          step: 'Manual Worker Test',
          status: 'error',
          message: 'Worker function failed to execute',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Step 4: Check cron job status
      console.log('[DIAGNOSTICS] Step 4: Checking cron job status...');
      try {
        // We can't directly check cron jobs from frontend, but we can infer from update patterns
        const { data: updatePattern, error: patternError } = await supabase
          .from('store_items')
          .select('updated_at')
          .eq('is_bot_item', true)
          .order('updated_at', { ascending: false })
          .limit(20);

        if (patternError) throw patternError;

        if (updatePattern && updatePattern.length > 0) {
          const updateTimes = updatePattern.map(item => new Date(item.updated_at).getTime());
          const intervals = [];
          for (let i = 1; i < Math.min(updateTimes.length, 5); i++) {
            intervals.push((updateTimes[i-1] - updateTimes[i]) / (1000 * 60)); // minutes
          }
          
          const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b) / intervals.length : 0;
          
          if (avgInterval > 25 && avgInterval < 35) {
            diagnosticResults.push({
              step: 'Cron Job Pattern',
              status: 'success',
              message: 'Update pattern suggests cron job is running every ~30 minutes',
              details: `Average interval: ${avgInterval.toFixed(1)} minutes`
            });
          } else if (avgInterval === 0) {
            diagnosticResults.push({
              step: 'Cron Job Pattern',
              status: 'warning',
              message: 'Not enough update history to determine cron pattern',
              details: 'Only one update found in recent history'
            });
          } else {
            diagnosticResults.push({
              step: 'Cron Job Pattern',
              status: 'warning',
              message: 'Update pattern does not match expected 30-minute interval',
              details: `Average interval: ${avgInterval.toFixed(1)} minutes (Expected: ~30)`
            });
          }
        }
      } catch (error) {
        diagnosticResults.push({
          step: 'Cron Job Pattern',
          status: 'error',
          message: 'Failed to analyze cron job pattern',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

    } catch (error) {
      diagnosticResults.push({
        step: 'General Error',
        status: 'error',
        message: 'Diagnostic process failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setResults(diagnosticResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Pricing Pipeline Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run Full Diagnostics'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Diagnostic Results:</h3>
            {results.map((result, index) => (
              <Card key={index} className={`border-l-4 ${
                result.status === 'success' ? 'border-l-green-500' :
                result.status === 'error' ? 'border-l-red-500' :
                'border-l-yellow-500'
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h4 className="font-medium">{result.step}</h4>
                      <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                      {result.details && (
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                          {result.details}
                        </pre>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
