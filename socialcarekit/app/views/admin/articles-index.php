<div class="admin-topbar">
  <h1 style="margin:0">Content manager</h1>
  <a class="btn btn-primary" href="/admin/articles/new/">+ New article</a>
</div>
<table class="admin-table">
  <thead><tr><th>Title</th><th>Section</th><th>Status</th><th>Review due</th><th>Updated</th><th></th></tr></thead>
  <tbody>
    <?php foreach ($articles as $a): ?>
    <tr>
      <td><?= e($a['title']) ?><br><span class="search-kind">/<?= e($a['section']) ?>/<?= e($a['slug']) ?>/</span></td>
      <td><?= e($a['section']) ?></td>
      <td><span class="rag <?= $a['status'] === 'published' ? 'rag-green' : 'rag-amber' ?>"><?= e($a['status']) ?></span></td>
      <td><?= e(format_date($a['review_due'])) ?></td>
      <td><?= e(format_date($a['updated_at'])) ?></td>
      <td class="admin-actions">
        <a class="btn btn-sm btn-outline" href="/admin/articles/<?= (int) $a['id'] ?>/">Edit</a>
        <?php if ($a['status'] === 'published'): ?>
        <a class="btn btn-sm btn-ghost" href="/<?= e($a['section']) ?>/<?= e($a['slug']) ?>/" target="_blank" rel="noopener">View ↗</a>
        <?php endif; ?>
      </td>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>
