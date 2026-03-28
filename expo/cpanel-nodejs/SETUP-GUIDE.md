# SocialStoryAI Backend - cPanel Node.js Setup Guide

This directory contains a standalone Node.js backend that can be deployed to cPanel hosting with Node.js support.

## 📋 Prerequisites

Before you begin, ensure you have:

1. **cPanel Hosting Account** with Node.js support (Node.js 18 or higher)
2. **Supabase Account** and project set up (see database setup section)
3. **Domain or Subdomain** configured for the API
4. **SSH Access** (recommended) or File Manager access

## 🚀 Quick Start

### Step 1: Prepare Your Files

1. **Upload Files to cPanel**
   - Compress the `cpanel-nodejs` folder into a ZIP file
   - Log in to cPanel > File Manager
   - Navigate to your desired directory (e.g., `/home/username/api`)
   - Upload and extract the ZIP file

   **Or via SSH:**
   ```bash
   cd /home/username
   mkdir api
   cd api
   # Upload files via SCP/SFTP or git clone
   ```

### Step 2: Install Dependencies

1. **Via cPanel Terminal** (if available):
   ```bash
   cd /home/username/api/cpanel-nodejs
   npm install
   ```

2. **Or via SSH:**
   ```bash
   cd /home/username/api/cpanel-nodejs
   npm install
   ```

### Step 3: Configure Environment Variables

1. Create a `.env` file in the `cpanel-nodejs` directory:

```bash
# Required - Generate a secure secret
JWT_SECRET=your_generated_secret_here_min_32_chars

# Required - Your Supabase credentials
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Required - CORS configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional - Email configuration (for contact form)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_EMAIL=noreply@yourdomain.com
MAIL_FROM_NAME=SocialStoryAI

# Optional - Server configuration
PORT=3000
NODE_ENV=production
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Setup Node.js Application in cPanel

1. **Access Node.js Selector:**
   - Log in to cPanel
   - Find "Setup Node.js App" or "Node.js Selector"

2. **Create New Application:**
   - **Node.js Version**: Select 18.x or higher
   - **Application Mode**: Production
   - **Application Root**: `/home/username/api/cpanel-nodejs`
   - **Application URL**: Your domain or subdomain (e.g., `api.yourdomain.com`)
   - **Application Startup File**: `server.js`
   - **Environment Variables**: Add all variables from your `.env` file

3. **Configure Application:**
   - Click "Create"
   - Copy the command to enter the virtual environment
   - Run `npm install` in the application directory

### Step 5: Start the Application

1. **Via cPanel Interface:**
   - In Node.js Selector, find your application
   - Click "Start" or "Restart"

2. **Via Terminal:**
   ```bash
   cd /home/username/api/cpanel-nodejs
   npm start
   ```

3. **Set Auto-Restart (Optional):**
   - Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name socialstoryai-api
   pm2 save
   pm2 startup
   ```

### Step 6: Configure Domain/Subdomain

1. **In cPanel > Domains:**
   - Add a subdomain (e.g., `api.yourdomain.com`)
   - Point it to your Node.js application port

2. **Or use .htaccess** for proxying:
   Create `.htaccess` in your public_html/api directory:
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
   ```

### Step 7: Verify Installation

1. **Test Health Endpoint:**
   ```bash
   curl https://api.yourdomain.com/health
   ```

   Expected response:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "timestamp": "2025-01-01T00:00:00.000Z",
     "environment": "production"
   }
   ```

2. **Test API Root:**
   ```bash
   curl https://api.yourdomain.com/
   ```

   Expected response:
   ```json
   {
     "status": "ok",
     "message": "SocialStoryAI API is running",
     "version": "1.0.0",
     "endpoints": {
       "health": "/health",
       "api": "/api/trpc"
     }
   }
   ```

## 🗄️ Database Setup

### Supabase Configuration

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Save your project URL and API keys

2. **Run Database Schema:**
   - In Supabase Dashboard > SQL Editor
   - Execute the schema from `database/supabase-schema.sql` (from your main project)

3. **Create Admin User:**
   - In Supabase Dashboard > Authentication > Users
   - Create a user with your admin email
   - In SQL Editor, run:
   ```sql
   UPDATE public.users 
   SET is_admin = true, is_premium = true 
   WHERE email = 'your-admin@email.com';
   ```

