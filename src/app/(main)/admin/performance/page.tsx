'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  Database, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Zap
} from 'lucide-react';
import { formatBytes, formatDuration } from '@/lib/performance';

interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  slowestEndpoints: Array<{ endpoint: string; avgTime: number }>;
  requestsPerMinute: number;
}

interface SystemMetrics {
  timestamp: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cacheStats: {
    size: number;
    hitRate: number;
    missRate: number;
  };
  apiMetrics: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
  };
  uptime: number;
}

interface PerformanceAlerts {
  slowResponses: boolean;
  highErrorRate: boolean;
  lowCacheHitRate: boolean;
  alerts: string[];
}

export default function PerformancePage() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlerts | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState('1h');

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, metricsRes, alertsRes] = await Promise.all([
        fetch(`/api/admin/performance/stats?window=${timeWindow}`),
        fetch('/api/admin/performance/system'),
        fetch('/api/admin/performance/alerts'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setSystemMetrics(metricsData);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeWindow]);

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCacheHitColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitor</h1>
          <p className="text-muted-foreground">
            Monitor system performance, cache efficiency, and API response times
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="15m">Last 15 minutes</option>
            <option value="1h">Last hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
          </select>
          <Button onClick={fetchData} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts && alerts.alerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="space-y-1">
              {alerts.alerts.map((alert, index) => (
                <div key={index} className="text-red-800">{alert}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="system">System Metrics</TabsTrigger>
          <TabsTrigger value="cache">Cache Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalRequests.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.requestsPerMinute.toFixed(1) || '0'} req/min
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStatusColor(stats?.averageResponseTime || 0, { good: 500, warning: 1000 })}`}>
                  {stats?.averageResponseTime.toFixed(0) || '0'}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt;500ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getCacheHitColor(stats?.cacheHitRate || 0)}`}>
                  {stats?.cacheHitRate.toFixed(1) || '0'}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &gt;80%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStatusColor(stats?.errorRate || 0, { good: 1, warning: 5 })}`}>
                  {stats?.errorRate.toFixed(1) || '0'}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: &lt;1%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Overview */}
          {systemMetrics && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Memory Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used</span>
                      <span>{formatBytes(systemMetrics.memoryUsage.used)}</span>
                    </div>
                    <Progress value={systemMetrics.memoryUsage.percentage} />
                    <div className="text-xs text-muted-foreground">
                      {systemMetrics.memoryUsage.percentage.toFixed(1)}% of {formatBytes(systemMetrics.memoryUsage.total)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Uptime</span>
                      <Badge variant="outline">
                        {formatDuration(systemMetrics.uptime)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Healthy
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Slowest Endpoints</CardTitle>
              <CardDescription>
                Endpoints with the highest average response times
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.slowestEndpoints.length ? (
                <div className="space-y-3">
                  {stats.slowestEndpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="font-mono text-sm">{endpoint.endpoint}</div>
                      <Badge variant={endpoint.avgTime > 1000 ? 'destructive' : endpoint.avgTime > 500 ? 'secondary' : 'default'}>
                        {endpoint.avgTime.toFixed(0)}ms
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          {systemMetrics && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Memory Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Heap Used</span>
                    <span>{formatBytes(systemMetrics.memoryUsage.used)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heap Total</span>
                    <span>{formatBytes(systemMetrics.memoryUsage.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usage</span>
                    <span>{systemMetrics.memoryUsage.percentage.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Requests</span>
                    <span>{systemMetrics.apiMetrics.totalRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response Time</span>
                    <span>{systemMetrics.apiMetrics.averageResponseTime.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate</span>
                    <span>{systemMetrics.apiMetrics.errorRate.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Performance</CardTitle>
              <CardDescription>
                Monitor cache efficiency and hit rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.cacheHitRate.toFixed(1) || '0'}%
                  </div>
                  <div className="text-sm text-muted-foreground">Hit Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {systemMetrics?.cacheStats.size || '0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Cache Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {((100 - (stats?.cacheHitRate || 0))).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Miss Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}