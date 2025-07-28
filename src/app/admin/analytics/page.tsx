'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Types for analytics data
type SchoolAnalyticsData = {
  schoolId: string;
  schoolName: string;
  date: string;
  favoritesAdded: number;
  ratingsSubmitted: number;
  avgTimeOnPage: number;
  clickThroughRate: number;
};

type SearchAnalyticsData = {
  date: string;
  searchTerm: string;
  searchCount: number;
  avgResults: number;
};

// Client component to display analytics
export default function AnalyticsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [schoolAnalytics, setSchoolAnalytics] = useState<SchoolAnalyticsData[]>([]);
  const [searchAnalytics, setSearchAnalytics] = useState<SearchAnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schools');
  
  // Check if user is authenticated and is an admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);
  
  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch school analytics
        const schoolRes = await fetch('/api/admin/school-analytics');
        if (schoolRes.ok) {
          const schoolData = await schoolRes.json();
          setSchoolAnalytics(schoolData);
        }
        
        // Fetch search analytics
        const searchRes = await fetch('/api/admin/search-analytics');
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          setSearchAnalytics(searchData);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (session?.user?.role === 'admin') {
      fetchData();
    }
  }, [session]);
  
  // If loading or not authenticated, show loading state
  if (loading || status === 'loading' || session?.user?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'schools' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('schools')}
        >
          School Analytics
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'searches' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('searches')}
        >
          Search Analytics
        </button>
      </div>
      
      {/* School Analytics Table */}
      {activeTab === 'schools' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">School Engagement Metrics</h2>
          
          {schoolAnalytics.length === 0 ? (
            <p className="text-gray-500">No school analytics data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Date</th>
                    <th className="py-2 px-4 border-b text-left">School</th>
                    <th className="py-2 px-4 border-b text-right">Favorites</th>
                    <th className="py-2 px-4 border-b text-right">Ratings</th>
                    <th className="py-2 px-4 border-b text-right">Avg. Time (sec)</th>
                    <th className="py-2 px-4 border-b text-right">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolAnalytics.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{item.date}</td>
                      <td className="py-2 px-4 border-b">{item.schoolName}</td>
                      <td className="py-2 px-4 border-b text-right">{item.favoritesAdded}</td>
                      <td className="py-2 px-4 border-b text-right">{item.ratingsSubmitted}</td>
                      <td className="py-2 px-4 border-b text-right">{item.avgTimeOnPage}</td>
                      <td className="py-2 px-4 border-b text-right">{(item.clickThroughRate * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Search Analytics Table */}
      {activeTab === 'searches' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Top Search Terms</h2>
          
          {searchAnalytics.length === 0 ? (
            <p className="text-gray-500">No search analytics data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b text-left">Date</th>
                    <th className="py-2 px-4 border-b text-left">Search Term</th>
                    <th className="py-2 px-4 border-b text-right">Count</th>
                    <th className="py-2 px-4 border-b text-right">Avg. Results</th>
                  </tr>
                </thead>
                <tbody>
                  {searchAnalytics.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{item.date}</td>
                      <td className="py-2 px-4 border-b">{item.searchTerm}</td>
                      <td className="py-2 px-4 border-b text-right">{item.searchCount}</td>
                      <td className="py-2 px-4 border-b text-right">{item.avgResults.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}