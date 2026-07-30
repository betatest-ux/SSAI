<div class="admin-topbar"><h1 style="margin:0">Site searches</h1></div>
<p>What visitors look for — and what they don't find. No-result searches are a to-do list for new content.</p>
<div class="grid grid-2">
  <div>
    <h2>No results <span class="rag rag-amber">create this content</span></h2>
    <table class="admin-table">
      <thead><tr><th>Query</th><th>Times</th><th>Last</th></tr></thead>
      <tbody>
        <?php foreach ($noResults as $q): ?>
        <tr><td>“<?= e($q['query']) ?>”</td><td><?= (int) $q['searches'] ?></td><td><?= e(format_date($q['last_searched'])) ?></td></tr>
        <?php endforeach; ?>
        <?php if (!$noResults): ?><tr><td colspan="3">None — everything searched for was found.</td></tr><?php endif; ?>
      </tbody>
    </table>
  </div>
  <div>
    <h2>All queries (top 100)</h2>
    <table class="admin-table">
      <thead><tr><th>Query</th><th>Times</th><th>Results</th></tr></thead>
      <tbody>
        <?php foreach ($top as $q): ?>
        <tr><td>“<?= e($q['query']) ?>”</td><td><?= (int) $q['searches'] ?></td><td><?= (int) $q['results_count'] ?></td></tr>
        <?php endforeach; ?>
        <?php if (!$top): ?><tr><td colspan="3">No searches yet.</td></tr><?php endif; ?>
      </tbody>
    </table>
  </div>
</div>
