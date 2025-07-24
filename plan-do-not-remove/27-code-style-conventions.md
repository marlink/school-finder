# Code Style & Conventions

## Overview
This document outlines the coding standards and conventions used in the School Finder Portal project to maintain consistency and readability.

## File Structure

```
/app                  # Next.js App Router
  /api                # API routes
  /admin              # Admin panel pages
  /(site)             # Public site pages
/components           # React components
  /ui                 # Reusable UI components
  /forms              # Form components
  /layout             # Layout components
/contexts             # React context providers
/hooks                # Custom React hooks
/lib                  # Utility functions and services
/prisma               # Prisma schema and migrations
/public               # Static assets
/styles               # Global styles
/types                # TypeScript type definitions
```

## Naming Conventions

### Files and Folders
- Use kebab-case for file names: `school-card.tsx`
- Use PascalCase for component files: `SchoolCard.tsx`
- Use camelCase for utility files: `formatDate.ts`

### Components
- Use PascalCase for component names: `SchoolCard`
- Use camelCase for props: `onClick`, `schoolData`

### Variables and Functions
- Use camelCase for variables and functions: `getUserData`
- Use PascalCase for types and interfaces: `SchoolData`
- Use UPPER_CASE for constants: `MAX_SEARCH_LIMIT`

## Component Structure

```tsx
// components/ui/Button.tsx
'use client';

import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

## TypeScript Best Practices

### Type Definitions

```typescript
// types/school.ts
export interface School {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  phone?: string;
  email?: string;
  website?: string;
  type: SchoolType;
  rating: number;
  reviewCount: number;
  coordinates: Coordinates;
  createdAt: Date;
  updatedAt: Date;
}

export type SchoolType = 'PUBLIC' | 'PRIVATE' | 'CHARTER';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SchoolSearchParams {
  query?: string;
  type?: SchoolType;
  rating?: number;
  city?: string;
  region?: string;
  page?: number;
  limit?: number;
}
```

### Using Types with React

```tsx
// components/SchoolCard.tsx
import { FC } from 'react';
import { School } from '@/types/school';

interface SchoolCardProps {
  school: School;
  onFavorite?: (schoolId: string) => void;
  isFavorite?: boolean;
}

export const SchoolCard: FC<SchoolCardProps> = ({ 
  school, 
  onFavorite, 
  isFavorite = false 
}) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold">{school.name}</h3>
      <p className="text-sm text-gray-500">{school.city}, {school.region}</p>
      {/* More school details */}
      {onFavorite && (
        <button 
          onClick={() => onFavorite(school.id)}
          className="mt-2 text-sm text-blue-500"
        >
          {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        </button>
      )}
    </div>
  );
};
```

## API Route Conventions

```typescript
// app/api/schools/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Input validation schema
const searchParamsSchema = z.object({
  query: z.string().optional(),
  type: z.enum(['PUBLIC', 'PRIVATE', 'CHARTER']).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export async function GET(request) {
  try {
    // Get search parameters
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Validate input
    const validatedParams = searchParamsSchema.parse(params);
    const { query, type, rating, page, limit } = validatedParams;
    
    // Build filter conditions
    const where = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { region: { contains: query, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (rating) where.rating = { gte: rating };
    
    // Execute query with pagination
    const schools = await prisma.school.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { rating: 'desc' },
    });
    
    const total = await prisma.school.count({ where });
    
    return NextResponse.json({
      schools,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    );
  }
}
```

## CSS/Styling Conventions

- Use Tailwind CSS for styling
- Use CSS variables for theme colors and values
- Use class-variance-authority (cva) for component variants

```tsx
// components/ui/card.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  "rounded-lg shadow-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white border border-gray-200",
        elevated: "bg-white shadow-md",
        outlined: "bg-transparent border border-gray-300",
      },
      size: {
        default: "p-4",
        sm: "p-2",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, size, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

## Comments and Documentation

- Use JSDoc comments for functions and components
- Document complex logic with inline comments
- Keep comments up-to-date with code changes

```typescript
/**
 * Formats a school address into a standardized string
 * @param {School} school - The school object containing address information
 * @returns {string} Formatted address string
 */
export function formatSchoolAddress(school: School): string {
  const { address, city, region, postalCode } = school;
  return `${address}, ${city}, ${region} ${postalCode}`;
}
```

## Git Commit Conventions

Follow the Conventional Commits specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Changes that don't affect code meaning (formatting, etc)
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `test:` - Adding or correcting tests
- `chore:` - Changes to build process or auxiliary tools

Example: `feat: add school rating filter component`