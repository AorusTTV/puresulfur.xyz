
export interface NameAnalysis {
  duplicates: Array<{ name: string; count: number; ids: string[] }>;
  whitespaceIssues: Array<{ id: string; name: string; trimmed: string; hasLeading: boolean; hasTrailing: boolean }>;
  specialChars: Array<{ id: string; name: string; chars: string[] }>;
  encodingIssues: Array<{ id: string; name: string; normalizedName: string; hasIssue: boolean }>;
  invisibleChars: Array<{ id: string; name: string; cleanedName: string; hasInvisible: boolean }>;
  totalBotItems: number;
  sampleNames: string[];
  cleanupSqlGenerated: string;
  detailedStats: {
    totalItems: number;
    itemsWithWhitespace: number;
    itemsWithSpecialChars: number;
    itemsWithEncodingIssues: number;
    itemsWithInvisibleChars: number;
    duplicateGroups: number;
    totalDuplicateItems: number;
  };
}
