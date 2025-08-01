import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health Check API Route
 * Verifies system components are working correctly
 */

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: ServiceStatus;
    auth: ServiceStatus;
    environment: ServiceStatus;
  };
  version: string;
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: any;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      auth: await checkAuth(),
      environment: checkEnvironment()
    },
    version: process.env.npm_package_version || '1.0.0'
  };
  
  // Determine overall health
  const serviceStatuses = Object.values(health.services).map(s => s.status);
  if (serviceStatuses.includes('down')) {
    health.status = 'unhealthy';
  } else if (serviceStatuses.includes('degraded')) {
    health.status = 'degraded';
  }
  
  const statusCode = health.status === 'healthy' ? 200 : 
                    health.status === 'degraded' ? 200 : 503;
  
  return NextResponse.json(health, { status: statusCode });
}

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test a more complex query
    const schoolCount = await prisma.school.count();
    
    return {
      status: 'up',
      responseTime: Date.now() - start,
      details: {
        schoolCount,
        connection: 'active'
      }
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

async function checkAuth(): Promise<ServiceStatus> {
  const start = Date.now();
  
  try {
    // Check if Stack Auth environment variables are set
    const requiredVars = [
      'NEXT_PUBLIC_STACK_PROJECT_ID',
      'NEXT_PUBLIC_STACK_PUBLISHABLE_KEY',
      'STACK_SECRET_SERVER_KEY'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return {
        status: 'degraded',
        responseTime: Date.now() - start,
        error: `Missing environment variables: ${missingVars.join(', ')}`,
        details: { missingVars }
      };
    }
    
    return {
      status: 'up',
      responseTime: Date.now() - start,
      details: {
        provider: 'Stack Auth',
        configured: true
      }
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown auth error'
    };
  }
}

function checkEnvironment(): ServiceStatus {
  const start = Date.now();
  
  try {
    const requiredVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];
    
    const optionalVars = [
      'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
      'APIFY_API_TOKEN',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ];
    
    const missingRequired = requiredVars.filter(varName => !process.env[varName]);
    const missingOptional = optionalVars.filter(varName => !process.env[varName]);
    
    if (missingRequired.length > 0) {
      return {
        status: 'down',
        responseTime: Date.now() - start,
        error: `Missing required environment variables: ${missingRequired.join(', ')}`,
        details: {
          missingRequired,
          missingOptional
        }
      };
    }
    
    if (missingOptional.length > 0) {
      return {
        status: 'degraded',
        responseTime: Date.now() - start,
        error: `Missing optional environment variables: ${missingOptional.join(', ')}`,
        details: {
          missingOptional,
          note: 'Some features may not work properly'
        }
      };
    }
    
    return {
      status: 'up',
      responseTime: Date.now() - start,
      details: {
        environment: process.env.NODE_ENV,
        allVariablesConfigured: true
      }
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown environment error'
    };
  }
}