<div class="admin-topbar"><h1 style="margin:0">Acronym manager</h1></div>

<h2><?= $editing ? 'Edit “' . e($editing['acronym']) . '”' : 'Add an acronym' ?></h2>
<form method="post" action="/admin/acronyms/save/">
  <?= App\Core\Csrf::field() ?>
  <input type="hidden" name="id" value="<?= (int) ($editing['id'] ?? 0) ?>">
  <div class="grid grid-2">
    <div class="form-row"><label for="ac-a">Acronym</label><input type="text" id="ac-a" name="acronym" required value="<?= e($editing['acronym'] ?? '') ?>"></div>
    <div class="form-row"><label for="ac-f">Full term</label><input type="text" id="ac-f" name="full_term" required value="<?= e($editing['full_term'] ?? '') ?>"></div>
    <div class="form-row">
      <label for="ac-s">Sector</label>
      <select id="ac-s" name="sector">
        <?php foreach (['children', 'adults', 'both', 'health', 'education', 'legal'] as $s): ?>
        <option value="<?= $s ?>" <?= ($editing['sector'] ?? '') === $s ? 'selected' : '' ?>><?= ucfirst($s) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="form-row"><label for="ac-m">One-sentence plain-English meaning</label><textarea id="ac-m" name="meaning" rows="2" style="max-width:none"><?= e($editing['meaning'] ?? '') ?></textarea></div>
  </div>
  <button type="submit" class="btn btn-primary btn-sm"><?= $editing ? 'Save changes' : 'Add acronym' ?></button>
  <?php if ($editing): ?><a class="btn btn-ghost btn-sm" href="/admin/acronyms/">Cancel edit</a><?php endif; ?>
</form>

<hr>
<form method="get" action="/admin/acronyms/" style="display:flex;gap:.5rem;max-width:420px">
  <label class="visually-hidden" for="ac-q">Filter</label>
  <input type="search" id="ac-q" name="q" value="<?= e($q) ?>" placeholder="Filter…">
  <button type="submit" class="btn btn-outline btn-sm">Filter</button>
</form>
<table class="admin-table">
  <thead><tr><th>Acronym</th><th>Full term</th><th>Sector</th><th></th></tr></thead>
  <tbody>
    <?php foreach ($acronyms as $a): ?>
    <tr>
      <td><strong><?= e($a['acronym']) ?></strong></td>
      <td><?= e($a['full_term']) ?><br><span class="search-kind"><?= e(mb_strimwidth($a['meaning'], 0, 90, '…')) ?></span></td>
      <td><?= e($a['sector']) ?></td>
      <td class="admin-actions">
        <a class="btn btn-sm btn-outline" href="/admin/acronyms/?edit=<?= (int) $a['id'] ?><?= $q !== '' ? '&q=' . rawurlencode($q) : '' ?>">Edit</a>
        <form method="post" action="/admin/acronyms/delete/" onsubmit="return confirm('Delete <?= e($a['acronym']) ?>?')" style="display:inline">
          <?= App\Core\Csrf::field() ?>
          <input type="hidden" name="id" value="<?= (int) $a['id'] ?>">
          <button type="submit" class="btn btn-sm btn-danger">Delete</button>
        </form>
      </td>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>
