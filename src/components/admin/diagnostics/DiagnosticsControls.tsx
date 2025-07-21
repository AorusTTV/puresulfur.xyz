
import { Button } from '@/components/ui/button';
import { Database, Zap } from 'lucide-react';

interface DiagnosticsControlsProps {
  onRunAnalysis: () => void;
  onRunPricingTest: () => void;
  isAnalyzing: boolean;
  isTestingPrices: boolean;
}

export const DiagnosticsControls = ({ 
  onRunAnalysis, 
  onRunPricingTest, 
  isAnalyzing, 
  isTestingPrices 
}: DiagnosticsControlsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Button 
        onClick={onRunAnalysis}
        disabled={isAnalyzing}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
      >
        <Database className="h-4 w-4" />
        {isAnalyzing ? 'מנתח מחירים...' : '🔍 נתח וצור SQL לתיקון'}
      </Button>
      
      <Button 
        onClick={onRunPricingTest}
        disabled={isTestingPrices}
        variant="outline"
        className="flex items-center gap-2 border-green-500 text-green-700 hover:bg-green-50"
      >
        <Zap className="h-4 w-4" />
        {isTestingPrices ? 'בודק מחירים...' : '🧪 בדוק עדכון מחירים'}
      </Button>
    </div>
  );
};
