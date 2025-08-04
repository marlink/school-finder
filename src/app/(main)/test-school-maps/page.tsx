import { GoogleMapsTest } from '@/components/GoogleMapsTest';
import { GoogleMap } from '@/components/school/GoogleMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, School } from 'lucide-react';

// Mock school data for testing
const mockSchool = {
  id: 'test-school-1',
  name: 'Szkoła Podstawowa nr 1 im. Adama Mickiewicza',
  address: {
    street: 'ul. Marszałkowska 1',
    city: 'Warszawa',
    postalCode: '00-001',
    voivodeship: 'mazowieckie',
    country: 'Poland'
  },
  location: {
    lat: 52.2297,
    lng: 21.0122
  }
};

const mockSchool2 = {
  id: 'test-school-2',
  name: 'Liceum Ogólnokształcące im. Mikołaja Kopernika',
  address: {
    street: 'ul. Krakowskie Przedmieście 26/28',
    city: 'Warszawa',
    postalCode: '00-927',
    voivodeship: 'mazowieckie',
    country: 'Poland'
  },
  location: {
    lat: 52.2396,
    lng: 21.0129
  }
};

const mockSchool3 = {
  id: 'test-school-3',
  name: 'Technikum Informatyczne',
  address: {
    street: 'ul. Nowy Świat 15',
    city: 'Warszawa',
    postalCode: '00-029',
    voivodeship: 'mazowieckie',
    country: 'Poland'
  }
  // No location coordinates - will test geocoding
};

export default function TestSchoolMapsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl text-white">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Google Maps Integration Test</h1>
              <p className="text-gray-600">
                Test Google Maps functionality on school pages with mock data
              </p>
            </div>
          </div>
        </div>

        {/* API Status Test */}
        <div className="mb-8">
          <GoogleMapsTest />
        </div>

        {/* School Maps Tests */}
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Test 1: School with Coordinates
              </CardTitle>
              <p className="text-sm text-gray-600">
                Testing map with provided latitude/longitude coordinates
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{mockSchool.name}</h3>
                <p className="text-gray-600">
                  {mockSchool.address.street}, {mockSchool.address.city}
                </p>
                <p className="text-sm text-gray-500">
                  Coordinates: {mockSchool.location.lat}, {mockSchool.location.lng}
                </p>
              </div>
              <GoogleMap
                address={mockSchool.address}
                schoolName={mockSchool.name}
                location={mockSchool.location}
                className="h-64"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Test 2: School with Different Coordinates
              </CardTitle>
              <p className="text-sm text-gray-600">
                Testing map with different coordinates in Warsaw
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{mockSchool2.name}</h3>
                <p className="text-gray-600">
                  {mockSchool2.address.street}, {mockSchool2.address.city}
                </p>
                <p className="text-sm text-gray-500">
                  Coordinates: {mockSchool2.location.lat}, {mockSchool2.location.lng}
                </p>
              </div>
              <GoogleMap
                address={mockSchool2.address}
                schoolName={mockSchool2.name}
                location={mockSchool2.location}
                className="h-64"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Test 3: School with Address Only (Geocoding)
              </CardTitle>
              <p className="text-sm text-gray-600">
                Testing map with address geocoding (no coordinates provided)
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{mockSchool3.name}</h3>
                <p className="text-gray-600">
                  {mockSchool3.address.street}, {mockSchool3.address.city}
                </p>
                <p className="text-sm text-gray-500">
                  No coordinates - will use geocoding
                </p>
              </div>
              <GoogleMap
                address={mockSchool3.address}
                schoolName={mockSchool3.name}
                className="h-64"
              />
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        <Card className="mt-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">🔧 Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">To enable Google Maps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Get a Google Maps API key from <a href="https://console.cloud.google.com/" target="_blank" className="underline">Google Cloud Console</a></li>
                  <li>Enable these APIs: Maps JavaScript API, Geocoding API, Places API</li>
                  <li>Update your environment file with the API key:</li>
                </ol>
              </div>
              
              <div className="bg-orange-100 p-3 rounded-lg">
                <code className="text-sm">
                  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=&quot;your_actual_api_key_here&quot;
                </code>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Environment Files to Update:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><code>.env.local</code> - for local development</li>
                  <li><code>.env.staging</code> - for staging environment</li>
                  <li><code>.env.production</code> - for production environment</li>
                </ul>
              </div>
              
              <div>
                <p className="text-sm">
                  📖 See <code>docs/GOOGLE_MAPS_SETUP.md</code> for detailed setup instructions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}