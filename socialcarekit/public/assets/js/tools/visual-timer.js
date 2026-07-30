// Visual Timer / Now-and-Next board — client-side, offline-capable (PWA).
(function () {
  'use strict';
  var setup = document.getElementById('vt-setup');
  if (!setup) return;

  // ---- Icon library: ~40 simple, calm SVG picture cards -------------------
  // Each icon is drawn in a 64x64 viewBox with thick friendly strokes.
  var S = 'fill="none" stroke="#0f5257" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"';
  var A = 'fill="#f4a259" stroke="#0f5257" stroke-width="3"';
  var ICONS = {
    'eat':        '<circle cx="32" cy="34" r="16" ' + S + '/><path d="M12 12v14M8 12v8M16 12v8M12 26v10" ' + S + '/><path d="M52 12c3 0 4 4 4 8s-2 6-4 8v10" ' + S + '/>',
    'drink':      '<path d="M20 12h24l-3 38a4 4 0 0 1-4 4H27a4 4 0 0 1-4-4z" ' + S + '/><path d="M22 24h20" ' + S + '/>',
    'snack':      '<path d="M14 30a18 14 0 0 1 36 0z" ' + A + '/><path d="M14 34h36M20 42h24" ' + S + '/>',
    'breakfast':  '<circle cx="30" cy="36" r="14" ' + S + '/><circle cx="30" cy="36" r="6" ' + A + '/><path d="M50 22v22" ' + S + '/>',
    'school':     '<path d="M12 28l20-12 20 12v22H12z" ' + S + '/><rect x="27" y="36" width="10" height="14" ' + A + '/>',
    'home':       '<path d="M12 32L32 14l20 18" ' + S + '/><path d="M18 30v20h28V30" ' + S + '/>',
    'car':        '<path d="M12 36l4-12a4 4 0 0 1 4-3h24a4 4 0 0 1 4 3l4 12v10H12z" ' + S + '/><circle cx="22" cy="46" r="5" ' + A + '/><circle cx="42" cy="46" r="5" ' + A + '/>',
    'bus':        '<rect x="12" y="14" width="40" height="34" rx="6" ' + S + '/><path d="M12 34h40" ' + S + '/><circle cx="22" cy="52" r="4" ' + A + '/><circle cx="42" cy="52" r="4" ' + A + '/>',
    'walk':       '<circle cx="34" cy="12" r="6" ' + S + '/><path d="M34 18l-4 14 8 8 2 12M30 32l-8 6-2 10M34 26l10 4 6-2" ' + S + '/>',
    'bath':       '<path d="M12 34h40v6a10 10 0 0 1-10 10H22a10 10 0 0 1-10-10z" ' + S + '/><path d="M16 34V16a6 6 0 0 1 12 0" ' + S + '/><circle cx="36" cy="26" r="2" fill="#0f5257"/><circle cx="42" cy="20" r="2" fill="#0f5257"/>',
    'shower':     '<path d="M32 10v8M20 26a12 12 0 0 1 24 0z" ' + S + '/><path d="M22 34v4M28 36v6M34 36v6M40 34v4" ' + S + '/>',
    'teeth':      '<path d="M18 16c6-6 22-6 28 0 4 4 2 14-2 22-2 4-6 4-7 0l-2-6h-6l-2 6c-1 4-5 4-7 0-4-8-6-18-2-22z" ' + S + '/>',
    'toilet':     '<path d="M20 12h14v16H20z" ' + S + '/><path d="M16 28h28a14 12 0 0 1-14 14h0l2 10h-10l2-10a14 12 0 0 1-8-14z" ' + S + '/>',
    'wash-hands': '<path d="M14 30h22M14 38h22M14 46h20" ' + S + '/><path d="M44 18c4 8 8 14 8 20a8 8 0 0 1-16 0c0-6 4-12 8-20z" ' + A + '/>',
    'bed':        '<path d="M10 44V22M10 36h44v8M10 32h44" ' + S + '/><circle cx="20" cy="28" r="4" ' + A + '/>',
    'sleep':      '<path d="M40 14a18 18 0 1 0 12 26 16 16 0 0 1-12-26z" ' + A + '/><path d="M14 16h10l-10 10h10" ' + S + '/>',
    'wake-up':    '<circle cx="32" cy="36" r="12" ' + A + '/><path d="M32 16v-6M14 36H8M56 36h-6M18 22l-4-4M46 22l4-4" ' + S + '/>',
    'dressed':    '<path d="M24 12l8 6 8-6 10 8-6 8-4-2v24H24V26l-4 2-6-8z" ' + S + '/>',
    'play':       '<rect x="12" y="24" width="40" height="24" rx="8" ' + S + '/><circle cx="24" cy="36" r="3" fill="#0f5257"/><path d="M40 32v8M36 36h8" ' + S + '/>',
    'outside':    '<circle cx="20" cy="20" r="8" ' + A + '/><path d="M8 52c8-12 16-16 24-10 6 4 14 4 24-4" ' + S + '/>',
    'park':       '<circle cx="24" cy="22" r="10" ' + S + '/><path d="M24 32v20M16 52h16" ' + S + '/><path d="M44 30l8 22M52 30l-8 22" ' + S + '/>',
    'swimming':   '<path d="M8 44c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0" ' + S + '/><circle cx="26" cy="24" r="6" ' + S + '/><path d="M32 34l10-6 8 4" ' + S + '/>',
    'tablet':     '<rect x="16" y="10" width="32" height="44" rx="4" ' + S + '/><circle cx="32" cy="48" r="2" fill="#0f5257"/>',
    'tv':         '<rect x="10" y="16" width="44" height="30" rx="4" ' + S + '/><path d="M24 54h16" ' + S + '/>',
    'music':      '<path d="M24 46V16l24-6v30" ' + S + '/><circle cx="18" cy="46" r="6" ' + A + '/><circle cx="42" cy="40" r="6" ' + A + '/>',
    'reading':    '<path d="M32 16c-6-4-14-4-20-2v34c6-2 14-2 20 2 6-4 14-4 20-2V14c-6-2-14-2-20 2z" ' + S + '/><path d="M32 16v34" ' + S + '/>',
    'drawing':    '<path d="M14 50l4-12L44 12l8 8-26 26z" ' + S + '/><path d="M40 16l8 8" ' + S + '/>',
    'quiet-time': '<path d="M20 26a12 12 0 0 1 24 0v10l4 8H16l4-8z" ' + S + '/><path d="M26 50a6 6 0 0 0 12 0" ' + S + '/><path d="M10 10l44 44" stroke="#c97b2d" stroke-width="3.5" stroke-linecap="round"/>',
    'sensory':    '<circle cx="32" cy="32" r="6" ' + A + '/><circle cx="32" cy="32" r="14" ' + S + '/><circle cx="32" cy="32" r="22" ' + S + ' stroke-dasharray="4 6"/>',
    'medicine':   '<rect x="18" y="22" width="28" height="30" rx="6" ' + S + '/><path d="M24 22v-8h16v8" ' + S + '/><path d="M32 30v14M25 37h14" stroke="#c97b2d" stroke-width="3.5" stroke-linecap="round"/>',
    'doctor':     '<circle cx="32" cy="20" r="8" ' + S + '/><path d="M16 52c2-10 8-14 16-14s14 4 16 14" ' + S + '/><path d="M32 38v8M28 42h8" stroke="#c97b2d" stroke-width="3" stroke-linecap="round"/>',
    'brush-hair': '<path d="M20 14h8v36a4 4 0 0 1-8 0z" ' + S + '/><path d="M36 14h4v10M44 14h4v10" ' + S + '/><path d="M34 30c8 0 14 4 16 12" ' + S + '/>',
    'shopping':   '<path d="M16 22h32l-4 28H20z" ' + S + '/><path d="M24 22a8 8 0 0 1 16 0" ' + S + '/>',
    'cooking':    '<path d="M14 30h36v8a14 12 0 0 1-14 12h-8a14 12 0 0 1-14-12z" ' + S + '/><path d="M24 22v-4M32 22v-6M40 22v-4" ' + S + '/>',
    'helping':    '<path d="M20 30a8 8 0 1 1 8-8" ' + S + '/><path d="M44 30a8 8 0 1 0-8-8" ' + S + '/><path d="M12 52c2-8 8-12 20-12s18 4 20 12" ' + S + '/>',
    'friends':    '<circle cx="22" cy="22" r="7" ' + S + '/><circle cx="42" cy="22" r="7" ' + S + '/><path d="M10 50c2-8 6-12 12-12s10 4 12 12M34 46c2-5 5-8 8-8 4 0 8 4 10 12" ' + S + '/>',
    'talk':       '<path d="M12 14h28v20H24l-8 8v-8h-4z" ' + S + '/><path d="M46 26h8v16h-4v6l-6-6h-8" ' + S + '/>',
    'calm':       '<circle cx="32" cy="32" r="20" ' + S + '/><path d="M24 30h.1M40 30h.1" stroke="#0f5257" stroke-width="4" stroke-linecap="round"/><path d="M24 40q8 5 16 0" ' + S + '/>',
    'stop':       '<path d="M22 10h20l12 12v20L42 54H22L10 42V22z" ' + S + '/><path d="M22 32h20" stroke="#c97b2d" stroke-width="4" stroke-linecap="round"/>',
    'choice':     '<rect x="10" y="18" width="18" height="28" rx="4" ' + S + '/><rect x="36" y="18" width="18" height="28" rx="4" ' + S + '/><path d="M19 40h.1M45 40h.1" stroke="#c97b2d" stroke-width="5" stroke-linecap="round"/>',
    'finished':   '<circle cx="32" cy="32" r="20" ' + S + '/><path d="M22 32l7 7 13-14" stroke="#106934" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  function iconSvg(name, big) {
    return '<svg viewBox="0 0 64 64" ' + (big ? '' : 'width="52" height="52"') + ' aria-hidden="true">' + (ICONS[name] || ICONS['play']) + '</svg>';
  }

  var chosen = { now: 'play', next: 'finished' };

  ['now', 'next'].forEach(function (slot) {
    var grid = document.getElementById('vt-' + slot + '-icons');
    Object.keys(ICONS).forEach(function (name) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', chosen[slot] === name ? 'true' : 'false');
      btn.setAttribute('aria-label', name.replace(/-/g, ' '));
      btn.innerHTML = iconSvg(name) + '<span class="vt-icon-name">' + name.replace(/-/g, ' ') + '</span>';
      btn.addEventListener('click', function () {
        chosen[slot] = name;
        grid.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-selected', 'false'); });
        btn.setAttribute('aria-selected', 'true');
      });
      grid.appendChild(btn);
    });
  });

  // ---- Board & timer -------------------------------------------------------
  var board = document.getElementById('vt-board');
  var countdownEl = document.getElementById('vt-countdown');
  var state = { total: 0, left: 0, running: false, tick: null };

  function card(slot) {
    var label = document.getElementById('vt-' + slot + '-label').value || '';
    return '<div>' + iconSvg(chosen[slot], true) + '</div><div class="vt-label">' + escapeHtml(label) + '</div>';
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function startBoard(fullscreen) {
    document.getElementById('vt-card-now').innerHTML = card('now');
    document.getElementById('vt-card-next').innerHTML = card('next');
    state.total = parseInt(document.getElementById('vt-minutes').value, 10) * 60;
    state.left = state.total;
    state.running = true;
    board.hidden = false;
    document.body.style.overflow = 'hidden';
    if (fullscreen && board.requestFullscreen) {
      board.requestFullscreen().catch(function () {});
    }
    clearInterval(state.tick);
    state.tick = setInterval(onTick, 1000);
    drawCountdown();
  }

  // Colour shifts gently teal → amber → soft red as time runs out. No flashing.
  function phaseColour() {
    var frac = state.left / state.total;
    if (frac > 0.5) return '#0f5257';
    if (frac > 0.2) return '#c97b2d';
    return '#a84448';
  }

  function drawCountdown() {
    var frac = state.total ? state.left / state.total : 0;
    var mins = Math.floor(state.left / 60);
    var secs = state.left % 60;
    var timeText = mins + ':' + (secs < 10 ? '0' : '') + secs;
    var colour = phaseColour();
    var style = document.getElementById('vt-style').value;
    if (style === 'circle') {
      var r = 70 * Math.sqrt(Math.max(frac, 0));
      countdownEl.innerHTML = '<svg viewBox="0 0 170 170" aria-hidden="true">' +
        '<circle cx="85" cy="85" r="78" fill="none" stroke="#d8e0e0" stroke-width="4"/>' +
        '<circle cx="85" cy="85" r="' + r.toFixed(1) + '" fill="' + colour + '" opacity="0.85" style="transition:r 1s linear, fill 3s linear"/>' +
        '<text x="85" y="94" text-anchor="middle" font-size="26" font-weight="700" fill="#1c2b2d">' + timeText + '</text></svg>';
    } else {
      countdownEl.innerHTML = '<div style="border:3px solid #d8e0e0;border-radius:10px;height:34px;overflow:hidden">' +
        '<div style="height:100%;width:' + (frac * 100).toFixed(1) + '%;background:' + colour + ';transition:width 1s linear, background 3s linear"></div></div>' +
        '<div style="text-align:center;font-weight:700;font-size:1.3rem;margin-top:.3rem">' + timeText + '</div>';
    }
  }

  function onTick() {
    if (!state.running) return;
    state.left--;
    if (state.left <= 0) {
      state.left = 0;
      state.running = false;
      clearInterval(state.tick);
      if (document.getElementById('vt-chime').checked) chime();
      countdownEl.setAttribute('aria-live', 'polite');
    }
    drawCountdown();
  }

  // Gentle two-note chime via WebAudio — quiet, short, non-startling.
  function chime() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      [[523.25, 0], [659.25, 0.35]].forEach(function (note) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = note[0];
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + note[1]);
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + note[1] + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + note[1] + 1.1);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + note[1]);
        osc.stop(ctx.currentTime + note[1] + 1.2);
      });
    } catch (e) { /* audio unavailable — fine */ }
  }

  document.getElementById('vt-start').addEventListener('click', function () { startBoard(false); });
  document.getElementById('vt-fullscreen').addEventListener('click', function () { startBoard(true); });

  document.getElementById('vt-swap').addEventListener('click', function () {
    // NEXT becomes NOW; NEXT clears to a "choose" placeholder.
    chosen.now = chosen.next;
    document.getElementById('vt-now-label').value = document.getElementById('vt-next-label').value;
    document.getElementById('vt-card-now').innerHTML = card('now');
    document.getElementById('vt-next-label').value = '';
    chosen.next = 'choice';
    document.getElementById('vt-card-next').innerHTML = card('next');
    state.left = state.total;
    state.running = true;
    clearInterval(state.tick);
    state.tick = setInterval(onTick, 1000);
    drawCountdown();
  });

  document.getElementById('vt-pause').addEventListener('click', function () {
    state.running = !state.running;
    this.textContent = state.running ? 'Pause' : 'Resume';
  });

  document.getElementById('vt-exit').addEventListener('click', function () {
    board.hidden = true;
    document.body.style.overflow = '';
    state.running = false;
    clearInterval(state.tick);
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
  });

  // ---- PWA: register the service worker for offline use -------------------
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/tools/visual-timer/sw.js', { scope: '/tools/visual-timer/' }).catch(function () {});
  }
})();
