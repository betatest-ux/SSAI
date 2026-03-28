# Supabase Setup Guide

This guide will help you set up Supabase for your SocialStoryAI application with authentication (including Google OAuth) and database.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Google Cloud Console account for OAuth setup

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: SocialStoryAI (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be created (2-3 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Set Up the Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `database/supabase-schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" to execute the schema
6. You should see "Success. No rows returned" message

This will create all the necessary tables, RLS policies, triggers, and default data.

## Step 4: Create Admin User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Enter admin credentials:
   - **Email**: `admin@socialstoryai.com` (or your preferred email)
   - **Password**: Set a secure password
   - Check "Auto Confirm User"
4. Click "Create user"
5. Go back to **SQL Editor** and run this query to make the user an admin:

```sql
UPDATE public.users 
SET is_admin = true, is_premium = true 
WHERE email = 'admin@socialstoryai.com';
```

## Step 5: Configure Google OAuth

### 5.1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**
4. Click "Create Credentials" → "OAuth client ID"
5. If prompted, configure the OAuth consent screen first:
   - User Type: External (or Internal for workspace)
   - App name: SocialStoryAI
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed

### 5.2. Create OAuth Clients

You'll need to create **three** OAuth client IDs for different platforms:

#### Web Client ID
1. Application type: **Web application**
2. Name: `SocialStoryAI Web`
3. Authorized JavaScript origins:
   - `http://localhost:8081`
   - `https://your-domain.com` (if you have a domain)
4. Authorized redirect URIs:
   - `https://[YOUR-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback`
   - `http://localhost:8081/auth/callback` (for development)
5. Click "Create"
6. **Save the Client ID** (you'll need this)

#### iOS Client ID
1. Application type: **iOS**
2. Name: `SocialStoryAI iOS`
3. Bundle ID: Your app's bundle ID (found in `app.json` under `ios.bundleIdentifier`)
4. Click "Create"
5. **Save the Client ID**

#### Android Client ID
1. Application type: **Android**
2. Name: `SocialStoryAI Android`
3. Package name: Your app's package name (found in `app.json` under `android.package`)
4. SHA-1 certificate fingerprint:
   - For development: Run `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`
   - For production: Use your release keystore fingerprint
5. Click "Create"
6. **Save the Client ID**

### 5.3. Configure Supabase for Google OAuth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find "Google" and enable it
3. Enter your **Web Client ID** in the "Client ID" field
4. Enter your **Web Client Secret** in the "Client Secret" field (from Google Console)
5. Click "Save"

## Step 6: Configure Environment Variables

You'll need to add these environment variables. You can request them in the app by clicking below:

### Required Environment Variables:
- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: Google OAuth Web Client ID
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`: Google OAuth iOS Client ID (optional, for iOS)
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`: Google OAuth Android Client ID (optional, for Android)

### Optional API Keys (configure these in Admin Panel after logging in):
- OpenAI API Key (for AI story generation)
- Google Gemini API Key (alternative to OpenAI)
- Stripe API Keys (for payments)
- Mail server settings (for email notifications)

## Step 7: Test Your Setup

1. Start your app: `npm start` or `yarn start`
2. Open the app in your browser or mobile device
3. Try to register a new account
4. Try logging in with your credentials
5. Try "Continue with Google" button
6. Log in as admin and verify you can access the admin panel

## Step 8: Configure Row Level Security (RLS)

The schema already includes RLS policies, but verify they're enabled:

1. Go to **Database** → **Tables**
2. For each table (users, stories, contact_requests, etc.):
   - Click on the table
   - Check that "Enable RLS" is turned on
   - Review the policies under "Policies" tab

## Troubleshooting

### Google Login Not Working
- Verify all redirect URIs are correctly configured in Google Console
- Check that the Supabase callback URL is added to Google Console
- Ensure you're using the Web Client ID in Supabase settings
- Check browser console for error messages

### Database Connection Issues
- Verify your Supabase URL and anon key are correct
- Check that RLS policies are properly configured
- Review the SQL editor for any schema creation errors

### User Creation Fails
- Check that the `handle_new_user()` trigger is working
- Verify the users table has proper constraints
- Review Supabase logs under **Database** → **Logs**

## Security Best Practices

1. **Never commit** your Supabase credentials to git
2. Use **environment variables** for all sensitive data
3. Keep your **anon key public** - it's safe, RLS protects your data
4. **Never expose** your service role key in client code
5. Regularly review **RLS policies** to ensure data protection
6. Enable **email confirmation** in production (Auth settings)
7. Set up **rate limiting** in Supabase Edge Functions if needed
8. Configure **CAPTCHA** for auth forms in production

## Production Checklist

Before going live:

- [ ] Enable email confirmation in Supabase Auth settings
- [ ] Set up custom email templates
- [ ] Configure custom domain for Supabase
- [ ] Set up proper OAuth redirect URLs for your domain
- [ ] Enable MFA (Multi-Factor Authentication) option
- [ ] Set up database backups
- [ ] Configure monitoring and alerts
- [ ] Review and test all RLS policies
- [ ] Set up proper error tracking
- [ ] Configure rate limiting
- [ ] Test all authentication flows
- [ ] Review security headers and CORS settings

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Need Help?

If you encounter any issues:
1. Check Supabase logs: **Database** → **Logs**
2. Review auth logs: **Authentication** → **Logs**
3. Visit Supabase Discord: https://discord.supabase.com
4. Check GitHub issues: https://github.com/supabase/supabase
