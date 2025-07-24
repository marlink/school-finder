# Admin Panel Implementation

## Overview
The School Finder Portal includes an admin panel for managing schools, users, subscriptions, and viewing analytics.

## Access Control

### Admin Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Protect admin routes
  if (path.startsWith('/admin')) {
    const session = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // Check if user is authenticated and has admin role
    const isAdmin = session?.role === 'ADMIN';
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

## Admin Dashboard

### Dashboard Layout
```tsx
// app/admin/layout.tsx
export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/admin" className="block p-2 hover:bg-gray-700 rounded">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/schools" className="block p-2 hover:bg-gray-700 rounded">
                Schools
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className="block p-2 hover:bg-gray-700 rounded">
                Users
              </Link>
            </li>
            <li>
              <Link href="/admin/subscriptions" className="block p-2 hover:bg-gray-700 rounded">
                Subscriptions
              </Link>
            </li>
            <li>
              <Link href="/admin/analytics" className="block p-2 hover:bg-gray-700 rounded">
                Analytics
              </Link>
            </li>
            <li>
              <Link href="/admin/scraping" className="block p-2 hover:bg-gray-700 rounded">
                Data Scraping
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">
        {children}
      </main>
    </div>
  );
}
```

## School Management

### School List Page
```tsx
// app/admin/schools/page.tsx
import { getSchools } from '@/lib/schools';

export default async function SchoolsPage() {
  const schools = await getSchools();
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Schools</h1>
        <Link 
          href="/admin/schools/new" 
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Add New School
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schools.map((school) => (
              <tr key={school.id}>
                <td className="px-6 py-4 whitespace-nowrap">{school.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{school.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{school.city}, {school.region}</td>
                <td className="px-6 py-4 whitespace-nowrap">{school.rating || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Link 
                    href={`/admin/schools/${school.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                  <button 
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDelete(school.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Analytics Dashboard

```tsx
// app/admin/analytics/page.tsx
import { getAnalytics } from '@/lib/analytics';

export default async function AnalyticsPage() {
  const analytics = await getAnalytics();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={analytics.totalUsers} />
        <StatCard title="Premium Users" value={analytics.premiumUsers} />
        <StatCard title="Total Schools" value={analytics.totalSchools} />
        <StatCard title="Total Searches" value={analytics.totalSearches} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Popular Schools</h2>
          <PopularSchoolsChart data={analytics.popularSchools} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Search Trends</h2>
          <SearchTrendsChart data={analytics.searchTrends} />
        </div>
      </div>
    </div>
  );
}
```