<?php /** @var array $entries */ ?>
<div class="section" data-reveal>
  <div class="container">
    <h1>Acronym Decoder</h1>
    <p class="lead" style="max-width:680px">"CLA has an ICPC, LADO aware, MASH informed…" — social care runs on acronyms. Search <?= count($entries) ?> of them, in plain English.</p>

    <div class="tool-panel" data-reveal>
      <div class="form-row">
        <label for="ac-search">Search acronyms</label>
        <input type="search" id="ac-search" placeholder="e.g. LADO, s.47, DoLS…" autocomplete="off">
      </div>
      <div class="filter-bar" role="group" aria-label="Filter by sector" id="ac-filters">
        <?php
        $sectors = ['all' => 'All', 'children' => "Children's", 'adults' => "Adults'", 'both' => 'Both', 'health' => 'Health', 'education' => 'Education', 'legal' => 'Legal'];
        foreach ($sectors as $val => $label): ?>
        <button type="button" class="chip" data-sector="<?= e($val) ?>" aria-pressed="<?= $val === 'all' ? 'true' : 'false' ?>"><?= e($label) ?></button>
        <?php endforeach; ?>
      </div>
      <p id="ac-count" aria-live="polite" class="form-hint"></p>

      <div style="overflow-x:auto">
        <table id="ac-table">
          <thead>
            <tr><th scope="col">Acronym</th><th scope="col">Stands for</th><th scope="col">Plain English</th><th scope="col">Sector</th></tr>
          </thead>
          <tbody>
            <?php foreach ($entries as $a): ?>
            <tr data-sector="<?= e($a['sector']) ?>" data-search="<?= e(mb_strtolower($a['acronym'] . ' ' . $a['full_term'])) ?>">
              <th scope="row"><?= e($a['acronym']) ?></th>
              <td><?= e($a['full_term']) ?></td>
              <td><?= e($a['meaning']) ?></td>
              <td><span class="tag"><?= e(ucfirst($a['sector'])) ?></span></td>
            </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
      <p id="ac-none" hidden>No matches. Missing an acronym you think we should add? <a href="/contact/">Tell us</a>.</p>
    </div>

    <section class="how-it-works">
      <h2>About this glossary</h2>
      <p>Definitions are one-sentence orientations, not full guidance — always check the source legislation or your organisation's policy for detail. Entries are reviewed and added regularly; if a term used in your team isn't here, <a href="/contact/">suggest it</a>.</p>
    </section>

    <?= view('partials/tool-footer', [
        'toolSlug' => 'acronym-decoder',
        'lastReviewed' => '2026-07-01',
        'related' => [
            ['title' => 'Writing daily logs that stand up to scrutiny', 'url' => '/guides/writing-daily-logs-that-stand-up-to-scrutiny/', 'kind' => 'Guide'],
            ['title' => 'Notification Decision Tool', 'url' => '/tools/notification-decision-tool/', 'kind' => 'Tool'],
        ],
    ]) ?>
  </div>
</div>
<script src="/assets/js/tools/acronyms.js" defer></script>
