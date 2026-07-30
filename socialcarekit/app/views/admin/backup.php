<div class="admin-topbar"><h1 style="margin:0">Backup &amp; maintenance</h1></div>

<div class="grid grid-2">
  <div>
    <h2>Database export</h2>
    <form method="post" action="/admin/backup/export/">
      <?= App\Core\Csrf::field() ?>
      <button type="submit" class="btn btn-primary">Download full .sql export now</button>
    </form>
    <h2>Nightly backups</h2>
    <p class="form-hint">Created by the cron job (see DEPLOY.md): <code>php scripts/backup.php</code> nightly, kept for 14 days in <code>storage/backups/</code> (outside the web root).</p>
    <table class="admin-table">
      <thead><tr><th>File</th><th>Size</th><th>Created</th></tr></thead>
      <tbody>
        <?php foreach ($backups as $b): ?>
        <tr><td><code><?= e($b['name']) ?></code></td><td><?= number_format($b['size'] / 1024) ?> KB</td><td><?= e(date('j M Y H:i', $b['time'])) ?></td></tr>
        <?php endforeach; ?>
        <?php if (!$backups): ?><tr><td colspan="3"><span class="rag rag-amber">No nightly backups found</span> — check the cron job is configured (DEPLOY.md §7).</td></tr><?php endif; ?>
      </tbody>
    </table>
  </div>
  <div>
    <h2>Page cache</h2>
    <p><?= (int) $cacheCount ?> cached pages. The cache purges itself on every content change; purge manually after config edits.</p>
    <form method="post" action="/admin/backup/purge-cache/">
      <?= App\Core\Csrf::field() ?>
      <button type="submit" class="btn btn-outline btn-sm">Purge page cache</button>
    </form>
    <h2>Maintenance mode</h2>
    <p>Toggled in <a href="/admin/site/">Site settings</a>.</p>
    <h2>Error log</h2>
    <p><a class="btn btn-outline btn-sm" href="/admin/logs/">View PHP error log</a></p>
  </div>
</div>
