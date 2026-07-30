<div class="admin-topbar"><h1 style="margin:0">Dashboard</h1></div>

<div class="stat-grid">
  <div class="stat-card"><div class="n"><?= number_format($downloads) ?></div>Template downloads this week</div>
  <div class="stat-card"><div class="n"><?= number_format($viewsWeek) ?></div>Page views this week</div>
  <div class="stat-card"><div class="n"><?= number_format($newMessages) ?></div>New inbox messages <?= $newMessages ? '· <a href="/admin/inbox/">open</a>' : '' ?></div>
  <div class="stat-card"><div class="n"><?= number_format($dueReview) ?></div>Items due for review <?= $dueReview ? '· <a href="/admin/review-queue/">queue</a>' : '' ?></div>
</div>

<div class="grid grid-2">
  <div>
    <h2>Top tools (30 days)</h2>
    <table class="admin-table">
      <thead><tr><th>Tool page</th><th>Views</th></tr></thead>
      <tbody>
        <?php foreach ($topTools as $t): ?>
        <tr><td><?= e($t['path']) ?></td><td><?= number_format((float) $t['views']) ?></td></tr>
        <?php endforeach; ?>
        <?php if (!$topTools): ?><tr><td colspan="2">No data yet.</td></tr><?php endif; ?>
      </tbody>
    </table>
  </div>
  <div>
    <h2>Top downloads (30 days)</h2>
    <table class="admin-table">
      <thead><tr><th>Template</th><th>Downloads</th></tr></thead>
      <tbody>
        <?php foreach ($topDownloads as $d): ?>
        <tr><td><a href="/admin/templates/"><?= e($d['title']) ?></a></td><td><?= number_format((float) $d['n']) ?></td></tr>
        <?php endforeach; ?>
        <?php if (!$topDownloads): ?><tr><td colspan="2">No data yet.</td></tr><?php endif; ?>
      </tbody>
    </table>
    <h2>Searches with no results</h2>
    <?php if ($noResults): ?>
    <ul>
      <?php foreach ($noResults as $q): ?>
      <li>“<?= e($q['query']) ?>” — <?= (int) $q['searches'] ?>×</li>
      <?php endforeach; ?>
    </ul>
    <p><a href="/admin/searches/">Full search log →</a></p>
    <?php else: ?><p>None recorded — good.</p><?php endif; ?>
  </div>
</div>
