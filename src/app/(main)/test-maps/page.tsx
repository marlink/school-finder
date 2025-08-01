import { GoogleMapsTest } from '@/components/GoogleMapsTest';

export default function TestMapsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Google Maps API Test</h1>
          <p className="text-gray-600">
            This page tests the Google Maps API integration. Use this to verify that your API key is working correctly.
          </p>
        </div>
        
        <GoogleMapsTest />
        
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="font-semibold text-blue-800 mb-2">Quick Setup:</h2>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
            <li>Create a new project or select existing one</li>
            <li>Enable: Maps JavaScript API, Geocoding API, Places API</li>
            <li>Create an API key in &quot;APIs &amp; Services&quot; → &quot;Credentials&quot;</li>
            <li>Add to .env.local: <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=&quot;your_key_here&quot;</code></li>
            <li>Restart development server</li>
          </ol>
        </div>
      </div>
    </div>
  );
}