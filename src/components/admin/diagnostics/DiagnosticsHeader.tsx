
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

export const DiagnosticsHeader = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Search className="h-5 w-5" />
        🇮🇱 תיקון מחירי החנות (Hebrew Store Price Fix)
      </CardTitle>
    </CardHeader>
  );
};
