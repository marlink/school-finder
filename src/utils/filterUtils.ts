import { School, SchoolFilter } from '@/types/school'

/**
 * Filters schools based on provided filter criteria
 * @param schools Array of schools to filter
 * @param filters Filter criteria
 * @returns Filtered array of schools
 */
export function filterSchools(schools: School[], filters: SchoolFilter): School[] {
  return schools.filter(school => {
    // Filter by region if selected
    if (filters.region && school.region !== filters.region) {
      return false
    }
    
    // Filter by minimum rating if selected
    if (filters.minRating !== null && filters.minRating !== undefined && 
        (school.rating === undefined || school.rating < filters.minRating)) {
      return false
    }
    
    // Filter by maximum rating if selected
    if (filters.maxRating !== null && filters.maxRating !== undefined && 
        (school.rating !== undefined && school.rating > filters.maxRating)) {
      return false
    }
    
    // Filter by school type if selected
    if (filters.type && school.type !== filters.type) {
      return false
    }
    
    // Filter by search term if provided
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const nameMatch = school.name?.toLowerCase().includes(searchLower)
      const addressMatch = school.address?.toLowerCase().includes(searchLower)
      const cityMatch = school.city?.toLowerCase().includes(searchLower)
      const regionMatch = school.region?.toLowerCase().includes(searchLower)
      const typeMatch = school.type?.toLowerCase().includes(searchLower)
      
      if (!(nameMatch || addressMatch || cityMatch || regionMatch || typeMatch)) {
        return false
      }
    }
    
    return true
  })
}