## 🔧 Configuration

### Port Configuration

If port 3000 is in use, you can change it:
1. Update `PORT` in your `.env` file
2. Update cPanel Node.js app settings
3. Restart the application

### SSL/HTTPS Setup

1. **Via cPanel:**
   - Use cPanel's SSL/TLS manager
   - Install Let's Encrypt certificate
   - Force HTTPS redirect

2. **Update CORS:**
   - Ensure `ALLOWED_ORIGINS` uses `https://` URLs

### Email Configuration

For Gmail:
1. Enable 2-Factor Authentication
2. Generate an App Password
3. Use the app password in `MAIL_PASSWORD`

For Other Providers:
- Update `MAIL_HOST`, `MAIL_PORT`, and `MAIL_SECURE`
- Check provider documentation for SMTP settings

## 📱 Connect Your Frontend

Update your frontend app's API endpoint:

**In your main project's `.env` or environment config:**
```
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

**In your tRPC client (`lib/trpc.ts`):**
```typescript
const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: process.env.EXPO_PUBLIC_API_URL 
        ? `${process.env.EXPO_PUBLIC_API_URL}/api/trpc`
        : 'http://localhost:8081/api/trpc',
    }),
  ],
});
```

## 🔍 Troubleshooting

### Application Won't Start

1. **Check logs:**
   ```bash
   cd /home/username/api/cpanel-nodejs
   cat logs/error.log
   ```

2. **Verify Node.js version:**
   ```bash
   node --version  # Should be 18.x or higher
   ```

3. **Check environment variables:**
   ```bash
   node -e "console.log(process.env)"
   ```

### Database Connection Errors

1. **Verify Supabase credentials:**
   - Check URL and keys in `.env`
   - Test connection in Supabase Dashboard

2. **Check network access:**
   - Ensure cPanel server can reach Supabase
   - Check firewall settings

### CORS Errors

1. **Update ALLOWED_ORIGINS:**
   - Include all domains that will access the API
   - Use comma-separated list

2. **Check headers:**
   - Verify frontend sends correct Origin header

### Port Already in Use

1. **Change port in `.env`:**
   ```
   PORT=3001
   ```

2. **Update cPanel app configuration**

3. **Restart application**

## 📊 Monitoring

### View Logs

**Via SSH:**
```bash
tail -f /home/username/api/cpanel-nodejs/logs/error.log
tail -f /home/username/api/cpanel-nodejs/logs/access.log
```

**Via cPanel:**
- Node.js Selector > Your App > View Logs

### Check Application Status

```bash
curl https://api.yourdomain.com/health
```

### Monitor with PM2

```bash
pm2 status
pm2 logs socialstoryai-api
pm2 monit
```

## 🔒 Security Best Practices

1. **Use Strong JWT_SECRET:**
   - At least 64 characters
   - Generated randomly
   - Never commit to version control

2. **Limit CORS Origins:**
   - Only allow your domains
   - Never use `*` in production

3. **Use HTTPS:**
   - Install SSL certificate
   - Force HTTPS redirects

4. **Keep Dependencies Updated:**
   ```bash
   npm audit
   npm update
   ```

5. **Secure Environment Variables:**
   - Never expose `.env` file
   - Use cPanel's environment variable management

## 📝 Maintenance

### Update Dependencies

```bash
cd /home/username/api/cpanel-nodejs
npm update
npm audit fix
```

### Restart Application

**Via cPanel:**
- Node.js Selector > Your App > Restart

**Via SSH:**
```bash
pm2 restart socialstoryai-api
```

### Backup

1. **Database:** Use Supabase's backup features
2. **Code:** Keep in version control (Git)
3. **Environment:** Backup `.env` file securely

## 🆘 Support

For issues:
1. Check the troubleshooting section above
2. Review application logs
3. Verify all environment variables are set correctly
4. Ensure Supabase connection is working
5. Check cPanel's Node.js version compatibility

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [tRPC Documentation](https://trpc.io/docs)
- [Hono Documentation](https://hono.dev/)

---

**Version:** 1.0.0  
**Last Updated:** January 2025
