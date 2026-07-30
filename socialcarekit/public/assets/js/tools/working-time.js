// Working Time Regulations checker — fully client-side.
(function () {
  'use strict';
  var form = document.getElementById('wtr-form');
  if (!form) return;
  var P = window.SCK_WTR || { weekly_limit: 48, daily_rest: 11, weekly_rest: 24, break_minutes: 20, break_trigger_hours: 6, night_limit: 8 };
  var resultEl = document.getElementById('wtr-result');
  var actionsEl = document.getElementById('wtr-actions');
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  function rag(status, label, detail, reg) {
    var cls = { green: 'rag-green', amber: 'rag-amber', red: 'rag-red' }[status];
    var word = { green: 'OK', amber: 'CHECK', red: 'ISSUE' }[status];
    return '<li><span class="rag ' + cls + '"><span class="rag-dot" aria-hidden="true"></span>' + word + '</span>' +
      '<span><strong>' + label + '</strong> <span class="search-kind">(' + reg + ')</span><br>' + detail + '</span></li>';
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var shifts = [];
    for (var i = 0; i < 7; i++) {
      var s = document.getElementById('wtr-s' + i).value;
      var e = document.getElementById('wtr-e' + i).value;
      var b = parseFloat(document.getElementById('wtr-b' + i).value) || 0;
      if (!s || !e) continue;
      var start = i * 24 * 60 + toMin(s);
      var end = i * 24 * 60 + toMin(e);
      if (end <= start) end += 24 * 60; // overnight shift
      shifts.push({ day: i, start: start, end: end, breaks: b, worked: (end - start - b) / 60, span: (end - start) / 60 });
    }
    function toMin(t) { var p = t.split(':'); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }

    if (!shifts.length) {
      resultEl.className = 'tool-result warn';
      resultEl.hidden = false;
      resultEl.innerHTML = '<h2>Enter at least one shift</h2>';
      return;
    }

    var night = document.getElementById('wtr-night').checked;
    var optout = document.getElementById('wtr-optout').checked;
    var checks = [];
    var totalWorked = shifts.reduce(function (a, s) { return a + s.worked; }, 0);

    // 1. 48-hour weekly limit
    if (totalWorked <= P.weekly_limit) {
      checks.push(rag('green', 'Average weekly limit', 'You worked ' + totalWorked.toFixed(1) + ' hours this week, within the ' + P.weekly_limit + '-hour limit. The legal test averages over 17 weeks, so one heavy week is not automatically a breach.', 'WTR 1998 reg 4'));
    } else if (optout) {
      checks.push(rag('amber', 'Average weekly limit', totalWorked.toFixed(1) + ' hours this week exceeds ' + P.weekly_limit + ', but you have signed an opt-out so the limit does not apply. You can cancel an opt-out with at most 3 months\' notice, and rest rights below still apply.', 'WTR 1998 regs 4–5'));
    } else {
      checks.push(rag('red', 'Average weekly limit', totalWorked.toFixed(1) + ' hours this week exceeds the ' + P.weekly_limit + '-hour limit and you have not opted out. Compliant would be an average of ' + P.weekly_limit + ' hours or fewer over the 17-week reference period — check your other weeks.', 'WTR 1998 reg 4'));
    }

    // 2. 11 hours daily rest between shifts
    var restIssues = [];
    for (var j = 1; j < shifts.length; j++) {
      var gap = (shifts[j].start - shifts[j - 1].end) / 60;
      if (gap < P.daily_rest && gap >= 0) {
        restIssues.push(DAYS[shifts[j - 1].day] + '→' + DAYS[shifts[j].day] + ': ' + gap.toFixed(1) + 'h');
      }
    }
    if (restIssues.length) {
      checks.push(rag('red', 'Daily rest (' + P.daily_rest + ' hours between shifts)', 'Short gaps: ' + restIssues.join('; ') + '. Compliant is ' + P.daily_rest + ' consecutive hours between working days. In residential care this can be modified for continuity of care, but only with equivalent compensatory rest afterwards (regs 21–24).', 'WTR 1998 reg 10'));
    } else {
      checks.push(rag('green', 'Daily rest (' + P.daily_rest + ' hours between shifts)', 'All gaps between your shifts were at least ' + P.daily_rest + ' hours.', 'WTR 1998 reg 10'));
    }

    // 3. Weekly rest: longest continuous gap
    var longest = 0;
    var horizonStart = shifts[0].start, horizonEnd = shifts[shifts.length - 1].end;
    var prevEnd = 0; // start of week
    var segments = [];
    segments.push({ from: 0, to: shifts[0].start });
    for (var k = 1; k < shifts.length; k++) segments.push({ from: shifts[k - 1].end, to: shifts[k].start });
    segments.push({ from: shifts[shifts.length - 1].end, to: 7 * 24 * 60 });
    segments.forEach(function (g) { longest = Math.max(longest, (g.to - g.from) / 60); });
    if (longest >= P.weekly_rest) {
      checks.push(rag('green', 'Weekly rest (' + P.weekly_rest + ' hours)', 'Your longest unbroken rest this week was ' + longest.toFixed(0) + ' hours.', 'WTR 1998 reg 11'));
    } else {
      checks.push(rag('amber', 'Weekly rest (' + P.weekly_rest + ' hours)', 'Longest unbroken rest was ' + longest.toFixed(0) + ' hours. The rule allows 24 hours each week or 48 hours per fortnight — check the adjoining weeks. Compensatory rest rules can apply in residential care.', 'WTR 1998 reg 11'));
    }

    // 4. 20-minute break on 6h+ shifts
    var breakIssues = shifts.filter(function (s) { return s.span > P.break_trigger_hours && s.breaks < P.break_minutes; })
      .map(function (s) { return DAYS[s.day] + ' (' + s.span.toFixed(1) + 'h shift, ' + s.breaks + ' min break)'; });
    if (breakIssues.length) {
      checks.push(rag('red', 'In-shift rest break', 'Missing or short breaks: ' + breakIssues.join('; ') + '. Compliant is an uninterrupted ' + P.break_minutes + '-minute break during any shift over ' + P.break_trigger_hours + ' hours — not at the start or end of the shift.', 'WTR 1998 reg 12'));
    } else {
      checks.push(rag('green', 'In-shift rest break', 'Every shift over ' + P.break_trigger_hours + ' hours included at least a ' + P.break_minutes + '-minute break.', 'WTR 1998 reg 12'));
    }

    // 5. Night work
    if (night) {
      var avgPerDay = totalWorked / 7 * (7 / Math.max(shifts.length, 1));
      var avgNight = totalWorked / shifts.length;
      if (avgNight > P.night_limit) {
        checks.push(rag('amber', 'Night work limit', 'Your shifts average ' + avgNight.toFixed(1) + ' hours. Night workers\' normal hours must not average more than ' + P.night_limit + ' in each 24 over the reference period. Special-hazard work has an absolute 8-hour cap. You are also entitled to a free health assessment.', 'WTR 1998 regs 6–7'));
      } else {
        checks.push(rag('green', 'Night work limit', 'Your shifts average ' + avgNight.toFixed(1) + ' hours, within the ' + P.night_limit + '-hour night-work average. Remember your right to a free health assessment.', 'WTR 1998 regs 6–7'));
      }
    }

    var reds = (checks.join('').match(/rag-red/g) || []).length;
    resultEl.className = 'tool-result ' + (reds ? 'fail' : 'pass');
    resultEl.hidden = false;
    resultEl.innerHTML = '<h2>' + (reds ? reds + ' issue' + (reds > 1 ? 's' : '') + ' to look at' : 'No issues found this week') + '</h2>' +
      '<ul class="check-list">' + checks.join('') + '</ul>' +
      '<p>Where residential care relies on the continuity-of-services exception, missed rest must be replaced with <strong>compensatory rest</strong> as soon as possible — it does not simply disappear.</p>' +
      '<p class="print-only">Generated by SocialCareKit working time checker on ' + new Date().toLocaleDateString('en-GB') + '. Guidance only — not legal advice.</p>';
    actionsEl.hidden = false;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
})();
