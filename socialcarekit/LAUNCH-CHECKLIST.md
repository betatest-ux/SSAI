# SocialCareKit — Launch checklist

Work through this in order. Everything in DEPLOY.md must be done first.

## 1. DNS + HTTPS

- [ ] Domain A/AAAA (or Cloudflare proxied) records point at the host
- [ ] `www` → apex (or vice versa) redirect works and lands on HTTPS
- [ ] Certificate valid (padlock, no mixed-content warnings on any page)
- [ ] If Cloudflare: SSL mode **Full (strict)**; caching level standard; no
      Rocket Loader (it can break inline tool JS)
- [ ] `http://` URLs 301 to `https://` (test with `curl -I`)

## 2. Email

- [ ] SPF record present (`dig TXT yourdomain`)
- [ ] DKIM record present and passing
- [ ] DMARC record present
- [ ] Contact form → message arrives in admin inbox AND notification email arrives
- [ ] Newsletter signup → confirmation email arrives, confirm link works,
      unsubscribe link in the flow works
- [ ] Admin "forgotten password" email arrives

## 3. Search engines

- [ ] `https://yourdomain/sitemap.xml` loads and lists tools, templates, guides
- [ ] `https://yourdomain/robots.txt` loads; disallows `/admin/`; sitemap line points at the live domain (edit in *Admin → SEO* if it still shows a placeholder)
- [ ] Google Search Console: add property (domain-level), verify via DNS,
      submit the sitemap
- [ ] Bing Webmaster Tools: import from GSC or verify, submit the sitemap
- [ ] Spot-check 3 pages with a rich-results tester (FAQ schema on tool
      pages, Article schema on a guide, BreadcrumbList sitewide)

## 4. Test every tool on mobile (real phone, not just devtools)

- [ ] Sleep-in checker — calculation, PASS and BREACH paths, print output
- [ ] Holiday calculator — all three modes, leaver dates validation
- [ ] WTR checker — overnight shift (e.g. 21:00–09:00), RAG output, print
- [ ] Notification tool — one Ofsted path, one CQC path, print decision record
- [ ] Acronym decoder — search, sector filters, deep link `?q=LADO`
- [ ] Body map — place/remove markers, initials warning, print layout shows
      markers and details, leaving-page warning fires
- [ ] Visual timer — full screen on a tablet, countdown colour shift, chime,
      swap button; airplane mode after first load (PWA offline)
- [ ] Training matrix — add staff/course, RAG dates, CSV export + re-import,
      data survives browser restart
- [ ] Every tool page shows the "runs entirely in your browser" notice and a
      last-reviewed date

## 5. Test every template download

- [ ] Each of the 31 templates downloads and opens in Word/Excel
      (spot-check at least one per category; the DoLS tracker is XLSX)
- [ ] Download counts increment (admin dashboard)
- [ ] Filters on /templates/ (regulator + category) behave

## 6. Backups

- [ ] Cron job created; next morning `storage/backups/` contains
      `db-YYYY-MM-DD.sql.gz` (visible in *Admin → Backup & maintenance*)
- [ ] One-click .sql export downloads and re-imports into a scratch DB
- [ ] Restore drill: confirm you know the steps (import export via phpMyAdmin)

## 7. Security

- [ ] `/setup.php` deleted from the server
- [ ] Admin 2FA enabled for every admin account
- [ ] Wrong password 6× → lockout message appears
- [ ] `securityheaders.com` scan: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy all present
- [ ] `config.php` not reachable over HTTP (try the URL directly)
- [ ] `storage/` not reachable over HTTP

## 8. Accessibility spot-check

- [ ] Keyboard-only run through one tool end to end (visible focus everywhere)
- [ ] Zoom to 200% — nothing overlaps or disappears
- [ ] A screen reader announces tool results (aria-live) on one tool
- [ ] Reduced motion: timer still usable with animations off

## 9. Content review calendar

All seeded content carries a review-due date 12 months out; the admin
*Review queue* surfaces anything due within 30 days. Diary these fixed
points as well:

| When | What |
|---|---|
| Late Nov (Budget) | New NMW/NLW rates announced — prepare |
| 1 April | Enter new NMW rates in *Rates & rules* (effective 1 April); update the site banner |
| April | Statutory payment/tribunal limit changes — review /rights/ articles |
| Sept | KCSIE update lands — review safeguarding-adjacent guides |
| Rolling | Ofsted/CQC framework changes — review inspection guides, notification tool |
| Monthly | Check *Review queue* + *Site searches → no results* for content gaps |

## 10. Final

- [ ] 404 page shows search + popular tools
- [ ] Maintenance mode: toggle on, check public 503 holding page, toggle off
- [ ] Site banner set (e.g. "New: free training matrix tracker")
- [ ] Uptime monitor pointed at `/health/` (expects body `ok`)
