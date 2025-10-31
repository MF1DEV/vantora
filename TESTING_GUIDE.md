# 🧪 Vantora Testing Guide

## ✅ Fixed Issues
- Fixed TypeScript ref callback in AccessibleTabs
- Renamed `performance.ts` to `performance.tsx` for JSX support
- Build should now pass on Vercel

---

## 🗄️ Database Setup (Required First!)

### 1. Apply Migrations
Go to your Supabase Dashboard → SQL Editor and run these migrations in order:

```sql
-- Migration 009: Advanced Customization (Phase 1)
-- Adds: custom_colors, fonts, backgrounds, button styles, custom CSS, layouts, etc.
-- Location: supabase/migrations/009_advanced_customization.sql
```

```sql
-- Migration 010: Analytics Optimization (Phase 3)
-- Adds: RPC functions, indexes, materialized views
-- Location: supabase/migrations/010_analytics_optimization.sql
```

### 2. Verify Tables Exist
Check that you have these tables in Supabase:
- `profiles` - User profiles
- `links` - User links
- `analytics` - Analytics tracking
- `daily_analytics_summary` - Materialized view

---

## 🧑‍💻 Local Testing

### 1. Start Development Server
```powershell
npm run dev
```
Visit: `http://localhost:3000`

### 2. Test Authentication
- **Register**: `/register`
  - Create a new account
  - Check email for confirmation (if email enabled)
  
- **Login**: `/login`
  - Test with valid credentials
  - Test error handling with wrong password

### 3. Test Dashboard (`/dashboard`)

#### **Basic Features:**
- [ ] Add a new link
- [ ] Edit existing link
- [ ] Delete a link
- [ ] Toggle link active/inactive
- [ ] Reorder links with drag-and-drop
- [ ] Upload avatar image
- [ ] Edit profile (title, bio)

#### **Phase 1: Profile Customization**

**Theme Selector:**
- [ ] Switch between themes (Professional, Neon, Minimal, Sunset, etc.)
- [ ] Preview theme changes

**Advanced Tab:**
- [ ] **Custom Colors**: Change primary, secondary, background, text, accent colors
- [ ] **Custom Fonts**: Select heading and body fonts (should load from Google Fonts)
- [ ] **Background**: 
  - Choose gradient/solid/image
  - Upload background image
  - Enable particle effects
- [ ] **Button Styles**: Switch between Rounded, Pill, Square, Outlined
- [ ] **Custom CSS**: Add custom CSS (test that dangerous CSS is sanitized)
- [ ] **Theme Templates**: Click "Apply" on any template (should update instantly)
- [ ] **Layout Selector**: Switch between Classic, Grid, Masonry, Card layouts
- [ ] **Section Ordering**: Drag sections to reorder (Bio, Links, Widgets, Social)

**Link Customization:**
- [ ] Upload thumbnail for a link
- [ ] Add badge to a link (New, Hot, Sale, etc.)
- [ ] Choose badge color
- [ ] Add/create category for links

---

## 🌐 Public Profile Testing

### Visit Your Profile: `/{your-username}`

#### **Phase 1 Visual Tests:**
- [ ] Custom theme colors applied correctly
- [ ] Custom fonts loaded (check in DevTools Network tab for Google Fonts)
- [ ] Background displays correctly (gradient/solid/image)
- [ ] Particles animation (if enabled)
- [ ] Custom button styles applied
- [ ] Layout displays correctly (Classic/Grid/Masonry/Card)
- [ ] Sections in correct order
- [ ] Link thumbnails display (in Card layout)
- [ ] Link badges display with correct colors
- [ ] Links grouped by category

#### **Click Tracking:**
- [ ] Click a link → should increment analytics
- [ ] Check `/analytics` to see click count increase

---

## 📱 Phase 2: Mobile & UX Testing

