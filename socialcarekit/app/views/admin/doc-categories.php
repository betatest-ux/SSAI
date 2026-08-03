<div class="admin-topbar">
  <h1 style="margin:0">Document categories</h1>
  <a class="btn btn-outline btn-sm" href="/admin/documents/">← Back to documents</a>
</div>
<p>Sections for organising the document library. Deleting a category never deletes its documents — they just become uncategorised.</p>

<h2><?= $editing ? 'Edit “' . e($editing['name']) . '”' : 'Add a category' ?></h2>
<form method="post" action="/admin/documents/categories/save/">
  <?= App\Core\Csrf::field() ?>
  <input type="hidden" name="id" value="<?= (int) ($editing['id'] ?? 0) ?>">
  <div class="grid grid-3">
    <div class="form-row"><label for="dc-name">Name</label><input type="text" id="dc-name" name="name" required value="<?= e($editing['name'] ?? '') ?>"></div>
    <div class="form-row"><label for="dc-slug">Slug</label><input type="text" id="dc-slug" name="slug" value="<?= e($editing['slug'] ?? '') ?>" placeholder="auto from name"></div>
    <div class="form-row"><label for="dc-sort">Sort order (low first)</label><input type="number" id="dc-sort" name="sort_order" value="<?= (int) ($editing['sort_order'] ?? 0) ?>"></div>
  </div>
  <div class="form-row"><label for="dc-desc">Description (optional)</label><input type="text" id="dc-desc" name="description" value="<?= e($editing['description'] ?? '') ?>" style="max-width:none"></div>
  <button type="submit" class="btn btn-primary btn-sm"><?= $editing ? 'Save changes' : 'Add category' ?></button>
  <?php if ($editing): ?><a class="btn btn-ghost btn-sm" href="/admin/documents/categories/">Cancel</a><?php endif; ?>
</form>

<table class="admin-table">
  <thead><tr><th>Order</th><th>Name</th><th>Slug</th><th>Documents</th><th></th></tr></thead>
  <tbody>
    <?php foreach ($categories as $c): ?>
    <tr>
      <td><?= (int) $c['sort_order'] ?></td>
      <td><?= e($c['name']) ?><?= $c['description'] ? '<br><span class="search-kind">' . e($c['description']) . '</span>' : '' ?></td>
      <td><code><?= e($c['slug']) ?></code></td>
      <td><a href="/admin/documents/?category=<?= (int) $c['id'] ?>"><?= (int) $c['doc_count'] ?></a></td>
      <td class="admin-actions">
        <a class="btn btn-sm btn-outline" href="/admin/documents/categories/?edit=<?= (int) $c['id'] ?>">Edit</a>
        <form method="post" action="/admin/documents/categories/delete/" onsubmit="return confirm('Delete this category? Its documents become uncategorised (files and links keep working).')" style="display:inline">
          <?= App\Core\Csrf::field() ?>
          <input type="hidden" name="id" value="<?= (int) $c['id'] ?>">
          <button type="submit" class="btn btn-sm btn-danger">Delete</button>
        </form>
      </td>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>
