'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  MapPin,
  Star,
  Users,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type School = {
  id: string;
  name: string;
  type: string;
  region: string;
  city: string;
  address: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  rating: number;
  reviewCount: number;
  favoriteCount: number;
  viewCount: number;
  isActive: boolean;
  source: 'admin' | 'scraping' | 'user_upload';
  createdAt: string;
  updatedAt: string;
};

type SchoolStats = {
  totalSchools: number;
  activeSchools: number;
  newSchoolsThisWeek: number;
  avgRating: number;
};

export default function SchoolManagement() {
  const { data: session } = useSession();
  const [schools, setSchools] = useState<School[]>([]);
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showSchoolDetails, setShowSchoolDetails] = useState(false);
  const [showAddSchool, setShowAddSchool] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch schools
        const schoolsRes = await fetch('/api/admin/schools');
        if (schoolsRes.ok) {
          const schoolsData = await schoolsRes.json();
          setSchools(schoolsData.schools);
          setStats(schoolsData.stats);
        }
      } catch (error) {
        console.error('Error fetching schools:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'admin') {
      fetchData();
    }
  }, [session]);

  const handleSchoolStatusToggle = async (schoolId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/schools/${schoolId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setSchools(schools.map(school => 
          school.id === schoolId ? { ...school, isActive } : school
        ));
      }
    } catch (error) {
      console.error('Error updating school status:', error);
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    if (!confirm('Are you sure you want to delete this school?')) return;

    try {
      const response = await fetch(`/api/admin/schools/${schoolId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSchools(schools.filter(school => school.id !== schoolId));
      }
    } catch (error) {
      console.error('Error deleting school:', error);
    }
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || school.type === typeFilter;
    const matchesRegion = regionFilter === 'all' || school.region === regionFilter;
    const matchesSource = sourceFilter === 'all' || school.source === sourceFilter;
    
    return matchesSearch && matchesType && matchesRegion && matchesSource;
  });

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'admin':
        return <Badge variant="default">Admin</Badge>;
      case 'scraping':
        return <Badge variant="secondary">Scraped</Badge>;
      case 'user_upload':
        return <Badge variant="outline">User Upload</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="outline" className="text-red-600">Inactive</Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">School Management</h1>
          <p className="text-gray-600 mt-1">Manage schools, data, and content</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm" onClick={() => setShowAddSchool(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add School
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSchools || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSchools || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <Plus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.newSchoolsThisWeek || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgRating?.toFixed(1) || '0.0'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search schools by name or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="university">University</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="mazowieckie">Mazowieckie</SelectItem>
                <SelectItem value="slaskie">Śląskie</SelectItem>
                <SelectItem value="wielkopolskie">Wielkopolskie</SelectItem>
                <SelectItem value="malopolskie">Małopolskie</SelectItem>
                <SelectItem value="dolnoslaskie">Dolnośląskie</SelectItem>
                <SelectItem value="pomorskie">Pomorskie</SelectItem>
                <SelectItem value="lodzkie">Łódzkie</SelectItem>
                <SelectItem value="lubelskie">Lubelskie</SelectItem>
                <SelectItem value="kujawsko-pomorskie">Kujawsko-Pomorskie</SelectItem>
                <SelectItem value="podkarpackie">Podkarpackie</SelectItem>
                <SelectItem value="warminsko-mazurskie">Warmińsko-Mazurskie</SelectItem>
                <SelectItem value="zachodniopomorskie">Zachodniopomorskie</SelectItem>
                <SelectItem value="podlaskie">Podlaskie</SelectItem>
                <SelectItem value="swietokrzyskie">Świętokrzyskie</SelectItem>
                <SelectItem value="lubuskie">Lubuskie</SelectItem>
                <SelectItem value="opolskie">Opolskie</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="scraping">Scraped</SelectItem>
                <SelectItem value="user_upload">User Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle>Schools ({filteredSchools.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{school.name}</div>
                      <div className="text-sm text-gray-500">{school.address}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{school.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      <div>
                        <div className="text-sm">{school.city}</div>
                        <div className="text-xs text-gray-500">{school.region}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      <span className="text-sm">{school.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500 ml-1">({school.reviewCount})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{school.favoriteCount} favorites</div>
                      <div className="text-gray-500">{school.viewCount} views</div>
                    </div>
                  </TableCell>
                  <TableCell>{getSourceBadge(school.source)}</TableCell>
                  <TableCell>{getStatusBadge(school.isActive)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedSchool(school);
                            setShowSchoolDetails(true);
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit School
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleSchoolStatusToggle(school.id, !school.isActive)}
                        >
                          {school.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteSchool(school.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete School
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* School Details Dialog */}
      <Dialog open={showSchoolDetails} onOpenChange={setShowSchoolDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>School Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedSchool?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedSchool && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">School Name</label>
                    <p className="text-sm">{selectedSchool.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-sm">{selectedSchool.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-sm">{selectedSchool.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">City</label>
                    <p className="text-sm">{selectedSchool.city}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Region</label>
                    <p className="text-sm">{selectedSchool.region}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <p className="text-sm">{selectedSchool.website || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm">{selectedSchool.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm">{selectedSchool.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Source</label>
                    <p className="text-sm">{getSourceBadge(selectedSchool.source)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-sm">{getStatusBadge(selectedSchool.isActive)}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedSchool.rating.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedSchool.reviewCount}</div>
                  <div className="text-sm text-gray-500">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedSchool.favoriteCount}</div>
                  <div className="text-sm text-gray-500">Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedSchool.viewCount}</div>
                  <div className="text-sm text-gray-500">Views</div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Edit School</Button>
                <Button 
                  variant={selectedSchool.isActive ? "destructive" : "default"}
                  onClick={() => handleSchoolStatusToggle(selectedSchool.id, !selectedSchool.isActive)}
                >
                  {selectedSchool.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}