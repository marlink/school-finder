'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { featureFlagService, FeatureFlag } from '@/lib/feature-flags';
import { useUser } from '@/hooks/useUser';
import { Flag, Settings, Users, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';

export default function FeatureFlagsPage() {
  const { user } = useUser();
  const [features, setFeatures] = useState<Record<string, FeatureFlag>>({});
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [editingFeature, setEditingFeature] = useState<FeatureFlag | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadFeatures();
    }
  }, [user]);

  const loadFeatures = () => {
    const allFeatures = featureFlagService.getAllFeatures();
    setFeatures(allFeatures);
    setLoading(false);
  };

  const handleFeatureToggle = async (featureName: string, enabled: boolean) => {
    await featureFlagService.updateFeature(featureName, { enabled });
    loadFeatures();
  };

  const handleRolloutChange = async (featureName: string, percentage: number) => {
    await featureFlagService.updateFeature(featureName, { rollout_percentage: percentage });
    loadFeatures();
  };

  const getFeatureStatus = (feature: FeatureFlag) => {
    if (!feature.enabled) return { status: 'disabled', color: 'destructive' };
    if (feature.rollout_percentage < 100) return { status: 'partial', color: 'secondary' };
    return { status: 'enabled', color: 'default' };
  };

  const getEnvironmentBadgeColor = (env: string) => {
    switch (env) {
      case 'production': return 'destructive';
      case 'staging': return 'secondary';
      case 'development': return 'default';
      default: return 'outline';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Flag className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold">Feature Flags Management</h1>
          <p className="text-gray-600">Control feature rollouts and access</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Feature Details</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(features).map(([featureName, feature]) => {
              const { status, color } = getFeatureStatus(feature);
              
              return (
                <Card key={featureName} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{featureName}</CardTitle>
                      <Badge variant={color as any}>
                        {status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`toggle-${featureName}`}>Enabled</Label>
                      <Switch
                        id={`toggle-${featureName}`}
                        checked={feature.enabled}
                        onCheckedChange={(checked) => handleFeatureToggle(featureName, checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Rollout: {feature.rollout_percentage}%</Label>
                      </div>
                      <Slider
                        value={[feature.rollout_percentage]}
                        onValueChange={([value]) => handleRolloutChange(featureName, value)}
                        max={100}
                        step={5}
                        className="w-full"
                        disabled={!feature.enabled}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Environments</Label>
                      <div className="flex flex-wrap gap-1">
                        {feature.environments.map((env) => (
                          <Badge
                            key={env}
                            variant={getEnvironmentBadgeColor(env) as any}
                            className="text-xs"
                          >
                            {env}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Allowed Roles</Label>
                      <div className="flex flex-wrap gap-1">
                        {feature.allowed_roles.map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFeature(featureName)}
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedFeature || ''} onValueChange={setSelectedFeature}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a feature to configure" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(features).map((featureName) => (
                      <SelectItem key={featureName} value={featureName}>
                        {featureName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedFeature && features[selectedFeature] && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold">{selectedFeature}</h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={features[selectedFeature].description}
                          readOnly
                          className="min-h-[80px]"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Rollout Percentage</Label>
                          <div className="flex items-center space-x-2">
                            <Slider
                              value={[features[selectedFeature].rollout_percentage]}
                              onValueChange={([value]) => handleRolloutChange(selectedFeature, value)}
                              max={100}
                              step={1}
                              className="flex-1"
                            />
                            <span className="w-12 text-sm">
                              {features[selectedFeature].rollout_percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={features[selectedFeature].enabled}
                            onCheckedChange={(checked) => handleFeatureToggle(selectedFeature, checked)}
                          />
                          <Label>Feature Enabled</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Features</CardTitle>
                <Flag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(features).length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enabled Features</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(features).filter(f => f.enabled).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Partial Rollouts</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(features).filter(f => f.enabled && f.rollout_percentage < 100).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feature Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(features).map(([featureName, feature]) => {
                  const { status, color } = getFeatureStatus(feature);
                  
                  return (
                    <div key={featureName} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={color as any}>{status}</Badge>
                        <div>
                          <p className="font-medium">{featureName}</p>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{feature.rollout_percentage}%</p>
                        <p className="text-xs text-gray-500">
                          {feature.allowed_roles.join(', ')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}