<?php
/** @var array $rates rows from nmw_rates (newest first) */
$ratesJson = json_encode($rates, JSON_UNESCAPED_SLASHES);
$current = [];
foreach ($rates as $r) {
    if (strtotime($r['effective_from']) <= time() && !isset($current[$r['band']])) {
        $current[$r['band']] = $r;
    }
}
// Present bands in age order, adult rate (the common case) first.
$bandOrder = ['nlw_21_over', 'age_18_20', 'age_16_17', 'apprentice'];
uksort($current, fn($x, $y) => array_search($x, $bandOrder, true) <=> array_search($y, $bandOrder, true));
?>
<div class="section" data-reveal>
  <div class="container">
    <h1>Sleep-in Pay &amp; National Minimum Wage Checker</h1>
    <?= view('partials/tool-privacy') ?>

    <div class="tool-panel" data-reveal>
      <form id="sleepin-form" novalidate>
        <div class="grid grid-2">
          <div>
            <div class="form-row">
              <label for="si-band">Your age band (sets your minimum wage rate)</label>
              <select id="si-band" required>
                <?php foreach ($current as $band => $r): ?>
                <option value="<?= e($band) ?>"><?= e($r['label']) ?> — £<?= e($r['hourly_rate']) ?>/hour</option>
                <?php endforeach; ?>
              </select>
              <p class="form-hint">Rates effective from <?= e(format_date(reset($current)['effective_from'] ?? null)) ?>. Apprentice rate applies in the first year of an apprenticeship or when under 19.</p>
            </div>
            <div class="form-row">
              <label for="si-period">Pay reference period</label>
              <select id="si-period">
                <option value="weekly">Weekly</option>
                <option value="monthly" selected>Monthly</option>
              </select>
            </div>
            <div class="form-row">
              <label for="si-rate">Your basic hourly rate (£)</label>
              <input type="number" id="si-rate" min="0" step="0.01" inputmode="decimal" required>
            </div>
            <div class="form-row">
              <label for="si-hours">Contracted / worked hours in the period (excluding sleep-ins)</label>
              <input type="number" id="si-hours" min="0" step="0.25" inputmode="decimal" required>
            </div>
          </div>
          <div>
            <div class="form-row">
              <label for="si-shifts">Number of sleep-in shifts in the period</label>
              <input type="number" id="si-shifts" min="0" step="1" inputmode="numeric" value="0">
            </div>
            <div class="form-row">
              <label for="si-flat">Flat rate paid per sleep-in (£)</label>
              <input type="number" id="si-flat" min="0" step="0.01" inputmode="decimal" value="0">
            </div>
            <div class="form-row">
              <label for="si-awake">Total hours <strong>awake and working</strong> during sleep-ins in the period</label>
              <input type="number" id="si-awake" min="0" step="0.25" inputmode="decimal" value="0">
              <p class="form-hint">Only time you were up and working (responding to a young person, dealing with an incident) counts — not time asleep or resting.</p>
            </div>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Check my pay</button>
      </form>

      <div id="si-result" class="tool-result" hidden aria-live="polite"></div>
      <div class="tool-actions" id="si-actions" hidden>
        <button type="button" class="btn btn-outline btn-sm" onclick="window.print()">Print / save as PDF</button>
      </div>
    </div>

    <section class="how-it-works">
      <h2>How this works — the law behind it</h2>
      <p>The Supreme Court decided in <em>Royal Mencap Society v Tomlinson-Blake</em> [2021] UKSC 8 that workers on sleep-in shifts are only doing "work" for National Minimum Wage purposes when they are <strong>awake for the purposes of working</strong>. Time spent asleep — even though you must stay on the premises — does not count towards NMW calculations.</p>
      <p>This checker therefore counts:</p>
      <ul>
        <li><strong>NMW-countable hours</strong> = your contracted/worked hours + hours awake and working during sleep-ins;</li>
        <li><strong>Total pay</strong> = (hours × hourly rate) + sleep-in allowances;</li>
        <li><strong>Effective hourly rate</strong> = total pay ÷ countable hours, compared against your NMW/NLW band.</li>
      </ul>
      <p>Your <em>contract</em> may still entitle you to more than the NMW for sleep-ins — check your contract and any collective agreement. If your effective rate is below your band, your employer may owe you arrears.</p>
      <p><strong>Underpaid?</strong> Read <a href="/rights/sleep-in-pay-explained/">sleep-in pay explained</a> and <a href="/rights/">your rights section</a>: start with ACAS (0300&nbsp;123&nbsp;1100) and you can complain to HMRC, which enforces the NMW, at gov.uk.</p>
    </section>

    <?= view('partials/tool-footer', [
        'toolSlug' => 'sleep-in-pay-checker',
        'lastReviewed' => '2026-07-01',
        'related' => [
            ['title' => 'Sleep-in pay explained', 'url' => '/rights/sleep-in-pay-explained/', 'kind' => 'Your rights'],
            ['title' => 'Payslips: what to check', 'url' => '/rights/payslips-what-to-check/', 'kind' => 'Your rights'],
            ['title' => 'Working Time Regulations Checker', 'url' => '/tools/working-time-checker/', 'kind' => 'Tool'],
        ],
    ]) ?>
  </div>
</div>
<script>window.SCK_NMW_RATES = <?= $ratesJson ?>;</script>
<script src="/assets/js/tools/sleep-in.js" defer></script>
