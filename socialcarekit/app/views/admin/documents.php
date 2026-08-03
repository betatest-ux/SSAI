<?php
function sck_filesize_h(int|string $b): string
{
    $b = (int) $b;
    if ($b >= 1073741824) return round($b / 1073741824, 2) . ' GB';
    if ($b >= 1048576) return round($b / 1048576, 1) . ' MB';
    return max(1, (int) round($b / 1024)) . ' KB';
}
?>
<div class="admin-topbar">
  <h1 style="margin:0">Documents</h1>
  <div class="admin-actions">
    <a class="btn btn-primary" href="/admin/documents/new/">+ Upload document</a>
    <a class="btn btn-outline" href="/admin/documents/categories/">Manage categories</a>
  </div>
</div>
<p>General document library: upload files, organise them into categories, and link to them anywhere on the site (or share the link directly). Files are stored outside the web root and served at <code>/files/&lt;slug&gt;/</code> with download counting.</p>

<form method="get" action="/admin/documents/" style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:flex-end;margin-bottom:1rem">
  <div>
    <label class="field-label" for="dq-cat">Category</label>
    <select id="dq-cat" name="category" onchange="this.form.submit()">
      <option value="0">All categories</option>
      <?php foreach ($categories as $c): ?>
      <option value="<?= (int) $c['id'] ?>" <?= $catFilter === (int) $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option>
      <?php endforeach; ?>
    </select>
  </div>
  <div>
    <label class="field-label" for="dq-q">Search</label>
    <input type="search" id="dq-q" name="q" value="<?= e($q) ?>" placeholder="Title or file name…">
  </div>
  <button type="submit" class="btn btn-outline btn-sm">Filter</button>
</form>

<table class="admin-table">
  <thead><tr><th>Document</th><th>Category</th><th>Type / size</th><th>Status</th><th>Downloads</th><th>Link</th><th></th></tr></thead>
  <tbody>
    <?php foreach ($documents as $d): ?>
    <tr>
      <td><?= e($d['title']) ?><br><span class="search-kind" style="text-transform:none"><?= e($d['original_name']) ?></span></td>
      <td><?= e($d['category_name'] ?? '—') ?></td>
      <td><?= e(strtoupper($d['ext'])) ?> · <?= sck_filesize_h($d['filesize']) ?></td>
      <td><span class="rag <?= $d['status'] === 'published' ? 'rag-green' : 'rag-amber' ?>"><?= e($d['status']) ?></span></td>
      <td><?= number_format((float) $d['download_count']) ?></td>
      <td>
        <button type="button" class="btn btn-sm btn-outline" data-copy-link="<?= e(base_url('/files/' . $d['slug'] . '/')) ?>">Copy link</button>
      </td>
      <td class="admin-actions">
        <a class="btn btn-sm btn-outline" href="/admin/documents/<?= (int) $d['id'] ?>/">Edit</a>
        <a class="btn btn-sm btn-ghost" href="/files/<?= e($d['slug']) ?>/" target="_blank" rel="noopener">Open ↗</a>
      </td>
    </tr>
    <?php endforeach; ?>
    <?php if (!$documents): ?><tr><td colspan="7">No documents<?= $catFilter || $q !== '' ? ' match this filter' : ' yet — upload the first one' ?>.</td></tr><?php endif; ?>
  </tbody>
</table>
<script>
document.addEventListener('click', function (ev) {
  var btn = ev.target.closest('[data-copy-link]');
  if (!btn) return;
  navigator.clipboard.writeText(btn.getAttribute('data-copy-link')).then(function () {
    var t = btn.textContent; btn.textContent = 'Copied ✓';
    setTimeout(function () { btn.textContent = t; }, 1500);
  });
});
</script>
