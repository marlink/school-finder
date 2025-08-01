'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, MapPin } from 'lucide-react';
import { loadGoogleMapsAPI, isGoogleMapsLoaded, geocodeAddress } from '@/lib/google-maps';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
}

export function GoogleMapsTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'API Key Configuration', status: 'pending', message: 'Checking...' },
    { name: 'Google Maps API Loading', status: 'pending', message: 'Checking...' },
    { name: 'Geocoding Service', status: 'pending', message: 'Checking...' },
    { name: 'Places Service', status: 'pending', message: 'Checking...' }
  ]);

  const updateTest = (index: number, status: TestResult['status'], message: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message } : test
    ));
  };

  const runTests = async () => {
    // Reset tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending', message: 'Checking...' })));

    // Test 1: API Key Configuration
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_') || apiKey.includes('_HERE')) {
      updateTest(0, 'error', 'API key not configured or using placeholder value');
      return;
    } else {
      updateTest(0, 'success', 'API key is configured');
    }

    // Test 2: Google Maps API Loading
    try {
      await loadGoogleMapsAPI();
      if (isGoogleMapsLoaded()) {
        updateTest(1, 'success', 'Google Maps API loaded successfully');
      } else {
        updateTest(1, 'error', 'Google Maps API failed to load');
        return;
      }
    } catch (error) {
      updateTest(1, 'error', `Failed to load Google Maps API: ${error}`);
      return;
    }

    // Test 3: Geocoding Service
    try {
      const testAddress = "Warszawa, Polska";
      const coordinates = await geocodeAddress(testAddress);
      if (coordinates) {
        updateTest(2, 'success', `Geocoding works: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`);
      } else {
        updateTest(2, 'error', 'Geocoding returned no results');
      }
    } catch (error) {
      updateTest(2, 'error', `Geocoding failed: ${error}`);
    }

    // Test 4: Places Service (basic check)
    try {
      if (window.google?.maps?.places) {
        updateTest(3, 'success', 'Places API is available');
      } else {
        updateTest(3, 'error', 'Places API not available');
      }
    } catch (error) {
      updateTest(3, 'error', `Places API check failed: ${error}`);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const allTestsPassed = tests.every(test => test.status === 'success');
  const hasErrors = tests.some(test => test.status === 'error');

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold">Google Maps API Integration Test</h2>
      </div>

      <div className="space-y-4 mb-6">
        {tests.map((test, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
            {getStatusIcon(test.status)}
            <div className="flex-1">
              <h3 className="font-medium">{test.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{test.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={runTests} variant="outline">
          Run Tests Again
        </Button>
        
        {allTestsPassed && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">All tests passed! Google Maps is ready.</span>
          </div>
        )}
        
        {hasErrors && (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Some tests failed. Check configuration.</span>
          </div>
        )}
      </div>

      {hasErrors && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-800 mb-2">Setup Instructions:</h3>
          <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
            <li>Get a Google Maps API key from Google Cloud Console</li>
            <li>Enable Maps JavaScript API, Geocoding API, and Places API</li>
            <li>Add your API key to .env.local as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
            <li>Restart your development server</li>
            <li>See docs/GOOGLE_MAPS_SETUP.md for detailed instructions</li>
          </ol>
        </div>
      )}
    </Card>
  );
}