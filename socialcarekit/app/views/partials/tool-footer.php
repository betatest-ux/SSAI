<?php
/**
 * @var string $lastReviewed  e.g. '2026-07-01'
 * @var string $toolSlug
 * @var array  $related       list of ['title' =>, 'url' =>, 'kind' =>]
 */
$lastReviewed = $lastReviewed ?? '2026-07-01';
$related = $related ?? [];
?>
<div class="notice-warn notice" data-reveal="left">
  <p><strong>Guidance, not advice.</strong> This tool gives general guidance based on the law and statutory guidance in force at the last review date. It is not legal advice and does not replace your organisation's policies or professional advice on your specific circumstances.</p>
</div>
<p class="last-reviewed">
  Last reviewed: <?= e(format_date($lastReviewed)) ?> ·
  <a href="/report-error/?tool=<?= e($toolSlug ?? '') ?>">Report an error in this tool</a>
</p>
<?php if ($related): ?>
<aside class="related-block" data-reveal aria-label="Related resources">
  <h2>Related resources</h2>
  <ul>
    <?php foreach ($related as $r): ?>
    <li><a href="<?= e($r['url']) ?>"><?= e($r['title']) ?></a> <span class="search-kind">(<?= e($r['kind']) ?>)</span></li>
    <?php endforeach; ?>
  </ul>
</aside>
<?php endif; ?>
