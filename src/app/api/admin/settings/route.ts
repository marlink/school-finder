import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import crypto from 'crypto';

// Mock system settings - in a real app, this would be stored in a database
let systemSettings = {
  siteName: 'School Finder Poland',
  siteDescription: 'Find the best schools in Poland for your children',
  contactEmail: 'contact@schoolfinder.pl',
  supportEmail: 'support@schoolfinder.pl',
  maintenanceMode: false,
  registrationEnabled: true,
  emailVerificationRequired: true,
  maxFileUploadSize: 10,
  sessionTimeout: 24,
  passwordMinLength: 8,
  requireStrongPasswords: true,
  enableTwoFactor: false,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  enableAuditLog: true,
  logRetentionDays: 90,
  enableAnalytics: true,
  analyticsProvider: 'google',
  enableNotifications: true,
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false,
  defaultLanguage: 'pl',
  defaultTimezone: 'Europe/Warsaw',
  enableCaching: true,
  cacheTimeout: 60,
  enableCompression: true,
  enableCDN: false,
  cdnUrl: '',
  backupFrequency: 'daily',
  backupRetention: 30,
  enableBackupEncryption: true
};

let apiKey = 'sk_live_' + crypto.randomBytes(32).toString('hex');

export async function GET() {
  try {
    await requireAdmin();

    return NextResponse.json({
      settings: systemSettings,
      apiKey
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const newSettings = await request.json();
    
    // Validate and update settings
    systemSettings = { ...systemSettings, ...newSettings };

    return NextResponse.json({
      success: true,
      settings: systemSettings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}