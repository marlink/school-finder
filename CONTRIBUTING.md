# Contributing to School Directory Poland

## Development Guidelines

### Environment Configuration

#### .env.local Placement Rule

**ALWAYS** keep `.env.local` files in the project root directory. NEVER place them inside sub-folders.

This ensures:
- Consistent environment variable loading by Next.js
- Proper access to database credentials and API keys
- Compatibility with Supabase CLI commands

Incorrect placement can cause connection errors when running database migrations.

### Other Guidelines

- Follow the existing code style and formatting
- Write meaningful commit messages
- Create pull requests for significant changes
- Update documentation when changing functionality