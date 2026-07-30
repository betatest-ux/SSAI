<div class="admin-topbar"><h1 style="margin:0"><?= $t ? 'Edit template' : 'New template' ?></h1></div>

<form method="post" action="/admin/templates/save/" enctype="multipart/form-data">
  <?= App\Core\Csrf::field() ?>
  <input type="hidden" name="id" value="<?= (int) ($t['id'] ?? 0) ?>">
  <div class="grid grid-2">
    <div class="form-row">
      <label for="tf-title">Title</label>
      <input type="text" id="tf-title" name="title" required value="<?= e($t['title'] ?? '') ?>">
    </div>
    <div class="form-row">
      <label for="tf-slug">Slug</label>
      <input type="text" id="tf-slug" name="slug" value="<?= e($t['slug'] ?? '') ?>" placeholder="auto from title">
    </div>
    <div class="form-row">
      <label for="tf-reg">Regulator</label>
      <select id="tf-reg" name="regulator">
        <?php foreach (['ofsted' => 'Ofsted', 'cqc' => 'CQC', 'both' => 'Both'] as $v => $l): ?>
        <option value="<?= $v ?>" <?= ($t['regulator'] ?? '') === $v ? 'selected' : '' ?>><?= $l ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="form-row">
      <label for="tf-cat">Category</label>
      <select id="tf-cat" name="category">
        <?php foreach (['care-planning', 'safeguarding', 'medication', 'hr-staffing', 'quality-audit', 'recording'] as $c): ?>
        <option value="<?= $c ?>" <?= ($t['category'] ?? '') === $c ? 'selected' : '' ?>><?= ucwords(str_replace('-', ' ', $c)) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="form-row">
      <label for="tf-status">Status</label>
      <select id="tf-status" name="status">
        <option value="draft" <?= ($t['status'] ?? '') === 'draft' ? 'selected' : '' ?>>Draft</option>
        <option value="published" <?= ($t['status'] ?? 'published') === 'published' ? 'selected' : '' ?>>Published</option>
      </select>
    </div>
    <div class="form-row">
      <label for="tf-file">Template file (DOCX, XLSX or PDF<?= $t ? ' — leave empty to keep the current file' : '' ?>)</label>
      <input type="file" id="tf-file" name="file" accept=".docx,.xlsx,.pdf">
      <?php if ($t): ?><p class="form-hint">Current: <?= e($t['filename']) ?> (<?= number_format($t['filesize'] / 1024) ?> KB)</p><?php endif; ?>
    </div>
    <div class="form-row">
      <label for="tf-lastrev">Last reviewed ("bump" this after each review)</label>
      <input type="date" id="tf-lastrev" name="last_reviewed" value="<?= e($t['last_reviewed'] ?? date('Y-m-d')) ?>">
    </div>
    <div class="form-row">
      <label for="tf-review">Review due</label>
      <input type="date" id="tf-review" name="review_due" value="<?= e($t['review_due'] ?? date('Y-m-d', strtotime('+12 months'))) ?>">
    </div>
  </div>
  <div class="form-row">
    <label for="tf-desc">Landing page description</label>
    <textarea id="tf-desc" name="description" rows="4" style="max-width:none"><?= e($t['description'] ?? '') ?></textarea>
  </div>
  <div class="form-row">
    <label for="tf-supports">Supports (regulation/standard)</label>
    <input type="text" id="tf-supports" name="supports" value="<?= e($t['supports'] ?? '') ?>" style="max-width:none" placeholder="e.g. Reg 35, Children's Homes (England) Regulations 2015">
  </div>
  <button type="submit" class="btn btn-primary">Save template</button>
</form>

<?php if ($t): ?>
<form method="post" action="/admin/templates/delete/" onsubmit="return confirm('Delete this template and its file permanently?')" style="margin-top:1.5rem">
  <?= App\Core\Csrf::field() ?>
  <input type="hidden" name="id" value="<?= (int) $t['id'] ?>">
  <button type="submit" class="btn btn-danger btn-sm">Delete template</button>
</form>
<?php endif; ?>
