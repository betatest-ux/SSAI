<div class="section">
  <div class="container">
    <h1>Body Map Recorder</h1>
    <?= view('partials/tool-privacy') ?>
    <div class="notice notice-danger">
      <p><strong>Nothing is saved anywhere.</strong> This page keeps the record only in your browser's memory. If you close or refresh the page the record is gone. Complete it, <strong>print it or save it as a PDF</strong>, and file it in your organisation's own recording system. This is deliberate: safeguarding records belong in your organisation's systems, not on our servers.</p>
    </div>

    <div class="tool-panel">
      <div class="grid grid-2">
        <div class="form-row">
          <label for="bm-variant">Body outline</label>
          <select id="bm-variant">
            <option value="adult">Adult</option>
            <option value="child">Child</option>
          </select>
        </div>
        <div class="form-row">
          <label for="bm-initials">Person's initials only</label>
          <input type="text" id="bm-initials" maxlength="5" autocomplete="off" placeholder="e.g. JD">
          <p class="form-hint" id="bm-initials-warn" hidden></p>
        </div>
      </div>

      <p><strong>Click or tap the outline to place a numbered marker</strong> at the site of each mark or injury, then complete its details below. Click a marker to remove it.</p>
      <div class="grid grid-2" id="bm-maps">
        <figure style="margin:0;text-align:center">
          <figcaption class="field-label">Front</figcaption>
          <svg id="bm-front" class="bm-svg" viewBox="0 0 200 420" role="img" aria-label="Front body outline — click to place a marker" style="max-width:230px;width:100%;background:#f5f8f8;border:1px solid #d8e0e0;border-radius:8px;cursor:crosshair"></svg>
        </figure>
        <figure style="margin:0;text-align:center">
          <figcaption class="field-label">Back</figcaption>
          <svg id="bm-back" class="bm-svg" viewBox="0 0 200 420" role="img" aria-label="Back body outline — click to place a marker" style="max-width:230px;width:100%;background:#f5f8f8;border:1px solid #d8e0e0;border-radius:8px;cursor:crosshair"></svg>
        </figure>
      </div>

      <div id="bm-markers"></div>

      <fieldset>
        <legend>Record details</legend>
        <div class="grid grid-2">
          <div class="form-row">
            <label for="bm-recorder">Recorded by (name and role)</label>
            <input type="text" id="bm-recorder" autocomplete="off">
          </div>
          <div class="form-row">
            <label for="bm-datetime">Date and time of observation</label>
            <input type="text" id="bm-datetime" autocomplete="off" placeholder="e.g. 30/07/2026 14:30">
          </div>
          <div class="form-row">
            <label for="bm-actions">Actions taken</label>
            <textarea id="bm-actions" rows="3"></textarea>
          </div>
          <div class="form-row">
            <label for="bm-reported">Reported to (name, role, date/time)</label>
            <textarea id="bm-reported" rows="3"></textarea>
          </div>
        </div>
      </fieldset>

      <div class="tool-actions">
        <button type="button" class="btn btn-primary" id="bm-print">Print / save as PDF</button>
        <button type="button" class="btn btn-outline" id="bm-clear">Clear everything</button>
      </div>
    </div>

    <section class="how-it-works">
      <h2>Using body maps well</h2>
      <ul>
        <li>Record <strong>facts, not interpretation</strong>: size (measure if possible), colour, shape, and the explanation given — in the person's own words where you can.</li>
        <li>Use <strong>initials only</strong> on the printed record; your organisation's system links it to the person securely.</li>
        <li>Never photograph injuries on personal devices; follow your organisation's photography policy.</li>
        <li>Report concerns immediately under your safeguarding procedure — a body map records, it does not replace a referral (children: s.47 enquiries via the placing/local authority; adults: a s.42 Care Act referral).</li>
        <li>The printed record should be signed, dated and filed the same day.</li>
      </ul>
    </section>

    <?= view('partials/tool-footer', [
        'toolSlug' => 'body-map',
        'lastReviewed' => '2026-07-01',
        'related' => [
            ['title' => 'Writing daily logs that stand up to scrutiny', 'url' => '/guides/writing-daily-logs-that-stand-up-to-scrutiny/', 'kind' => 'Guide'],
            ['title' => 'Incident/Accident Form', 'url' => '/templates/incident-accident-form/', 'kind' => 'Template'],
            ['title' => 'Notification Decision Tool', 'url' => '/tools/notification-decision-tool/', 'kind' => 'Tool'],
        ],
    ]) ?>
  </div>
</div>
<script src="/assets/js/tools/body-map.js" defer></script>
