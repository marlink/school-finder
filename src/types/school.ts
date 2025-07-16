export interface School {
  id: string
  name: string
  address?: string
  city?: string
  region?: string
  postalCode?: string
  latitude: number
  longitude: number
  rating?: number
  reviewCount?: number
  type?: string
  website?: string
  phone?: string
  email?: string
  description?: string
  imageUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface SchoolFilter {
  region?: string | null
  minRating?: number | null
  maxRating?: number | null
  type?: string | null
  searchTerm?: string | null
}