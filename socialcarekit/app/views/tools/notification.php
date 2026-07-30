<div class="section">
  <div class="container">
    <h1>Notification Decision Tool</h1>
    <?= view('partials/tool-privacy') ?>

    <div class="tool-panel">
      <div id="ndt-app">
        <div id="ndt-question" aria-live="polite"></div>
        <div class="tool-actions">
          <button type="button" class="btn btn-ghost btn-sm" id="ndt-back" hidden>← Back</button>
          <button type="button" class="btn btn-ghost btn-sm" id="ndt-restart" hidden>Start again</button>
        </div>
      </div>
      <div id="ndt-result" class="tool-result" hidden aria-live="polite"></div>
      <div class="tool-actions" id="ndt-actions" hidden>
        <button type="button" class="btn btn-outline btn-sm" onclick="window.print()">Print this decision record (PDF)</button>
      </div>
    </div>

    <section class="how-it-works">
      <h2>How this works — the law behind it</h2>
      <p>Registered services must notify their regulator of certain events:</p>
      <ul>
        <li><strong>Children's homes:</strong> Regulation 40 of the Children's Homes (England) Regulations 2015 requires the registered person to notify Ofsted (and others, including the placing authority) <strong>without delay</strong> of the events listed, using the Ofsted online notification system. Serious events may also need the LADO, the police, or a referral to the DBS under the Safeguarding Vulnerable Groups Act 2006.</li>
        <li><strong>CQC-registered services:</strong> the Care Quality Commission (Registration) Regulations 2009 — Reg 16 (deaths), Reg 17 (DoLS outcomes) and Reg 18 (other incidents: serious injury, abuse or allegations, police incidents, events stopping the safe running of the service) — require notification without delay through the CQC provider portal or forms.</li>
      </ul>
      <p>The printable decision record produced by this tool is evidence of your decision-making at the time — file it even when the answer is "no notification required".</p>
      <p><strong>This tool cannot cover every circumstance.</strong> If in doubt, notify — regulators consistently say they prefer over-notification to silence — and consult your registered manager or responsible individual.</p>
    </section>

    <?= view('partials/tool-footer', [
        'toolSlug' => 'notification-decision-tool',
        'lastReviewed' => '2026-07-01',
        'related' => [
            ['title' => 'Understanding the Children\'s Homes Quality Standards', 'url' => '/guides/childrens-homes-quality-standards/', 'kind' => 'Guide'],
            ['title' => 'What CQC inspectors look for', 'url' => '/guides/cqc-single-assessment-framework/', 'kind' => 'Guide'],
            ['title' => 'Incident/Accident Form', 'url' => '/templates/incident-accident-form/', 'kind' => 'Template'],
        ],
    ]) ?>
  </div>
</div>
<script src="/assets/js/tools/notification.js" defer></script>