### **Mobile Optimization (Resize browser to mobile width)**
- [ ] **Bottom Sheet**: Forms should open as bottom sheets on mobile
- [ ] **Touch Targets**: All buttons at least 44x44px (easy to tap)
- [ ] **Swipeable Cards**: Swipe link cards left/right (if implemented in UI)
- [ ] **Pull to Refresh**: Pull down on analytics page
- [ ] **Mobile Navigation**: Bottom nav bar visible on mobile
- [ ] **Responsive Dialog**: Modals become bottom sheets on mobile

### **Form Improvements**
Test in dashboard link editor:
- [ ] **Real-time Validation**: Type invalid URL → see error immediately
- [ ] **Visual Feedback**: Checkmark for valid input, X for invalid
- [ ] **Password Strength**: Enter password → see strength meter (1-5 levels)
- [ ] **Character Counter**: Type in bio → see "X characters remaining"
- [ ] **Input Masks**: Phone number auto-formats as (123) 456-7890
- [ ] **Auto-save**: Edit profile → should auto-save after 1 second

### **Accessibility (A11y)**
- [ ] **Tab Navigation**: Press Tab to navigate (should cycle through all buttons/inputs)
- [ ] **Escape Key**: Press Escape on modal → should close
- [ ] **Arrow Keys**: On tabs, press Left/Right arrows → should switch tabs
- [ ] **Focus Visible**: Tab through elements → should see blue outline
- [ ] **Screen Reader**: Use NVDA/JAWS → should announce "Skip to content" link
- [ ] **Reduced Motion**: Enable "Reduce Motion" in OS → animations should be minimal

---

## 📊 Phase 3: Analytics Testing

### **Generate Test Data**
1. Visit your profile from different browsers/devices
2. Click several links
3. Use different referrers (Google, Twitter, direct)
4. Wait 5 minutes for data to populate

### **Analytics Dashboard (`/analytics`)**

#### **Overview Metrics:**
- [ ] Total Views displayed
- [ ] Total Clicks displayed
- [ ] Unique Visitors count
- [ ] CTR (Click-through Rate) calculated correctly

#### **Advanced Analytics:**
- [ ] **Conversion Funnel**: Shows 4 steps (Profile Views → Link Clicks → External Visits → Conversions)
- [ ] **Device Breakdown**: Donut chart with Desktop/Mobile/Tablet percentages
- [ ] **Geographic Heatmap**: Top 10 countries with visit counts
- [ ] **Retention Cohorts**: Heatmap showing week-by-week retention
- [ ] **UTM Campaign Tracker**: If using UTM parameters (test with `?utm_source=twitter&utm_campaign=promo`)

#### **Date Range Selector:**
- [ ] Select "Last 7 Days" → data updates
- [ ] Select "Last 30 Days" → data updates
- [ ] Select "This Month" → data updates
- [ ] Custom Range: Pick start/end dates → data updates

#### **Comparison View:**
- [ ] Shows current vs previous period
- [ ] Displays percentage change
- [ ] Green arrow for increase, red for decrease

#### **Export & Reporting:**
- [ ] Click "Download CSV" → CSV file downloads with all metrics
- [ ] Click "Download PDF" → Print dialog opens with formatted report
- [ ] **Scheduled Reports**: 
  - Enter email
  - Select frequency (daily/weekly/monthly)
  - Toggle enable → Save settings

---

## ⚡ Phase 3: Performance Testing

### **Page Load Speed**
1. Open Chrome DevTools → Network tab
2. Reload page with cache disabled (Ctrl+Shift+R)
3. Check metrics:
   - [ ] First Contentful Paint < 1.5s
   - [ ] Largest Contentful Paint < 2.5s
   - [ ] Total page size < 3MB

### **Image Lazy Loading**
1. Open Chrome DevTools → Network tab
2. Filter to "Images"
3. Scroll down slowly on profile page
4. [ ] Images should load as they come into viewport (not all at once)

