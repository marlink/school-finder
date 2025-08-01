'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Bell,
  Mail,
  Database,
  Shield,
  Globe,
  Palette,
  Monitor,
  Smartphone,
  Users,
  Key,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

type SystemSettings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportEmail: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  maxFileUploadSize: number;
  sessionTimeout: number;
  passwordMinLength: number;
  requireStrongPasswords: boolean;
  enableTwoFactor: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  enableAuditLog: boolean;
  logRetentionDays: number;
  enableAnalytics: boolean;
  analyticsProvider: string;
  enableNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  defaultLanguage: string;
  defaultTimezone: string;
  enableCaching: boolean;
  cacheTimeout: number;
  enableCompression: boolean;
  enableCDN: boolean;
  cdnUrl: string;
  backupFrequency: string;
  backupRetention: number;
  enableBackupEncryption: boolean;
};

export default function AdminSettings() {
  const { user, isAuthenticated, isAdmin } = useUser();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
          setApiKey(data.apiKey);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchSettings();
    }
  }, [isAuthenticated, isAdmin]);

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        // Show success message
        if (process.env.NODE_ENV === 'development') {
          console.log('Settings saved successfully');
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const response = await fetch('/api/admin/settings/api-key', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setApiKey(data.apiKey);
      }
    } catch (error) {
      console.error('Error generating API key:', error);
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load system settings.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => alert('Reset functionality coming soon!')}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    value={settings.siteName}
                    onChange={(e) => updateSetting('siteName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea
                    id="site-description"
                    value={settings.siteDescription}
                    onChange={(e) => updateSetting('siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateSetting('contactEmail', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => updateSetting('supportEmail', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Temporarily disable site access</p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="registration-enabled">User Registration</Label>
                    <p className="text-sm text-gray-500">Allow new user registrations</p>
                  </div>
                  <Switch
                    id="registration-enabled"
                    checked={settings.registrationEnabled}
                    onCheckedChange={(checked) => updateSetting('registrationEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-verification">Email Verification</Label>
                    <p className="text-sm text-gray-500">Require email verification for new accounts</p>
                  </div>
                  <Switch
                    id="email-verification"
                    checked={settings.emailVerificationRequired}
                    onCheckedChange={(checked) => updateSetting('emailVerificationRequired', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-language">Default Language</Label>
                  <Select 
                    value={settings.defaultLanguage} 
                    onValueChange={(value) => updateSetting('defaultLanguage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eng">English (UK)</SelectItem>
                      <SelectItem value="pl">Polish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-timezone">Default Timezone</Label>
                  <Select 
                    value={settings.defaultTimezone} 
                    onValueChange={(value) => updateSetting('defaultTimezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Europe/Warsaw">Europe/Warsaw</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-min-length">Minimum Password Length</Label>
                  <Input
                    id="password-min-length"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="strong-passwords">Require Strong Passwords</Label>
                    <p className="text-sm text-gray-500">Enforce complexity requirements</p>
                  </div>
                  <Switch
                    id="strong-passwords"
                    checked={settings.requireStrongPasswords}
                    onCheckedChange={(checked) => updateSetting('requireStrongPasswords', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Enable 2FA for admin accounts</p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={settings.enableTwoFactor}
                    onCheckedChange={(checked) => updateSetting('enableTwoFactor', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Policies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                  <Input
                    id="max-login-attempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockout-duration"
                    type="number"
                    value={settings.lockoutDuration}
                    onChange={(e) => updateSetting('lockoutDuration', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="audit-log">Enable Audit Logging</Label>
                    <p className="text-sm text-gray-500">Track all admin actions</p>
                  </div>
                  <Switch
                    id="audit-log"
                    checked={settings.enableAuditLog}
                    onCheckedChange={(checked) => updateSetting('enableAuditLog', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="log-retention">Log Retention (days)</Label>
                  <Input
                    id="log-retention"
                    type="number"
                    value={settings.logRetentionDays}
                    onChange={(e) => updateSetting('logRetentionDays', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-notifications">Enable Notifications</Label>
                  <p className="text-sm text-gray-500">Master switch for all notifications</p>
                </div>
                <Switch
                  id="enable-notifications"
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="email-notifications">Email</Label>
                      <p className="text-xs text-gray-500">Email notifications</p>
                    </div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    disabled={!settings.enableNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="push-notifications">Push</Label>
                      <p className="text-xs text-gray-500">Browser push notifications</p>
                    </div>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                    disabled={!settings.enableNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="sms-notifications">SMS</Label>
                      <p className="text-xs text-gray-500">Text message notifications</p>
                    </div>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                    disabled={!settings.enableNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Caching Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-caching">Enable Caching</Label>
                    <p className="text-sm text-gray-500">Improve performance with caching</p>
                  </div>
                  <Switch
                    id="enable-caching"
                    checked={settings.enableCaching}
                    onCheckedChange={(checked) => updateSetting('enableCaching', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cache-timeout">Cache Timeout (minutes)</Label>
                  <Input
                    id="cache-timeout"
                    type="number"
                    value={settings.cacheTimeout}
                    onChange={(e) => updateSetting('cacheTimeout', parseInt(e.target.value))}
                    disabled={!settings.enableCaching}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-compression">Enable Compression</Label>
                    <p className="text-sm text-gray-500">Compress responses for faster loading</p>
                  </div>
                  <Switch
                    id="enable-compression"
                    checked={settings.enableCompression}
                    onCheckedChange={(checked) => updateSetting('enableCompression', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CDN Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-cdn">Enable CDN</Label>
                    <p className="text-sm text-gray-500">Use Content Delivery Network</p>
                  </div>
                  <Switch
                    id="enable-cdn"
                    checked={settings.enableCDN}
                    onCheckedChange={(checked) => updateSetting('enableCDN', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cdn-url">CDN URL</Label>
                  <Input
                    id="cdn-url"
                    value={settings.cdnUrl}
                    onChange={(e) => updateSetting('cdnUrl', e.target.value)}
                    disabled={!settings.enableCDN}
                    placeholder="https://cdn.example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-upload-size">Max File Upload Size (MB)</Label>
                  <Input
                    id="max-upload-size"
                    type="number"
                    value={settings.maxFileUploadSize}
                    onChange={(e) => updateSetting('maxFileUploadSize', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <Select 
                      value={settings.backupFrequency} 
                      onValueChange={(value) => updateSetting('backupFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="manual">Manual Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backup-retention">Backup Retention (days)</Label>
                    <Input
                      id="backup-retention"
                      type="number"
                      value={settings.backupRetention}
                      onChange={(e) => updateSetting('backupRetention', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backup-encryption">Enable Backup Encryption</Label>
                      <p className="text-sm text-gray-500">Encrypt backup files</p>
                    </div>
                    <Switch
                      id="backup-encryption"
                      checked={settings.enableBackupEncryption}
                      onCheckedChange={(checked) => updateSetting('enableBackupEncryption', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Database className="h-4 w-4 mr-2" />
                      Create Backup Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      readOnly
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button variant="outline" onClick={handleGenerateApiKey}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Use this key to authenticate API requests
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-analytics">Enable Analytics</Label>
                  <p className="text-sm text-gray-500">Track API usage and performance</p>
                </div>
                <Switch
                  id="enable-analytics"
                  checked={settings.enableAnalytics}
                  onCheckedChange={(checked) => updateSetting('enableAnalytics', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="analytics-provider">Analytics Provider</Label>
                <Select 
                  value={settings.analyticsProvider} 
                  onValueChange={(value) => updateSetting('analyticsProvider', value)}
                  disabled={!settings.enableAnalytics}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Analytics</SelectItem>
                    <SelectItem value="mixpanel">Mixpanel</SelectItem>
                    <SelectItem value="amplitude">Amplitude</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}