# Testing & Troubleshooting Guide

This guide will help you test your SocialStoryAI application and troubleshoot common issues.

## Prerequisites

Before testing, ensure:

1. ✅ Supabase project is set up and running
2. ✅ Database schema applied (from `database/supabase-schema.sql`)
3. ✅ Environment variables configured in Supabase Dashboard
4. ✅ Admin account created (see `ADMIN-SETUP.md`)

## Testing Authentication

### Test 1: Local Account Registration

1. **Open the app** in your web browser
2. **Click "Start Free Trial"** or "Sign In" button
3. **Click "Sign Up"** tab
4. **Fill in the form:**
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!
5. **Click "Create Account"**
6. **Expected Result:** 
   - ✅ User is created successfully
   - ✅ Redirected to /home
   - ✅ Can see user profile

**Troubleshooting:**
- ❌ "User already registered" → Email is already in use
- ❌ "Email not confirmed" → Check Supabase Auth settings to disable email confirmation
- ❌ Network error → Check Supabase credentials in environment variables

### Test 2: Local Account Login

1. **Open the app** in your web browser
2. **Click "Sign In"**
3. **Fill in credentials:**
   - Email: test@example.com
   - Password: Test123!
4. **Click "Sign In"**
5. **Expected Result:**
   - ✅ Logged in successfully
   - ✅ Redirected to /home

**Troubleshooting:**
- ❌ "Invalid email or password" → Check credentials or user exists in Supabase
- ❌ "User not found" → User may exist in auth.users but not in public.users table
  - Fix: Run this SQL:
    ```sql
    INSERT INTO public.users (id, email, name, is_premium, is_admin, stories_generated, created_at, updated_at)
    SELECT id, email, COALESCE(raw_user_meta_data->>'name', email), false, false, 0, created_at, NOW()
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.users);
    ```

### Test 3: Admin Account Login

1. **Open the app**
2. **Click "Sign In"**
3. **Use admin credentials:**
   - Email: admin@socialstoryai.com
   - Password: Your admin password
4. **Click "Sign In"**
5. **Navigate to `/admin`** in the URL
6. **Expected Result:**
   - ✅ Can access admin panel
   - ✅ See admin features

**Troubleshooting:**
- ❌ Can't access admin panel → User not marked as admin
  - Fix: `UPDATE public.users SET is_admin = true WHERE email = 'admin@socialstoryai.com';`

### Test 4: Google OAuth Login (Web Only)

**Note:** Google OAuth must be configured in Supabase first.

1. **Configure Google OAuth in Supabase:**
   - Go to Authentication > Providers
   - Enable Google
   - Add Client ID and Secret from Google Cloud Console
   - Add authorized redirect URLs

2. **Test Google Login:**
   - Click "Continue with Google"
   - Select Google account
   - Authorize the app
   - Should redirect back and log in

**Expected Behavior:**
- ✅ If configured: Opens Google OAuth flow
- ⚠️ If not configured: Shows "Google login is not available" message

**Troubleshooting:**
- ❌ "Google login is not available" → OAuth not configured in Supabase
- ❌ "Redirect URI mismatch" → Check authorized redirect URIs in Google Cloud Console
- ❌ "Invalid client" → Check Client ID/Secret in Supabase

## Testing Story Creation

### Test 5: Create First Story (Free User)

1. **Log in as regular user (not admin)**
2. **Navigate to /create-story**
3. **Fill in the form:**
   - Child's Name: Alex
   - Situation: Going to the dentist
   - Select complexity, tone, and image style
4. **Click "Generate Story"**
5. **Expected Result:**
   - ✅ Story is generated with AI content
   - ✅ Images are displayed
   - ✅ Story is saved
   - ✅ Free stories counter decrements (2 remaining)

**Troubleshooting:**
- ❌ "Failed to generate" → Check AI API keys in admin panel
- ❌ No images → Check image generation API configuration
- ❌ Network error → Check backend connection

### Test 6: Free Story Limit

1. **Create 3 stories as free user**
2. **Try to create 4th story**
3. **Expected Result:**
   - ⚠️ Shows upgrade prompt
   - ❌ Cannot generate more stories

## Testing Admin Panel

