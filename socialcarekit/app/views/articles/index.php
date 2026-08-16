<div class="section">
  <div class="container">
    <h1><?= e($title) ?></h1>
    <?php if ($section === 'rights'): ?>
    <p class="lead" style="max-width:680px">General information to help you understand where you stand — not legal advice. For your specific situation, start with ACAS (0300&nbsp;123&nbsp;1100) or your union.</p>
    <?php else: ?>
    <p class="lead" style="max-width:680px">The law and frameworks behind everyday practice, translated into what they mean on shift. Every guide shows its key legislation and a last-reviewed date.</p>
    <?php endif; ?>
    <div class="grid grid-2" style="margin-top:1.5rem">
      <?php foreach ($articles as $a): ?>
      <a class="card-wrap" href="/<?= e($section) ?>/<?= e($a['slug']) ?>/" data-reveal>
        <div class="card">
          <h2 style="font-size:1.15rem"><?= e($a['title']) ?></h2>
          <p style="font-size:.95rem"><?= e(mb_strimwidth((string) $a['summary'], 0, 180, '…')) ?></p>
          <span class="card-link">Read →</span>
        </div>
      </a>
      <?php endforeach; ?>
      <?php if (!$articles): ?>
      <p>Articles are being prepared — check back soon.</p>
      <?php endif; ?>
    </div>
  </div>
</div>
