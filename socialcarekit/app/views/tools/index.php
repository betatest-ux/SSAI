<div class="section">
  <div class="container">
    <h1>Interactive tools</h1>
    <p class="lead" style="max-width:680px">Eight free, browser-based tools built for the realities of shift work in children's homes and adult services. <strong>Everything runs on your device</strong> — nothing you type is sent to or stored on our servers.</p>
    <div class="grid grid-2" style="margin-top:1.5rem">
      <?php foreach ($tools as $slug => $tool): ?>
      <a class="card-wrap" href="/tools/<?= e($slug) ?>/">
        <div class="card">
          <div class="card-icon"><?= view('partials/icon', ['name' => $tool['icon']]) ?></div>
          <h2 style="font-size:1.2rem"><?= e($tool['title']) ?></h2>
          <p><?= e($tool['blurb']) ?></p>
          <span class="card-link">Open the tool →</span>
        </div>
      </a>
      <?php endforeach; ?>
    </div>
  </div>
</div>
