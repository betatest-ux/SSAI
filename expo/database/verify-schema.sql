-- Run this in Supabase SQL Editor to verify and fix your schema

-- Check if users table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
) as users_table_exists;

-- Check if trigger exists
SELECT EXISTS (
    SELECT FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
) as trigger_exists;

-- Check if function exists
SELECT EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'handle_new_user'
) as function_exists;

-- If tables don't exist, you need to run the full schema from supabase-schema.sql

-- Test creating a user profile manually (for testing):
-- First, get a user ID from auth.users
-- SELECT id FROM auth.users LIMIT 1;
-- Then try to query:
-- SELECT * FROM public.users WHERE id = 'YOUR_USER_ID';

-- If you get errors, your schema is not properly set up
-- Go to Supabase Dashboard > SQL Editor > Run supabase-schema.sql
