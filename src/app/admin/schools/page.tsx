'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Edit, MoreVertical, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SchoolEditModal } from '@/components/admin/SchoolEditModal'

export default function SchoolsManagement() {
  const [schools, setSchools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<{region?: string, type?: string}>({})  
  const [editingSchool, setEditingSchool] = useState<any | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchSchools = async () => {
    setLoading(true)
    try {
      const searchFilters = searchTerm ? { search: searchTerm } : {}
      const data = await adminApi.getAllSchools(page, 10, { ...filters, ...searchFilters })
      setSchools(data.schools)
      setTotalPages(data.totalPages)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchools()
  }, [page, filters])

  const handleSearch = () => {
    setPage(1) // Reset to first page when searching
    fetchSchools()
  }

  const handleEdit = (school: any) => {
    setEditingSchool(school)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this school?')) return
    
    try {
      await adminApi.deleteSchool(id)
      fetchSchools() // Refresh the list
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSaveEdit = async (updatedSchool: any) => {
    try {
      await adminApi.updateSchool(updatedSchool.id, updatedSchool)
      setIsEditModalOpen(false)
      fetchSchools() // Refresh the list
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Schools Management</h1>
      
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleSearch}>Search</Button>
          
          <div className="flex-1"></div>
          
          <select 
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            value={filters.type || ''}
            onChange={(e) => setFilters({...filters, type: e.target.value || undefined})}
          >
            <option value="">All Types</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="high">High</option>
            <option value="combined">Combined</option>
          </select>
          
          <select 
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            value={filters.region || ''}
            onChange={(e) => setFilters({...filters, region: e.target.value || undefined})}
          >
            <option value="">All Regions</option>
            <option value="Warszawa">Warszawa</option>
            <option value="Kraków">Kraków</option>
            <option value="Łódź">Łódź</option>
            <option value="Wrocław">Wrocław</option>
            <option value="Poznań">Poznań</option>
          </select>
        </div>
        
        {error && (
          <div className="bg-destructive/10 p-4 rounded-md mb-6">
            <p className="text-destructive">Error: {error}</p>
          </div>
        )}
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : schools.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No schools found
                  </TableCell>
                </TableRow>
              ) : (
                schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.type || 'N/A'}</TableCell>
                    <TableCell>{school.region || 'N/A'}</TableCell>
                    <TableCell>{school.address || 'N/A'}</TableCell>
                    <TableCell>{school.rating ? `${school.rating}/5` : 'N/A'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(school)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(school.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = page <= 3 ? i + 1 : page - 2 + i
              if (pageNum <= totalPages) {
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      isActive={pageNum === page}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              }
              return null
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Card>
      
      {isEditModalOpen && editingSchool && (
        <SchoolEditModal
          school={editingSchool}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  )
}