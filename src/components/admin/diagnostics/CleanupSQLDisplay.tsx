
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Copy } from 'lucide-react';
import { NameAnalysis } from './types';

interface CleanupSQLDisplayProps {
  analysis: NameAnalysis;
  onCopyToClipboard: (text: string) => void;
}

export const CleanupSQLDisplay = ({ analysis, onCopyToClipboard }: CleanupSQLDisplayProps) => {
  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          📋 SQL לתיקון מחירים עברית
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onCopyToClipboard(analysis.cleanupSqlGenerated)}
              size="sm"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Copy className="h-4 w-4" />
              📋 העתק SQL לתיקון
            </Button>
            <span className="text-sm text-gray-600">
              → הפעל ב-Supabase SQL Editor עכשיו
            </span>
          </div>
          
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64 font-mono">
            {analysis.cleanupSqlGenerated}
          </pre>
          
          <div className="bg-green-50 p-3 rounded">
            <div className="text-sm text-green-700">
              <strong>תוצאה צפויה:</strong> מחק {analysis.detailedStats.totalDuplicateItems} כפילויות → תקן מחירים לנוסחה דולר × 1.495
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
