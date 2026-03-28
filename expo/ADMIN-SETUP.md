# Admin Account Setup Guide

This guide will help you create an admin account for your SocialStoryAI application.

## Prerequisites

- Supabase project set up and running
- Database schema applied (from `database/supabase-schema.sql`)
- Environment variables configured

## Creating Admin Account

### Option 1: Using Supabase Dashboard (Recommended for Web)

1. **Go to Supabase Dashboard**
   - Navigate to your project at https://app.supabase.com
   - Go to Authentication > Users

2. **Create New User**
   - Click "Add User" button
   - Email: `admin@socialstoryai.com` (or your preferred email)
   - Password: Choose a strong password (e.g., `Admin123!@#`)
   - **Important**: Check "Auto Confirm User" to skip email verification

3. **Make User Admin**
   - Copy the User ID from the newly created user
   - Go to SQL Editor
   - Run this query:
   ```sql
   UPDATE public.users 
   SET 
     is_admin = true,
     is_premium = true,
     name = 'Admin',
     updated_at = NOW()
   WHERE email = 'admin@socialstoryai.com';
   ```

4. **Verify Admin User**
   ```sql
   SELECT id, email, name, is_admin, is_premium, created_at 
   FROM public.users 
   WHERE email = 'admin@socialstoryai.com';
   ```

### Option 2: Using SQL Only

If the user wasn't created in the `users` table automatically:

1. **Get Auth User ID**
   ```sql
   SELECT id FROM auth.users WHERE email = 'admin@socialstoryai.com';
   ```

2. **Insert/Update User Profile**
   ```sql
   INSERT INTO public.users (id, email, name, is_premium, is_admin, stories_generated, created_at, updated_at)
   VALUES (
     'YOUR_USER_ID_HERE', 
     'admin@socialstoryai.com', 
     'Admin', 
     true, 
     true, 
     0,
     NOW(), 
     NOW()
   )
   ON CONFLICT (id) DO UPDATE
   SET 
     is_admin = true, 
     is_premium = true, 
     name = 'Admin', 
     updated_at = NOW();
   ```

## Testing Admin Login

### Web Application

1. Open your app in a web browser
2. Click "Sign In"
3. Enter admin credentials:
   - Email: `admin@socialstoryai.com`
   - Password: Your chosen password
4. You should be logged in and redirected to the home page
5. Navigate to `/admin` to access admin panel

### Troubleshooting

#### "Invalid credentials" or "User not found"

**Problem**: The user exists in `auth.users` but not in `public.users` table.

**Solution**: Run the SQL from Option 2 above to create the user profile.

#### "Google login is not available"

**Problem**: Google OAuth is not configured in Supabase.

**Solution**: 
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID: From Google Cloud Console
   - Client Secret: From Google Cloud Console
4. Set authorized redirect URLs in Google Cloud Console

#### Can't access admin panel

**Problem**: User is not marked as admin.

**Solution**: 
```sql
UPDATE public.users SET is_admin = true WHERE email = 'admin@socialstoryai.com';
```

## Creating Additional Admin Users

To promote any existing user to admin:

```sql
UPDATE public.users 
SET 
  is_admin = true,
  is_premium = true,
  updated_at = NOW()
WHERE email = 'user@example.com';
```

## Security Notes

1. **Change Default Password**: If you used a simple password during setup, change it immediately after first login
2. **Use Strong Passwords**: Admin accounts should have complex passwords
3. **Limit Admin Access**: Only grant admin privileges to trusted users
4. **Monitor Activity**: Check activity logs regularly in the admin panel
5. **Enable 2FA**: Consider enabling two-factor authentication in Supabase

## Default Admin Credentials

For initial setup only:
- Email: `admin@socialstoryai.com`
- Password: Set during account creation

**IMPORTANT**: Change these credentials immediately after first login!
