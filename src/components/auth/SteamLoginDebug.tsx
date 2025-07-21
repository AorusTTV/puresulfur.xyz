
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Info, ExternalLink } from 'lucide-react';

export const SteamLoginDebug: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const runConnectivityTest = async () => {
    setTesting(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    try {
      // Test 1: Check if Steam auth function exists
      const steamAuthUrl = 'https://sckkxdmwzxayefwvcgic.supabase.co/functions/v1/steam-auth';
      
      try {
        const response = await fetch(`${steamAuthUrl}?action=test`, {
          method: 'GET',
          mode: 'cors'
        });
        
        results.tests.functionReachable = {
          status: response.status < 500 ? 'pass' : 'fail',
          message: `Steam auth function returned status: ${response.status}`,
          details: `Response: ${response.statusText}`
        };
      } catch (error) {
        results.tests.functionReachable = {
          status: 'fail',
          message: 'Steam auth function not reachable',
          details: error instanceof Error ? error.message : String(error)
        };
      }

      // Test 2: Check Steam Community connectivity
      try {
        const steamTestUrl = 'https://steamcommunity.com/openid/login';
        const steamResponse = await fetch(steamTestUrl, {
          method: 'HEAD',
          mode: 'no-cors'
        });
        
        results.tests.steamConnectivity = {
          status: 'pass',
          message: 'Steam Community is reachable',
          details: 'Steam OpenID endpoint accessible'
        };
      } catch (error) {
        results.tests.steamConnectivity = {
          status: 'fail',
          message: 'Steam Community not reachable',
          details: error instanceof Error ? error.message : String(error)
        };
      }

      // Test 3: Check current domain
      const currentDomain = window.location.origin;
      results.tests.domainCheck = {
        status: 'info',
        message: `Current domain: ${currentDomain}`,
        details: 'This will be used as the redirect URL'
      };

      // Test 4: Check for URL parameters indicating previous auth attempts
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthError = urlParams.has('error');
      
      results.tests.urlParams = {
        status: hasAuthError ? 'fail' : 'pass',
        message: hasAuthError ? 'Auth error found in URL' : 'No auth errors in URL',
        details: hasAuthError ? `Error: ${urlParams.get('error')}, Reason: ${urlParams.get('reason')}` : 'Clean URL state'
      };

      setTestResults(results);
      
      const passedTests = Object.values(results.tests).filter((test: any) => test.status === 'pass').length;
      const totalTests = Object.keys(results.tests).length;
      
      toast({
        title: 'Connectivity Test Complete',
        description: `${passedTests}/${totalTests} tests passed`,
        variant: passedTests === totalTests ? 'default' : 'destructive'
      });

    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: 'Test Failed',
        description: 'Failed to run connectivity tests',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'pass' ? 'default' : status === 'fail' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
  };

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Steam Login Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runConnectivityTest} 
            disabled={testing}
            className="flex items-center gap-2"
          >
            {testing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Testing...
              </>
            ) : (
              'Run Connectivity Test'
            )}
          </Button>
        </div>

        {testResults && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Test Results</h3>
              <span className="text-sm text-muted-foreground">
                {new Date(testResults.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="space-y-2">
              {Object.entries(testResults.tests).map(([testName, result]: [string, any]) => (
                <div key={testName} className="p-3 border border-border/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{testName}</span>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-muted-foreground opacity-80">{result.details}</p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Troubleshooting Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ensure Steam API key is configured in Supabase secrets</li>
                <li>• Check that redirect URLs are properly configured</li>
                <li>• Verify Supabase Edge Function is deployed and accessible</li>
                <li>• Test with different browsers or incognito mode</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
