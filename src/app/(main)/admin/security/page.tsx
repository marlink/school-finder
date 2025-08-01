'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Lock,
  Unlock,
  UserX,
  Activity,
  Clock,
  Globe,
  Database,
  Server,
  Wifi
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

type SecurityEvent = {
  id: string;
  type: 'login_attempt' | 'failed_login' | 'password_change' | 'role_change' | 'data_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string | null;
  userEmail: string | null;
  ipAddress: string;
  userAgent: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
};

type SecurityStats = {
  totalEvents: number;
  criticalEvents: number;
  failedLogins: number;
  suspiciousActivities: number;
  blockedIPs: number;
  activeUsers: number;
};

type SystemHealth = {
  database: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
  authentication: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  lastChecked: string;
};

export default function SecurityManagement() {
  const { user, isAdmin } = useUser();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch security events
        const eventsRes = await fetch('/api/admin/security/events');
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData.events);
          setStats(eventsData.stats);
        }

        // Fetch system health
        const healthRes = await fetch('/api/admin/security/health');
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setSystemHealth(healthData);
        }
      } catch (error) {
        console.error('Error fetching security data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_attempt':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'failed_login':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'password_change':
        return <Lock className="h-4 w-4 text-green-500" />;
      case 'role_change':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'data_access':
        return <Database className="h-4 w-4 text-blue-500" />;
      case 'suspicious_activity':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
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
          <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor system security and user activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Security Report
          </Button>
          <Button size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            View Alerts
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {stats && stats.criticalEvents > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Security Events Detected</AlertTitle>
          <AlertDescription>
            There are {stats.criticalEvents} critical security events that require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.criticalEvents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.failedLogins || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
            <Eye className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.suspiciousActivities || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.blockedIPs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getEventIcon(event.type)}
                          <span className="text-sm font-medium">
                            {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{event.userEmail || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{event.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm font-mono">{event.ipAddress}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs truncate" title={event.description}>
                          {event.description}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health Status</CardTitle>
                <p className="text-sm text-gray-600">
                  Last checked: {systemHealth?.lastChecked ? new Date(systemHealth.lastChecked).toLocaleString() : 'Never'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-gray-500" />
                    <span>Database</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {systemHealth && getHealthIcon(systemHealth.database)}
                    {systemHealth && getHealthBadge(systemHealth.database)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="h-5 w-5 text-gray-500" />
                    <span>API Services</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {systemHealth && getHealthIcon(systemHealth.api)}
                    {systemHealth && getHealthBadge(systemHealth.api)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-gray-500" />
                    <span>Authentication</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {systemHealth && getHealthIcon(systemHealth.authentication)}
                    {systemHealth && getHealthBadge(systemHealth.authentication)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-5 w-5 text-gray-500" />
                    <span>Storage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {systemHealth && getHealthIcon(systemHealth.storage)}
                    {systemHealth && getHealthBadge(systemHealth.storage)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Two-Factor Authentication</div>
                      <div className="text-xs text-gray-500">Enabled for admin accounts</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Password Policy</div>
                      <div className="text-xs text-gray-500">Consider stronger requirements</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Rate Limiting</div>
                      <div className="text-xs text-gray-500">Needs configuration for API endpoints</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">SSL/TLS</div>
                      <div className="text-xs text-gray-500">Properly configured</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Session Timeout</div>
                    <div className="text-xs text-gray-500">Auto logout after inactivity</div>
                  </div>
                  <Badge variant="outline">24 hours</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Password Requirements</div>
                    <div className="text-xs text-gray-500">Minimum complexity rules</div>
                  </div>
                  <Badge variant="outline">Medium</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Failed Login Attempts</div>
                    <div className="text-xs text-gray-500">Account lockout threshold</div>
                  </div>
                  <Badge variant="outline">5 attempts</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Two-Factor Authentication</div>
                    <div className="text-xs text-gray-500">Required for admin accounts</div>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">IP Whitelist</div>
                    <div className="text-xs text-gray-500">Restrict admin access by IP</div>
                  </div>
                  <Badge variant="outline">Disabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">API Rate Limiting</div>
                    <div className="text-xs text-gray-500">Requests per minute limit</div>
                  </div>
                  <Badge variant="outline">100/min</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">CORS Policy</div>
                    <div className="text-xs text-gray-500">Cross-origin request policy</div>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">Configured</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Audit Logging</div>
                    <div className="text-xs text-gray-500">Track all admin actions</div>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}