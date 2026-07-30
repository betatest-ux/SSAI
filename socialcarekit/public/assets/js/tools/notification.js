// Notification Decision Tool — data-driven decision tree, fully client-side.
(function () {
  'use strict';
  var qEl = document.getElementById('ndt-question');
  if (!qEl) return;
  var resultEl = document.getElementById('ndt-result');
  var actionsEl = document.getElementById('ndt-actions');
  var backBtn = document.getElementById('ndt-back');
  var restartBtn = document.getElementById('ndt-restart');

  var CONTENTS_OFSTED = [
    'Name of the home, registration number, and registered person/manager',
    'Child\'s initials, age, legal status and placing authority',
    'Date, time and place of the event',
    'Factual description of what happened and who was involved',
    'Immediate action taken to protect the child(ren)',
    'Who else has been informed (placing authority, parents where appropriate, LADO, police, DBS)',
    'Ongoing actions, and the name/role of the person making the notification'
  ];
  var CONTENTS_CQC = [
    'Provider and location ID, and service name',
    'Person\'s initials (never full names in free text), age and relevant needs',
    'Date, time and place of the incident',
    'Factual description of the incident and immediate response',
    'Injuries and treatment provided, if any',
    'Who else has been informed (family, GP, police, safeguarding team, coroner where relevant)',
    'Actions being taken to prevent recurrence, and the notifier\'s name/role'
  ];

  function outcome(o) { return { outcome: o }; }

  var TREE = {
    start: {
      q: 'Which regulator is the service registered with?',
      options: [
        { label: 'Ofsted — children\'s home', next: 'of-event' },
        { label: 'CQC — adult social care service', next: 'cqc-event' }
      ]
    },

    // ---------------- Ofsted (Reg 40, CHR 2015) ----------------
    'of-event': {
      q: 'What has happened?',
      options: [
        { label: 'A child has died', next: outcome({
          required: true, reg: 'Reg 40(4)(a), Children\'s Homes (England) Regulations 2015',
          who: ['Ofsted', 'The placing authority (and the local authority where the home is located)', 'The Secretary of State (via Ofsted notification)', 'Police and coroner as directed', 'Parents/those with parental responsibility, as appropriate'],
          when: 'Without delay', extra: 'Also consider a Serious Incident Notification to the Child Safeguarding Practice Review Panel via the local authority, and preserve the scene and records.' }) },
        { label: 'Serious illness, serious accident or serious injury to a child', next: 'of-serious' },
        { label: 'Allegation of abuse against the home, staff or others', next: outcome({
          required: true, reg: 'Reg 40(4)(c), Children\'s Homes (England) Regulations 2015',
          who: ['Ofsted', 'LADO (allegation against a person who works with children — within 1 working day)', 'Placing authority', 'Police, if a crime may have been committed'],
          when: 'Without delay', extra: 'Follow your allegations-management policy. Do not investigate ahead of the LADO/police strategy discussion. Consider suspension as a neutral act, and DBS referral duties if a person is removed from regulated activity.' }) },
        { label: 'Child protection enquiry (s.47) started or concluded', next: outcome({
          required: true, reg: 'Reg 40(4)(d), Children\'s Homes (England) Regulations 2015',
          who: ['Ofsted', 'Placing authority (they may already be leading it)'],
          when: 'Without delay — both when the enquiry starts and when the outcome is known',
          extra: 'Record the enquiry outcome and any actions for the home in the child\'s records.' }) },
        { label: 'Involvement, or suspected involvement, in sexual exploitation (or criminal exploitation)', next: outcome({
          required: true, reg: 'Reg 40(4)(b), Children\'s Homes (England) Regulations 2015',
          who: ['Ofsted', 'Police', 'Placing authority'],
          when: 'Without delay', extra: 'Update the child\'s risk assessments and missing/exploitation plans. Consider a National Referral Mechanism (NRM) referral for suspected trafficking/criminal exploitation.' }) },
        { label: 'Incident requiring police involvement (call-out to the home)', next: 'of-police' },
        { label: 'Referral of a person working at the home to the DBS', next: outcome({
          required: true, reg: 'Reg 40(4)(f), Children\'s Homes (England) Regulations 2015',
          who: ['Ofsted'], when: 'Without delay',
          extra: 'A DBS referral is itself a legal duty (Safeguarding Vulnerable Groups Act 2006) where a person has been removed from regulated activity because they harmed or posed a risk of harm to a child.' }) },
        { label: 'Child is missing from the home', next: 'of-missing' },
        { label: 'Something else involving a child', next: 'of-other' }
      ]
    },
    'of-serious': {
      q: 'How serious is the illness/accident?',
      options: [
        { label: 'The child needed emergency/hospital treatment, or the outcome is potentially serious', next: outcome({
          required: true, reg: 'Reg 40(4)(e), Children\'s Homes (England) Regulations 2015',
          who: ['Ofsted', 'Placing authority', 'Parents/those with parental responsibility, as appropriate'],
          when: 'Without delay', extra: 'Also consider RIDDOR reporting to the HSE where the incident is work-related, and record first-aid given.' }) },
        { label: 'Minor bump, scrape or short-lived illness handled in-house', next: outcome({
          required: false, reg: 'Reg 40, Children\'s Homes (England) Regulations 2015',
          who: [], when: '', extra: 'Record it in the child\'s records and daily log, tell the placing authority through normal reporting, and keep this decision record. If the picture worsens, reassess — the duty is triggered by seriousness, not by the initial label.' }) }
      ]
    },
    'of-police': {
      q: 'Were the police actively involved (attended, investigating, or a crime recorded)?',
      options: [
        { label: 'Yes', next: outcome({
          required: true, reg: 'Reg 40(4)(g), Children\'s Homes (England) Regulations 2015',
          who: ['Ofsted', 'Placing authority'], when: 'Without delay',
          extra: 'Include the police incident/CAD reference. If the incident involved restraint, complete the Reg 35 restraint record too.' }) },
        { label: 'No — advice call only, no attendance or investigation', next: outcome({
          required: false, reg: 'Reg 40(4)(g), Children\'s Homes (England) Regulations 2015',
          who: [], when: '', extra: 'A routine advice call without police involvement is not automatically notifiable — but record it, and notify if it develops. If the registered person considers the underlying incident serious, notify under Reg 40(4)(h).' }) }
      ]
    },
    'of-missing': {
      q: 'Has the child been missing, or is this an unauthorised absence within known limits?',
      options: [
        { label: 'Missing — whereabouts unknown / police informed', next: outcome({
          required: true, reg: 'Reg 40(4)(h) and statutory guidance on children missing from care',
          who: ['Police (if whereabouts unknown and risk assessment requires)', 'Placing authority and parents as appropriate', 'Ofsted — for serious or repeated episodes, and always where there is police involvement'],
          when: 'Police and placing authority immediately; Ofsted without delay',
          extra: 'On return, arrange an independent return home interview within 72 hours and update the missing risk plan. Use the missing-from-care record template.' }) },
        { label: 'Short unauthorised absence, whereabouts known, returned safely', next: outcome({
          required: false, reg: 'Reg 40, Children\'s Homes (England) Regulations 2015',
          who: [], when: '', extra: 'Record the absence, inform the placing authority through normal reporting, and review whether the pattern is escalating. Repeated episodes may become notifiable as serious.' }) }
      ]
    },
    'of-other': {
      q: 'Does the registered person consider the incident serious in relation to a child (harm, significant risk, major disruption to their care)?',
      options: [
        { label: 'Yes — it is serious', next: outcome({
          required: true, reg: 'Reg 40(4)(h), Children\'s Homes (England) Regulations 2015 (any other incident the registered person considers serious)',
          who: ['Ofsted', 'Placing authority'], when: 'Without delay',
          extra: 'The catch-all exists precisely for judgement calls: if you are debating it, that usually means notify.' }) },
        { label: 'No — minor and managed', next: outcome({
          required: false, reg: 'Reg 40(4)(h), Children\'s Homes (England) Regulations 2015',
          who: [], when: '', extra: 'Record your reasoning and keep this decision record — being able to show why you did not notify is part of good governance (and is exactly what Reg 44 visitors and inspectors look for).' }) }
      ]
    },

    // ---------------- CQC (Regs 16–18, CQC (Registration) Regulations 2009) ----------------
    'cqc-event': {
      q: 'What has happened?',
      options: [
        { label: 'A person using the service has died', next: 'cqc-death' },
        { label: 'Serious injury to a person using the service', next: 'cqc-injury' },
        { label: 'Abuse, or an allegation of abuse', next: outcome({
          required: true, reg: 'Reg 18(2)(e), CQC (Registration) Regulations 2009',
          who: ['CQC', 'Local authority safeguarding team (s.42 Care Act referral)', 'Police, if a crime may have been committed', 'Relevant commissioners'],
          when: 'Without delay', extra: 'Follow your safeguarding policy; preserve evidence; consider immediate protective measures and the duty of candour (Reg 20) conversation with the person/family.', contents: 'cqc' }) },
        { label: 'DoLS application made, or its outcome received', next: outcome({
          required: true, reg: 'Reg 17A / Reg 18, CQC (Registration) Regulations 2009 (DoLS notifications)',
          who: ['CQC — notify the application and, separately, its outcome'],
          when: 'Without delay once the application is made and again when the outcome is known',
          extra: 'Track applications, authorisations, conditions and expiry dates — the DoLS tracker template helps.', contents: 'cqc' }) },
        { label: 'Incident reported to, or investigated by, the police', next: outcome({
          required: true, reg: 'Reg 18(2)(f), CQC (Registration) Regulations 2009',
          who: ['CQC', 'Local safeguarding team where a person using the service is affected'],
          when: 'Without delay', extra: 'Include the police reference number and the immediate steps taken to keep people safe.', contents: 'cqc' }) },
        { label: 'Event stopping, or likely to stop, the safe running of the service', next: outcome({
          required: true, reg: 'Reg 18(2)(g)–(h), CQC (Registration) Regulations 2009',
          who: ['CQC', 'Commissioners/local authority, especially if continuity of care is at risk'],
          when: 'Without delay', extra: 'Covers events like loss of utilities or premises, staffing collapse, or IT failure affecting medicines administration — and the action taken to keep people safe.', contents: 'cqc' }) },
        { label: 'Something else', next: 'cqc-other' }
      ]
    },
    'cqc-death': {
      q: 'Where and how did the person die?',
      options: [
        { label: 'While receiving the regulated activity, or as a possible result of it (including within 2 weeks of leaving an unwell state related to care)', next: outcome({
          required: true, reg: 'Reg 16, CQC (Registration) Regulations 2009',
          who: ['CQC (unless already notified to NHS England through agreed routes)', 'Coroner where the death was unexpected, violent or cause unknown', 'Local authority safeguarding team if abuse/neglect may be a factor', 'Family, with the duty of candour in mind'],
          when: 'Without delay', extra: 'For deaths subject to DoLS at the time, notify CQC and follow coroner requirements. Preserve records and medication charts.', contents: 'cqc' }) },
        { label: 'Expected death under end-of-life care, unrelated to the service\'s care', next: outcome({
          required: true, reg: 'Reg 16, CQC (Registration) Regulations 2009',
          who: ['CQC — expected deaths of people using the service are still notifiable for residential services'],
          when: 'Without delay', extra: 'Use the standard death notification form; note anticipatory care plans (ReSPECT/DNACPR) in the record.', contents: 'cqc' }) }
      ]
    },
    'cqc-injury': {
      q: 'How serious is the injury?',
      options: [
        { label: 'Serious: fractures, prolonged pain/psychiatric harm, permanent damage, or hospital treatment required', next: outcome({
          required: true, reg: 'Reg 18(2)(a)–(b), CQC (Registration) Regulations 2009',
          who: ['CQC', 'Family/representatives (duty of candour, Reg 20)', 'RIDDOR report to HSE if work-related', 'Safeguarding team if neglect or abuse may be a factor'],
          when: 'Without delay', extra: 'Record the injury on a body map and incident form; review risk assessments and equipment.', contents: 'cqc' }) },
        { label: 'Minor: first-aid level, no lasting effect', next: outcome({
          required: false, reg: 'Reg 18, CQC (Registration) Regulations 2009',
          who: [], when: '', extra: 'Not notifiable, but record it, monitor (especially head injuries and skin integrity), analyse falls patterns, and keep this decision record.', contents: 'cqc' }) }
      ]
    },
    'cqc-other': {
      q: 'Does the event seriously affect people\'s health, safety or welfare, or the service\'s ability to run safely?',
      options: [
        { label: 'Yes', next: outcome({
          required: true, reg: 'Reg 18, CQC (Registration) Regulations 2009',
          who: ['CQC', 'Commissioners and safeguarding partners as relevant'],
          when: 'Without delay', extra: 'If you are unsure which category fits, notify with your best description — CQC prefers over-notification to silence.', contents: 'cqc' }) },
        { label: 'No — routine operational matter', next: outcome({
          required: false, reg: 'Regs 16–18, CQC (Registration) Regulations 2009',
          who: [], when: '', extra: 'No notification needed. Record the event and your reasoning, and keep this decision record.', contents: 'cqc' }) }
      ]
    }
  };

  var trail = [];

  function renderNode(key) {
    var node = TREE[key];
    resultEl.hidden = true;
    actionsEl.hidden = true;
    qEl.innerHTML = '<h2 style="margin-top:0">' + node.q + '</h2>' +
      node.options.map(function (o, i) {
        return '<button type="button" class="btn btn-outline" style="display:block;width:100%;max-width:640px;text-align:left;margin:.4rem 0" data-opt="' + i + '">' + o.label + '</button>';
      }).join('');
    qEl.querySelectorAll('[data-opt]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var opt = node.options[parseInt(btn.getAttribute('data-opt'), 10)];
        trail.push({ q: node.q, a: opt.label, key: key });
        if (opt.next && opt.next.outcome) showOutcome(opt.next.outcome);
        else renderNode(opt.next);
        updateNav();
      });
    });
    updateNav();
  }

  function showOutcome(o) {
    qEl.innerHTML = '';
    var isOfsted = trail[0] && trail[0].a.indexOf('Ofsted') === 0;
    var contents = o.contents === 'cqc' || !isOfsted ? CONTENTS_CQC : CONTENTS_OFSTED;
    var method = isOfsted
      ? 'Submit through Ofsted Online (the online notification system). Phone Ofsted on 0300 123 1231 if the system is unavailable — then follow up online.'
      : 'Submit through the CQC provider portal (or the relevant statutory notification form). Deaths and some events have dedicated forms.';
    var html = '<h2>' + (o.required ? 'Notification required: YES' : 'Notification required: NO') + '</h2>' +
      '<p><strong>Legal basis:</strong> ' + o.reg + '</p>';
    if (o.required) {
      html += '<p><strong>Who to notify:</strong></p><ul>' + o.who.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul>' +
        '<p><strong>Timescale:</strong> ' + o.when + '</p>' +
        '<p><strong>Method:</strong> ' + method + '</p>' +
        '<p><strong>The notification should contain:</strong></p><ul>' + contents.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>';
    }
    if (o.extra) html += '<p>' + o.extra + '</p>';
    html += '<h3>Your answers</h3><ol>' + trail.map(function (t) { return '<li>' + t.q + ' — <strong>' + t.a + '</strong></li>'; }).join('') + '</ol>' +
      '<div class="print-only"><p>Decision record generated by the SocialCareKit Notification Decision Tool on ' +
      new Date().toLocaleString('en-GB') + '.</p><p>Decision made by (name/role): ______________________  Signature: ______________________</p>' +
      '<p>Guidance only — not legal advice. Check the regulations and your policies for your specific circumstances.</p></div>';
    resultEl.className = 'tool-result ' + (o.required ? 'warn' : 'pass');
    resultEl.innerHTML = html;
    resultEl.hidden = false;
    actionsEl.hidden = false;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function updateNav() {
    backBtn.hidden = trail.length === 0;
    restartBtn.hidden = trail.length === 0;
  }
  backBtn.addEventListener('click', function () {
    var last = trail.pop();
    if (last) renderNode(last.key);
  });
  restartBtn.addEventListener('click', function () {
    trail = [];
    renderNode('start');
  });

  renderNode('start');
})();
