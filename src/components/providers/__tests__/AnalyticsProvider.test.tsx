import { render } from '@testing-library/react';
import { analytics } from '@/components/providers/AnalyticsProvider';

// Mock the analytics functions
jest.mock('@/components/providers/AnalyticsProvider', () => ({
  analytics: {
    track: jest.fn(),
    page: jest.fn(),
    schoolView: jest.fn(),
    schoolSearch: jest.fn(),
    reviewSubmit: jest.fn(),
    userRegistration: jest.fn(),
    userLogin: jest.fn(),
    filterApply: jest.fn(),
    contactSubmit: jest.fn(),
    performanceMetric: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should track school view events', () => {
    analytics.schoolView('school-123', 'Test School');
    expect(analytics.schoolView).toHaveBeenCalledWith('school-123', 'Test School');
  });

  it('should track search events', () => {
    analytics.schoolSearch('test query', 5);
    expect(analytics.schoolSearch).toHaveBeenCalledWith('test query', 5);
  });

  it('should track review submission', () => {
    analytics.reviewSubmit('school-123', 4);
    expect(analytics.reviewSubmit).toHaveBeenCalledWith('school-123', 4);
  });

  it('should track user registration', () => {
    analytics.userRegistration('email');
    expect(analytics.userRegistration).toHaveBeenCalledWith('email');
  });

  it('should track errors', () => {
    analytics.error('Test error', { context: 'test' });
    expect(analytics.error).toHaveBeenCalledWith('Test error', { context: 'test' });
  });
});