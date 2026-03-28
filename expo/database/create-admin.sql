-- Create Default Admin Account for SocialStoryAI
-- Run this in your Supabase SQL Editor AFTER creating the admin user in Supabase Auth

-- Step 1: First, create the user in Supabase Dashboard:
-- Go to Authentication > Users > Add User
-- Email: admin@socialstoryai.com
-- Password: Choose a secure password (e.g., Admin123!@#)
-- Auto-confirm user: YES

-- Step 2: After creating the user, run this SQL to make them admin:
-- Replace 'USER_ID_HERE' with the actual user ID from Supabase Auth

-- Make user admin and premium
UPDATE public.users 
SET 
  is_admin = true,
  is_premium = true,
  name = 'Admin',
  updated_at = NOW()
WHERE email = 'admin@socialstoryai.com';

-- Verify the admin user was created correctly
SELECT id, email, name, is_admin, is_premium, created_at 
FROM public.users 
WHERE email = 'admin@socialstoryai.com';

-- If the above doesn't work (user not in users table yet), you can manually insert:
-- First get the auth.users id:
-- SELECT id FROM auth.users WHERE email = 'admin@socialstoryai.com';

-- Then insert into users table (replace UUID_FROM_ABOVE with actual ID):
-- INSERT INTO public.users (id, email, name, is_premium, is_admin, created_at, updated_at)
-- VALUES ('UUID_FROM_ABOVE', 'admin@socialstoryai.com', 'Admin', true, true, NOW(), NOW())
-- ON CONFLICT (id) DO UPDATE
-- SET is_admin = true, is_premium = true, name = 'Admin', updated_at = NOW();