### **Caching**
1. Visit `/analytics`
2. Note load time
3. Navigate away, then return
4. [ ] Second load should be much faster (data cached in localStorage)

### **Virtual List** (if you have 100+ links)
- [ ] Scroll through long list → should be smooth
- [ ] Only ~20 items rendered at a time (check DevTools Elements tab)

---

## 🔍 Browser Testing

Test in multiple browsers:
- [ ] **Chrome** (Desktop & Mobile DevTools)
- [ ] **Firefox**
- [ ] **Safari** (Mac/iOS)
- [ ] **Edge**

Check for:
- Layout consistency
- Font rendering
- Animation smoothness
- Form functionality

---

## 🐛 Common Issues & Solutions

### "Migration not applied"
**Symptom**: Custom theme options don't save, or errors in console about missing columns  
**Fix**: Run migrations 009 and 010 in Supabase SQL Editor

### "Analytics not tracking"
**Symptom**: Zero views/clicks shown  
**Fix**: 
1. Check Supabase RLS policies allow INSERT on `analytics` table
2. Check browser console for API errors
3. Visit `/api/analytics/track` in browser (should return 404, but check Network tab)

### "Images not uploading"
**Symptom**: Avatar/thumbnail upload fails  
**Fix**:
1. Check Supabase Storage bucket `avatars` and `thumbnails` exist
2. Check RLS policies allow authenticated users to upload
3. Check file size < 5MB

### "Fonts not loading"
**Symptom**: Custom fonts don't apply  
**Fix**:
1. Check Network tab for Google Fonts API calls
2. Check `CustomThemeProvider` is wrapping profile page
3. Try different font (some fonts may not be available)

### "Vercel build fails"
**Symptom**: Deployment errors  
**Fix**: 
1. All TypeScript errors should be resolved now
2. Run `npm run build` locally to test
3. Check Vercel logs for specific error

---

## ✅ Checklist for Phase 4

Before moving to Phase 4, verify:
- [ ] Migrations 009 & 010 applied
- [ ] Can customize profile (colors, fonts, layout)
- [ ] Can add/edit/delete links with thumbnails/badges
- [ ] Public profile displays correctly with custom theme
- [ ] Analytics tracking works (views & clicks)
- [ ] Mobile responsive (test on real device or DevTools)
- [ ] Forms have validation and visual feedback
- [ ] Keyboard navigation works (Tab, Escape, Arrows)
- [ ] Export CSV/PDF downloads
- [ ] No console errors
- [ ] Vercel deployment successful

---

## 🚀 Performance Benchmarks

**Target Metrics:**
- Lighthouse Performance Score: > 90
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Total Blocking Time: < 200ms
- Cumulative Layout Shift: < 0.1

**Run Lighthouse:**
1. Open Chrome DevTools → Lighthouse tab
2. Select "Performance" + "Best Practices" + "Accessibility"
3. Click "Analyze page load"

---

## 📝 Testing Workflow

**Quick Smoke Test (5 mins):**
1. Register → Login
2. Add 3 links
3. Change theme
4. Visit public profile
5. Check analytics

**Full Test (30 mins):**
1. All dashboard features
2. All customization options
3. Mobile responsive check
4. Accessibility check
5. Analytics generation & export
6. Performance audit

**Pre-Deployment Test:**
1. Run `npm run build` locally
2. Check for TypeScript errors
3. Test in production mode (`npm start`)
4. Review Lighthouse scores
5. Test on real mobile device

---

## 🎯 Next Steps

After verifying everything works:
1. ✅ Mark Phase 1, 2, 3 as complete
2. 🗂️ Document any bugs found
3. 📊 Collect performance metrics
4. 🚀 Ready for Phase 4!

**Phase 4 Options:**
- Social Features (comments, likes, shares)
- Monetization (premium tiers, subscriptions)
- Integrations (Zapier, webhooks, OAuth)
- Admin Dashboard (user management, moderation)

---

Happy Testing! 🎉
