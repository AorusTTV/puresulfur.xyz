
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { NameAnalysis } from './types';

interface IssuesDisplayProps {
  analysis: NameAnalysis;
}

export const IssuesDisplay = ({ analysis }: IssuesDisplayProps) => {
  const hasIssues = analysis.duplicates.length > 0 || 
                   analysis.whitespaceIssues.length > 0 || 
                   analysis.invisibleChars.length > 0 || 
                   analysis.encodingIssues.length > 0;

  if (!hasIssues) return null;

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          בעיות שנמצאו: {analysis.duplicates.length + analysis.whitespaceIssues.length + analysis.invisibleChars.length + analysis.encodingIssues.length}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.duplicates.length > 0 && (
            <div>
              <h4 className="font-medium text-red-600 mb-2">🔄 {analysis.duplicates.length} כפילויות</h4>
              <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                {analysis.duplicates.slice(0, 5).map((dup, idx) => (
                  <div key={idx} className={`p-2 rounded text-xs ${dup.name.includes('Heat Seeker') ? 'bg-green-50' : 'bg-red-50'}`}>
                    "{dup.name}" → {dup.count} עותקים {dup.name.includes('Heat Seeker') ? '(דלג)' : '(תקן)'}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {analysis.whitespaceIssues.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-600 mb-2">🔤 {analysis.whitespaceIssues.length} בעיות רווחים</h4>
              <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                {analysis.whitespaceIssues.slice(0, 3).map((issue, idx) => (
                  <div key={idx} className="bg-yellow-50 p-2 rounded text-xs">
                    רווחים מיותרים בתחילת/סוף השם
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
