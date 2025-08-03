# School Finder Production

A comprehensive school search platform built with Next.js, helping users find and compare educational institutions in Poland.

## Features

- 🔍 Advanced school search with filters
- 🌍 Bilingual support (Polish & English UK)
- 📱 Responsive design for all devices
- 🔐 User authentication and profiles
- ⭐ School favorites and comparison
- 📊 Admin panel for school management
- 🎯 Search analytics and history

## Tech Stack

- **Framework:** Next.js 15.4.1 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Internationalization:** next-intl
- **UI Components:** Radix UI + shadcn/ui
- **Testing:** Playwright

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Configure your Supabase credentials

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Playwright tests
```

## Project Structure

```
src/
├── app/             # Next.js App Router pages
├── components/      # Reusable UI components
├── lib/            # Utility functions and configurations
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
└── styles/         # Global styles and Tailwind config
```

## Supported Languages

- **Polish** (`pl.json`)
- **English UK** (`eng.json`)

## Contributing

1. Follow the development guidelines in `DEVELOPMENT_GUIDELINES.md`
2. Run `npm run build` before committing
3. Ensure all tests pass with `npm run test`
4. Follow the established code style and conventions

## Deployment

The application is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

For detailed deployment instructions, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Documentation

- [Development Guidelines](./DEVELOPMENT_GUIDELINES.md) - Technical standards and best practices
- [Project Guide](./PROJECT_GUIDE.md) - Detailed project documentation
- [Development Roadmap](./DEVELOPMENT_ROADMAP_UPDATED.md) - Feature roadmap and progress

## License

This project is proprietary software. All rights reserved.