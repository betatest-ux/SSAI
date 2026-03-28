# Database Setup and Deployment Guide

## Overview
This application uses SQLite with better-sqlite3 for data persistence. All data is stored in a single database file with proper indexing and foreign key constraints.

## Quick Setup

### 1. Install Dependencies
```bash
bun install
```

This will install all required packages including:
- better-sqlite3 (SQLite database driver)
- bcryptjs (Password hashing)
- jsonwebtoken (Authentication tokens)

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_PATH=./database/socialstoryai.db

# JWT Secret (REQUIRED - Generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration (Optional)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# API Keys (Configure via Admin Panel)
# These can be managed through the admin interface at /admin
```

**IMPORTANT**: Generate a secure JWT secret using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Database Initialization

The database will be automatically created and initialized when you first start the server. The schema includes:

- Users table (with bcrypt password hashing)
- Stories table
- Contact requests
- Pages and page contents
- Theme settings
- Header/footer configuration
- Admin settings
- API keys (encrypted storage)
- Activity logs
- Rate limiting records
- Session tokens

### 4. Start the Server

```bash
bun start
```

The database will be created at `./database/socialstoryai.db` on first run.

### 5. Default Admin Account

A default admin account is created automatically:
- **Email**: admin@socialstoryai.com
- **Password**: admin123

⚠️ **CHANGE THIS PASSWORD IMMEDIATELY** after first login!

## Database Backup

### Manual Backup
```bash
# Copy the database file
cp database/socialstoryai.db database/socialstoryai.backup.db
```

### Automated Backup Script
Create a `backup.sh` script:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp database/socialstoryai.db "database/backups/socialstoryai_$DATE.db"
echo "Backup created: socialstoryai_$DATE.db"
```

## Deploying to a New Server

### Option 1: Fresh Installation

1. Copy your project files to the new server
2. Install dependencies: `bun install`
3. Set up environment variables
4. Start the server: `bun start`
5. Database will be created automatically

### Option 2: Migrate Existing Data

1. **On Old Server:**
   ```bash
   # Stop the application
   # Create backup
   cp database/socialstoryai.db database/export.db
   ```

2. **Transfer Database:**
   ```bash
   # Use SCP, SFTP, or your preferred method
   scp database/export.db user@newserver:/path/to/app/database/socialstoryai.db
   ```

3. **On New Server:**
   ```bash
   # Install dependencies
   bun install
   
   # Set up environment variables (copy .env file or recreate it)
   
   # Start the server
   bun start
   ```

### Option 3: Using SQL Export/Import

1. **Export Data (Old Server):**
   ```bash
   sqlite3 database/socialstoryai.db .dump > database/export.sql
   ```

2. **Import Data (New Server):**
   ```bash
   sqlite3 database/socialstoryai.db < database/export.sql
   ```

## Database Location Configuration

You can change the database location using the `DATABASE_PATH` environment variable:

```env
DATABASE_PATH=/var/lib/socialstoryai/database.db
```

Make sure the directory exists and has proper permissions:
```bash
mkdir -p /var/lib/socialstoryai
chmod 755 /var/lib/socialstoryai
```

## Security Best Practices

### 1. File Permissions
```bash
# Restrict database file access
chmod 600 database/socialstoryai.db

# Restrict directory access
chmod 700 database/
```

### 2. Environment Variables
- Never commit `.env` file to version control
- Use environment-specific configurations
- Rotate JWT secrets periodically
- Store API keys in the database (via admin panel)

### 3. Backups
- Create regular automated backups
- Store backups in a different location
- Test backup restoration regularly
- Keep at least 7 days of backups

### 4. Database Encryption
For sensitive production environments, consider:
- SQLCipher for database encryption
- Encrypted file systems
- Hardware security modules (HSM)

## Monitoring and Maintenance

### Check Database Size
```bash
ls -lh database/socialstoryai.db
```

### Vacuum Database (Optimize)
```bash
sqlite3 database/socialstoryai.db "VACUUM;"
```

### Check Database Integrity
```bash
sqlite3 database/socialstoryai.db "PRAGMA integrity_check;"
```

### View Database Stats
```bash
sqlite3 database/socialstoryai.db ".dbinfo"
```

## Troubleshooting

### Database Locked Error
- Ensure only one application instance is running
- Check for long-running transactions
- Use WAL mode (already configured)

### Permission Denied
```bash
# Fix ownership
chown -R appuser:appuser database/

# Fix permissions
chmod 700 database/
chmod 600 database/*.db
```

### Database Corruption
```bash
# Check integrity
sqlite3 database/socialstoryai.db "PRAGMA integrity_check;"

# If corrupted, restore from backup
cp database/backups/latest.db database/socialstoryai.db
```

## Production Deployment Checklist

- [ ] Generate secure JWT_SECRET
- [ ] Configure ALLOWED_ORIGINS
- [ ] Change default admin password
- [ ] Set proper file permissions
- [ ] Configure automated backups
- [ ] Set up monitoring
- [ ] Configure reverse proxy (nginx/apache)
- [ ] Enable HTTPS
- [ ] Set up firewall rules
- [ ] Configure process manager (PM2/systemd)
- [ ] Test backup restoration
- [ ] Document server access procedures

## API Keys Management

All API keys are stored encrypted in the database and can be managed through the admin panel at `/admin`:

- OpenAI API Key
- Google Gemini API Key
- Stripe Secret Key
- Stripe Publishable Key
- Google OAuth Client IDs (Web, iOS, Android)
- Mail Server Configuration

Never hardcode API keys in your codebase. Always use the admin panel to configure them.

## Support

For issues or questions:
1. Check application logs
2. Verify environment variables
3. Check database integrity
4. Review security settings
5. Contact support with log files

## Database Schema Reference

See `database/schema.sql` for complete table definitions and indexes.

Key tables:
- `users` - User accounts with bcrypt passwords
- `stories` - Generated stories
- `contact_requests` - Contact form submissions
- `pages` - CMS pages
- `admin_settings` - Application settings
- `api_keys` - Encrypted API credentials
- `activity_logs` - Audit trail
- `rate_limits` - Rate limiting records
