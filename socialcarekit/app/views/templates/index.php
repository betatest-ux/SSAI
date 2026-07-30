<?php
$categories = [];
foreach ($templates as $t) {
    $categories[$t['category']] = true;
}
$catLabels = [
    'care-planning' => 'Care planning', 'safeguarding' => 'Safeguarding', 'medication' => 'Medication',
    'hr-staffing' => 'HR & staffing', 'quality-audit' => 'Quality & audit', 'recording' => 'Recording',
];
?>
<div class="section">
  <div class="container">
    <h1>Template library</h1>
    <p class="lead" style="max-width:680px"><?= count($templates) ?> professionally structured templates, mapped to the regulations they support. Free to use within your organisation — <a href="/terms/">licence</a>. Review each one against your own policies before use.</p>

    <div class="filter-bar" data-filter-bar="[data-template-card]" data-filter-live="tpl-count">
      <span class="field-label" style="margin:0">Regulator:</span>
      <button type="button" class="chip" data-filter-group="reg" data-filter-value="all" aria-pressed="true">All</button>
      <button type="button" class="chip" data-filter-group="reg" data-filter-value="ofsted" aria-pressed="false">Ofsted</button>
      <button type="button" class="chip" data-filter-group="reg" data-filter-value="cqc" aria-pressed="false">CQC</button>
      <button type="button" class="chip" data-filter-group="reg" data-filter-value="both" aria-pressed="false">Both</button>
      <span class="field-label" style="margin:0 0 0 .8rem">Category:</span>
      <button type="button" class="chip" data-filter-group="cat" data-filter-value="all" aria-pressed="true">All</button>
      <?php foreach (array_keys($categories) as $cat): ?>
      <button type="button" class="chip" data-filter-group="cat" data-filter-value="<?= e($cat) ?>" aria-pressed="false"><?= e($catLabels[$cat] ?? ucfirst($cat)) ?></button>
      <?php endforeach; ?>
    </div>
    <p id="tpl-count" aria-live="polite" class="form-hint"></p>

    <div class="grid grid-3">
      <?php foreach ($templates as $t): ?>
      <a class="card-wrap" href="/templates/<?= e($t['slug']) ?>/" data-template-card data-filter-tags="<?= e($t['regulator'] . ' ' . $t['category']) ?>">
        <div class="card">
          <div>
            <span class="tag tag-<?= e($t['regulator']) ?>"><?= e(strtoupper($t['regulator'] === 'both' ? 'Ofsted + CQC' : $t['regulator'])) ?></span>
            <span class="tag"><?= e(strtoupper($t['format'])) ?></span>
          </div>
          <h2 style="font-size:1.1rem"><?= e($t['title']) ?></h2>
          <p style="font-size:.93rem"><?= e(mb_strimwidth((string) $t['description'], 0, 140, '…')) ?></p>
          <span class="card-link">View &amp; download →</span>
        </div>
      </a>
      <?php endforeach; ?>
    </div>
  </div>
</div>
