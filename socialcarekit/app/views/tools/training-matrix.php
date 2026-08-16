<div class="section" data-reveal>
  <div class="container">
    <h1>Training Matrix Tracker</h1>
    <?= view('partials/tool-privacy') ?>
    <div class="notice" data-reveal="left">
      <p><strong>Where your data lives:</strong> this matrix is saved in your browser's local storage on <em>this device only</em> — nothing touches our servers. Clearing your browser data will delete it, so use <strong>Export CSV</strong> regularly to keep a copy in your organisation's systems, and to move the matrix between devices.</p>
    </div>

    <div class="tool-panel" data-reveal>
      <div class="tool-actions" style="margin:0 0 1rem">
        <button type="button" class="btn btn-primary btn-sm" id="tm-add-staff">+ Add staff member</button>
        <button type="button" class="btn btn-primary btn-sm" id="tm-add-course">+ Add course</button>
        <button type="button" class="btn btn-outline btn-sm" id="tm-export">Export CSV</button>
        <label class="btn btn-outline btn-sm" style="margin:0">Import CSV<input type="file" id="tm-import" accept=".csv" style="display:none"></label>
        <button type="button" class="btn btn-outline btn-sm" onclick="window.print()">Print / PDF</button>
        <button type="button" class="btn btn-danger btn-sm" id="tm-reset">Reset matrix</button>
      </div>
      <p class="form-hint">Click a cell to set the completion date. Click a course name to edit its renewal period. Status: <span class="rag rag-green">in date</span> <span class="rag rag-amber">due within 60 days</span> <span class="rag rag-red">expired / missing</span></p>
      <div style="overflow-x:auto">
        <table id="tm-table"></table>
      </div>
      <p id="tm-summary" aria-live="polite" class="form-hint"></p>
    </div>

    <section class="how-it-works">
      <h2>Using the matrix</h2>
      <ul>
        <li>The pre-loaded course list reflects common expectations in regulated services (Care Certificate, Ofsted/CQC inspection practice) — edit renewal periods to match <strong>your organisation's</strong> training policy, which is the authoritative source.</li>
        <li>"Due within 60 days" turns amber so you can book refreshers before anything lapses — a favourite inspection question is "show me your training compliance".</li>
        <li>Export the CSV monthly and store it with your quality-assurance records (it drops straight into the <a href="/templates/audit-schedule-annual/">audit schedule</a>).</li>
      </ul>
    </section>

    <?= view('partials/tool-footer', [
        'toolSlug' => 'training-matrix',
        'lastReviewed' => '2026-07-01',
        'related' => [
            ['title' => 'Induction Checklist (Care Certificate)', 'url' => '/templates/induction-checklist-care-certificate/', 'kind' => 'Template'],
            ['title' => 'Supervision Record', 'url' => '/templates/supervision-record-staff/', 'kind' => 'Template'],
            ['title' => 'Audit Schedule', 'url' => '/templates/audit-schedule-annual/', 'kind' => 'Template'],
        ],
    ]) ?>
  </div>
</div>
<script src="/assets/js/tools/training-matrix.js" defer></script>
