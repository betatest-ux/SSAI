# Fix Supabase Schema Issues

If you're getting errors like "Could not find the table 'public.users' in the schema cache", follow these steps:

## Step 1: Verify Schema in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the verification script in `database/verify-schema.sql`

## Step 2: Apply Schema (if not exists)

1. In Supabase SQL Editor, open a new query
2. Copy the entire contents of `database/supabase-schema.sql`
3. Paste and run it
4. Wait for it to complete (should take a few seconds)

## Step 3: Verify RLS Policies

1. Go to **Authentication** > **Policies**
2. Ensure policies are enabled for the `users` table
3. Check that the service role key is configured (not the anon key in backend)

## Step 4: Check Environment Variables

Make sure these are set:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (backend only, keep secret!)

**IMPORTANT:** The backend needs the SERVICE_ROLE_KEY to bypass RLS policies for user creation.

## Step 5: Create Test Admin Account

After schema is applied, create an admin account:

1. Go to **Authentication** > **Users**
2. Click **Add user**
3. Enter:
   - Email: `admin@test.com`
   - Password: `Admin123!`
   - Auto Confirm User: **✓ Yes**
4. Click **Create user**
5. Copy the user ID
6. Go to **SQL Editor** and run:

```sql
UPDATE public.users 
SET is_admin = true, is_premium = true 
WHERE id = 'PASTE_USER_ID_HERE';
```

## Step 6: Test Registration

1. Try registering a new account in the app
2. Check **Authentication** > **Users** to see if the auth user was created
3. Check **Table Editor** > **users** to see if the profile was created
4. If profile wasn't created, the trigger may not be working

## Troubleshooting

### Users table not being created after signup

If the trigger isn't working:

```sql
-- Check trigger
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Recreate trigger if needed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### RLS Policy Issues

If you get permission errors, temporarily disable RLS for testing:

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

Then try to create a user. If it works, the issue is with RLS policies.
Re-enable RLS and check the policies in the schema.

### Service Role Key

Make sure you're using the SERVICE ROLE KEY (not the anon key) in your backend:
- It should be set in your environment as `SUPABASE_SERVICE_ROLE_KEY`
- Check `backend/db/connection.ts` line 5

## Login Issues

After fixing the schema, login should work with:
- **Email:** admin@test.com
- **Password:** Admin123!

Or create a new account via the registration form.
