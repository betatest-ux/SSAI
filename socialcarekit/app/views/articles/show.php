<?php $legislation = json_decode((string) $a['key_legislation'], true) ?: []; ?>
<div class="section">
  <div class="container">
    <article class="article-body">
      <h1><?= e($a['title']) ?></h1>
      <p class="meta-line">
        <?= e($sectionTitle) ?> ·
        <?php if ($a['published_at']): ?>Published <?= e(format_date($a['published_at'])) ?> · <?php endif; ?>
        Last updated <?= e(format_date($a['updated_at'])) ?>
      </p>

      <?php if ($a['summary']): ?>
      <div class="summary-box">
        <h2>Summary</h2>
        <p><?= e($a['summary']) ?></p>
      </div>
      <?php endif; ?>

      <?php if ($legislation): ?>
      <div class="legislation-list">
        <strong>Key legislation &amp; guidance:</strong>
        <ul style="margin:.4rem 0 0">
          <?php foreach ($legislation as $l): ?>
          <li><?= e($l) ?></li>
          <?php endforeach; ?>
        </ul>
      </div>
      <?php endif; ?>

      <?= $a['body_html'] /* stored sanitised HTML, admin-authored */ ?>

      <div class="notice-warn notice" style="margin-top:2rem">
        <p><strong>Guidance, not advice.</strong> This article is general information based on the position at the last update date. It is not legal advice — for your specific circumstances speak to ACAS, your union, your regulator or a solicitor as appropriate.</p>
      </div>
    </article>

    <?php if ($related): ?>
    <aside class="related-block" aria-label="Related articles">
      <h2>Related reading</h2>
      <ul>
        <?php foreach ($related as $r): ?>
        <li><a href="/<?= e($r['section']) ?>/<?= e($r['slug']) ?>/"><?= e($r['title']) ?></a></li>
        <?php endforeach; ?>
      </ul>
    </aside>
    <?php endif; ?>
  </div>
</div>
