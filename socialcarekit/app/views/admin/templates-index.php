<div class="admin-topbar">
  <h1 style="margin:0">Template manager</h1>
  <a class="btn btn-primary" href="/admin/templates/new/">+ New template</a>
</div>
<table class="admin-table">
  <thead><tr><th>Title</th><th>Regulator</th><th>Format</th><th>Status</th><th>Downloads</th><th>Last reviewed</th><th></th></tr></thead>
  <tbody>
    <?php foreach ($templates as $t): ?>
    <tr>
      <td><?= e($t['title']) ?></td>
      <td><span class="tag tag-<?= e($t['regulator']) ?>"><?= e($t['regulator']) ?></span></td>
      <td><?= e(strtoupper($t['format'])) ?></td>
      <td><span class="rag <?= $t['status'] === 'published' ? 'rag-green' : 'rag-amber' ?>"><?= e($t['status']) ?></span></td>
      <td><?= number_format((float) $t['download_count']) ?></td>
      <td><?= e(format_date($t['last_reviewed'])) ?></td>
      <td class="admin-actions">
        <a class="btn btn-sm btn-outline" href="/admin/templates/<?= (int) $t['id'] ?>/">Edit</a>
        <a class="btn btn-sm btn-ghost" href="/templates/<?= e($t['slug']) ?>/" target="_blank" rel="noopener">View ↗</a>
      </td>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>
