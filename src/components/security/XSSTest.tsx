
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle } from 'lucide-react';
import { EnhancedInputSanitizer, SecureHTMLRenderer } from './XSSProtection';

// XSS Test payloads for verification
const XSS_TEST_PAYLOADS = [
  '<img src=x onerror=alert(1)>',
  '<script>alert("XSS")</script>',
  'javascript:alert(1)',
  '<iframe src="javascript:alert(1)"></iframe>',
  '<svg onload=alert(1)>',
  '<input onfocus=alert(1) autofocus>',
  '<select onfocus=alert(1) autofocus>',
  '<textarea onfocus=alert(1) autofocus>',
  '<keygen onfocus=alert(1) autofocus>',
  '<video><source onerror="alert(1)">',
  '<audio src=x onerror=alert(1)>',
  '<body onload=alert(1)>',
  '"><script>alert(1)</script>',
  "';alert(1);//",
  '<img src="javascript:alert(1)">',
  '<object data="javascript:alert(1)">',
  '<embed src="javascript:alert(1)">',
  '<link rel=stylesheet href="javascript:alert(1)">',
  '<style>@import "javascript:alert(1)";</style>',
  '<meta http-equiv="refresh" content="0;javascript:alert(1)">'
];

export const XSSTest: React.FC = () => {
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState<Array<{
    payload: string;
    sanitized: string;
    blocked: boolean;
  }>>([]);

  const runSingleTest = () => {
    if (!testInput.trim()) return;

    try {
      const sanitized = EnhancedInputSanitizer.sanitizeUserContent(testInput);
      const blocked = sanitized !== testInput;
      
      setTestResults(prev => [...prev, {
        payload: testInput,
        sanitized,
        blocked
      }]);
      
      setTestInput('');
    } catch (error) {
      setTestResults(prev => [...prev, {
        payload: testInput,
        sanitized: 'ERROR: ' + (error instanceof Error ? error.message : 'Unknown error'),
        blocked: true
      }]);
      setTestInput('');
    }
  };

  const runAllTests = () => {
    const results = XSS_TEST_PAYLOADS.map(payload => {
      try {
        const sanitized = EnhancedInputSanitizer.sanitizeUserContent(payload);
        return {
          payload,
          sanitized,
          blocked: sanitized !== payload || sanitized === ''
        };
      } catch (error) {
        return {
          payload,
          sanitized: 'BLOCKED BY SANITIZER',
          blocked: true
        };
      }
    });
    
    setTestResults(results);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const allTestsPassed = testResults.length > 0 && testResults.every(result => result.blocked);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          XSS Protection Test Suite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Enter XSS payload to test..."
            className="flex-1"
          />
          <Button onClick={runSingleTest} disabled={!testInput.trim()}>
            Test Single
          </Button>
          <Button onClick={runAllTests} variant="outline">
            Run All Tests
          </Button>
          <Button onClick={clearResults} variant="ghost">
            Clear
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={allTestsPassed ? "default" : "destructive"}>
                {allTestsPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {testResults.filter(r => r.blocked).length} / {testResults.length} blocked
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    {result.blocked ? (
                      <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="text-sm">
                        <strong>Payload:</strong>
                        <code className="ml-2 text-xs bg-muted p-1 rounded">
                          {result.payload}
                        </code>
                      </div>
                      <div className="text-sm">
                        <strong>Sanitized:</strong>
                        <SecureHTMLRenderer 
                          html={result.sanitized} 
                          className="ml-2 text-xs bg-muted p-1 rounded inline"
                          tag="code"
                        />
                      </div>
                      <Badge variant={result.blocked ? "default" : "destructive"} className="text-xs">
                        {result.blocked ? "BLOCKED" : "FAILED"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
