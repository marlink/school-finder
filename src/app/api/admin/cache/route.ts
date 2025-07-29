import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cache } from '@/lib/cache';
import { CacheInvalidator, CacheWarmer, CacheMonitor } from '@/lib/cache-middleware';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = CacheMonitor.getStats();
        return NextResponse.json({
          ...stats,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime()
        });

      case 'warm':
        const target = searchParams.get('target');
        if (target === 'search') {
          await CacheWarmer.warmSearchCache();
          return NextResponse.json({ message: 'Search cache warming initiated' });
        } else if (target === 'schools') {
          const schoolIds = searchParams.get('schoolIds')?.split(',') || [];
          await CacheWarmer.warmSchoolDetailsCache(schoolIds);
          return NextResponse.json({ message: 'School details cache warming initiated' });
        } else {
          return NextResponse.json({ error: 'Invalid warm target' }, { status: 400 });
        }

      case 'invalidate':
        const invalidateTarget = searchParams.get('target');
        const id = searchParams.get('id');
        
        if (invalidateTarget === 'all') {
          CacheInvalidator.invalidateAll();
          return NextResponse.json({ message: 'All cache invalidated' });
        } else if (invalidateTarget === 'schools') {
          CacheInvalidator.invalidateSchoolData(id || undefined);
          return NextResponse.json({ message: id ? `School ${id} cache invalidated` : 'All school cache invalidated' });
        } else if (invalidateTarget === 'search') {
          CacheInvalidator.invalidateSearchResults();
          return NextResponse.json({ message: 'Search cache invalidated' });
        } else if (invalidateTarget === 'analytics') {
          CacheInvalidator.invalidateAnalytics();
          return NextResponse.json({ message: 'Analytics cache invalidated' });
        } else if (invalidateTarget === 'user' && id) {
          CacheInvalidator.invalidateUserData(id);
          return NextResponse.json({ message: `User ${id} cache invalidated` });
        } else {
          return NextResponse.json({ error: 'Invalid invalidate target' }, { status: 400 });
        }

      case 'cleanup':
        cache.cleanup();
        return NextResponse.json({ message: 'Cache cleanup completed' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Cache management API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'set':
        const { key, value, config } = data;
        if (!key || !value || !config) {
          return NextResponse.json({ error: 'Missing required fields: key, value, config' }, { status: 400 });
        }
        cache.set(key, value, config);
        return NextResponse.json({ message: 'Cache entry set successfully' });

      case 'bulk_invalidate':
        const { keys } = data;
        if (!Array.isArray(keys)) {
          return NextResponse.json({ error: 'Keys must be an array' }, { status: 400 });
        }
        keys.forEach(key => cache.invalidate(key));
        return NextResponse.json({ message: `${keys.length} cache entries invalidated` });

      case 'reset_stats':
        CacheMonitor.reset();
        return NextResponse.json({ message: 'Cache statistics reset' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Cache management API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}