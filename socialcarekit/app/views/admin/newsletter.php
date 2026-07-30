<div class="admin-topbar">
  <h1 style="margin:0">Newsletter signups</h1>
  <div class="admin-actions">
    <a class="btn btn-sm btn-outline" href="/admin/newsletter/export/?list=general">Export general (CSV)</a>
    <a class="btn btn-sm btn-outline" href="/admin/newsletter/export/?list=storybuilder">Export Story Builder (CSV)</a>
  </div>
</div>
<p>Double opt-in is enforced: exports contain <strong>confirmed, still-subscribed addresses only</strong> (PECR/GDPR). Unsubscribes are one-click via a signed link in every email.</p>

<div class="stat-grid">
  <?php foreach ($stats as $s): ?>
  <div class="stat-card"><div class="n"><?= number_format((float) $s['active']) ?></div><?= e($s['list_name'] === 'storybuilder' ? 'Story Builder launch list' : 'General list') ?> (active)<br>
  <span class="search-kind"><?= (int) $s['pending'] ?> pending confirmation · <?= (int) $s['unsubscribed'] ?> unsubscribed</span></div>
  <?php endforeach; ?>
  <?php if (!$stats): ?><div class="stat-card"><div class="n">0</div>No signups yet</div><?php endif; ?>
</div>

<h2>Recent activity</h2>
<table class="admin-table">
  <thead><tr><th>Email</th><th>List</th><th>Status</th><th>Signed up</th></tr></thead>
  <tbody>
    <?php foreach ($recent as $r): ?>
    <tr>
      <td><?= e($r['email']) ?></td>
      <td><?= e($r['list_name']) ?></td>
      <td>
        <?php if ($r['unsubscribed_at']): ?><span class="rag rag-red">unsubscribed</span>
        <?php elseif ($r['confirmed_at']): ?><span class="rag rag-green">confirmed</span>
        <?php else: ?><span class="rag rag-amber">pending</span><?php endif; ?>
      </td>
      <td><?= e(format_date($r['created_at'])) ?></td>
    </tr>
    <?php endforeach; ?>
  </tbody>
</table>
