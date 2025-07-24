# School Finder Portal - Product Specification Document

## Project Overview
A web platform that allows users to search for schools in Poland, view essential information including Google ratings, location on a map, and contribute their own reviews after signing up.

## Core Features

### School Search
- Location-based search with radius filtering (optimized for Polish cities and regions)
- Quick view of proximity (distance in kilometers)
- Sorting options (distance, rating, name)

### School Information Display
- Google ratings integration with star visualization
- Map thumbnail showing location
- Basic school details (type, grades, contact info)
- Polish education system categorization (przedszkole, szkoła podstawowa, liceum, etc.)

### User Accounts
- Simple registration/login system
- Ability to save favorite schools
- Review submission capability
- RODO (GDPR) compliant data handling

### Data Acquisition (Scraping)
- Ethical scraping from public education directories
- Scheduled updates from official Polish education ministry resources
- Compliance with Polish and EU regulations regarding data collection
- Rate-limited requests to avoid server overload
- Proper user-agent identification and respect for robots.txt

## Tech Stack
- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL with real-time)
- **Maps**: Mapbox (better pricing than Google Maps)
- **Deployment**: Vercel (free tier)
- **Scraping**: Puppeteer with proxy rotation

## Authentication
- **Provider**: Supabase Auth
- **Cost**: Free tier (unlimited users)
- **Features**:
  - Email/password authentication
  - Social login (Google, Facebook, GitHub)
  - Magic link authentication
  - Email verification
  - Password reset
  - Session management
  - RODO/GDPR compliant
- **Integration**: Built into Supabase - no additional setup needed

## Development Plan

### Phase 1: MVP Development
**Description**: Build core functionality with essential features

#### Status Conflict

**HEAD Version**:
- **Milestones**:
  - **Project Foundation**:
    - Tasks:
      - Initialize Next.js 14 project with App Router
      - Setup Tailwind CSS + shadcn/ui components
      - Configure Supabase project and get API keys
      - Setup Mapbox account and get access token
      - Create basic folder structure (components, lib, types, etc.)
      - Setup environment variables (.env.local)
      - Deploy to Vercel for testing
    - Deliverables:
      - Working Next.js app with Tailwind
      - Supabase connection established
      - Mapbox integration ready
      - Basic responsive layout

**Merged Version (56b8b28)**:
- **Status**: COMPLETED ✅
- **Completion Date**: 2024-07-14
- **Completed Milestones**:
  - **Project Foundation**:
    - Status: COMPLETED ✅
    - Tasks:
      - ✅ Initialize Next.js 14 project with App Router
      - ✅ Setup Tailwind CSS + shadcn/ui components
      - ✅ Configure Supabase project and get API keys
      - ✅ Setup Mapbox account and get access token
      - ✅ Create basic folder structure (components, lib, types, etc.)
      - ✅ Setup environment variables (.env.local)
      - ✅ Deploy to Vercel for testing
    - Deliverables:
      - ✅ Working Next.js app with Tailwind
      - ✅ Supabase connection established
      - ✅ Mapbox integration ready
      - ✅ Basic responsive layout

#### Database Setup

**HEAD Version**:
- Tasks:
  - Create Supabase tables: schools, users, reviews, favorites
  - Insert sample data from specification
  - Create database types (TypeScript interfaces)
  - Setup Supabase client configuration
  - Test database connections
- Deliverables:
  - Complete database schema
  - Sample data populated
  - TypeScript types defined
  - Database connection working

**Merged Version (56b8b28)**:
- Status: COMPLETED ✅
- Tasks:
  - ✅ Create Supabase tables: schools, users, reviews, favorites
  - ✅ Insert sample data from specification
  - ✅ Create database types (TypeScript interfaces)
  - ✅ Setup Supabase client configuration
  - ✅ Test database connections
- Deliverables:
  - ✅ Complete database schema
  - ✅ Sample data populated
  - ✅ TypeScript types defined
  - ✅ Database connection working

#### Core Search Functionality

**HEAD Version**:
- Tasks:
  - Create homepage (/) with search bar
  - Build search results page (/search) with filters
  - Implement search logic (by city, school type, etc.)
  - Add basic filtering (public/private, school type)
  - Create school card components
  - Add pagination for results
  - Polish language support (basic translations)
- Deliverables:
  - Work (incomplete in the provided content)

**Note**: The document appears to have merge conflicts that need resolution. The HEAD version shows the planned tasks while the merged version (56b8b28) shows completed tasks with status indicators.