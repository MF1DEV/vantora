# Vantora.id

A modern bio link platform built with Next.js 14, TypeScript, and Supabase.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables in `.env.local`

3. Run the development server:
```bash
npm run dev
```

4. **Important:** Run database migrations in your Supabase dashboard:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run each migration file in `/supabase/migrations/` in order:
     - `001_initial_schema.sql`
     - `002_analytics_tables.sql`
     - `003_file_storage.sql`
     - `004_add_link_scheduling.sql`
     - `005_add_background_music.sql`
     - `006_music_storage.sql` (creates music storage bucket)

5. Open [http://localhost:3000](http://localhost:3000)

## Storage Buckets Setup

The app requires two Supabase storage buckets:
- **avatars** - For user profile pictures (created by migration 003)
- **music** - For background music files (created by migration 006)

If you get "bucket not found" errors, ensure you've run the migrations in your Supabase dashboard.

## Project Structure

- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - Reusable React components
- `/src/lib` - Utilities and configurations
- `/src/hooks` - Custom React hooks
- `/src/types` - TypeScript type definitions
- `/supabase/migrations` - Database migrations

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel
