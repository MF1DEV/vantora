# Social Media Links Setup

## Prerequisites
The social media links feature requires running migration `011_social_media_links.sql`.

## How to Apply the Migration

### Option 1: Supabase Dashboard (Recommended for Remote Projects)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/011_social_media_links.sql`
4. Paste and run the SQL in the editor
5. Verify the columns were added to the `links` table

### Option 2: Supabase CLI (Local Development)
```bash
# Link your project (if not already linked)
npx supabase link --project-ref your-project-ref

# Push the migration
npx supabase db push
```

### Option 3: Manual SQL
Run this SQL in your database:

```sql
ALTER TABLE links ADD COLUMN IF NOT EXISTS link_type TEXT DEFAULT 'regular' CHECK (link_type IN ('regular', 'social'));
ALTER TABLE links ADD COLUMN IF NOT EXISTS social_platform TEXT CHECK (
  social_platform IS NULL OR 
  social_platform IN (
    'twitter', 'instagram', 'facebook', 'linkedin', 'github', 
    'youtube', 'tiktok', 'twitch', 'discord', 'telegram',
    'whatsapp', 'snapchat', 'reddit', 'pinterest', 'medium',
    'behance', 'dribbble', 'spotify', 'soundcloud', 'patreon'
  )
);
```

## Enabling the Feature

After running the migration:

1. Open `src/app/(dashboard)/dashboard/page.tsx`
2. Find line ~549: `{false && ( // TODO: Enable after running migration`
3. Change `{false &&` to `{true &&`
4. Save the file

The "Social Media" link type option will now appear in the dashboard!

## Features
- 20 supported platforms with auto-generated URLs
- Users only enter username (e.g., `@johndoe`)
- Platform-specific icons displayed on profile
- Auto-builds full URLs (e.g., `https://twitter.com/johndoe`)

## Backwards Compatible
The code works with or without the migration:
- **Without migration**: Regular links only
- **With migration**: Regular links + Social media links with icons
