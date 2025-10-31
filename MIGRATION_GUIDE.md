# Database Migration Guide

## Required Migrations

Your Vantora app requires the following migrations to be run in your Supabase database to enable all features.

### How to Run Migrations

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Create a new query
5. Copy and paste the migration SQL
6. Click **Run** to execute

---

## Migration 009: Advanced Customization (⚠️ REQUIRED)

**Status:** ⚠️ Not applied (causing errors in Advanced Themes)

**What it adds:**
- Custom colors (accent, button, text colors)
- Custom fonts (heading and body)
- Advanced backgrounds (solid, gradient, image, video)
- Particle effects toggle
- Button styles (rounded, pill, square, neon, glass, etc.)
- Custom CSS support
- Profile layouts (centered, grid, masonry, card)
- Section ordering
- Link categories, badges, thumbnails

**File:** `supabase/migrations/009_advanced_customization.sql`

**How to apply:**
1. Open Supabase SQL Editor
2. Run the contents of `009_advanced_customization.sql`
3. Refresh your Vantora dashboard

---

## Migration 010: Analytics Optimization (⚠️ RECOMMENDED)

**Status:** ⚠️ Not applied

**What it adds:**
- Click-through rate (CTR) calculation
- Conversion tracking
- UTM parameter support
- Device type tracking
- Geographic location tracking
- Better indexes for faster queries
- Analytics aggregation tables

**File:** `supabase/migrations/010_analytics_optimization.sql`

**How to apply:**
1. Open Supabase SQL Editor
2. Run the contents of `010_analytics_optimization.sql`
3. Your analytics will become more detailed

---

## Other Migrations (Already Applied ✅)

These should already be in your database:

- ✅ `001_initial_schema.sql` - Core tables (profiles, links, analytics)
- ✅ `002_analytics_tables.sql` - Analytics tracking
- ✅ `003_file_storage.sql` - Avatar and file uploads
- ✅ `004_add_link_scheduling.sql` - Scheduled link visibility
- ✅ `005_add_background_music.sql` - Profile background music
- ✅ `006_music_storage.sql` - Music file storage bucket
- ✅ `007_advanced_analytics.sql` - Enhanced analytics
- ✅ `008_custom_domains_and_protected_links.sql` - Custom domains & password protection

---

## Verification

After running migration 009, you should be able to:
- ✅ Use Advanced Themes → Background without errors
- ✅ View your profile page without "Something went wrong" errors
- ✅ Customize colors, fonts, and backgrounds
- ✅ Use custom CSS
- ✅ Add badges and categories to links

After running migration 010, you should see:
- ✅ More detailed analytics (device types, locations, UTM tracking)
- ✅ Faster analytics page loading
- ✅ Click-through rate (CTR) metrics

---

## Troubleshooting

### "Something went wrong" on profile page
→ Run migration 009 to add the missing `background_gradient`, `custom_colors`, etc. columns

### "Something went wrong" in Advanced Themes
→ Run migration 009 to add advanced customization columns

### Analytics page is slow
→ Run migration 010 to add performance indexes

### Can't upload music/avatars
→ Check that migrations 003 and 006 were applied for storage buckets

---

## Quick Command Reference

```sql
-- Check if a column exists (example)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'custom_colors';

-- If it returns nothing, run migration 009
```

---

## Need Help?

If you encounter any issues:
1. Check the browser console for specific error messages
2. Verify which migrations have been applied in Supabase
3. Run migrations in order (009 before 010)
4. Clear your browser cache after applying migrations
