<?php
/** @var string $content */
/** @var array $meta */
$banner = App\Core\Settings::get('site_banner');
?>
<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($meta['title']) ?><?= str_contains($meta['title'], 'SocialCareKit') ? '' : ' — SocialCareKit' ?></title>
<?php if (!empty($meta['description'])): ?>
<meta name="description" content="<?= e($meta['description']) ?>">
<?php endif; ?>
<?php if (!empty($meta['robots'])): ?>
<meta name="robots" content="<?= e($meta['robots']) ?>">
<?php endif; ?>
<link rel="canonical" href="<?= e($meta['canonical']) ?>">
<meta property="og:site_name" content="SocialCareKit">
<meta property="og:type" content="website">
<meta property="og:title" content="<?= e($meta['og_title'] ?? $meta['title']) ?>">
<meta property="og:description" content="<?= e($meta['og_description'] ?? $meta['description']) ?>">
<meta property="og:url" content="<?= e($meta['canonical']) ?>">
<?php if (!empty($meta['og_image'])): ?>
<meta property="og:image" content="<?= e($meta['og_image']) ?>">
<?php endif; ?>
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/site.css">
<?php foreach ($meta['schema'] as $schema): ?>
<script type="application/ld+json"><?= json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?></script>
<?php endforeach; ?>
<?= $meta['extra_head'] ?>
</head>
<body class="<?= e($meta['body_class']) ?>">
<a class="skip-link" href="#main">Skip to main content</a>

<?php if ($banner): ?>
<div class="site-banner" role="region" aria-label="Site notice"><?= e($banner) ?></div>
<?php endif; ?>

<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="SocialCareKit home">
      <svg class="brand-mark" width="34" height="34" viewBox="0 0 34 34" aria-hidden="true" focusable="false"><rect width="34" height="34" rx="8" fill="#0f5257"/><path d="M17 8c-3 3.2-7 3.8-7 8.2 0 4.8 3.4 8.3 7 9.8 3.6-1.5 7-5 7-9.8C24 11.8 20 11.2 17 8z" fill="#f4a259"/><circle cx="17" cy="17" r="3" fill="#fff"/></svg>
      <span class="brand-name">SocialCare<span class="brand-accent">Kit</span></span>
    </a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav" data-nav-toggle>
      <span class="visually-hidden">Menu</span>
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Main">
      <ul>
        <li><a href="/tools/"<?= str_starts_with(request_path(), '/tools') ? ' aria-current="page"' : '' ?>>Tools</a></li>
        <li><a href="/templates/"<?= str_starts_with(request_path(), '/templates') ? ' aria-current="page"' : '' ?>>Templates</a></li>
        <li><a href="/guides/"<?= str_starts_with(request_path(), '/guides') ? ' aria-current="page"' : '' ?>>Guides</a></li>
        <li><a href="/rights/"<?= str_starts_with(request_path(), '/rights') ? ' aria-current="page"' : '' ?>>Your rights</a></li>
        <li><a href="/story-builder/"<?= str_starts_with(request_path(), '/story-builder') ? ' aria-current="page"' : '' ?>>Story Builder</a></li>
      </ul>
      <form class="header-search" action="/search/" method="get" role="search">
        <label class="visually-hidden" for="header-q">Search the site</label>
        <input type="search" id="header-q" name="q" placeholder="Search tools, templates, guides…" required>
        <button type="submit" aria-label="Search"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.5-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
      </form>
    </nav>
  </div>
</header>

<?php if (!empty($meta['breadcrumbs'])): ?>
<nav class="breadcrumbs" aria-label="Breadcrumb">
  <div class="container">
    <ol>
      <?php foreach ($meta['breadcrumbs'] as $i => [$label, $url]): ?>
        <?php if ($i === count($meta['breadcrumbs']) - 1): ?>
          <li aria-current="page"><?= e($label) ?></li>
        <?php else: ?>
          <li><a href="<?= e($url) ?>"><?= e($label) ?></a></li>
        <?php endif; ?>
      <?php endforeach; ?>
    </ol>
  </div>
</nav>
<?php endif; ?>

<main id="main">
<?= $content ?>
</main>

<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <p class="footer-brand">SocialCare<span class="brand-accent">Kit</span></p>
      <p class="footer-small">Free tools, templates and plain-English guidance for the UK social care workforce — children's and adult services.</p>
      <p class="footer-small">Content is reviewed on a rolling schedule; every tool and template shows its last-reviewed date. Guidance only — not legal or clinical advice.</p>
    </div>
    <nav aria-label="Footer — resources">
      <h2 class="footer-heading">Resources</h2>
      <ul>
        <li><a href="/tools/">Interactive tools</a></li>
        <li><a href="/templates/">Template library</a></li>
        <li><a href="/guides/">Practice guides</a></li>
        <li><a href="/rights/">Staff rights &amp; career</a></li>
        <li><a href="/story-builder/">Visual Story Builder</a></li>
      </ul>
    </nav>
    <nav aria-label="Footer — site">
      <h2 class="footer-heading">Site</h2>
      <ul>
        <li><a href="/about/">About</a></li>
        <li><a href="/contact/">Contact &amp; feedback</a></li>
        <li><a href="/report-error/">Report an error in a tool</a></li>
        <li><a href="/privacy/">Privacy</a></li>
        <li><a href="/terms/">Terms of use</a></li>
        <li><a href="/disclaimer/">Disclaimer</a></li>
      </ul>
    </nav>
  </div>
  <div class="container footer-bottom">
    <p>&copy; <?= date('Y') ?> SocialCareKit. Not affiliated with or endorsed by Ofsted, the CQC, or Carol Gray / Social Stories™.</p>
  </div>
</footer>
<script src="/assets/js/site.js" defer></script>
<script src="/assets/js/site-animate.js" defer></script>
</body>
</html>