### Test 7: Access Admin Dashboard

1. **Log in as admin**
2. **Navigate to `/admin`**
3. **Expected Result:**
   - ✅ Can see dashboard
   - ✅ View user statistics
   - ✅ See activity logs

### Test 8: Manage Users

1. **In admin panel, go to Users tab**
2. **Try to:**
   - View all users
   - Make user premium
   - Make user admin
   - Delete user (be careful!)
3. **Expected Result:**
   - ✅ Can perform admin actions
   - ✅ Changes persist

## Performance Testing

### Test 9: Page Load Speed

1. **Open app in web browser**
2. **Open DevTools (F12) → Network tab**
3. **Refresh the page**
4. **Expected Result:**
   - ✅ Initial load < 3 seconds
   - ✅ No failed requests
   - ✅ Supabase connections successful

### Test 10: Console Logs

1. **Open DevTools (F12) → Console tab**
2. **Navigate through the app**
3. **Expected Result:**
   - ✅ No error messages
   - ✅ Only info/debug logs
   - ⚠️ Warning logs are acceptable

**Common Console Messages (Normal):**
```
✅ Loading user, session exists: true
✅ Auth state changed: SIGNED_IN
✅ Login successful
```

**Error Messages to Watch For:**
```
❌ Failed to load user
❌ Error loading user profile
❌ Login error
❌ Network request failed
```

## Security Testing

### Test 11: RLS (Row Level Security)

1. **Log in as User A**
2. **Create a story**
3. **Note the story ID**
4. **Log out and log in as User B**
5. **Try to access User A's story via URL**
6. **Expected Result:**
   - ❌ Cannot access other user's stories
   - ✅ Only see own stories

### Test 12: Admin-Only Routes

1. **Log in as regular user (not admin)**
2. **Try to navigate to `/admin`**
3. **Expected Result:**
   - ❌ Redirected away or access denied
   - ✅ Only admins can access

## Common Issues & Solutions

### Issue: "Failed to fetch" error

**Cause:** Network connectivity or CORS issue

**Solution:**
1. Check Supabase credentials in environment variables
2. Verify Supabase project is not paused
3. Check browser console for CORS errors
4. Ensure allowed origins are configured in Supabase

### Issue: "User not found" after login

**Cause:** User exists in auth.users but not in public.users

**Solution:**
```sql
-- Sync auth users to public.users
INSERT INTO public.users (id, email, name, is_premium, is_admin, stories_generated, created_at, updated_at)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'name', email), 
  false, 
  false, 
  0, 
  created_at, 
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
```

### Issue: Google login not working

**Cause:** Google OAuth not configured

**Solution:**
1. Configure Google OAuth in Supabase Dashboard
2. Or disable Google login button in the app
3. Or show helpful message to users

### Issue: Can't create stories

**Cause:** Missing API keys for AI generation

**Solution:**
1. Log in as admin
2. Go to Admin Panel → Settings
3. Add OpenAI or Gemini API key
4. Save settings

### Issue: Images not loading

**Cause:** Image generation API not configured

**Solution:**
1. Check API keys in admin panel
2. Verify image generation service is working
3. Check console for specific error messages

## Testing Checklist

Before going live, ensure:

- [ ] User registration works
- [ ] User login works
- [ ] Admin login works
- [ ] Story creation works
- [ ] Free story limit enforced
- [ ] Admin panel accessible
- [ ] User management works
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] RLS policies working
- [ ] Environment variables set
- [ ] API keys configured
- [ ] Database schema applied
- [ ] Admin account created

## Monitoring

### What to Monitor:

1. **Supabase Dashboard:**
   - Active users
   - API requests
   - Database usage
   - Auth success/failure rates

2. **Browser Console:**
   - JavaScript errors
   - Network failures
   - Performance warnings

3. **User Feedback:**
   - Login issues
   - Story generation failures
   - Performance complaints

## Getting Help

If you encounter issues not covered here:

1. Check browser console for error messages
2. Check Supabase logs
3. Review ADMIN-SETUP.md for admin setup
4. Review SUPABASE-SETUP.md for database setup
5. Contact support with:
   - Error message
   - Steps to reproduce
   - Browser/platform information
