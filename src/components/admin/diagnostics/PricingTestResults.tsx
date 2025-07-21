
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { PricingTestResult } from '@/utils/testPriceUpdates';

interface PricingTestResultsProps {
  results: PricingTestResult;
}

export const PricingTestResults = ({ results }: PricingTestResultsProps) => {
  const getStatusColor = (successRate: number) => {
    if (successRate >= 98) return 'text-green-600 bg-green-50';
    if (successRate >= 90) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          🧪 תוצאות בדיקת מחירים
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded text-center">
            <div className="text-xl font-bold text-blue-600">{results.itemsProcessed}</div>
            <div className="text-xs text-blue-600">פריטים נבדקו</div>
          </div>
          <div className="bg-green-50 p-3 rounded text-center">
            <div className="text-xl font-bold text-green-600">{results.successCount}</div>
            <div className="text-xs text-green-600">הצליחו</div>
          </div>
          <div className="bg-red-50 p-3 rounded text-center">
            <div className="text-xl font-bold text-red-600">{results.errorCount}</div>
            <div className="text-xs text-red-600">נכשלו</div>
          </div>
          <div className={`p-3 rounded text-center ${getStatusColor(results.successRate)}`}>
            <div className="text-xl font-bold">{results.successRate}%</div>
            <div className="text-xs">אחוז הצלחה</div>
          </div>
        </div>
        
        <div className="space-y-2">
          {results.successRate >= 98 ? (
            <div className="bg-green-50 p-3 rounded">
              <div className="text-green-800 font-medium">🎉 המחירים תוקנו בהצלחה!</div>
              <div className="text-sm text-green-700">
                המחירים עכשיו נכונים לפי הנוסחה דולר × 1.495
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-3 rounded">
              <div className="text-yellow-800 font-medium">⚠️ עדיין צריך תיקונים ({results.successRate}%)</div>
              <div className="text-sm text-yellow-700">
                הפעל את ה-SQL שנוצר כדי לתקן את הבעיות
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
