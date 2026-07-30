// SocialCareKit — global behaviour (nav toggle, filter chips). Vanilla JS.
(function () {
  'use strict';

  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Generic filter chips: buttons with [data-filter-group][data-filter-value]
  // filter elements carrying [data-filter-tags] (space-separated values).
  document.querySelectorAll('[data-filter-bar]').forEach(function (bar) {
    var state = {};
    bar.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-filter-value]');
      if (!btn) return;
      var group = btn.getAttribute('data-filter-group');
      state[group] = btn.getAttribute('data-filter-value');
      bar.querySelectorAll('[data-filter-group="' + group + '"]').forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      var items = document.querySelectorAll(bar.getAttribute('data-filter-bar'));
      items.forEach(function (item) {
        var tags = (item.getAttribute('data-filter-tags') || '').split(/\s+/);
        var show = Object.keys(state).every(function (g) {
          return state[g] === 'all' || tags.indexOf(state[g]) !== -1;
        });
        item.hidden = !show;
      });
      var live = document.getElementById(bar.getAttribute('data-filter-live') || '');
      if (live) {
        var visible = 0;
        items.forEach(function (i) { if (!i.hidden) visible++; });
        live.textContent = visible + ' result' + (visible === 1 ? '' : 's') + ' shown';
      }
    });
  });
})();
