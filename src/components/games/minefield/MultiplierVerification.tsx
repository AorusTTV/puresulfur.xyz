
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getMinefieldMultiplier, formatMultiplier, FEATURE_FLAGS } from '@/utils/minefieldMultipliers';

interface TestCase {
  mines: number;
  safeClicks: number;
  expected: number;
  description: string;
}

const TEST_CASES: TestCase[] = [
  { mines: 5, safeClicks: 3, expected: 1.56, description: "5 mines, 3 safe clicks" },
  { mines: 12, safeClicks: 10, expected: 138.60, description: "12 mines, 10 safe clicks" },
  { mines: 24, safeClicks: 1, expected: 8.21, description: "24 mines, 1 safe click" },
  { mines: 1, safeClicks: 1, expected: 1.03, description: "1 mine, 1 safe click" },
  { mines: 3, safeClicks: 24, expected: 34.30, description: "3 mines, 24 safe clicks" },
  { mines: 9, safeClicks: 5, expected: 4.09, description: "9 mines, 5 safe clicks" },
  { mines: 1, safeClicks: 10, expected: 1.46, description: "1 mine, 10 safe clicks" },
  { mines: 6, safeClicks: 8, expected: 4.42, description: "6 mines, 8 safe clicks" },
  { mines: 15, safeClicks: 5, expected: 20.12, description: "15 mines, 5 safe clicks" },
  { mines: 20, safeClicks: 4, expected: 42.16, description: "20 mines, 4 safe clicks" }
];

export const MultiplierVerification: React.FC = () => {
  const [mines, setMines] = useState<number>(5);
  const [safeClicks, setSafeClicks] = useState<number>(3);
  const [result, setResult] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<Array<{case: TestCase, actual: number, passed: boolean}>>([]);

  const testMultiplier = () => {
    const multiplier = getMinefieldMultiplier(mines, safeClicks);
    setResult(multiplier);
    console.log(`Multiplier test: ${mines} mines, ${safeClicks} safe clicks -> ${formatMultiplier(multiplier)}`);
  };

  const runAllTestCases = () => {
    console.log('=== Multiplier Verification Test Cases ===');
    const results = TEST_CASES.map(testCase => {
      const actual = getMinefieldMultiplier(testCase.mines, testCase.safeClicks);
      const passed = Math.abs(actual - testCase.expected) < 0.01;
      
      console.log(`${testCase.description}: Expected ${testCase.expected}, Got ${actual} - ${passed ? '✅ PASS' : '❌ FAIL'}`);
      
      return {
        case: testCase,
        actual,
        passed
      };
    });
    
    setTestResults(results);
    
    const passedCount = results.filter(r => r.passed).length;
    console.log(`\n=== Test Summary ===`);
    console.log(`Passed: ${passedCount}/${results.length}`);
    console.log(`Feature Flag V2 Enabled: ${FEATURE_FLAGS.MINEFIELD_MULTIPLIER_V2}`);
  };

  const testFeatureFlag = () => {
    console.log('=== Feature Flag Test ===');
    
    // Test with V2 enabled
    FEATURE_FLAGS.MINEFIELD_MULTIPLIER_V2 = true;
    const v2Result = getMinefieldMultiplier(5, 3);
    
    // Test with V2 disabled (fallback)
    FEATURE_FLAGS.MINEFIELD_MULTIPLIER_V2 = false;
    const fallbackResult = getMinefieldMultiplier(5, 3);
    
    // Re-enable V2
    FEATURE_FLAGS.MINEFIELD_MULTIPLIER_V2 = true;
    
    console.log(`V2 Enabled (5 mines, 3 safe): ${v2Result} (should be ~1.56)`);
    console.log(`V2 Disabled (5 mines, 3 safe): ${fallbackResult} (should be different from 1.56)`);
    console.log(`Feature flag working: ${Math.abs(v2Result - fallbackResult) > 0.1 ? '✅ PASS' : '❌ FAIL'}`);
  };

  const testEdgeCases = () => {
    console.log('=== Edge Cases Test ===');
    
    const edgeCases = [
      { mines: 0, safeClicks: 1, expected: 1, description: "Invalid mines (0)" },
      { mines: 25, safeClicks: 1, expected: 1, description: "Invalid mines (25)" },
      { mines: 5, safeClicks: 0, expected: 1, description: "Invalid safe clicks (0)" },
      { mines: 5, safeClicks: 25, expected: 1, description: "Invalid safe clicks (25)" },
      { mines: 24, safeClicks: 2, expected: 1, description: "Impossible combination (24 mines, 2 safe)" },
      { mines: 23, safeClicks: 3, expected: 1, description: "Impossible combination (23 mines, 3 safe)" }
    ];
    
    edgeCases.forEach(testCase => {
      const actual = getMinefieldMultiplier(testCase.mines, testCase.safeClicks);
      const passed = actual === testCase.expected;
      console.log(`${testCase.description}: Expected ${testCase.expected}, Got ${actual} - ${passed ? '✅ PASS' : '❌ FAIL'}`);
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm max-w-2xl">
        <CardHeader>
          <CardTitle className="text-foreground">Multiplier Verification Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mines">Mines</Label>
              <Input
                id="mines"
                type="number"
                value={mines}
                onChange={(e) => setMines(parseInt(e.target.value) || 1)}
                min="1"
                max="24"
              />
            </div>
            <div>
              <Label htmlFor="safeClicks">Safe Clicks</Label>
              <Input
                id="safeClicks"
                type="number"
                value={safeClicks}
                onChange={(e) => setSafeClicks(parseInt(e.target.value) || 1)}
                min="1"
                max="24"
              />
            </div>
          </div>

          <Button onClick={testMultiplier} className="w-full">
            Test Single Multiplier
          </Button>

          {result !== null && (
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <p className="text-lg font-bold text-primary">
                Result: {formatMultiplier(result)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button onClick={runAllTestCases} variant="outline">
              Run All Tests
            </Button>
            <Button onClick={testFeatureFlag} variant="outline">
              Test Feature Flag
            </Button>
            <Button onClick={testEdgeCases} variant="outline">
              Test Edge Cases
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Check the browser console for detailed test results and logs.
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card className="bg-card/60 border-border/50 backdrop-blur-sm max-w-2xl">
          <CardHeader>
            <CardTitle className="text-foreground">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                  <span className="text-sm">{result.case.description}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Expected: {result.case.expected} | Got: {result.actual.toFixed(2)}
                    </span>
                    <Badge variant={result.passed ? "default" : "destructive"}>
                      {result.passed ? "PASS" : "FAIL"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-2 bg-primary/10 rounded">
              <p className="text-sm font-semibold">
                Summary: {testResults.filter(r => r.passed).length}/{testResults.length} tests passed
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
