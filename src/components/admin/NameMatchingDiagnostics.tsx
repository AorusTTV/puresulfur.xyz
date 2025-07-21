
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { runPricingTest, PricingTestResult } from '@/utils/testPriceUpdates';
import { runNameAnalysis } from './diagnostics/nameAnalyzer';
import { NameAnalysis } from './diagnostics/types';
import { DiagnosticsHeader } from './diagnostics/DiagnosticsHeader';
import { PricingInstructions } from './diagnostics/PricingInstructions';
import { DiagnosticsControls } from './diagnostics/DiagnosticsControls';
import { SummaryStats } from './diagnostics/SummaryStats';
import { IssuesDisplay } from './diagnostics/IssuesDisplay';
import { CleanupSQLDisplay } from './diagnostics/CleanupSQLDisplay';
import { PricingTestResults } from './diagnostics/PricingTestResults';
import { DiagnosticsInstructions } from './diagnostics/DiagnosticsInstructions';

export const NameMatchingDiagnostics = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTestingPrices, setIsTestingPrices] = useState(false);
  const [analysis, setAnalysis] = useState<NameAnalysis | null>(null);
  const [pricingResults, setPricingResults] = useState<PricingTestResult | null>(null);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysisResult = await runNameAnalysis();
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('[NAME-ANALYSIS] Error during Hebrew pricing analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunPricingTest = async () => {
    setIsTestingPrices(true);
    try {
      console.log('[PRICING-TEST] Running Hebrew pricing test for USD × 1.495...');
      
      const results = await runPricingTest();
      setPricingResults(results);
      
      console.log('[PRICING-TEST] Hebrew pricing test completed:', results);

    } catch (error) {
      console.error('[PRICING-TEST] Hebrew pricing test failed:', error);
      setPricingResults({
        success: false,
        itemsProcessed: 0,
        successCount: 0,
        errorCount: 1,
        successRate: 0,
        timestamp: new Date().toISOString(),
        averageProcessingTime: 0
      });
    } finally {
      setIsTestingPrices(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="w-full">
      <DiagnosticsHeader />
      <CardContent className="space-y-6">
        <PricingInstructions />

        <DiagnosticsControls
          onRunAnalysis={handleRunAnalysis}
          onRunPricingTest={handleRunPricingTest}
          isAnalyzing={isAnalyzing}
          isTestingPrices={isTestingPrices}
        />

        {analysis && (
          <div className="space-y-4">
            <SummaryStats analysis={analysis} />
            <IssuesDisplay analysis={analysis} />
            <CleanupSQLDisplay 
              analysis={analysis} 
              onCopyToClipboard={copyToClipboard} 
            />
          </div>
        )}

        {pricingResults && (
          <PricingTestResults results={pricingResults} />
        )}

        <DiagnosticsInstructions />
      </CardContent>
    </Card>
  );
};
