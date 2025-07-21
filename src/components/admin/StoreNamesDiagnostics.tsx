
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, Loader2, Database } from 'lucide-react';

interface NameDiagnosticResult {
  success: boolean;
  analysis?: {
    totalBotItems: number;
    heatSeekerItems: Array<{
      id: string;
      name: string;
      price: number;
      updated_at: string;
      nameLength: number;
      nameBytes: number;
    }>;
    duplicateNames: Array<{ name: string; count: number }>;
    whitespaceIssues: Array<{
      name: string;
      hasLeadingSpace: boolean;
      hasTrailingSpace: boolean;
      trimmed: string;
    }>;
    sampleNames: string[];
  };
  error?: string;
  timestamp: string;
}

export const StoreNamesDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<NameDiagnosticResult | null>(null);

  const runNameDiagnostics = async () => {
    setIsRunning(true);
    
    try {
      console.log('[STORE-NAMES-DEBUG] Running store names diagnostics...');
      
      const { data, error } = await supabase.functions.invoke('debug-store-names');
      
      if (error) {
        throw error;
      }
      
      setResults(data);
      console.log('[STORE-NAMES-DEBUG] Results:', data);
      
    } catch (error) {
      console.error('[STORE-NAMES-DEBUG] Error:', error);
      setResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Store Names Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Name Matching Analysis</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• Check for Heat Seeker SAR items in store_items table</div>
            <div>• Identify duplicate item names</div>
            <div>• Find whitespace issues (leading/trailing spaces)</div>
            <div>• Analyze name encoding and length issues</div>
          </div>
        </div>

        <Button 
          onClick={runNameDiagnostics} 
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Store Names...
            </>
          ) : (
            'Run Store Names Analysis'
          )}
        </Button>

        {results && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {results.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Analysis Results
            </h3>
            
            {results.success && results.analysis ? (
              <div className="space-y-4">
                {/* Heat Seeker Items */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Heat Seeker Items ({results.analysis.heatSeekerItems.length})</h4>
                    {results.analysis.heatSeekerItems.length > 0 ? (
                      <div className="space-y-2">
                        {results.analysis.heatSeekerItems.map((item, idx) => (
                          <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                            <div><strong>Name:</strong> {item.name}</div>
                            <div><strong>Price:</strong> ${item.price}</div>
                            <div><strong>Length:</strong> {item.nameLength} chars ({item.nameBytes} bytes)</div>
                            <div><strong>Updated:</strong> {item.updated_at}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-red-600">❌ No Heat Seeker items found!</div>
                    )}
                  </CardContent>
                </Card>

                {/* Duplicate Names */}
                <Card className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Duplicate Names ({results.analysis.duplicateNames.length})</h4>
                    {results.analysis.duplicateNames.length > 0 ? (
                      <div className="space-y-1">
                        {results.analysis.duplicateNames.map((dup, idx) => (
                          <div key={idx} className="text-sm">
                            {dup.name} appears {dup.count} times
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-green-600">✅ No duplicate names found</div>
                    )}
                  </CardContent>
                </Card>

                {/* Whitespace Issues */}
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Whitespace Issues ({results.analysis.whitespaceIssues.length})</h4>
                    {results.analysis.whitespaceIssues.length > 0 ? (
                      <div className="space-y-2">
                        {results.analysis.whitespaceIssues.map((issue, idx) => (
                          <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                            <div><strong>Original:</strong> {issue.name}</div>
                            <div><strong>Trimmed:</strong> {issue.trimmed}</div>
                            <div>
                              {issue.hasLeadingSpace && <span className="text-red-500">Leading space ❌</span>}
                              {issue.hasTrailingSpace && <span className="text-red-500">Trailing space ❌</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-green-600">✅ No whitespace issues found</div>
                    )}
                  </CardContent>
                </Card>

                {/* Sample Names */}
                <Card className="border-l-4 border-l-gray-500">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Sample Item Names (First 10)</h4>
                    <div className="text-xs bg-gray-100 p-2 rounded font-mono">
                      {results.analysis.sampleNames.map((name, idx) => (
                        <div key={idx}>{name}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Summary */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Summary</h4>
                  <div className="text-sm text-green-700">
                    <div>Total bot items: {results.analysis.totalBotItems}</div>
                    <div>Heat Seeker items: {results.analysis.heatSeekerItems.length}</div>
                    <div>Issues found: {results.analysis.duplicateNames.length + results.analysis.whitespaceIssues.length}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Error</h4>
                <div className="text-sm text-red-700">{results.error}</div>
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Analysis completed at: {results.timestamp}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
