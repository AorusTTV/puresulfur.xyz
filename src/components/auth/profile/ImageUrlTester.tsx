
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ImageUrlTesterProps {
  url: string;
}

export const ImageUrlTester: React.FC<ImageUrlTesterProps> = ({ url }) => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testImageUrl = async () => {
    setIsLoading(true);
    setTestResult('Testing...');
    
    try {
      console.log('Testing image URL:', url);
      
      // Test 1: Try to fetch the URL
      const response = await fetch(url, { method: 'HEAD' });
      console.log('Fetch response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        setTestResult(`HTTP Error: ${response.status} ${response.statusText}`);
        return;
      }
      
      // Test 2: Try to load as image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('Image loaded successfully:', {
          width: img.naturalWidth,
          height: img.naturalHeight,
          src: img.src
        });
        setTestResult(`✅ Image loaded successfully (${img.naturalWidth}x${img.naturalHeight})`);
        setIsLoading(false);
      };
      
      img.onerror = (error) => {
        console.error('Image failed to load:', error);
        setTestResult('❌ Image failed to load - possible CORS or format issue');
        setIsLoading(false);
      };
      
      img.src = url;
      
    } catch (error) {
      console.error('Network error:', error);
      setTestResult(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Image URL Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input 
          value={url} 
          readOnly 
          className="text-xs font-mono"
        />
        <Button 
          onClick={testImageUrl} 
          disabled={isLoading || !url}
          size="sm"
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Image URL'}
        </Button>
        {testResult && (
          <div className={`text-xs p-2 rounded ${
            testResult.includes('✅') ? 'bg-green-50 text-green-700' : 
            testResult.includes('❌') ? 'bg-red-50 text-red-700' : 
            'bg-blue-50 text-blue-700'
          }`}>
            {testResult}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
