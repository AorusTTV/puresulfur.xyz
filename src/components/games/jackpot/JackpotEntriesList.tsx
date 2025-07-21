
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JackpotEntry } from './JackpotEntry';
import type { JackpotEntryData } from '@/types/jackpot';

interface JackpotEntriesListProps {
  entries: JackpotEntryData[];
  totalPot: number;
}

export const JackpotEntriesList = ({ entries, totalPot }: JackpotEntriesListProps) => {
  return (
    <Card className="bg-slate-800/60 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-lg">Current Entries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <JackpotEntry 
              key={entry.id} 
              entry={entry} 
              totalPot={totalPot}
            />
          ))
        ) : (
          <p className="text-slate-400 text-center">No entries yet</p>
        )}
      </CardContent>
    </Card>
  );
};
