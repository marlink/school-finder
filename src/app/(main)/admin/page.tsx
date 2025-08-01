'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BarChart3, 
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Removed Progress import due to missing dependency

type DashboardStats = {
  totalUsers: number;
  totalSchools: number;
  totalSearches: number;
  activeUsers: number;
  newUsersToday: number;
  searchesToday: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: string;
};

type RecentActivity = {
  id: string;
  type: 'user_registration' | 'school_added' | 'search_performed' | 'error';
  description: string;
  timestamp: string;
  user?: string;
};

type ActivityData = {
  recentUsers: Array<{
    id: string;
    email: string;
    createdAt: string;
  }>;
  recentSearches: Array<{
    id: string;
    query: string;
    timestamp: string;
    user: { email: string };
  }>;
  recentRatings: Array<{
    id: string;
    rating: number;
    createdAt: string;
    user: { email: string };
    school: { name: string };
  }>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Demo data for admin panel
      const demoStats: DashboardStats = {
        totalUsers: 1247,
        totalSchools: 156,
        totalSearches: 8934,
        activeUsers: 89,
        newUsersToday: 12,
        searchesToday: 234,
        systemHealth: 'healthy' as const,
        uptime: '99.9%'
      };
      
      const demoActivity: ActivityData = {
        recentUsers: [
          {
            id: '1',
            email: 'john@example.com',
            createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString()
          },
          {
            id: '2',
            email: 'sarah@example.com',
            createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
          }
        ],
        recentSearches: [
          {
            id: '1',
            query: 'engineering schools',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            user: { email: 'user@example.com' }
          },
          {
            id: '2',
            query: 'medical universities',
            timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            user: { email: 'student@example.com' }
          }
        ],
        recentRatings: [
          {
            id: '1',
            rating: 5,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            user: { email: 'parent@example.com' },
            school: { name: 'Tech University' }
          }
        ]
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats(demoStats);
      setActivity(demoActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'school_added':
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case 'search_performed':
        return <BarChart3 className="h-4 w-4 text-purple-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, Admin
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {stats && getHealthBadge(stats.systemHealth)}
          <span className="text-sm text-gray-500">Uptime: {stats?.uptime || 'N/A'}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newUsersToday || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSchools || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all regions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSearches || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.searchesToday || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => window.location.href = '/admin/users'}>
              <Users className="h-6 w-6 mb-2" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => window.location.href = '/admin/schools'}>
              <GraduationCap className="h-6 w-6 mb-2" />
              <span>Add School</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => window.location.href = '/admin/analytics'}>
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!activity ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                <>
                  {activity.recentUsers.slice(0, 2).map((user) => (
                    <div key={user.id} className="flex items-start space-x-3">
                      {getActivityIcon('user_registration')}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">New user registered: {user.email}</p>
                        <p className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {activity.recentSearches.slice(0, 2).map((search) => (
                    <div key={search.id} className="flex items-start space-x-3">
                      {getActivityIcon('search_performed')}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">Search: "{search.query}" by {search.user.email}</p>
                        <p className="text-xs text-gray-500">{new Date(search.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {activity.recentRatings.slice(0, 1).map((rating) => (
                    <div key={rating.id} className="flex items-start space-x-3">
                      {getActivityIcon('school_added')}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{rating.user.email} rated {rating.school.name}: {rating.rating} stars</p>
                        <p className="text-xs text-gray-500">{new Date(rating.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Services</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Search Engine</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Background Jobs</span>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">Processing</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Server Load</span>
                  <span className="text-sm text-gray-600">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}