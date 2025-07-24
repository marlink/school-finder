# School Finder Portal - Page Structure

> **WAŻNE**: NIGDY nie używaj plików z folderu `-Trash`. Folder ten zawiera przestarzałe lub odrzucone dokumenty, które nie powinny być wykorzystywane w implementacji.

## 1. Overview

This document outlines the structure and layout of each page in the School Finder Portal. All pages will use the Shadcn UI CSS framework with the tangerine theme.

## 2. Common Elements

### 2.1. Header/Navbar

Present on all pages, containing:
- Logo/brand name
- Navigation links
- User authentication controls

### 2.2. Footer

Present on all pages, containing:
- Three columns of information
- Copyright information
- Links to important pages

## 3. Page Layouts

### 3.1. Home Page ('/')

- **Access**: Public, first search is free
- **Components**:
  - Hero section with introduction and 3 key benefits
  - Prominent search component with city/town input and region selector
  - Table listing regions with top 5 schools for each region
  - Horizontal carousel with 8 school cards (auto-scrolling, 3-4 visible on XL screens)
  - Banner highlighting signup benefits and future updates (university faculties)

### 3.2. Category/Region Page

- **Access**: Public with search limits
- **Components**:
  - List of all schools from a specific region
  - Filter options with multiple layout styles (togglable via small navigation in top right)

### 3.3. City/Town Page

- **Access**: Public with search limits
- **Components**:
  - List of all schools from a specific city/town
  - Filter options with multiple layout styles (togglable via small navigation in top right)

### 3.4. School Details Page

- **Access**: Limited to 2 schools for free users
- **Components**:
  - School photo
  - Complete school details from database
  - Rating and scoring information
  - Custom hero banners based on school type

### 3.5. User Profile Page

- **Access**: Authenticated users only
- **Components**:
  - Password change option
  - Account deletion option
  - Subscription upgrade controls
  - Profile picture management
  - Sharing options (text, email, PDF export)
  - Favorites schools list management (add, remove, revert deletion)
  - Reminder settings (email/phone)
  - Usage statistics
  - Visited schools toggle (dimming visited schools)
  - City/region visit counter (e.g., "3 out of 6 schools visited")

### 3.6. Authentication Pages

- **Login Page**: Form for existing users
- **Registration Page**: Form for new users

### 3.7. Special Promo Page

- **Access**: Public
- **Components**:
  - Alternative index page with different layout
  - Special promotional content

## 4. Layout Variations

For major sections (especially filters), provide three different layout styles that users can toggle between:
- Horizontal layout
- Vertical layout
- Mixed/column layout

A small navigation control in the top right corner of these sections will allow users to switch between layouts.

## 5. Implementation Notes

- Install Shadcn UI with tangerine theme: `npx shadcn@latest add https://tweakcn.com/r/themes/tangerine.json`
- Follow installation guide: https://ui.shadcn.com/docs/installation/next
- Ensure all pages are responsive and follow accessibility guidelines
- Implement layout switching functionality for filter sections