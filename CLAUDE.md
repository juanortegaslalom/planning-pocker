# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Planning Poker application for agile teams to estimate task complexity using Fibonacci scoring. Built with Next.js 15, TypeScript, and SQLite/Drizzle ORM.

## Common Development Commands

```bash
# Development
npm run dev           # Start development server with Turbopack on http://localhost:3000

# Build & Production
npm run build         # Build for production
npm start            # Start production server using custom server.js (port 8080)

# Database Management
npm run db:generate  # Generate Drizzle migrations from schema changes
npm run db:migrate   # Apply migrations to database
npm run db:push      # Push schema changes directly (development)
npm run db:studio    # Open Drizzle Studio for database inspection

# Code Quality
npm run lint         # Run Next.js linting
```

## Architecture & Key Components

### Database Layer
- **SQLite** with **Drizzle ORM** for persistence
- Schema defined in `src/lib/db/schema.ts` with two tables:
  - `sessions`: Stores session metadata (ID, ticket info, status)
  - `participants`: Stores user votes and participation data
- Database initialization in `src/lib/db/index.ts` handles both development and production paths
- `dbSessionStore` (`src/lib/dbSessionStore.ts`) provides the data access layer with methods for session CRUD operations

### API Routes (Next.js App Router)
All API endpoints are in `src/app/api/sessions/`:
- `create/route.ts`: Create new sessions
- `join/route.ts`: Join existing sessions
- `vote/route.ts`: Submit votes
- `reveal/route.ts`: Reveal votes (creator only)
- `[sessionId]/route.ts`: Get session details

### Session Management
- Sessions use 6-character uppercase IDs generated via nanoid
- Three session states: `active`, `revealed`, `ended`
- Creator privileges: Only session creator can reveal/end sessions
- First participant to join becomes the creator if none exists

### Frontend Components
- `src/components/FibonacciCards.tsx`: Voting card interface
- `src/components/SessionResults.tsx`: Vote display component
- `src/components/Button.tsx`: Reusable button component
- Pages use Next.js App Router in `src/app/`

### Deployment Configuration
- Azure deployment configured via `.github/workflows/main_planning-poker-app.yml`
- Custom `server.js` for production serving
- Database path automatically adjusts for Azure environment (`/tmp` or `$HOME` in production)

## Environment Variables

- `NODE_ENV`: Development/production mode
- `DATABASE_PATH`: Override default database location
- `NEXT_PUBLIC_BASE_URL`: Base URL for share links (auto-detected if not set)
- `PORT`: Server port (default: 8080 in production)

## Key Implementation Details

- All session IDs are automatically uppercased for consistency
- Database migrations run on startup with fallback paths for production
- Votes use Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21
- TypeScript types defined in `src/types/index.ts`
- Tailwind CSS v4 for styling