'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { School, SchoolFilter } from '@/types/school'
import { filterSchools } from '@/utils/filterUtils'
import { getRatingColor, getContrastColor } from '@/utils/mapUtils'
import { mockSchools } from '@/data/mockSchools'
import SearchBox from '@/components/maps/SearchBox'
import FilterControls from '@/components/maps/FilterControls'
import PaginationControls from '@/components/pagination/PaginationControls'
import { getAppPath } from '@/lib/routeUtils'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'




// Define view types
type ViewType = 'table' | 'card'

export default function SchoolsPage() {
  const searchParams = useSearchParams()
  
  // State for filters, pagination, and view type
  const [filters, setFilters] = useState<SchoolFilter>({
    region: null,
    minRating: null,
    maxRating: null,
    searchTerm: null
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [viewType, setViewType] = useState<ViewType>('table')
  
  // Read search parameters from URL on initial load
  useEffect(() => {
    const search = searchParams.get('search')
    const region = searchParams.get('region')
    
    if (search || region) {
      setFilters(prev => ({
        ...prev,
        searchTerm: search,
        region: region
      }))
    }
  }, [searchParams])
  
  // Extract unique regions for the filter dropdown
  const regions = useMemo(() => {
    const uniqueRegions = new Set(mockSchools.map(school => school.region))
    return Array.from(uniqueRegions).filter(Boolean).sort()
  }, [])
  
  // Apply filters to schools
  const filteredSchools = useMemo(() => {
    return filterSchools(mockSchools, filters)
  }, [filters])
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage)
  const paginatedSchools = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredSchools.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredSchools, currentPage, itemsPerPage])
  
  // Handle filter changes
  const handleFilterChange = (newFilters: SchoolFilter) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
    // Reset to first page when filters change
    setCurrentPage(1)
  }
  
  // Handle search
  const handleSearch = (searchTerm: string | null) => {
    setFilters(prev => ({
      ...prev,
      searchTerm
    }))
    // Reset to first page when search changes
    setCurrentPage(1)
  }
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of the list
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1) // Reset to first page
  }
  
  // Handle view type change
  const toggleViewType = () => {
    setViewType(prev => prev === 'table' ? 'card' : 'table')
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl md:text-3xl lg:text-4xl font-bold">Schools Directory</h1>
      
      {/* Search Box */}
      <div className="mb-4">
        <SearchBox onSearch={handleSearch} />
      </div>
      
      {/* Filter Controls */}
      <FilterControls 
        regions={regions} 
        onFilterChange={handleFilterChange} 
      />
      
      {/* View Controls */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-xs md:text-sm text-gray-600">
            Showing {paginatedSchools.length} of {filteredSchools.length} schools
            {filters.region ? ` in ${filters.region}` : ''}
            {filters.minRating !== null ? ` with rating ${filters.minRating}+` : ''}
            {filters.maxRating !== null ? ` with rating up to ${filters.maxRating}` : ''}
            {filters.searchTerm ? ` matching "${filters.searchTerm}"` : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="itemsPerPage" className="mr-2 text-xs md:text-sm">Items per page:</label>
            <select 
              id="itemsPerPage" 
              value={itemsPerPage} 
              onChange={handleItemsPerPageChange}
              className="p-1 border rounded text-xs md:text-sm"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <button 
            onClick={toggleViewType}
            className="px-3 py-1 text-xs md:text-sm border rounded hover:bg-gray-100"
          >
            {viewType === 'table' ? 'Card View' : 'Table View'}
          </button>
        </div>
      </div>
      
      {/* Table View */}
      {viewType === 'table' && (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableCaption className="text-xs md:text-sm">List of schools in Poland</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs md:text-sm">Name</TableHead>
                <TableHead className="text-xs md:text-sm">Rating</TableHead>
                <TableHead className="text-xs md:text-sm">Type</TableHead>
                <TableHead className="text-xs md:text-sm">Region</TableHead>
                <TableHead className="text-xs md:text-sm">Address</TableHead>
                <TableHead className="text-right text-xs md:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSchools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell className="font-medium text-xs md:text-sm">{school.name}</TableCell>
                  <TableCell>
                    {school.rating !== undefined ? (
                      <span className="px-2 py-1 rounded text-xs" 
                        style={{
                          backgroundColor: getRatingColor(school.rating),
                          color: getContrastColor(getRatingColor(school.rating))
                        }}>
                        {school.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs md:text-sm">No rating</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs md:text-sm">{school.type || 'N/A'}</TableCell>
                  <TableCell className="text-xs md:text-sm">{school.region || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs md:text-sm">{school.address || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Link 
                      href={getAppPath(`/schools/${school.id}`)}
                      className="text-blue-600 hover:underline text-xs md:text-sm"
                    >
                      View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Card View */}
      {viewType === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedSchools.map((school) => (
            <Card key={school.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base md:text-lg lg:text-xl font-semibold">{school.name}</h3>
                    {school.rating !== undefined ? (
                      <span className="px-2 py-1 rounded text-xs" 
                        style={{
                          backgroundColor: getRatingColor(school.rating),
                          color: getContrastColor(getRatingColor(school.rating))
                        }}>
                        {school.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">No rating</span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 mb-1">{school.type || 'N/A'}</p>
                  <p className="text-xs md:text-sm text-gray-500 mb-2">{school.region || 'N/A'}</p>
                  <p className="text-xs md:text-sm mb-3 line-clamp-2">{school.description || 'No description available.'}</p>
                  <div className="flex justify-end">
                    <Link 
                      href={getAppPath(`/schools/${school.id}`)}
                      className="text-blue-600 hover:underline text-xs md:text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}