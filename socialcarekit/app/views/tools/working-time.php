<?php /** @var array $params WTR parameters from admin settings */ ?>
<div class="section">
  <div class="container">
    <h1>Working Time Regulations Checker</h1>
    <?= view('partials/tool-privacy') ?>

    <div class="tool-panel">
      <p>Enter one week's rota. Leave days you didn't work blank. Times use the 24-hour clock; shifts ending past midnight are handled automatically (e.g. 21:00–09:00).</p>
      <form id="wtr-form" novalidate>
        <div style="overflow-x:auto">
          <table id="wtr-table">
            <thead>
              <tr><th scope="col">Day</th><th scope="col">Start</th><th scope="col">End</th><th scope="col">Breaks taken (mins)</th></tr>
            </thead>
            <tbody>
              <?php foreach (['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] as $i => $day): ?>
              <tr>
                <th scope="row"><?= $day ?></th>
                <td><label class="visually-hidden" for="wtr-s<?= $i ?>"><?= $day ?> start</label><input type="time" id="wtr-s<?= $i ?>" style="max-width:130px"></td>
                <td><label class="visually-hidden" for="wtr-e<?= $i ?>"><?= $day ?> end</label><input type="time" id="wtr-e<?= $i ?>" style="max-width:130px"></td>
                <td><label class="visually-hidden" for="wtr-b<?= $i ?>"><?= $day ?> breaks</label><input type="number" id="wtr-b<?= $i ?>" min="0" step="5" value="0" style="max-width:110px" inputmode="numeric"></td>
              </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
        <div class="grid grid-2" style="margin:0 0 1rem">
          <label class="check-row"><input type="checkbox" id="wtr-night"> I am a night worker (I regularly work at least 3 hours between 23:00 and 06:00)</label>
          <label class="check-row"><input type="checkbox" id="wtr-optout"> I have signed a 48-hour opt-out agreement</label>
        </div>
        <button type="submit" class="btn btn-primary">Check this week</button>
      </form>

      <div id="wtr-result" class="tool-result" hidden aria-live="polite"></div>
      <div class="tool-actions" id="wtr-actions" hidden>
        <button type="button" class="btn btn-outline btn-sm" onclick="window.print()">Print / save as PDF</button>
      </div>
    </div>

    <section class="how-it-works">
      <h2>How this works — the law behind it</h2>
      <p>The Working Time Regulations 1998 set minimum rest standards. This checker looks at one week in isolation, so treat amber results as prompts to check a longer period:</p>
      <ul>
        <li><strong>48-hour average week (reg 4):</strong> average working time, normally over a 17-week reference period, must not exceed 48 hours unless you have opted out in writing.</li>
        <li><strong>Daily rest (reg 10):</strong> 11 consecutive hours' rest in each 24-hour period.</li>
        <li><strong>Weekly rest (reg 11):</strong> 24 uninterrupted hours each week, or 48 hours per fortnight.</li>
        <li><strong>Rest breaks (reg 12):</strong> 20 uninterrupted minutes when the working day exceeds 6 hours.</li>
        <li><strong>Night work (reg 6):</strong> night workers' normal hours must not average more than 8 in 24.</li>
        <li><strong>Residential care exception (regs 21–24):</strong> where continuity of care requires it, some entitlements can be modified — but the worker must then receive <strong>compensatory rest</strong>: an equivalent period of rest taken as soon as possible afterwards.</li>
      </ul>
    </section>

    <?= view('partials/tool-footer', [
        'toolSlug' => 'working-time-checker',
        'lastReviewed' => '2026-07-01',
        'related' => [
            ['title' => 'Secondary employment and the 48-hour week', 'url' => '/rights/secondary-employment-48-hour-week/', 'kind' => 'Your rights'],
            ['title' => 'Sleep-in Pay Checker', 'url' => '/tools/sleep-in-pay-checker/', 'kind' => 'Tool'],
            ['title' => 'Holiday Accrual Calculator', 'url' => '/tools/holiday-accrual-calculator/', 'kind' => 'Tool'],
        ],
    ]) ?>
  </div>
</div>
<script>window.SCK_WTR = <?= json_encode($params, JSON_UNESCAPED_SLASHES) ?>;</script>
<script src="/assets/js/tools/working-time.js" defer></script>
