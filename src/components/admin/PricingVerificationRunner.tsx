
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { verifyPricingFixes } from '@/utils/verifyPricingFixes';
import { PricingVerificationButton } from '@/components/admin/pricing/PricingVerificationButton';
import { PricingVerificationResults } from '@/components/admin/pricing/PricingVerificationResults';
import { PricingVerificationSummary } from '@/components/admin/pricing/PricingVerificationSummary';
import { PricingVerificationInstructions } from '@/components/admin/pricing/PricingVerificationInstructions';

export const PricingVerificationRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const handleRunVerification = async () => {
    setIsRunning(true);
    setResults(null);
    setVerificationComplete(false);
    
    try {
      console.log('[PRICING-VERIFICATION] Starting final verification run...');
      const testResults = await verifyPricingFixes();
      
      setResults(testResults);
      
      // Check if all tests passed
      const allPassed = Object.values(testResults).every((result: any) => {
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
      
      setVerificationComplete(allPassed);
      
    } catch (error) {
      console.error('Error running pricing verification:', error);
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Final Pricing Pipeline Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <PricingVerificationButton 
          isRunning={isRunning}
          onRunVerification={handleRunVerification}
        />

        <PricingVerificationSummary verificationComplete={verificationComplete} />

        <PricingVerificationResults results={results} />

        <PricingVerificationInstructions />
      </CardContent>
    </Card>
  );
};
