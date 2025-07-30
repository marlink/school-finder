'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Download, 
  Upload, 
  Play, 
  Pause, 
  Settings, 
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  Globe,
  FileText,
  BarChart3,
  Plus
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type ScrapingJob = {
  id: string;
  name: string;
  source: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled' | 'paused';
  progress: number;
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  startedAt: string | null;
  completedAt: string | null;
  nextRunAt: string | null;
  schedule: string | null;
  isActive: boolean;
  lastError: string | null;
};

type ScrapingStats = {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalSchoolsScraped: number;
  successRate: number;
};

type DataSource = {
  id: string;
  name: string;
  url: string;
  type: 'government' | 'educational' | 'directory' | 'api';
  isActive: boolean;
  lastScraped: string | null;
  schoolCount: number;
  successRate: number;
};

export default function DataScrapingSystem() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [stats, setStats] = useState<ScrapingStats | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<ScrapingJob | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch scraping jobs
        const jobsRes = await fetch('/api/admin/scraping/jobs');
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData.jobs);
          setStats(jobsData.stats);
        }

        // Fetch data sources
        const sourcesRes = await fetch('/api/admin/scraping/sources');
        if (sourcesRes.ok) {
          const sourcesData = await sourcesRes.json();
          setDataSources(sourcesData.sources);
        }
      } catch (error) {
        console.error('Error fetching scraping data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'admin') {
      fetchData();
    }
  }, [session]);

  const handleJobAction = async (jobId: string, action: 'start' | 'pause' | 'stop' | 'restart') => {
    try {
      const response = await fetch(`/api/admin/scraping/jobs/${jobId}/${action}`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh jobs data
        const jobsRes = await fetch('/api/admin/scraping/jobs');
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData.jobs);
          setStats(jobsData.stats);
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing job:`, error);
    }
  };

  const handleSourceToggle = async (sourceId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/scraping/sources/${sourceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setDataSources(dataSources.map(source => 
          source.id === sourceId ? { ...source, isActive } : source
        ));
      }
    } catch (error) {
      console.error('Error updating source:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'paused':
        return <Badge variant="outline">Paused</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSourceTypeBadge = (type: string) => {
    switch (type) {
      case 'government':
        return <Badge variant="default">Government</Badge>;
      case 'educational':
        return <Badge variant="secondary">Educational</Badge>;
      case 'directory':
        return <Badge variant="outline">Directory</Badge>;
      case 'api':
        return <Badge variant="default" className="bg-purple-100 text-purple-800">API</Badge>;
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
          <h1 className="text-3xl font-bold text-gray-900">Data Scraping System</h1>
          <p className="text-gray-600 mt-1">Automated school data collection and management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Play className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeJobs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedJobs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.failedJobs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schools Scraped</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSchoolsScraped || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.successRate?.toFixed(1) || '0.0'}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Scraping Jobs</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{job.name}</div>
                          <div className="text-sm text-gray-500">ID: {job.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm">{job.source}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(job.status)}
                          {getStatusBadge(job.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{job.progress}%</span>
                            <span>{job.processedItems}/{job.totalItems}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${job.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-green-600">{job.successfulItems} success</div>
                          <div className="text-red-600">{job.failedItems} failed</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {job.schedule ? (
                            <div>
                              <div>{job.schedule}</div>
                              {job.nextRunAt && (
                                <div className="text-gray-500">
                                  Next: {new Date(job.nextRunAt).toLocaleString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">Manual</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {job.completedAt ? (
                            <div>
                              <div>{new Date(job.completedAt).toLocaleDateString()}</div>
                              <div className="text-gray-500">
                                {new Date(job.completedAt).toLocaleTimeString()}
                              </div>
                            </div>
                          ) : job.startedAt ? (
                            <div>
                              <div>Started</div>
                              <div className="text-gray-500">
                                {new Date(job.startedAt).toLocaleTimeString()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Never</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {job.status === 'running' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleJobAction(job.id, 'pause')}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleJobAction(job.id, 'start')}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleJobAction(job.id, 'restart')}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Schools</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Last Scraped</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataSources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell>
                        <div className="font-medium">{source.name}</div>
                      </TableCell>
                      <TableCell>{getSourceTypeBadge(source.type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm font-mono max-w-xs truncate" title={source.url}>
                            {source.url}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{source.schoolCount}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{source.successRate.toFixed(1)}%</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {source.lastScraped ? (
                            new Date(source.lastScraped).toLocaleDateString()
                          ) : (
                            <span className="text-gray-500">Never</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={source.isActive}
                          onCheckedChange={(checked) => handleSourceToggle(source.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scraping Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="concurrent-jobs">Concurrent Jobs</Label>
                  <Input id="concurrent-jobs" type="number" defaultValue="3" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retry-attempts">Retry Attempts</Label>
                  <Input id="retry-attempts" type="number" defaultValue="3" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="request-delay">Request Delay (ms)</Label>
                  <Input id="request-delay" type="number" defaultValue="1000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input id="timeout" type="number" defaultValue="30" />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="respect-robots" defaultChecked />
                  <Label htmlFor="respect-robots">Respect robots.txt</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="enable-caching" defaultChecked />
                  <Label htmlFor="enable-caching">Enable caching</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Processing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="duplicate-threshold">Duplicate Detection Threshold</Label>
                  <Select defaultValue="0.8">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.6">60% similarity</SelectItem>
                      <SelectItem value="0.7">70% similarity</SelectItem>
                      <SelectItem value="0.8">80% similarity</SelectItem>
                      <SelectItem value="0.9">90% similarity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validation-level">Data Validation Level</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="strict">Strict</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="auto-geocoding" defaultChecked />
                  <Label htmlFor="auto-geocoding">Auto-geocoding</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="auto-categorization" defaultChecked />
                  <Label htmlFor="auto-categorization">Auto-categorization</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="quality-scoring" defaultChecked />
                  <Label htmlFor="quality-scoring">Quality scoring</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="auto-publish" />
                  <Label htmlFor="auto-publish">Auto-publish verified data</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="notify-completion" defaultChecked />
                  <Label htmlFor="notify-completion">Job completion</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="notify-failures" defaultChecked />
                  <Label htmlFor="notify-failures">Job failures</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="notify-duplicates" />
                  <Label htmlFor="notify-duplicates">Duplicate detection</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="notify-quality" />
                  <Label htmlFor="notify-quality">Quality issues</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="notify-schedule" defaultChecked />
                  <Label htmlFor="notify-schedule">Schedule changes</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="notify-sources" defaultChecked />
                  <Label htmlFor="notify-sources">Source updates</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}