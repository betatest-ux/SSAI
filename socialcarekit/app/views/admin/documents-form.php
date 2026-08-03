<?php $isEdit = (bool) $d; ?>
<div class="admin-topbar">
  <h1 style="margin:0"><?= $isEdit ? 'Edit document' : 'Upload document' ?></h1>
  <?php if ($isEdit): ?>
  <div class="admin-actions">
    <button type="button" class="btn btn-sm btn-outline" data-copy-link="<?= e(base_url('/files/' . $d['slug'] . '/')) ?>">Copy public link</button>
    <a class="btn btn-sm btn-ghost" href="/files/<?= e($d['slug']) ?>/" target="_blank" rel="noopener">Open ↗</a>
  </div>
  <?php endif; ?>
</div>

<?php if ($isEdit): ?>
<div class="notice">
  <p><strong>Public link:</strong> <code><?= e(base_url('/files/' . $d['slug'] . '/')) ?></code><br>
  <span class="form-hint">PDFs and images open in the browser (add <code>?dl=1</code> to force download); other formats download directly. Paste this link into any article, template description or external message.</span></p>
</div>
<?php endif; ?>

<form method="post" action="/admin/documents/save/" enctype="multipart/form-data">
  <?= App\Core\Csrf::field() ?>
  <input type="hidden" name="id" value="<?= (int) ($d['id'] ?? 0) ?>">
  <div class="grid grid-2">
    <div class="form-row">
      <label for="df-title">Title</label>
      <input type="text" id="df-title" name="title" required value="<?= e($d['title'] ?? '') ?>">
    </div>
    <div class="form-row">
      <label for="df-slug">Slug (sets the public link)</label>
      <input type="text" id="df-slug" name="slug" value="<?= e($d['slug'] ?? '') ?>" placeholder="auto from title">
      <?php if ($isEdit): ?><p class="form-hint">Changing the slug changes the public link — add a redirect if the old link is already in use.</p><?php endif; ?>
    </div>
    <div class="form-row">
      <label for="df-cat">Category</label>
      <select id="df-cat" name="category_id">
        <option value="0">— Uncategorised —</option>
        <?php foreach ($categories as $c): ?>
        <option value="<?= (int) $c['id'] ?>" <?= (int) ($d['category_id'] ?? 0) === (int) $c['id'] ? 'selected' : '' ?>><?= e($c['name']) ?></option>
        <?php endforeach; ?>
      </select>
      <p class="form-hint"><a href="/admin/documents/categories/">Manage categories</a></p>
    </div>
    <div class="form-row">
      <label for="df-status">Status</label>
      <select id="df-status" name="status">
        <option value="published" <?= ($d['status'] ?? 'published') === 'published' ? 'selected' : '' ?>>Published (link works)</option>
        <option value="draft" <?= ($d['status'] ?? '') === 'draft' ? 'selected' : '' ?>>Draft (link returns 404)</option>
      </select>
    </div>
  </div>
  <div class="form-row">
    <label for="df-file">File<?= $isEdit ? ' — leave empty to keep the current file' : '' ?></label>
    <input type="file" id="df-file" name="file" accept=".pdf,.docx,.xlsx,.pptx,.odt,.ods,.odp,.csv,.zip,.png,.jpg,.jpeg,.webp" <?= $isEdit ? '' : 'required' ?>>
    <p class="form-hint">
      Accepted: PDF, DOCX, XLSX, PPTX, ODT/ODS/ODP, CSV, ZIP, PNG, JPG, WEBP ·
      Server upload limit: <strong><?= e(App\Core\Uploads::maxUploadHuman()) ?></strong>
      (raise it via DEPLOY.md §“Large uploads” if needed).
    </p>
    <?php if ($isEdit): ?>
    <p class="form-hint">Current: <?= e($d['original_name']) ?> (<?= e(strtoupper($d['ext'])) ?>, <?= number_format($d['filesize'] / 1048576, 1) ?> MB), uploaded by <?= e($d['uploaded_by'] ?? 'unknown') ?> · replacing the file keeps the same public link.</p>
    <?php endif; ?>
  </div>
  <div class="form-row">
    <label for="df-desc">Internal notes / description (optional)</label>
    <textarea id="df-desc" name="description" rows="3" style="max-width:none"><?= e($d['description'] ?? '') ?></textarea>
  </div>
  <button type="submit" class="btn btn-primary" data-upload-submit>Save document</button>
  <span class="form-hint" data-upload-progress hidden style="margin-left:.6rem">Uploading — leave this page open until it finishes…</span>
</form>

<?php if ($isEdit): ?>
<form method="post" action="/admin/documents/delete/" onsubmit="return confirm('Delete this document and its file permanently? Any links to it will stop working.')" style="margin-top:1.5rem">
  <?= App\Core\Csrf::field() ?>
  <input type="hidden" name="id" value="<?= (int) $d['id'] ?>">
  <button type="submit" class="btn btn-danger btn-sm">Delete document</button>
</form>
<?php endif; ?>

<script>
document.addEventListener('click', function (ev) {
  var btn = ev.target.closest('[data-copy-link]');
  if (!btn) return;
  navigator.clipboard.writeText(btn.getAttribute('data-copy-link')).then(function () {
    var t = btn.textContent; btn.textContent = 'Copied ✓';
    setTimeout(function () { btn.textContent = t; }, 1500);
  });
});
// Prevent double submits and show that a big upload is in progress.
document.querySelectorAll('form[enctype]').forEach(function (form) {
  form.addEventListener('submit', function () {
    var b = form.querySelector('[data-upload-submit]');
    var p = form.querySelector('[data-upload-progress]');
    if (b) { b.disabled = true; b.textContent = 'Uploading…'; }
    if (p) { p.hidden = false; }
  });
});
</script>
