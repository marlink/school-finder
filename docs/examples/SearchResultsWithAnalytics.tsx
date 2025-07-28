'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAnalytics } from '../../src/hooks/useAnalytics';

type SchoolResult = {
  id: string;
  name: string;
  type: string;
  city: string;
  // Add other properties as needed
};

/**
 * Example component showing how to use the analytics hook
 * in a search results page
 */
export default function SearchResults() {
  // Initialize analytics hook
  const analytics = useAnalytics();
  
  // State for search term and results
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SchoolResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Perform search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    
    try {
      // Make API call to search for schools
      const response = await fetch(`/api/schools/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      setResults(data);
      
      // Track the search with the number of results
      analytics.trackSearch(searchTerm, data.length);
    } catch (error) {
      console.error('Error searching schools:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };
  
  // Track when a user clicks on a school result
  const handleSchoolClick = (schoolId: string) => {
    analytics.trackSearchClick(schoolId);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Find Schools in Poland</h1>
      
      {/* Search form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search by school name, city, or type..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {/* Search results */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((school) => (
            <Link 
              href={`/schools/${school.id}`} 
              key={school.id}
              onClick={() => handleSchoolClick(school.id)}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{school.name}</h2>
              <p className="text-gray-600 mb-1">{school.type}</p>
              <p className="text-gray-600">{school.city}</p>
            </Link>
          ))}
        </div>
      ) : searchTerm && !loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No schools found matching "{searchTerm}"</p>
        </div>
      ) : null}
    </div>
  );
}