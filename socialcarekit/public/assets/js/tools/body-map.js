// Body Map Recorder — 100% client-side; state lives only in this page's memory.
(function () {
  'use strict';
  var front = document.getElementById('bm-front');
  if (!front) return;
  var back = document.getElementById('bm-back');
  var markersEl = document.getElementById('bm-markers');
  var variantSel = document.getElementById('bm-variant');
  var initialsEl = document.getElementById('bm-initials');
  var initialsWarn = document.getElementById('bm-initials-warn');

  // Gender-neutral outline built from primitives; child variant uses rounder
  // proportions (bigger head, shorter limbs). viewBox 200x420.
  function outline(variant, isBack) {
    var a = variant === 'child';
    var head = a ? 'M100 18a26 26 0 1 1 0 52 26 26 0 0 1 0-52z'
                 : 'M100 14a23 23 0 1 1 0 46 23 23 0 0 1 0-46z';
    var neckY = a ? 70 : 60;
    var g = '<g fill="#ffffff" stroke="#47585a" stroke-width="2.5" stroke-linejoin="round">';
    g += '<path d="' + head + '"/>';
    // neck
    g += '<rect x="92" y="' + neckY + '" width="16" height="14" rx="4"/>';
    // torso
    var torsoTop = neckY + 12;
    var torsoH = a ? 120 : 140;
    g += '<path d="M60 ' + (torsoTop + 12) + ' Q60 ' + torsoTop + ' 76 ' + torsoTop + ' H124 Q140 ' + torsoTop + ' 140 ' + (torsoTop + 12) +
         ' V' + (torsoTop + torsoH - 14) + ' Q140 ' + (torsoTop + torsoH) + ' 124 ' + (torsoTop + torsoH) +
         ' H76 Q60 ' + (torsoTop + torsoH) + ' 60 ' + (torsoTop + torsoH - 14) + ' Z"/>';
    // arms
    var armLen = a ? 110 : 135;
    g += '<rect x="34" y="' + (torsoTop + 4) + '" width="22" height="' + armLen + '" rx="11"/>';
    g += '<rect x="144" y="' + (torsoTop + 4) + '" width="22" height="' + armLen + '" rx="11"/>';
    // hands
    g += '<circle cx="45" cy="' + (torsoTop + armLen + 14) + '" r="11"/>';
    g += '<circle cx="155" cy="' + (torsoTop + armLen + 14) + '" r="11"/>';
    // legs
    var legTop = torsoTop + torsoH + 2;
    var legLen = a ? 120 : 145;
    g += '<rect x="66" y="' + legTop + '" width="28" height="' + legLen + '" rx="13"/>';
    g += '<rect x="106" y="' + legTop + '" width="28" height="' + legLen + '" rx="13"/>';
    // feet
    g += '<path d="M62 ' + (legTop + legLen + 2) + ' h34 v10 q0 6-8 6 H68 q-10 0-10-8 z"/>';
    g += '<path d="M104 ' + (legTop + legLen + 2) + ' h34 v8 q0 8-10 8 h-16 q-8 0-8-6 z"/>';
    if (!isBack) {
      // simple face marks on front view only
      var eyeY = a ? 40 : 33;
      g += '<circle cx="91" cy="' + eyeY + '" r="1.8" fill="#47585a" stroke="none"/><circle cx="109" cy="' + eyeY + '" r="1.8" fill="#47585a" stroke="none"/>';
      g += '<path d="M93 ' + (eyeY + 12) + ' q7 5 14 0" fill="none" stroke-linecap="round"/>';
    } else {
      g += '<path d="M100 ' + (neckY + 14) + ' V' + (neckY + 40) + '" fill="none" stroke-dasharray="3 4"/>';
    }
    g += '</g><g class="bm-marker-layer"></g>';
    return g;
  }

  var markers = []; // {n, side, x, y}
  var nextN = 1;

  function drawOutlines() {
    front.innerHTML = outline(variantSel.value, false);
    back.innerHTML = outline(variantSel.value, true);
    redrawMarkers();
  }

  function redrawMarkers() {
    [front, back].forEach(function (svg) {
      var layer = svg.querySelector('.bm-marker-layer');
      layer.innerHTML = '';
      var side = svg === front ? 'front' : 'back';
      markers.filter(function (m) { return m.side === side; }).forEach(function (m) {
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('style', 'cursor:pointer');
        g.setAttribute('data-n', m.n);
        g.innerHTML = '<circle cx="' + m.x + '" cy="' + m.y + '" r="11" fill="#b10e1e" fill-opacity="0.9"/>' +
          '<text x="' + m.x + '" y="' + (m.y + 4.5) + '" text-anchor="middle" font-size="13" font-weight="bold" fill="#fff">' + m.n + '</text>';
        g.addEventListener('click', function (ev) {
          ev.stopPropagation();
          if (window.confirm('Remove marker ' + m.n + '?')) removeMarker(m.n);
        });
        layer.appendChild(g);
      });
    });
  }

  function svgPoint(svg, ev) {
    var pt = svg.createSVGPoint();
    pt.x = ev.clientX; pt.y = ev.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  [front, back].forEach(function (svg) {
    svg.addEventListener('click', function (ev) {
      var p = svgPoint(svg, ev);
      if (p.x < 0 || p.x > 200 || p.y < 0 || p.y > 420) return;
      var m = { n: nextN++, side: svg === front ? 'front' : 'back', x: Math.round(p.x), y: Math.round(p.y) };
      markers.push(m);
      addMarkerForm(m);
      redrawMarkers();
    });
  });

  function addMarkerForm(m) {
    var div = document.createElement('fieldset');
    div.setAttribute('data-marker', m.n);
    div.innerHTML = '<legend>Marker ' + m.n + ' — ' + m.side + '</legend>' +
      '<div class="grid grid-2">' +
      f(m.n, 'desc', 'Description of mark/injury (what it looks like)') +
      f(m.n, 'size', 'Size (measure where possible)') +
      f(m.n, 'colour', 'Colour') +
      f(m.n, 'expl', 'Explanation given (in their words where possible)') +
      f(m.n, 'obs', 'Who observed it') +
      f(m.n, 'when', 'Date/time first noticed') +
      '</div>';
    markersEl.appendChild(div);
    function f(n, key, label) {
      return '<div class="form-row"><label for="bm-m' + n + '-' + key + '">' + label + '</label>' +
        '<input type="text" id="bm-m' + n + '-' + key + '" autocomplete="off"></div>';
    }
  }

  function removeMarker(n) {
    markers = markers.filter(function (m) { return m.n !== n; });
    var f = markersEl.querySelector('[data-marker="' + n + '"]');
    if (f) f.remove();
    redrawMarkers();
  }

  variantSel.addEventListener('change', drawOutlines);

  // Initials validation: warn if it looks like a full name.
  initialsEl.addEventListener('input', function () {
    var v = initialsEl.value.trim();
    var looksLikeName = /\s/.test(v) || v.length > 4 || /^[A-Z][a-z]{2,}$/.test(v);
    initialsWarn.hidden = !looksLikeName;
    initialsWarn.textContent = looksLikeName
      ? '⚠ That looks like a name. Use initials only (e.g. "JD") — the printed record should not identify the person by name.'
      : '';
    initialsWarn.style.color = '#b10e1e';
  });

  document.getElementById('bm-print').addEventListener('click', function () {
    document.title = 'Body map record — ' + (initialsEl.value.trim() || 'no initials') + ' — ' + new Date().toLocaleDateString('en-GB');
    window.print();
  });

  document.getElementById('bm-clear').addEventListener('click', function () {
    if (!window.confirm('Clear the whole record? This cannot be undone.')) return;
    markers = []; nextN = 1;
    markersEl.innerHTML = '';
    ['bm-initials', 'bm-recorder', 'bm-datetime', 'bm-actions', 'bm-reported'].forEach(function (id) {
      document.getElementById(id).value = '';
    });
    redrawMarkers();
  });

  // Leaving the page loses everything — warn if there is content.
  window.addEventListener('beforeunload', function (ev) {
    if (markers.length || initialsEl.value) {
      ev.preventDefault();
      ev.returnValue = '';
    }
  });

  drawOutlines();
})();
