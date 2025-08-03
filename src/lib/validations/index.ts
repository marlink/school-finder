import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

// User validation schemas
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: phoneSchema.optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const userProfileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: phoneSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  preferences: z.object({
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    marketingEmails: z.boolean(),
  }).optional(),
});

// School validation schemas
export const schoolSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100),
  region: z.string().optional(),
  city: z.string().optional(),
  schoolType: z.enum(['public', 'private', 'charter', 'all']).default('all'),
  minRating: z.number().min(0).max(5).optional(),
  maxDistance: z.number().min(1).max(100).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

export const schoolReviewSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  content: z.string().min(20, 'Review must be at least 20 characters').max(1000),
  categories: z.object({
    academics: z.number().min(1).max(5),
    facilities: z.number().min(1).max(5),
    teachers: z.number().min(1).max(5),
    extracurricular: z.number().min(1).max(5),
  }),
  anonymous: z.boolean().default(false),
});

// Admin validation schemas
export const adminUserManagementSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  action: z.enum(['activate', 'deactivate', 'delete', 'promote', 'demote']),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
});

export const adminSchoolManagementSchema = z.object({
  schoolId: z.string().uuid('Invalid school ID'),
  updates: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    address: z.string().min(1).max(300).optional(),
    phone: phoneSchema.optional(),
    email: emailSchema.optional(),
    website: z.string().url('Invalid website URL').optional(),
    isActive: z.boolean().optional(),
  }),
});

// Contact form validation
export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  category: z.enum(['general', 'support', 'feedback', 'partnership', 'other']),
});

// Newsletter subscription
export const newsletterSchema = z.object({
  email: emailSchema,
  preferences: z.object({
    weeklyDigest: z.boolean().default(true),
    schoolUpdates: z.boolean().default(true),
    promotions: z.boolean().default(false),
  }).optional(),
});

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().datetime(),
});

export const paginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  total: z.number().min(0),
  totalPages: z.number().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// Export types
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
export type SchoolSearch = z.infer<typeof schoolSearchSchema>;
export type SchoolReview = z.infer<typeof schoolReviewSchema>;
export type AdminUserManagement = z.infer<typeof adminUserManagementSchema>;
export type AdminSchoolManagement = z.infer<typeof adminSchoolManagementSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;
export type Newsletter = z.infer<typeof newsletterSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type Pagination = z.infer<typeof paginationSchema>;