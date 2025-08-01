import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireAdmin();
    const user = await getUser();

    // Mock security events data - in a real app, this would come from a security logging system
    const securityEvents = [
      {
        id: '1',
        type: 'login_attempt',
        severity: 'info',
        user: 'john.doe@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        details: 'Successful login'
      },
      {
        id: '2',
        type: 'failed_login',
        severity: 'warning',
        user: 'admin@example.com',
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        details: 'Invalid password'
      },
      {
        id: '3',
        type: 'suspicious_activity',
        severity: 'critical',
        user: 'unknown',
        ipAddress: '203.0.113.1',
        userAgent: 'curl/7.68.0',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        details: 'Multiple failed login attempts from same IP'
      },
      {
        id: '4',
        type: 'password_change',
        severity: 'info',
        user: 'jane.smith@example.com',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        details: 'Password changed successfully'
      },
      {
        id: '5',
        type: 'admin_action',
        severity: 'info',
        user: user?.primaryEmail || 'admin@example.com',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        details: 'User role updated'
      }
    ];

    // Mock security statistics
    const stats = {
      totalEvents: 1247,
      criticalEvents: 3,
      failedLogins: 23,
      suspiciousActivities: 5,
      blockedIPs: 12,
      activeUsers: 156
    };

    // Mock system health
    const systemHealth = {
      database: { status: 'healthy', responseTime: 45, uptime: '99.9%' },
      api: { status: 'healthy', responseTime: 120, uptime: '99.8%' },
      authentication: { status: 'healthy', responseTime: 80, uptime: '100%' },
      storage: { status: 'warning', responseTime: 200, uptime: '98.5%' }
    };

    return NextResponse.json({
      events: securityEvents,
      stats,
      systemHealth
    });
  } catch (error) {
    console.error('Error fetching security data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}