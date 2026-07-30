<div class="admin-topbar">
  <h1 style="margin:0">SEO manager</h1>
  <form method="post" action="/admin/sitemap/rebuild/" style="margin:0">
    <?= App\Core\Csrf::field() ?>
    <button type="submit" class="btn btn-outline btn-sm">Rebuild sitemap.xml now</button>
  </form>
</div>
<p>Per-page overrides for title, meta description, canonical and Open Graph. Pages without an override use their built-in metadata. The sitemap regenerates automatically whenever content is published or unpublished.</p>

<h2><?= $editing ? 'Edit override: ' . e($editing['path']) : 'Add a page override' ?></h2>
<form method="post" action="/admin/seo/save/">
  <?= App\Core\Csrf::field() ?>
  <div class="grid grid-2">
    <div class="form-row"><label for="seo-path">Path (e.g. /tools/body-map/)</label><input type="text" id="seo-path" name="path" required value="<?= e($editing['path'] ?? '') ?>"></div>
    <div class="form-row"><label for="seo-title">Title tag</label><input type="text" id="seo-title" name="title" value="<?= e($editing['title'] ?? '') ?>"></div>
    <div class="form-row"><label for="seo-md">Meta description</label><textarea id="seo-md" name="meta_description" rows="2" style="max-width:none"><?= e($editing['meta_description'] ?? '') ?></textarea></div>
    <div class="form-row"><label for="seo-canon">Canonical URL</label><input type="text" id="seo-canon" name="canonical" value="<?= e($editing['canonical'] ?? '') ?>" placeholder="leave blank for default"></div>
    <div class="form-row"><label for="seo-ogt">OG title</label><input type="text" id="seo-ogt" name="og_title" value="<?= e($editing['og_title'] ?? '') ?>"></div>
    <div class="form-row"><label for="seo-ogd">OG description</label><input type="text" id="seo-ogd" name="og_description" value="<?= e($editing['og_description'] ?? '') ?>"></div>
    <div class="form-row"><label for="seo-ogi">OG image URL</label><input type="text" id="seo-ogi" name="og_image" value="<?= e($editing['og_image'] ?? '') ?>"></div>
  </div>
  <button type="submit" class="btn btn-primary btn-sm">Save override</button>
</form>

<table class="admin-table">
  <thead><tr><th>Path</th><th>Title</th><th>Meta</th><th></th></tr></thead>
  <tbody>
    <?php foreach ($pages as $p): ?>
    <tr>
      <td><code><?= e($p['path']) ?></code></td>
      <td><?= e(mb_strimwidth((string) $p['title'], 0, 40, '…')) ?></td>
      <td><?= e(mb_strimwidth((string) $p['meta_description'], 0, 60, '…')) ?></td>
      <td class="admin-actions">
        <a class="btn btn-sm btn-outline" href="/admin/seo/?edit=<?= (int) $p['id'] ?>">Edit</a>
        <form method="post" action="/admin/seo/delete/" style="display:inline">
          <?= App\Core\Csrf::field() ?>
          <input type="hidden" name="id" value="<?= (int) $p['id'] ?>">
          <button type="submit" class="btn btn-sm btn-danger">Remove</button>
        </form>
      </td>
    </tr>
    <?php endforeach; ?>
    <?php if (!$pages): ?><tr><td colspan="4">No overrides yet.</td></tr><?php endif; ?>
  </tbody>
</table>

<h2>robots.txt</h2>
<form method="post" action="/admin/robots/save/">
  <?= App\Core\Csrf::field() ?>
  <div class="form-row">
    <label for="seo-robots" class="visually-hidden">robots.txt content</label>
    <textarea id="seo-robots" name="robots" rows="10" style="max-width:none;font-family:ui-monospace,monospace"><?= e($robots) ?></textarea>
  </div>
  <button type="submit" class="btn btn-primary btn-sm">Save robots.txt</button>
  <p class="form-hint">Admin routes are excluded from the sitemap automatically; keep <code>Disallow: /admin/</code> here too.</p>
</form>
