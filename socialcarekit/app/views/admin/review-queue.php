<div class="admin-topbar"><h1 style="margin:0">Review queue</h1></div>
<p>Everything past — or within 30 days of — its review-due date. Reviewing means: check against current law/guidance, update if needed, then bump the review date on the item's edit page.</p>

<h2>Articles</h2>
<table class="admin-table">
  <thead><tr><th>Title</th><th>Section</th><th>Status</th><th>Review due</th><th></th></tr></thead>
  <tbody>
    <?php foreach ($articles as $a): ?>
    <tr>
      <td><?= e($a['title']) ?></td>
      <td><?= e($a['section']) ?></td>
      <td><?= e($a['status']) ?></td>
      <td><span class="rag <?= strtotime($a['review_due']) <= time() ? 'rag-red' : 'rag-amber' ?>"><?= e(format_date($a['review_due'])) ?></span></td>
      <td><a class="btn btn-sm btn-outline" href="/admin/articles/<?= (int) $a['id'] ?>/">Review</a></td>
    </tr>
    <?php endforeach; ?>
    <?php if (!$articles): ?><tr><td colspan="5">Nothing due. ✓</td></tr><?php endif; ?>
  </tbody>
</table>

<h2>Templates</h2>
<table class="admin-table">
  <thead><tr><th>Title</th><th>Status</th><th>Review due</th><th></th></tr></thead>
  <tbody>
    <?php foreach ($templates as $t): ?>
    <tr>
      <td><?= e($t['title']) ?></td>
      <td><?= e($t['status']) ?></td>
      <td><span class="rag <?= strtotime($t['review_due']) <= time() ? 'rag-red' : 'rag-amber' ?>"><?= e(format_date($t['review_due'])) ?></span></td>
      <td><a class="btn btn-sm btn-outline" href="/admin/templates/<?= (int) $t['id'] ?>/">Review</a></td>
    </tr>
    <?php endforeach; ?>
    <?php if (!$templates): ?><tr><td colspan="4">Nothing due. ✓</td></tr><?php endif; ?>
  </tbody>
</table>

<h2>Rates</h2>
<?php if ($staleRates): ?>
<div class="notice notice-warn"><p>These NMW bands have had no new rate for over 13 months — new rates usually apply each April. <a href="/admin/rates/">Update rates →</a></p></div>
<ul><?php foreach ($staleRates as $r): ?><li><?= e($r['label']) ?> — latest effective date <?= e(format_date($r['latest'])) ?></li><?php endforeach; ?></ul>
<?php else: ?><p>NMW rates look current. ✓</p><?php endif; ?>
