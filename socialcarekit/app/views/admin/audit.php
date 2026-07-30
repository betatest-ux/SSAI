<div class="admin-topbar"><h1 style="margin:0">Audit log</h1></div>
<table class="admin-table">
  <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Entity</th><th>Detail</th></tr></thead>
  <tbody>
    <?php foreach ($log as $l): ?>
    <tr>
      <td style="white-space:nowrap"><?= e(date('j M Y H:i', strtotime($l['created_at']))) ?></td>
      <td><?= e($l['user_email'] ?? 'system') ?></td>
      <td><code><?= e($l['action']) ?></code></td>
      <td><?= e(trim(($l['entity'] ?? '') . ' ' . ($l['entity_id'] ?? ''))) ?></td>
      <td><?= e(mb_strimwidth((string) $l['detail'], 0, 120, '…')) ?></td>
    </tr>
    <?php endforeach; ?>
    <?php if (!$log): ?><tr><td colspan="5">No entries yet.</td></tr><?php endif; ?>
  </tbody>
</table>
