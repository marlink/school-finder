import { supabase } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

async function getAuthToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token || ''
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken()
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred while fetching the data.'
    }))
    throw new Error(error.message || 'An error occurred')
  }

  return response.json()
}

export const adminApi = {
  // Dashboard
  getDashboardStats: () => fetchWithAuth('/admin/dashboard'),
  
  // Schools
  getAllSchools: (page = 1, limit = 20, filters = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    })
    return fetchWithAuth(`/admin/schools?${queryParams}`)
  },
  updateSchool: (id: string, data: any) => fetchWithAuth(`/admin/schools/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteSchool: (id: string) => fetchWithAuth(`/admin/schools/${id}`, {
    method: 'DELETE',
  }),
  
  // Scraping
  triggerScraping: (data: { region: string, schoolType: string, fullScrape?: boolean }) => fetchWithAuth('/admin/scraping/trigger', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getScrapingStatus: () => fetchWithAuth('/admin/scraping/status'),
  
  // Data Quality
  getDataQualityReport: () => fetchWithAuth('/admin/data-quality'),
  fixDataQualityIssue: (data: { schoolId: string, fixes: any }) => fetchWithAuth('/admin/data-quality/fix', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
}