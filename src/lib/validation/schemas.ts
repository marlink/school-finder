import { z } from 'zod';

/**
 * Comprehensive validation schemas for API security
 * Prevents injection attacks and ensures data integrity
 */

// Common validation patterns
const sanitizedString = z.string()
  .trim()
  .min(1)
  .max(1000)
  .refine((val) => {
    // Enhanced XSS protection patterns
    const xssPatterns = [
      /<script[\s\S]*?>/i,
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<iframe[\s\S]*?>/i,
      /<img[\s\S]*?onerror[\s\S]*?>/i,
      /<svg[\s\S]*?onload[\s\S]*?>/i,
      /on\w+\s*=/i,
      /<object[\s\S]*?>/i,
      /<embed[\s\S]*?>/i,
      /<link[\s\S]*?>/i,
      /<meta[\s\S]*?>/i,
      /expression\s*\(/i,
      /url\s*\(/i,
      /@import/i,
      /['"];?\s*alert\s*\(/i,  // Catches ';alert('XSS');// and similar patterns
      /['"];?\s*eval\s*\(/i,   // Catches eval injection attempts
      /['"];?\s*document\./i,  // Catches document manipulation attempts
      /['"];?\s*window\./i     // Catches window object manipulation
    ];
    return !xssPatterns.some(pattern => pattern.test(val));
  }, {
    message: "Invalid characters detected"
  });

const safeHtml = z.string()
  .trim()
  .max(5000)
  .refine((val) => {
    // Enhanced XSS protection for HTML content
    const xssPatterns = [
      /<script[\s\S]*?>/i,
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<iframe[\s\S]*?>/i,
      /<img[\s\S]*?onerror[\s\S]*?>/i,
      /<svg[\s\S]*?onload[\s\S]*?>/i,
      /on\w+\s*=/i,
      /<object[\s\S]*?>/i,
      /<embed[\s\S]*?>/i,
      /<link[\s\S]*?>/i,
      /<meta[\s\S]*?>/i,
      /expression\s*\(/i,
      /url\s*\(/i,
      /@import/i,
      /<form[\s\S]*?>/i,
      /<input[\s\S]*?>/i,
      /<textarea[\s\S]*?>/i,
      /<button[\s\S]*?>/i,
      /['"];?\s*alert\s*\(/i,  // Catches ';alert('XSS');// and similar patterns
      /['"];?\s*eval\s*\(/i,   // Catches eval injection attempts
      /['"];?\s*document\./i,  // Catches document manipulation attempts
      /['"];?\s*window\./i     // Catches window object manipulation
    ];
    return !xssPatterns.some(pattern => pattern.test(val));
  }, {
    message: "Potentially unsafe HTML detected"
  });

const uuid = z.string().uuid();
const email = z.string().email().max(255);
const url = z.string().url().max(500);

// Search validation schemas
export const searchQuerySchema = z.object({
  query: sanitizedString.max(200),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().min(1).max(100).optional(),
  filters: z.object({
    type: z.array(sanitizedString.max(50)).optional(),
    voivodeship: z.array(sanitizedString.max(50)).optional(),
    city: z.array(sanitizedString.max(100)).optional(),
  }).optional(),
  page: z.number().min(1).max(100).default(1),
  limit: z.number().min(1).max(50).default(20),
});

export const mcpSearchSchema = z.object({
  query: sanitizedString.max(500),
  context: z.object({
    location: z.string().max(100).optional(),
    preferences: z.array(sanitizedString.max(50)).optional(),
    intent: z.enum(['search', 'compare', 'recommend']).optional(),
  }).optional(),
  options: z.object({
    includeAnalytics: z.boolean().default(false),
    maxResults: z.number().min(1).max(100).default(20),
  }).optional(),
});

// Rating validation schemas
export const ratingSchema = z.object({
  schoolId: uuid,
  overallRating: z.number().min(1).max(5),
  teachingQuality: z.number().min(1).max(5).optional(),
  facilities: z.number().min(1).max(5).optional(),
  safety: z.number().min(1).max(5).optional(),
  extracurricular: z.number().min(1).max(5).optional(),
  comment: safeHtml.max(1000).optional(),
  anonymous: z.boolean().default(false),
});

// User data validation schemas
export const userProfileSchema = z.object({
  name: sanitizedString.max(100).optional(),
  email: email.optional(),
  preferences: z.object({
    notifications: z.boolean().default(true),
    newsletter: z.boolean().default(false),
    dataSharing: z.boolean().default(false),
  }).optional(),
});

export const searchHistorySchema = z.object({
  query: sanitizedString.max(200),
  filters: z.record(z.string(), z.any()).optional(),
  resultsCount: z.number().min(0).max(10000),
  timestamp: z.date().default(() => new Date()),
});

// Analytics validation schemas
export const schoolAnalyticsSchema = z.object({
  schoolId: uuid,
  action: z.enum(['view', 'favorite', 'unfavorite', 'rate', 'compare']),
  metadata: z.object({
    timeOnPage: z.number().min(0).max(3600).optional(), // max 1 hour
    referrer: url.optional(),
    userAgent: sanitizedString.max(500).optional(),
  }).optional(),
});

export const searchAnalyticsSchema = z.object({
  searchTerm: sanitizedString.max(200),
  resultsCount: z.number().min(0).max(10000),
  filters: z.record(z.string(), z.any()).optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }).optional(),
});

// Admin validation schemas
export const adminUserSchema = z.object({
  userId: uuid,
  action: z.enum(['promote', 'demote', 'suspend', 'activate', 'delete']),
  reason: sanitizedString.max(500).optional(),
});

export const adminSettingsSchema = z.object({
  key: z.enum([
    'maintenance_mode',
    'registration_enabled',
    'search_rate_limit',
    'max_favorites',
    'cache_duration'
  ]),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

// File upload validation schemas
export const fileUploadSchema = z.object({
  filename: sanitizedString.max(255)
    .refine((val) => /^[a-zA-Z0-9._-]+$/.test(val), {
      message: "Filename contains invalid characters"
    }),
  mimetype: z.enum([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/csv'
  ]),
  size: z.number().min(1).max(10 * 1024 * 1024), // 10MB max
});

// Security validation schemas
export const ipAddressSchema = z.string()
  .refine((val) => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(val) || ipv6Regex.test(val);
  }, {
    message: "Invalid IP address format"
  });

export const userAgentSchema = z.string()
  .max(500)
  .refine((val) => !/<script|javascript:|data:/i.test(val), {
    message: "Invalid user agent"
  });

// API key validation
export const apiKeySchema = z.string()
  .regex(/^sk_(test|live)_[a-zA-Z0-9]{32,}$/, {
    message: "Invalid API key format"
  });

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().min(1).max(1000).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'rating', 'created_at', 'updated_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Request validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: string;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// CSRF token validation
export const csrfTokenSchema = z.string()
  .length(32)
  .regex(/^[a-zA-Z0-9]+$/, {
    message: "Invalid CSRF token format"
  });

// Rate limiting schemas
export const rateLimitSchema = z.object({
  windowMs: z.number().min(1000).max(3600000), // 1 second to 1 hour
  maxRequests: z.number().min(1).max(10000),
  skipSuccessfulRequests: z.boolean().default(false),
  skipFailedRequests: z.boolean().default(false),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type MCPSearch = z.infer<typeof mcpSearchSchema>;
export type Rating = z.infer<typeof ratingSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type SearchHistory = z.infer<typeof searchHistorySchema>;
export type SchoolAnalytics = z.infer<typeof schoolAnalyticsSchema>;
export type SearchAnalytics = z.infer<typeof searchAnalyticsSchema>;
export type AdminUser = z.infer<typeof adminUserSchema>;
export type AdminSettings = z.infer<typeof adminSettingsSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type CSRFToken = z.infer<typeof csrfTokenSchema>;
export type RateLimit = z.infer<typeof rateLimitSchema>;