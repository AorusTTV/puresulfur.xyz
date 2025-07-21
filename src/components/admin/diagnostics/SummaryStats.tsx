
import { NameAnalysis } from './types';

interface SummaryStatsProps {
  analysis: NameAnalysis;
}

export const SummaryStats = ({ analysis }: SummaryStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-blue-50 p-3 rounded">
        <div className="text-xl font-bold text-blue-600">{analysis.detailedStats.totalItems}</div>
        <div className="text-xs text-blue-600">סה"כ פריטים</div>
      </div>
      <div className="bg-red-50 p-3 rounded">
        <div className="text-xl font-bold text-red-600">{analysis.detailedStats.duplicateGroups}</div>
        <div className="text-xs text-red-600">כפילויות</div>
      </div>
      <div className="bg-yellow-50 p-3 rounded">
        <div className="text-xl font-bold text-yellow-600">{analysis.detailedStats.itemsWithWhitespace}</div>
        <div className="text-xs text-yellow-600">בעיות רווחים</div>
      </div>
      <div className="bg-purple-50 p-3 rounded">
        <div className="text-xl font-bold text-purple-600">{analysis.detailedStats.totalDuplicateItems}</div>
        <div className="text-xs text-purple-600">למחיקה</div>
      </div>
    </div>
  );
};
