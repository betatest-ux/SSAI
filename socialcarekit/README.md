# SocialCareKit

A resource platform for the UK social care workforce — children's services
(Ofsted) and adult social care (CQC). Free client-side tools, a downloadable
template library, plain-English practice guides, a staff-rights section, and
a full CMS/admin panel. Built for standard LAMP shared hosting: plain PHP
8.2+, MySQL, no Composer/Node/build step on the server.

## Layout

```
app/            Front controller core, controllers, views (PHP templates)
config/         config.sample.php → copy to config.php (never committed)
database/       schema.sql, seed.sql, and the JSON seed-content sources
public/         Web root: index.php, .htaccess, assets, setup.php
scripts/        CLI: build_seed.php (regenerate seed.sql),
                generate_templates.py (regenerate DOCX files),
                backup.php (nightly cron backup)
storage/        OUTSIDE web root: template files, page cache, backups, logs
build/          Dev-only helpers (PHP built-in server router)
```

## Key design decisions

- **Privacy by architecture.** Every interactive tool runs 100% client-side;
  nothing typed into a tool is transmitted or stored. Analytics is an
  aggregate per-day page-view counter — no cookies, no consent banner needed.
- **Template files live outside the web root** and are served via
  `/download/{slug}/` for download counting and hotlink prevention.
- **General document manager** (admin → Documents): upload files up to the
  server limit (shipped config raises it to 256 MB), organise them into
  admin-managed categories, and link to them anywhere at `/files/{slug}/`.
  Downloads stream in 1 MB chunks with HTTP Range/resume support, so large
  files never hit PHP memory or execution limits.
- **Annual legal updates need no deploy:** NMW rates, WTR parameters and
  review dates are managed in the admin panel (Rates & rules).
- **Page cache** is file-based with purge-on-publish (shared hosting has no
  Redis); sitemap.xml regenerates automatically on publish/unpublish.
- **Styling** is a single hand-written design-system stylesheet
  (`public/assets/css/site.css`) — tokens, components, print styles, WCAG AA
  focus states — shipped ready-built so the server needs no tooling.

## Test drive with Docker (easiest)

With [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed:

```bash
git clone https://github.com/betatest-ux/socialcarekit
cd socialcarekit
docker compose up --build
```

Then open **http://localhost:8080** — the database imports itself (all
templates, guides, acronyms and rates included). Create your admin login at
**http://localhost:8080/setup.php**, then explore the admin panel at
`/admin/`. Stop with Ctrl-C; `docker compose down -v` resets the database.
Upload limits match production (256 MB). Emails are not sent in this
environment (newsletter confirmation links can be taken from the
`newsletter_subscribers` table if you want to test that flow).

## Local development

```bash
# MySQL: create db `socialcarekit`, import database/schema.sql + seed.sql
cp config/config.sample.php config/config.php   # fill in DB creds, env=development
php -S 127.0.0.1:8090 -t public build/dev-router.php
# visit http://127.0.0.1:8090/setup.php to create the first admin
```

Regenerating derived artefacts:

```bash
php scripts/build_seed.php          # JSON seed-content → database/seed.sql
python3 scripts/generate_templates.py   # rebuild the DOCX/XLSX template files
```

## Deployment

See **DEPLOY.md** (upload layout, DB import, config, permissions, first
admin, cron backup, SPF/DKIM) and **LAUNCH-CHECKLIST.md** (go-live checks
and the content review calendar).
