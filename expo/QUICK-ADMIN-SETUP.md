# Quick Admin Account Setup

## Step-by-Step Instructions

### 1. Create Admin User in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication > Users**
4. Click **"Add User"** button
5. Fill in:
   - **Email**: `admin@socialstoryai.com` (or your preferred email)
   - **Password**: Choose a strong password (e.g., `Admin2025!@#`)
   - **Important**: ✅ Check "Auto Confirm User"
6. Click **"Create User"**

### 2. Make User Admin

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Paste this SQL:

```sql
UPDATE public.users 
SET 
  is_admin = true,
  is_premium = true,
  name = 'Admin',
  updated_at = NOW()
WHERE email = 'admin@socialstoryai.com';
```

4. Click **"Run"** or press `Ctrl/Cmd + Enter`

### 3. Verify Admin Account

Run this SQL to verify:

```sql
SELECT id, email, name, is_admin, is_premium, created_at 
FROM public.users 
WHERE email = 'admin@socialstoryai.com';
```

You should see:
- ✅ is_admin = true
- ✅ is_premium = true
- ✅ name = Admin

### 4. Login to Your App

1. Open your app in web browser
2. Click "Sign In"
3. Enter:
   - Email: `admin@socialstoryai.com`
   - Password: Your password from step 1
4. Click "Sign In"
5. Navigate to `/admin` to access admin panel

## Troubleshooting

### "User not found" error

If you get this error, the user might not be in the `public.users` table. Run:

```sql
-- Get the auth user ID first
SELECT id FROM auth.users WHERE email = 'admin@socialstoryai.com';

-- Then insert into users table (replace UUID with actual ID from above)
INSERT INTO public.users (id, email, name, is_premium, is_admin, stories_generated, created_at, updated_at)
VALUES (
  'YOUR_UUID_HERE', 
  'admin@socialstoryai.com', 
  'Admin', 
  true, 
  true, 
  0,
  NOW(), 
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET is_admin = true, is_premium = true, name = 'Admin', updated_at = NOW();
```

### "Invalid credentials" error

- Double-check the password you entered
- Make sure you checked "Auto Confirm User" when creating the account
- Verify the user exists in Supabase Authentication > Users

### Can't access admin panel

Run this to ensure admin flag is set:

```sql
UPDATE public.users SET is_admin = true WHERE email = 'admin@socialstoryai.com';
```

## Security Reminder

🔒 **Change your password immediately after first login!**

Go to Settings > Change Password after logging in.

---

For more detailed information, see `ADMIN-SETUP.md` and `TESTING-GUIDE.md`.
