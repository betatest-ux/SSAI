# Deploying SocialCareKit to shared hosting (cPanel-style)

The site is plain PHP 8.2+ with MySQL. No Composer, no Node, no build step
on the server — everything deploys by FTP/File Manager upload.

## What you need from your host

- PHP 8.2 or newer with extensions: `pdo_mysql`, `mbstring`, `fileinfo`, `zip`, `zlib` (all standard on cPanel)
- One MySQL 5.7+ / MariaDB 10.3+ database
- Apache with `mod_rewrite` (standard)
- Ability to add a cron job (for nightly backups)

## 1. Directory layout on the server

Upload the project so that **only `public/` is inside the web root**:

```
/home/YOURUSER/
├── socialcarekit/          ← everything EXCEPT public/
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── scripts/
│   └── storage/            ← template files, cache, backups, logs (NOT web-accessible)
└── public_html/            ← the CONTENTS of public/ go here
    ├── index.php
    ├── .htaccess
    ├── robots.txt
    ├── setup.php
    └── assets/
```

After uploading, edit **one line** in `public_html/index.php` so it can find the app:

```php
require dirname(__DIR__) . '/socialcarekit/app/bootstrap.php';
```

(If your host lets you point the document root at `socialcarekit/public/`
instead, do that and skip the edit — it's the cleaner setup.)

## 2. Create the database

1. cPanel → *MySQL Databases*: create a database and a user, grant the user **all privileges** on it.
2. phpMyAdmin → select the database → *Import* → upload `database/schema.sql`.
3. Then *Import* → upload `database/seed.sql` (articles, templates, acronyms, NMW rates, default settings).

## 3. Configure

1. Copy `config/config.sample.php` to `config/config.php`.
2. Fill in: DB host/name/user/password, `base_url` (e.g. `https://socialcarekit.com` — no trailing slash), the mail addresses, and a fresh `app_key`:
   ```
   php -r "echo bin2hex(random_bytes(32));"
   ```
   (or any 64 random hex characters).
3. `config.php` lives outside the web root in this layout, so it is never
   downloadable. **Never** commit it to version control — `.gitignore` already excludes it.

## 4. File permissions

- Directories `storage/`, `storage/cache/pages/`, `storage/logs/`, `storage/backups/`, `storage/templates/files/`: writable by PHP (usually `755` is enough on suPHP/LSAPI hosts; use `775` only if your host runs PHP as a different user).
- `public_html/` needs PHP write access for `sitemap.xml` and `robots.txt` (admin panel writes them).
- Everything else: `644` files / `755` directories.

## 5. First admin user

1. Visit `https://yourdomain/setup.php`.
2. Create the admin account (12+ character password).
3. The script writes `storage/setup.lock` and refuses to run again. Delete
   `public_html/setup.php` afterwards for belt and braces.
4. Log in at `/admin/login/` and enable two-factor authentication under
   *Users & audit → My two-factor settings*.

## 6. HTTPS

`.htaccess` force-redirects HTTP→HTTPS. Issue a certificate first
(cPanel → *SSL/TLS Status* → AutoSSL, or Let's Encrypt). If you use
Cloudflare in front, set SSL mode to **Full (strict)** — Cloudflare is
DNS/CDN only; the site has no dependency on it.

## 7. Cron jobs

Nightly database backup (14-day rotation, stored outside the web root):

```
30 2 * * * /usr/local/bin/php /home/YOURUSER/socialcarekit/scripts/backup.php >/dev/null 2>&1
```

(Adjust the PHP binary path to your host — cPanel shows it in *Cron Jobs*.
`ea-php82` style binaries also work.)

## 8. Email (SPF/DKIM)

Transactional mail (contact notifications, newsletter double opt-in,
password resets) sends through the host MTA by default, or SMTP if you fill
in the `smtp_*` config values.

For deliverability:

- **SPF:** add/extend the TXT record on your domain, e.g.
  `v=spf1 +a +mx include:YOURHOST.example ~all` (cPanel → *Email Deliverability* shows the exact value).
- **DKIM:** enable in cPanel → *Email Deliverability* → *Repair* / copy the
  DKIM TXT record to DNS (if DNS is at Cloudflare, paste it there).
- **DMARC (recommended):** TXT at `_dmarc` — `v=DMARC1; p=quarantine; rua=mailto:you@yourdomain`.
- Send a test via the contact form and check the headers show `spf=pass` and `dkim=pass`.

## 9. Large uploads (document manager)

The admin *Documents* section accepts files up to the server's PHP limits.
The repo ships both mechanisms for raising them to **256 MB**:

- `public/.user.ini` — used when PHP runs as CGI/FastCGI/LSAPI (the default
  on cPanel). Changes apply within ~5 minutes. Raise the values here if you
  need more than 256 MB.
- `public/.htaccess` `<IfModule mod_php.c>` block — used only on mod_php hosts.

Verify the effective limit in the admin panel: *Documents → Upload document*
shows "Server upload limit" (it reads the live PHP configuration). If it
still shows 2M/8M after deploying:

1. cPanel → *Select PHP Version* → *Options*: set `upload_max_filesize`,
   `post_max_size`, `max_execution_time` (300), `max_input_time` (600) there —
   some hosts override `.user.ini`.
2. Hosts with ModSecurity/LiteSpeed request-body caps (`SecRequestBodyLimit`,
   `LimitRequestBody`) may need a support ticket to raise them.
3. If Cloudflare proxies the site, its free-plan cap is ~100 MB per upload
   request — bypass the proxy (grey-cloud) on the admin hostname or accept
   that cap.

Timeouts: uploads honour `max_input_time` (600 s ≈ enough for 256 MB on a
slow connection); downloads of any size are safe — files stream in 1 MB
chunks with `set_time_limit(0)` and support resume (HTTP Range), so PHP
memory and execution limits never bite.

Uploaded documents live in `storage/documents/` (outside the web root) and
are served at `/files/<slug>/`. **Include this folder in your backup routine**
— the nightly job backs up the database only; add `storage/documents/` and
`storage/templates/` to your host's file backups.

## 10. Post-deploy checks

- `https://yourdomain/health/` returns `ok`
- Homepage, one tool, one template download, one guide all load
- `/admin/` → dashboard shows stats; *SEO → Rebuild sitemap.xml now* works
  (proves web-root write permission)
- An invalid URL shows the custom 404
- See `LAUNCH-CHECKLIST.md` for the full go-live list

## Updating the site later

Upload changed files over FTP. Then in the admin panel:
*Backup & maintenance → Purge page cache*. Annual legal updates (NMW rates,
WTR parameters, notification text) are done entirely in *Rates & rules* —
no file uploads needed. Take a backup (*Backup & maintenance → Download
full .sql export*) before importing anything.
