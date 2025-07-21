
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface PricingVerificationResultsProps {
  results: any;
}

export const PricingVerificationResults = ({ results }: PricingVerificationResultsProps) => {
  if (!results) return null;

  const summaryItems = [];
  
  for (const [itemName, result] of Object.entries(results)) {
    if ((result as any).error) {
      summaryItems.push({
        item: itemName,
        status: 'error',
        message: (result as any).error
      });
      continue;
    }

    const layers = (result as any).layers || {};
    const checks = {
      rows_affected: (layers['3_db_write']?.rows_affected || 0) > 0,
      verification_success: layers['4_db_verification']?.verification_success === true,
      calculation_correct: layers['2_worker_computation']?.calculation_correct === true,
      unique_prices_correct: layers['6_api_output']?.unique_prices?.length === 1 && 
                            layers['6_api_output']?.unique_prices?.[0] === 28.7,
      frontend_consistency: layers['7_frontend_data']?.frontend_consistency === true
    };

    const allPassed = Object.values(checks).every(check => check === true);
    
    summaryItems.push({
      item: itemName,
      status: allPassed ? 'pass' : 'fail',
      checks,
      pricing: layers['2_worker_computation']
    });
  }

  return (
    <div className="space-y-4">
      {summaryItems.map((item, index) => (
        <Card key={index} className={`border-l-4 ${
          item.status === 'pass' ? 'border-l-green-500' : 
          item.status === 'error' ? 'border-l-red-500' : 'border-l-yellow-500'
        }`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {item.status === 'pass' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {item.item}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {item.status === 'error' ? (
              <div className="text-red-600">{item.message}</div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className={`flex items-center gap-2 ${item.checks?.rows_affected ? 'text-green-600' : 'text-red-600'}`}>
                    {item.checks?.rows_affected ? '✅' : '❌'} rows_affected &gt; 0
                  </div>
                  <div className={`flex items-center gap-2 ${item.checks?.verification_success ? 'text-green-600' : 'text-red-600'}`}>
                    {item.checks?.verification_success ? '✅' : '❌'} verification_success
                  </div>
                  <div className={`flex items-center gap-2 ${item.checks?.calculation_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {item.checks?.calculation_correct ? '✅' : '❌'} calculation_correct
                  </div>
                  <div className={`flex items-center gap-2 ${item.checks?.unique_prices_correct ? 'text-green-600' : 'text-red-600'}`}>
                    {item.checks?.unique_prices_correct ? '✅' : '❌'} unique_prices = [28.7]
                  </div>
                  <div className={`flex items-center gap-2 ${item.checks?.frontend_consistency ? 'text-green-600' : 'text-red-600'}`}>
                    {item.checks?.frontend_consistency ? '✅' : '❌'} frontend_consistency
                  </div>
                </div>
                
                {item.pricing && (
                  <div className="mt-3 p-3 bg-slate-50 rounded text-sm">
                    <div><strong>Formula:</strong> {item.pricing.formula}</div>
                    <div><strong>Expected:</strong> {item.pricing.expected_result}</div>
                    <div><strong>Actual:</strong> ${item.pricing.final_price}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
