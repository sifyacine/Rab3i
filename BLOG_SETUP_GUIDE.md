# Blog CRUD & Request RLS Setup Guide

## Overview

This guide will help you:
1. Fix the Request RLS policy issue (prevent guests from creating requests)
2. Set up blog functionality with full CRUD operations
3. Add sample blog posts for testing

---

## Part 1: Database Setup

### Step 1: Run the Setup SQL

Go to [Supabase Dashboard](https://app.supabase.com):

1. Select your project
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `DATABASE_SETUP.sql`
5. Click **Run**

The script will:
- Fix RLS policies on the `requests` table (allow guests to submit requests)
- Create the `blog_posts` table with proper schema
- Set up RLS policies for blog posts
- Insert 2 sample blog posts for testing

### What Gets Created:

**Blog Posts Table** with columns:
- `id` - UUID primary key
- `title` - Article title
- `slug` - URL-friendly identifier (auto-generated)
- `category` - Article category
- `author` - Author name
- `excerpt` - Short description
- `content` - Full article content
- `featured_image_url` - Featured image (optional)
- `status` - 'published', 'draft', or 'scheduled'
- `views` - View counter (starts at 0)
- `published_at` - Publication timestamp
- `created_at` / `updated_at` - Timestamps

---

## Part 2: Fix Request RLS Issue

The RLS policy fix allows:
- ✅ **Guests (unauthenticated)** to submit project requests
- ✅ **Authenticated admins** to read, update, and delete requests
- ✅ Requests created with status `'new'` by default

**Error Before Fix:**
```
{
  "code": "42501",
  "message": "new row violates row-level security policy for table \"requests\""
}
```

**After Fix:**
Guests can submit requests without authentication ✅

---

## Part 3: Blog CRUD Functionality

### Frontend Implementation:

#### **1. Blog Service** (`src/services/blogService.ts`)
- `getBlogPosts()` - Fetch all blog posts (admin)
- `getBlogPosts({ published_only: true })` - Fetch published posts only
- `getBlogPostById(id)` - Get single post by ID
- `getBlogPostBySlug(slug)` - Get post by URL slug
- `createBlogPost(data)` - Create new post
- `updateBlogPost(id, data)` - Update existing post
- `deleteBlogPost(id)` - Delete post

#### **2. Admin Blog Page** (`src/pages/admin/Blog.tsx`)
- Lists all blog posts with status badges
- Create/Edit/Delete operations
- Soft refresh on navigation
- Shows published vs total count

#### **3. Admin Blog Form** (`src/pages/admin/BlogForm.tsx`)
- 3-step form wizard:
  1. **Step 1:** Title, Category, Excerpt
  2. **Step 2:** Full article content
  3. **Step 3:** Publish settings, author, date, featured image
- Create or edit blog posts
- Auto-generates URL slug from title
- Validates required fields before proceeding

#### **4. Public Blog Page** (`src/pages/public/Blog.tsx`)
- Displays only published blog posts
- Fetches from database
- Shows view count and publication date
- Links to individual article pages

---

## Part 4: Testing the Setup

### Test 1: Submit a Request (Guest)
1. Go to `http://localhost:5173/request`
2. Fill out the form as a guest (no login required)
3. Submit the request
4. Should see success message ✅

### Test 2: Create a Blog Post (Admin)
1. Login as admin
2. Go to `/admin/blog`
3. Click "+ جديد" (New)
4. Fill 3 form steps
5. Click "نشر المقال" to publish
6. Post should appear in the admin list and on public blog page ✅

### Test 3: Edit a Blog Post (Admin)
1. In `/admin/blog`, click any post
2. Click "تعديل" (Edit)
3. Modify the content
4. Click "تحديث المقال"
5. Changes should be saved and visible ✅

### Test 4: Delete a Blog Post (Admin)
1. In `/admin/blog`, click any post
2. Click "حذف" (Delete)
3. Confirm deletion
4. Post should disappear from both admin and public pages ✅

### Test 5: View Published Articles (Public)
1. Go to `http://localhost:5173/blog`
2. Should see 2 sample blog posts (if seeds were inserted)
3. Both articles should be fully visible ✅

---

## Part 5: Sample Data

Two blog posts are included for testing:

### Post 1: "كيف تبني هوية بصرية تميز علامتك التجارية؟"
- **Author:** أحمد المالكي
- **Category:** علامة تجارية
- **Status:** Published
- **Published:** 15 days ago
- **Views:** 42

### Post 2: "أسرار الحملات التسويقية الناجحة"
- **Author:** سارة العتيبي
- **Category:** التسويق الرقمي
- **Status:** Published
- **Published:** 10 days ago
- **Views:** 28

---

## Part 6: Features Implemented

### ✅ Complete CRUD Operations
- **Create** blog posts through admin form
- **Read** published posts on public site, all posts in admin
- **Update** existing blog posts
- **Delete** blog posts with confirmation

### ✅ Automatic Features
- Slug generation from title
- View counter increments on article view
- Soft refresh after operations
- Role-based access control (admin only)

### ✅ Response Types
- TypeScript interfaces: `BlogPost`, `CreateBlogDTO`
- Type-safe API calls
- Full error handling with toast notifications

### ✅ Request Form Fixed
- Guests can now submit project requests
- RLS policy allows anonymous inserts
- Proper error handling and validation

---

## Part 7: Database Schema

```sql
blog_posts table:
├── id (UUID, primary key)
├── title (TEXT, not null)
├── slug (TEXT, unique, auto-generated)
├── category (TEXT, not null)
├── author (TEXT, default: 'ربيعي')
├── excerpt (TEXT, not null)
├── content (TEXT, not null)
├── featured_image_url (TEXT, optional)
├── status (TEXT: 'published'|'draft'|'scheduled')
├── views (INT, default: 0)
├── published_at (TIMESTAMP, optional)
├── created_at (TIMESTAMP, auto)
└── updated_at (TIMESTAMP, auto)

Indexes:
- status (for filtering)
- category (for categorization)
- slug (for URL lookup)
- published_at DESC (for sorting)
```

---

## Part 8: Troubleshooting

### Blog posts not showing in public?
- Check status is `'published'`
- Check `published_at` is set to current or past date
- Clear browser cache and refresh

### Request form still errors?
- Verify you ran the SQL script completely
- Check RLS policies in Supabase: Tables → requests → RLS
- Ensure policies include the "allow_guests_insert_requests" policy

### Can't edit/delete as admin?
- Verify you're logged in as admin (role = 'admin')
- Check in Supabase RLS policies are set correctly
- Try logging out and back in to refresh permissions

### Slug conflicts?
- Slugs are auto-generated and must be unique
- If creating a post with same title, modify title slightly
- Slug format: lowercase, hyphens only, no special chars

---

## Part 9: Queries & Analytics

### View Blog Stats
```sql
SELECT
  status,
  COUNT(*) as count,
  SUM(views) as total_views,
  AVG(views) as avg_views,
  MAX(views) as top_views
FROM blog_posts
GROUP BY status;
```

### Find Most Viewed Posts
```sql
SELECT title, author, views, published_at
FROM blog_posts
WHERE status = 'published'
ORDER BY views DESC
LIMIT 10;
```

### Track Requests
```sql
SELECT status, COUNT(*) as count
FROM requests
GROUP BY status;
```

---

## Files Modified/Created

| File | Change | Purpose |
|------|--------|---------|
| `src/services/blogService.ts` | ✨ **NEW** | Blog API service layer |
| `src/pages/admin/Blog.tsx` | 🔄 **Updated** | Admin blog list with DB integration |
| `src/pages/admin/BlogForm.tsx` | 🔄 **Updated** | Admin blog form with mutations |
| `src/pages/public/Blog.tsx` | 🔄 **Updated** | Public blog page fetches from DB |
| `DATABASE_SETUP.sql` | ✨ **NEW** | Database initialization script |

---

## Next Steps (Optional)

1. **Add blog comments** - Create comments table with RLS
2. **Add featured images** - Implement Supabase storage
3. **Add rich text editor** - Replace textarea with TipTap or similar
4. **Add pagination** - Implement on public blog list
5. **Add search/filter** - Filter by category, author, date
6. **Add tags** - Add post tagging system

---

## Support

If you encounter issues:
1. Check the Supabase logs for detailed error messages
2. Verify RLS policies are correctly applied
3. Test with curl/Postman to isolate frontend vs backend issues
4. Check browser console for TypeScript/React errors

**Build Status:** ✅ All changes compiled successfully!
