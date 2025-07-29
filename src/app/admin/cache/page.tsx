'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';

interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
  total: number;
  hitRate: number;
  cacheSize: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  uptime: number;
}

export default function CacheManagementPage() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customKey, setCustomKey] = useState('');
  const [schoolIds, setSchoolIds] = useState('');

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/cache?action=stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        throw new Error('Failed to fetch cache stats');
      }
    } catch (error) {
      console.error('Error fetching cache stats:', error);
      setMessage({ type: 'error', text: 'Failed to fetch cache statistics' });
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (action: string, target?: string, id?: string) => {
    setActionLoading(action);
    setMessage(null);

    try {
      const url = new URL('/api/admin/cache', window.location.origin);
      url.searchParams.set('action', action);
      if (target) url.searchParams.set('target', target);
      if (id) url.searchParams.set('id', id);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        await fetchStats(); // Refresh stats
      } else {
        throw new Error(data.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Action failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const warmSchoolCache = async () => {
    if (!schoolIds.trim()) {
      setMessage({ type: 'error', text: 'Please enter school IDs' });
      return;
    }

    setActionLoading('warm-schools');
    setMessage(null);

    try {
      const url = new URL('/api/admin/cache', window.location.origin);
      url.searchParams.set('action', 'warm');
      url.searchParams.set('target', 'schools');
      url.searchParams.set('schoolIds', schoolIds);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setSchoolIds('');
      } else {
        throw new Error(data.error || 'Cache warming failed');
      }
    } catch (error) {
      console.error('Error warming cache:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Cache warming failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const invalidateCustomKey = async () => {
    if (!customKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter a cache key' });
      return;
    }

    setActionLoading('invalidate-custom');
    setMessage(null);

    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_invalidate',
          data: { keys: [customKey] }
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setCustomKey('');
        await fetchStats();
      } else {
        throw new Error(data.error || 'Invalidation failed');
      }
    } catch (error) {
      console.error('Error invalidating cache:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Invalidation failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading cache statistics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cache Management</h1>
          <p className="text-muted-foreground">Monitor and manage application cache</p>
        </div>
        <Button 
          onClick={fetchStats} 
          disabled={actionLoading === 'refresh'}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${actionLoading === 'refresh' ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500' : 'border-green-500'}>
          {message.type === 'error' ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {stats && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.hitRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.hits} hits / {stats.total} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cacheSize}</div>
                <p className="text-xs text-muted-foreground">entries stored</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatBytes(stats.memoryUsage.heapUsed)}</div>
                <p className="text-xs text-muted-foreground">
                  of {formatBytes(stats.memoryUsage.heapTotal)} heap
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatUptime(stats.uptime)}</div>
                <p className="text-xs text-muted-foreground">server running</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Cache Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Cache Hits</Label>
                  <div className="text-lg font-semibold text-green-600">{stats.hits}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Cache Misses</Label>
                  <div className="text-lg font-semibold text-yellow-600">{stats.misses}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Cache Errors</Label>
                  <div className="text-lg font-semibold text-red-600">{stats.errors}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Requests</Label>
                  <div className="text-lg font-semibold">{stats.total}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cache Management Actions */}
          <Tabs defaultValue="invalidate" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="invalidate">Invalidate Cache</TabsTrigger>
              <TabsTrigger value="warm">Warm Cache</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="invalidate" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cache Invalidation</CardTitle>
                  <CardDescription>Remove cached data to force fresh data retrieval</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      onClick={() => performAction('invalidate', 'search')}
                      disabled={actionLoading === 'invalidate'}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Search Results</span>
                    </Button>

                    <Button
                      onClick={() => performAction('invalidate', 'schools')}
                      disabled={actionLoading === 'invalidate'}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>All Schools</span>
                    </Button>

                    <Button
                      onClick={() => performAction('invalidate', 'analytics')}
                      disabled={actionLoading === 'invalidate'}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Analytics</span>
                    </Button>

                    <Button
                      onClick={() => performAction('invalidate', 'all')}
                      disabled={actionLoading === 'invalidate'}
                      variant="destructive"
                      className="flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>All Cache</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customKey">Custom Cache Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="customKey"
                        value={customKey}
                        onChange={(e) => setCustomKey(e.target.value)}
                        placeholder="Enter cache key to invalidate"
                      />
                      <Button
                        onClick={invalidateCustomKey}
                        disabled={actionLoading === 'invalidate-custom'}
                      >
                        Invalidate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="warm" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cache Warming</CardTitle>
                  <CardDescription>Pre-populate cache with frequently accessed data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => performAction('warm', 'search')}
                      disabled={actionLoading === 'warm'}
                      className="flex items-center space-x-2"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Common Searches</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolIds">School IDs (comma-separated)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="schoolIds"
                        value={schoolIds}
                        onChange={(e) => setSchoolIds(e.target.value)}
                        placeholder="e.g., school1,school2,school3"
                      />
                      <Button
                        onClick={warmSchoolCache}
                        disabled={actionLoading === 'warm-schools'}
                      >
                        Warm Schools
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cache Maintenance</CardTitle>
                  <CardDescription>Perform maintenance operations on the cache</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => performAction('cleanup')}
                      disabled={actionLoading === 'cleanup'}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Cleanup Expired</span>
                    </Button>

                    <Button
                      onClick={async () => {
                        setActionLoading('reset-stats');
                        try {
                          const response = await fetch('/api/admin/cache', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'reset_stats', data: {} })
                          });
                          const data = await response.json();
                          if (response.ok) {
                            setMessage({ type: 'success', text: data.message });
                            await fetchStats();
                          } else {
                            throw new Error(data.error);
                          }
                        } catch (error) {
                          setMessage({ type: 'error', text: 'Failed to reset statistics' });
                        } finally {
                          setActionLoading(null);
                        }
                      }}
                      disabled={actionLoading === 'reset-stats'}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Reset Statistics</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}