<div class="section" data-reveal>
  <div class="container">
    <h1>Holiday Accrual Calculator</h1>
    <?= view('partials/tool-privacy') ?>

    <div class="tool-panel" data-reveal>
      <form id="hol-form" novalidate>
        <fieldset>
          <legend>What do you want to work out?</legend>
          <label class="radio-row"><input type="radio" name="hol-mode" value="regular" checked> Regular hours, full-year worker — annual entitlement</label>
          <label class="radio-row"><input type="radio" name="hol-mode" value="irregular"> Irregular hours / part-year worker — accrual this pay period (12.07%)</label>
          <label class="radio-row"><input type="radio" name="hol-mode" value="leaver"> Leaver — accrued vs taken, and pay in lieu</label>
        </fieldset>

        <div data-mode="regular">
          <div class="form-row">
            <label for="hol-days-week">Days worked per week</label>
            <input type="number" id="hol-days-week" min="0" max="7" step="0.5" value="5" inputmode="decimal">
          </div>
          <div class="form-row">
            <label for="hol-hours-day">Average hours per working day</label>
            <input type="number" id="hol-hours-day" min="0" step="0.25" value="8" inputmode="decimal">
          </div>
        </div>

        <div data-mode="irregular" hidden>
          <div class="form-row">
            <label for="hol-worked">Hours worked in this pay period</label>
            <input type="number" id="hol-worked" min="0" step="0.25" inputmode="decimal">
          </div>
          <div class="form-row">
            <label class="check-row"><input type="checkbox" id="hol-rolled"> My employer uses rolled-up holiday pay (12.07% uplift on the payslip)</label>
          </div>
          <div class="form-row">
            <label for="hol-rate-i">Hourly rate (£) — optional, to show the rolled-up amount</label>
            <input type="number" id="hol-rate-i" min="0" step="0.01" inputmode="decimal">
          </div>
        </div>

        <div data-mode="leaver" hidden>
          <div class="grid grid-2">
            <div>
              <div class="form-row">
                <label for="hol-ly-start">Leave year start date</label>
                <input type="date" id="hol-ly-start">
              </div>
              <div class="form-row">
                <label for="hol-leave-date">Leaving date</label>
                <input type="date" id="hol-leave-date">
              </div>
              <div class="form-row">
                <label for="hol-entitle">Full-year entitlement (days)</label>
                <input type="number" id="hol-entitle" min="0" step="0.5" value="28" inputmode="decimal">
                <p class="form-hint">Statutory minimum is 5.6 × days worked per week, capped at 28 days.</p>
              </div>
            </div>
            <div>
              <div class="form-row">
                <label for="hol-taken">Holiday already taken this leave year (days)</label>
                <input type="number" id="hol-taken" min="0" step="0.5" value="0" inputmode="decimal">
              </div>
              <div class="form-row">
                <label for="hol-hours-day-l">Hours per working day</label>
                <input type="number" id="hol-hours-day-l" min="0" step="0.25" value="8" inputmode="decimal">
              </div>
              <div class="form-row">
                <label for="hol-rate-l">Hourly rate (£)</label>
                <input type="number" id="hol-rate-l" min="0" step="0.01" inputmode="decimal">
              </div>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary">Calculate</button>
      </form>

      <div id="hol-result" class="tool-result" hidden aria-live="polite"></div>
      <div class="tool-actions" id="hol-actions" hidden>
        <button type="button" class="btn btn-outline btn-sm" onclick="window.print()">Print / save as PDF</button>
      </div>
    </div>

    <section class="how-it-works">
      <h2>How this works — the law behind it</h2>
      <p>Almost all workers are entitled to <strong>5.6 weeks' paid holiday</strong> a year (Working Time Regulations 1998, regs 13 and 13A), pro-rated for part-time work and capped at 28 days for the statutory minimum.</p>
      <h3>Irregular-hours and part-year workers</h3>
      <p>For leave years starting on or after <strong>1 April 2024</strong>, the Employment Rights (Amendment, Revocation and Transitional Provision) Regulations 2023 put the familiar <strong>12.07%</strong> method on a statutory footing: holiday accrues at 12.07% of hours worked in each pay period (12.07% = 5.6 ÷ 46.4, the working weeks left after holiday).</p>
      <h3>Rolled-up holiday pay</h3>
      <p>For irregular-hours and part-year workers only, employers may pay a <strong>12.07% uplift</strong> with each payslip instead of paying when leave is taken. It must be <strong>itemised separately on the payslip</strong> — if you can't see it as its own line, query it. You should still be enabled to actually take time off.</p>
      <h3>Leavers</h3>
      <p>When you leave part-way through a leave year you are entitled to payment in lieu of accrued-but-untaken statutory holiday (WTR reg 14): entitlement × fraction of the leave year worked, minus days taken.</p>
    </section>

    <?= view('partials/tool-footer', [
        'toolSlug' => 'holiday-accrual-calculator',
        'lastReviewed' => '2026-07-01',
        'related' => [
            ['title' => 'Payslips: what to check', 'url' => '/rights/payslips-what-to-check/', 'kind' => 'Your rights'],
            ['title' => 'Sleep-in Pay Checker', 'url' => '/tools/sleep-in-pay-checker/', 'kind' => 'Tool'],
            ['title' => 'Working Time Regulations Checker', 'url' => '/tools/working-time-checker/', 'kind' => 'Tool'],
        ],
    ]) ?>
  </div>
</div>
<script src="/assets/js/tools/holiday.js" defer></script>
