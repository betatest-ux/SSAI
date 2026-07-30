<?php
$isEdit = (bool) $a;
$legislation = $a ? implode("\n", json_decode((string) $a['key_legislation'], true) ?: []) : '';
?>
<div class="admin-topbar">
  <h1 style="margin:0"><?= $isEdit ? 'Edit article' : 'New article' ?></h1>
  <?php if ($isEdit && $a['status'] === 'published'): ?>
  <a class="btn btn-ghost" href="/<?= e($a['section']) ?>/<?= e($a['slug']) ?>/" target="_blank" rel="noopener">View live ↗</a>
  <?php endif; ?>
</div>

<form method="post" action="/admin/articles/save/">
  <?= App\Core\Csrf::field() ?>
  <input type="hidden" name="id" value="<?= (int) ($a['id'] ?? 0) ?>">
  <div class="grid grid-2">
    <div class="form-row">
      <label for="af-title">Title</label>
      <input type="text" id="af-title" name="title" required value="<?= e($a['title'] ?? '') ?>" maxlength="255" style="max-width:none">
    </div>
    <div class="form-row">
      <label for="af-slug">Slug</label>
      <input type="text" id="af-slug" name="slug" value="<?= e($a['slug'] ?? '') ?>" placeholder="auto-generated from title">
    </div>
    <div class="form-row">
      <label for="af-section">Section</label>
      <select id="af-section" name="section">
        <option value="guides" <?= ($a['section'] ?? '') === 'guides' ? 'selected' : '' ?>>Practice guides</option>
        <option value="rights" <?= ($a['section'] ?? '') === 'rights' ? 'selected' : '' ?>>Staff rights &amp; career</option>
      </select>
    </div>
    <div class="form-row">
      <label for="af-status">Status</label>
      <select id="af-status" name="status">
        <option value="draft" <?= ($a['status'] ?? 'draft') === 'draft' ? 'selected' : '' ?>>Draft</option>
        <option value="published" <?= ($a['status'] ?? '') === 'published' ? 'selected' : '' ?>>Published</option>
      </select>
    </div>
    <div class="form-row">
      <label for="af-review">Review due</label>
      <input type="date" id="af-review" name="review_due" value="<?= e($a['review_due'] ?? date('Y-m-d', strtotime('+12 months'))) ?>">
    </div>
  </div>
  <div class="form-row">
    <label for="af-meta">Meta description <span class="search-kind">(aim 120–160 chars)</span></label>
    <textarea id="af-meta" name="meta_description" rows="2" maxlength="320" style="max-width:none"><?= e($a['meta_description'] ?? '') ?></textarea>
  </div>
  <div class="form-row">
    <label for="af-summary">Summary (shown in the summary box and listings)</label>
    <textarea id="af-summary" name="summary" rows="3" style="max-width:none"><?= e($a['summary'] ?? '') ?></textarea>
  </div>
  <div class="form-row">
    <label for="af-leg">Key legislation (one per line)</label>
    <textarea id="af-leg" name="key_legislation" rows="3" style="max-width:none"><?= e($legislation) ?></textarea>
  </div>
  <div class="form-row">
    <label for="af-body">Body</label>
    <div class="rte-toolbar" data-rte-for="af-body"></div>
    <textarea id="af-body" name="body_html" rows="22" style="max-width:none;font-family:ui-monospace,monospace;font-size:.9rem"><?= e($a['body_html'] ?? '') ?></textarea>
  </div>
  <button type="submit" class="btn btn-primary">Save</button>
</form>

<?php if ($isEdit): ?>
<h2>SEO health check</h2>
<ul class="check-list">
  <?php foreach ($seoChecks as [$label, $pass, $detail]): ?>
  <li><span class="rag <?= $pass ? 'rag-green' : 'rag-amber' ?>"><span class="rag-dot" aria-hidden="true"></span><?= $pass ? 'OK' : 'CHECK' ?></span>
      <span><strong><?= e($label) ?></strong> — <?= e($detail) ?></span></li>
  <?php endforeach; ?>
</ul>

<form method="post" action="/admin/articles/delete/" onsubmit="return confirm('Delete this article permanently?')" style="margin-top:1.5rem">
  <?= App\Core\Csrf::field() ?>
  <input type="hidden" name="id" value="<?= (int) $a['id'] ?>">
  <button type="submit" class="btn btn-danger btn-sm">Delete article</button>
</form>
<?php endif; ?>
<script src="/assets/js/admin-editor.js" defer></script>
