<div class="admin-topbar"><h1 style="margin:0">SEO check: <?= e($a['title']) ?></h1></div>
<ul class="check-list">
  <?php foreach ($checks as [$label, $pass, $detail]): ?>
  <li><span class="rag <?= $pass ? 'rag-green' : 'rag-amber' ?>"><span class="rag-dot" aria-hidden="true"></span><?= $pass ? 'OK' : 'CHECK' ?></span>
      <span><strong><?= e($label) ?></strong> — <?= e($detail) ?></span></li>
  <?php endforeach; ?>
</ul>
<p><a class="btn btn-outline btn-sm" href="/admin/articles/<?= (int) $a['id'] ?>/">Edit article</a></p>
