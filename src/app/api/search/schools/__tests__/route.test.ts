import { NextRequest } from 'next/server';
import { GET } from '../route';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    school: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    userSearches: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock Stack Auth
jest.mock('@/stack', () => ({
  stackServerApp: {
    getUser: jest.fn(),
  },
}));

import { prisma } from '@/lib/prisma';
import { stackServerApp } from '@/stack';

jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      json: jest.fn((body, init) => ({
        json: () => Promise.resolve(body),
        status: init?.status || 200,
        headers: {
          set: jest.fn(),
          get: jest.fn(),
          has: jest.fn(),
          delete: jest.fn(),
          forEach: jest.fn(),
          entries: jest.fn(),
          keys: jest.fn(),
          values: jest.fn(),
        },
        clone: jest.fn(() => ({
          json: () => Promise.resolve(body),
        })),
      })),
    },
  };
});

describe('GET /api/search/schools', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock no user (no authentication required for search)
    (stackServerApp.getUser as jest.Mock).mockResolvedValue(null);
  });

  it('should return empty array when no schools match', async () => {
    // Mock empty results
    (prisma.school.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.school.count as jest.Mock).mockResolvedValue(0);

    const request = new NextRequest('http://localhost:3000/api/search/schools?q=nonexistent');
    const res = await GET(request);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.schools).toEqual([]);
    expect(data.pagination.totalCount).toBe(0);
  });

  it('should return schools matching the query', async () => {
    const mockSchools = [
      {
        id: '1',
        name: 'Test Public School',
        type: 'public',
        address: { city: 'Test City' },
        contact: { phone: '123-456-7890' },
        userRatings: [],
        googleRatings: [],
        favorites: [],
        images: []
      }
    ];

    // Mock successful results
    (prisma.school.findMany as jest.Mock).mockResolvedValue(mockSchools);
    (prisma.school.count as jest.Mock).mockResolvedValue(1);

    const request = new NextRequest('http://localhost:3000/api/search/schools?q=Test');
    const res = await GET(request);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.schools.length).toBeGreaterThanOrEqual(1);
    expect(data.schools[0].name).toContain('Test');
  });

  it('should filter schools by type', async () => {
    const mockPublicSchools = [
      {
        id: '1',
        name: 'Public School',
        type: 'public',
        address: { city: 'Test City' },
        contact: { phone: '123-456-7890' },
        userRatings: [],
        googleRatings: [],
        favorites: [],
        images: []
      }
    ];

    // Mock filtered results
    (prisma.school.findMany as jest.Mock).mockResolvedValue(mockPublicSchools);
    (prisma.school.count as jest.Mock).mockResolvedValue(1);

    const request = new NextRequest('http://localhost:3000/api/search/schools?q=school&type=public');
    const res = await GET(request);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.schools.length).toBeGreaterThanOrEqual(1);
    // All returned schools should be public
    data.schools.forEach((school: { type: string }) => {
      expect(school.type).toBe('public');
    });
  });

  it('should paginate the results', async () => {
    const mockSchools = [
      {
        id: '6',
        name: 'School 6',
        type: 'public',
        address: { city: 'Test City' },
        contact: { phone: '123-456-7890' },
        userRatings: [],
        googleRatings: [],
        favorites: [],
        images: []
      }
    ];

    // Mock paginated results
    (prisma.school.findMany as jest.Mock).mockResolvedValue(mockSchools);
    (prisma.school.count as jest.Mock).mockResolvedValue(10); // Total of 10 schools

    const request = new NextRequest('http://localhost:3000/api/search/schools?q=school&page=2&limit=5');
    const res = await GET(request);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.schools.length).toBeLessThanOrEqual(5);
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(5);
    expect(data.pagination.totalCount).toBe(10);
  });
});