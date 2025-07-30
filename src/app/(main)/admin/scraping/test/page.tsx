'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  status: 'completed' | 'error';
  message?: string;
  error?: string;
  resultsCount?: number;
  sampleData?: any[];
}

interface TestResponse {
  success: boolean;
  message: string;
  connectionTests: {
    apify: boolean;
    firecrawl: boolean;
    python: boolean;
  };
  results: {
    apify?: TestResult;
    firecrawl?: TestResult;
    python?: TestResult;
  };
  config: {
    method: string;
    schoolCount: number;
    testMode: boolean;
    regions: string[];
  };
}

export default function ScrapingTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState('all');
  const [schoolCount, setSchoolCount] = useState(10);
  const [region, setRegion] = useState('mazowieckie');
  const [testResult, setTestResult] = useState<TestResponse | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/admin/scraping/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          schoolCount,
          testMode: true,
          regions: [region]
        }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult({
        success: false,
        message: 'Test failed',
        connectionTests: { apify: false, firecrawl: false, python: false },
        results: {},
        config: { method, schoolCount, testMode: true, regions: [region] }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getConnectionBadge = (connected: boolean) => {
    return (
      <Badge variant={connected ? "default" : "destructive"}>
        {connected ? "Connected" : "Disconnected"}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scraping System Test</h1>
          <p className="text-muted-foreground">
            Test the three scraping methods: Apify, Firecrawl, and Python-style
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>
            Configure and run tests for the scraping system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">Scraping Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="apify">Apify Only</SelectItem>
                  <SelectItem value="firecrawl">Firecrawl Only</SelectItem>
                  <SelectItem value="python">Python-style Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolCount">Number of Schools</Label>
              <Input
                id="schoolCount"
                type="number"
                min="1"
                max="50"
                value={schoolCount}
                onChange={(e) => setSchoolCount(parseInt(e.target.value) || 10)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mazowieckie">Mazowieckie</SelectItem>
                  <SelectItem value="małopolskie">Małopolskie</SelectItem>
                  <SelectItem value="śląskie">Śląskie</SelectItem>
                  <SelectItem value="wielkopolskie">Wielkopolskie</SelectItem>
                  <SelectItem value="dolnośląskie">Dolnośląskie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleTest} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Test...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Scraping Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {testResult && (
        <div className="space-y-4">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span>Apify</span>
                  {getConnectionBadge(testResult.connectionTests.apify)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Firecrawl</span>
                  {getConnectionBadge(testResult.connectionTests.firecrawl)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Python-style</span>
                  {getConnectionBadge(testResult.connectionTests.python)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testResult.results.apify && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(testResult.results.apify.status)}
                    Apify Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {testResult.results.apify.message || testResult.results.apify.error}
                    </p>
                    {testResult.results.apify.resultsCount !== undefined && (
                      <p className="font-medium">
                        Results: {testResult.results.apify.resultsCount}
                      </p>
                    )}
                    {testResult.results.apify.sampleData && (
                      <details className="text-xs">
                        <summary className="cursor-pointer">Sample Data</summary>
                        <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                          {JSON.stringify(testResult.results.apify.sampleData, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {testResult.results.firecrawl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(testResult.results.firecrawl.status)}
                    Firecrawl Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {testResult.results.firecrawl.message || testResult.results.firecrawl.error}
                    </p>
                    {testResult.results.firecrawl.resultsCount !== undefined && (
                      <p className="font-medium">
                        Results: {testResult.results.firecrawl.resultsCount}
                      </p>
                    )}
                    {testResult.results.firecrawl.sampleData && (
                      <details className="text-xs">
                        <summary className="cursor-pointer">Sample Data</summary>
                        <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                          {JSON.stringify(testResult.results.firecrawl.sampleData, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {testResult.results.python && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(testResult.results.python.status)}
                    Python-style Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {testResult.results.python.message || testResult.results.python.error}
                    </p>
                    {testResult.results.python.resultsCount !== undefined && (
                      <p className="font-medium">
                        Results: {testResult.results.python.resultsCount}
                      </p>
                    )}
                    {testResult.results.python.sampleData && (
                      <details className="text-xs">
                        <summary className="cursor-pointer">Sample Data</summary>
                        <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                          {JSON.stringify(testResult.results.python.sampleData, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Test Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Test Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Status:</strong> {testResult.success ? 'Success' : 'Failed'}</p>
                <p><strong>Message:</strong> {testResult.message}</p>
                <p><strong>Method:</strong> {testResult.config.method}</p>
                <p><strong>School Count:</strong> {testResult.config.schoolCount}</p>
                <p><strong>Region:</strong> {testResult.config.regions.join(', ')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}