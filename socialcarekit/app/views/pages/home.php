<section class="hero">
  <div class="container">
    <h1><?= e($hero['heading']) ?></h1>
    <p class="lead"><?= e($hero['lead']) ?></p>
    <p><a class="btn btn-accent" href="/tools/">Explore the tools</a>
       <a class="btn btn-outline" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.6)" href="/templates/">Browse <?= (int) $templateCount ?>+ templates</a></p>
  </div>
</section>

<section class="section" data-reveal>
  <div class="container">
    <h2 style="margin-top:0">Tools that respect your data</h2>
    <p style="max-width:680px">Every calculator and recorder on this site runs <strong>entirely in your browser</strong>. Nothing you type is sent to or stored on our servers — so you can use them with real rotas, real payslips and real records.</p>
    <div class="grid grid-3">
      <?php foreach ($featuredTools as $slug => $tool): ?>
      <a class="card-wrap" href="/tools/<?= e($slug) ?>/" data-reveal>
        <div class="card">
          <div class="card-icon"><?= view('partials/icon', ['name' => $tool['icon']]) ?></div>
          <h3><?= e($tool['title']) ?></h3>
          <p style="font-size:.95rem"><?= e($tool['blurb']) ?></p>
          <span class="card-link">Open →</span>
        </div>
      </a>
      <?php endforeach; ?>
    </div>
    <p style="margin-top:1.25rem"><a href="/tools/">See all eight tools →</a></p>
  </div>
</section>

<section class="section section-soft">
  <div class="container">
    <div class="grid grid-2">
      <div data-reveal>
        <h2 style="margin-top:0">The template library</h2>
        <p>Placement plans, MCA capacity assessments, supervision records, Reg 44 packs, MAR audits — <?= (int) $templateCount ?>+ professionally structured documents, tagged Ofsted / CQC / both, free to download and use in your organisation.</p>
        <p><a class="btn btn-primary" href="/templates/">Browse the library</a></p>
      </div>
      <div data-reveal>
        <h2 style="margin-top:0">Know where you stand</h2>
        <p>Sleep-in pay after <em>Mencap</em>, holiday for irregular hours, the 48-hour week, grievances and tribunal deadlines — our <a href="/rights/">staff rights section</a> explains it in plain English, with signposts to ACAS and HMRC when you need more than information.</p>
        <p><a class="btn btn-outline" href="/rights/">Your rights, explained</a></p>
      </div>
    </div>
  </div>
</section>

<?php if ($guides): ?>
<section class="section" data-reveal>
  <div class="container">
    <h2 style="margin-top:0">Latest practice guides</h2>
    <div class="grid grid-3">
      <?php foreach ($guides as $g): ?>
      <a class="card-wrap" href="/guides/<?= e($g['slug']) ?>/" data-reveal>
        <div class="card">
          <h3 style="font-size:1.1rem"><?= e($g['title']) ?></h3>
          <p style="font-size:.95rem"><?= e(mb_strimwidth((string) $g['summary'], 0, 150, '…')) ?></p>
          <span class="card-link">Read the guide →</span>
        </div>
      </a>
      <?php endforeach; ?>
    </div>
    <p style="margin-top:1.25rem"><a href="/guides/">All guides →</a></p>
  </div>
</section>
<?php endif; ?>

<section class="section section-soft" data-reveal>
  <div class="container" style="max-width:720px;text-align:center">
    <h2 style="margin-top:0">Visual Story Builder — coming soon</h2>
    <p>A companion app for building personalised <strong>visual stories</strong>: pick a template, swap in names and photos, print a ready-to-use booklet. <a href="/story-builder/">Find out more and join the launch list →</a></p>
  </div>
</section>
