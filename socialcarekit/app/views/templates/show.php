<div class="section">
  <div class="container">
    <div class="grid" style="grid-template-columns:1fr;max-width:760px">
      <div>
        <span class="tag tag-<?= e($t['regulator']) ?>"><?= e($t['regulator'] === 'both' ? 'Ofsted + CQC' : strtoupper($t['regulator'])) ?></span>
        <span class="tag"><?= e(strtoupper($t['format'])) ?></span>
        <h1><?= e($t['title']) ?></h1>
        <p class="meta-line">Last reviewed: <?= e(format_date($t['last_reviewed'] ?: $t['updated_at'])) ?> · Downloaded <?= number_format((float) $t['download_count']) ?> times</p>
        <p><?= nl2br(e((string) $t['description'])) ?></p>
        <?php if ($t['supports']): ?>
        <div class="summary-box">
          <h2>Supports</h2>
          <p><?= e($t['supports']) ?></p>
        </div>
        <?php endif; ?>
        <p>
          <a class="btn btn-primary" href="/download/<?= e($t['slug']) ?>/" rel="nofollow">Download <?= e(strtoupper($t['format'])) ?> (<?= e(number_format($t['filesize'] / 1024, 0)) ?> KB)</a>
        </p>
        <p class="form-hint">Free for use within your organisation — no resale or republication. <a href="/terms/">Template licence</a>. Review against your own policies before use; <a href="/report-error/?tool=template">report a problem</a> with this template.</p>
      </div>
    </div>

    <?php if ($related): ?>
    <aside class="related-block" aria-label="Related templates">
      <h2>Related templates</h2>
      <ul>
        <?php foreach ($related as $r): ?>
        <li><a href="/templates/<?= e($r['slug']) ?>/"><?= e($r['title']) ?></a> <span class="search-kind">(<?= e($r['regulator'] === 'both' ? 'Ofsted + CQC' : strtoupper($r['regulator'])) ?>)</span></li>
        <?php endforeach; ?>
      </ul>
    </aside>
    <?php endif; ?>
  </div>
</div>
