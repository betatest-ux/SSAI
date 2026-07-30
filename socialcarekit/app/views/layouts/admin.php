<?php
/** @var string $content */
/** @var array $meta */
$user = App\Core\Auth::user();
$path = request_path();
$nav = [
    '/admin/' => 'Dashboard',
    '/admin/articles/' => 'Content',
    '/admin/templates/' => 'Templates',
    '/admin/acronyms/' => 'Acronyms',
    '/admin/rates/' => 'Rates & rules',
    '/admin/review-queue/' => 'Review queue',
    '/admin/seo/' => 'SEO',
    '/admin/redirects/' => 'Redirects',
    '/admin/searches/' => 'Site searches',
    '/admin/inbox/' => 'Inbox',
    '/admin/newsletter/' => 'Newsletter',
    '/admin/site/' => 'Site settings',
];
if (($user['role'] ?? '') === 'admin') {
    $nav['/admin/users/'] = 'Users & audit';
    $nav['/admin/backup/'] = 'Backup & maintenance';
}
?>
<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= e($meta['title'] ?? 'Admin') ?> — SocialCareKit admin</title>
<link rel="stylesheet" href="/assets/css/site.css">
<style>
.admin-shell { display: grid; min-height: 100vh; grid-template-columns: 1fr; }
@media (min-width: 900px) { .admin-shell { grid-template-columns: 230px 1fr; } }
.admin-side { background: var(--c-primary-dark); color: #fff; padding: 1rem; }
.admin-side a { display: block; color: #dcebeb; text-decoration: none; padding: .45rem .6rem; border-radius: 6px; font-weight: 600; font-size: .95rem; }
.admin-side a:hover { background: rgba(255,255,255,.1); color: #fff; }
.admin-side a[aria-current="page"] { background: var(--c-accent); color: #3a2200; }
.admin-main { padding: 1.5rem; max-width: 1100px; }
.admin-table td, .admin-table th { font-size: .95rem; }
.admin-actions { display: flex; gap: .4rem; flex-wrap: wrap; }
.admin-topbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 1px solid var(--c-line); padding-bottom: .8rem; margin-bottom: 1.2rem; flex-wrap: wrap; }
.stat-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 1.5rem; }
.stat-card { background: var(--c-bg-soft); border: 1px solid var(--c-line); border-radius: 8px; padding: 1rem; }
.stat-card .n { font-size: 1.9rem; font-weight: 800; color: var(--c-primary); }
</style>
</head>
<body>
<div class="admin-shell">
  <nav class="admin-side" aria-label="Admin">
    <p style="font-weight:800;font-size:1.05rem;margin:.2rem 0 1rem">SocialCare<span class="brand-accent">Kit</span> admin</p>
    <?php if ($user && empty($_SESSION['pending_2fa'])): ?>
      <?php foreach ($nav as $url => $label): ?>
      <a href="<?= e($url) ?>"<?= ($url === '/admin/' ? $path === '/admin/' : str_starts_with($path, $url)) ? ' aria-current="page"' : '' ?>><?= e($label) ?></a>
      <?php endforeach; ?>
      <hr style="border-color:rgba(255,255,255,.2)">
      <a href="/" target="_blank" rel="noopener">View site ↗</a>
      <form method="post" action="/admin/logout/" style="margin-top:.5rem">
        <?= App\Core\Csrf::field() ?>
        <button type="submit" class="btn btn-sm btn-outline" style="width:100%">Log out (<?= e($user['name']) ?>)</button>
      </form>
    <?php endif; ?>
  </nav>
  <main class="admin-main">
    <?php foreach (flash_pull() as $f): ?>
    <div class="notice notice-<?= e($f['type']) ?>"><p><?= e($f['message']) ?></p></div>
    <?php endforeach; ?>
    <?= $content ?>
  </main>
</div>
</body>
</html>
