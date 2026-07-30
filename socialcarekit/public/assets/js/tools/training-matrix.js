// Training Matrix Tracker — data persists in localStorage only. CSV in/out.
(function () {
  'use strict';
  var table = document.getElementById('tm-table');
  if (!table) return;
  var KEY = 'sck-training-matrix-v1';

  var DEFAULT_COURSES = [
    { name: 'Safeguarding Children L1', years: 1 },
    { name: 'Safeguarding Children L2', years: 2 },
    { name: 'Safeguarding Adults', years: 1 },
    { name: 'First Aid', years: 3 },
    { name: 'Medication', years: 1 },
    { name: 'Fire Safety', years: 1 },
    { name: 'Food Hygiene', years: 3 },
    { name: 'Manual Handling', years: 1 },
    { name: 'MCA / DoLS', years: 2 },
    { name: 'GDPR / Information Governance', years: 2 },
    { name: 'Infection Control', years: 2 },
    { name: 'Physical Intervention', years: 1 },
    { name: 'Equality & Diversity', years: 3 },
    { name: 'Health & Safety', years: 2 }
  ];

  var data = load() || {
    courses: DEFAULT_COURSES.slice(),
    staff: ['Example: A. Worker'],
    records: {} // key: staffIndex|courseIndex -> 'YYYY-MM-DD'
  };

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage full/blocked */ }
  }

  function status(dateStr, years) {
    if (!dateStr) return 'red';
    var done = new Date(dateStr);
    var renew = new Date(done);
    renew.setFullYear(renew.getFullYear() + (years || 1));
    var now = new Date();
    if (renew <= now) return 'red';
    var amberAt = new Date(renew);
    amberAt.setDate(amberAt.getDate() - 60);
    return now >= amberAt ? 'amber' : 'green';
  }

  function fmt(d) {
    if (!d) return '—';
    var p = d.split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : d;
  }

  function render() {
    var html = '<thead><tr><th scope="col">Staff member</th>';
    data.courses.forEach(function (c, ci) {
      html += '<th scope="col"><button type="button" class="btn-ghost" data-course="' + ci + '" title="Edit course">' +
        esc(c.name) + '<br><span class="search-kind">' + c.years + 'yr renewal</span></button></th>';
    });
    html += '<th scope="col"></th></tr></thead><tbody>';
    var counts = { green: 0, amber: 0, red: 0 };
    data.staff.forEach(function (name, si) {
      html += '<tr><th scope="row"><button type="button" class="btn-ghost" data-staff="' + si + '" title="Edit staff member">' + esc(name) + '</button></th>';
      data.courses.forEach(function (c, ci) {
        var d = data.records[si + '|' + ci] || '';
        var st = status(d, c.years);
        counts[st]++;
        html += '<td><button type="button" class="rag rag-' + st + '" style="border:0;cursor:pointer;font-family:inherit" data-cell="' + si + '|' + ci + '" ' +
          'aria-label="' + esc(name) + ', ' + esc(c.name) + ': ' + (d ? 'completed ' + fmt(d) : 'no record') + '">' + fmt(d) + '</button></td>';
      });
      html += '<td><button type="button" class="btn btn-sm btn-danger" data-del-staff="' + si + '" aria-label="Remove ' + esc(name) + '">×</button></td></tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
    document.getElementById('tm-summary').textContent =
      data.staff.length + ' staff × ' + data.courses.length + ' courses — ' +
      counts.green + ' in date, ' + counts.amber + ' due soon, ' + counts.red + ' expired or missing.';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  table.addEventListener('click', function (ev) {
    var cell = ev.target.closest('[data-cell]');
    if (cell) {
      var key = cell.getAttribute('data-cell');
      var current = data.records[key] || '';
      var val = window.prompt('Completion date (YYYY-MM-DD), or leave blank to clear:', current);
      if (val === null) return;
      val = val.trim();
      if (val && !/^\d{4}-\d{2}-\d{2}$/.test(val)) { window.alert('Please use YYYY-MM-DD, e.g. 2026-03-14'); return; }
      if (val) data.records[key] = val; else delete data.records[key];
      save(); render();
      return;
    }
    var courseBtn = ev.target.closest('[data-course]');
    if (courseBtn) {
      var ci = parseInt(courseBtn.getAttribute('data-course'), 10);
      var c = data.courses[ci];
      var name = window.prompt('Course name (blank to delete the course):', c.name);
      if (name === null) return;
      if (!name.trim()) {
        if (window.confirm('Delete "' + c.name + '" and all its records?')) {
          removeCourse(ci);
        }
        return;
      }
      var years = parseFloat(window.prompt('Renewal period in years:', c.years));
      c.name = name.trim();
      if (years > 0) c.years = years;
      save(); render();
      return;
    }
    var staffBtn = ev.target.closest('[data-staff]');
    if (staffBtn) {
      var si = parseInt(staffBtn.getAttribute('data-staff'), 10);
      var newName = window.prompt('Staff name:', data.staff[si]);
      if (newName === null || !newName.trim()) return;
      data.staff[si] = newName.trim();
      save(); render();
      return;
    }
    var del = ev.target.closest('[data-del-staff]');
    if (del) {
      var di = parseInt(del.getAttribute('data-del-staff'), 10);
      if (!window.confirm('Remove ' + data.staff[di] + ' and their records?')) return;
      removeStaff(di);
    }
  });

  function removeStaff(si) {
    data.staff.splice(si, 1);
    var next = {};
    Object.keys(data.records).forEach(function (k) {
      var p = k.split('|').map(Number);
      if (p[0] === si) return;
      next[(p[0] > si ? p[0] - 1 : p[0]) + '|' + p[1]] = data.records[k];
    });
    data.records = next;
    save(); render();
  }
  function removeCourse(ci) {
    data.courses.splice(ci, 1);
    var next = {};
    Object.keys(data.records).forEach(function (k) {
      var p = k.split('|').map(Number);
      if (p[1] === ci) return;
      next[p[0] + '|' + (p[1] > ci ? p[1] - 1 : p[1])] = data.records[k];
    });
    data.records = next;
    save(); render();
  }

  document.getElementById('tm-add-staff').addEventListener('click', function () {
    var name = window.prompt('Staff member name:');
    if (!name || !name.trim()) return;
    data.staff.push(name.trim());
    save(); render();
  });
  document.getElementById('tm-add-course').addEventListener('click', function () {
    var name = window.prompt('Course name:');
    if (!name || !name.trim()) return;
    var years = parseFloat(window.prompt('Renewal period in years:', '1')) || 1;
    data.courses.push({ name: name.trim(), years: years });
    save(); render();
  });

  // ---- CSV export / import -------------------------------------------------
  document.getElementById('tm-export').addEventListener('click', function () {
    var rows = [['Staff'].concat(data.courses.map(function (c) { return c.name + ' (' + c.years + 'yr)'; }))];
    data.staff.forEach(function (name, si) {
      rows.push([name].concat(data.courses.map(function (c, ci) { return data.records[si + '|' + ci] || ''; })));
    });
    var csv = rows.map(function (r) {
      return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\r\n');
    var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'training-matrix-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.getElementById('tm-import').addEventListener('change', function () {
    var file = this.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var rows = parseCsv(String(reader.result));
      if (!rows.length || rows[0].length < 2) { window.alert('Could not read that CSV.'); return; }
      if (!window.confirm('Replace the current matrix with "' + file.name + '"?')) return;
      var courses = rows[0].slice(1).map(function (h) {
        var m = h.match(/^(.*)\s\((\d+(?:\.\d+)?)yr\)$/);
        return m ? { name: m[1], years: parseFloat(m[2]) } : { name: h, years: 1 };
      });
      var staff = [], records = {};
      rows.slice(1).forEach(function (r, si) {
        if (!r[0]) return;
        staff.push(r[0]);
        r.slice(1).forEach(function (v, ci) {
          if (v && /^\d{4}-\d{2}-\d{2}$/.test(v.trim())) records[si + '|' + ci] = v.trim();
        });
      });
      data = { courses: courses, staff: staff, records: records };
      save(); render();
    };
    reader.readAsText(file);
    this.value = '';
  });

  function parseCsv(text) {
    var rows = [], row = [], cur = '', inQ = false;
    text = text.replace(/^﻿/, '');
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (inQ) {
        if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') inQ = false;
        else cur += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === ',') { row.push(cur); cur = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (cur !== '' || row.length) { row.push(cur); rows.push(row); row = []; cur = ''; }
        if (ch === '\r' && text[i + 1] === '\n') i++;
      } else cur += ch;
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }

  document.getElementById('tm-reset').addEventListener('click', function () {
    if (!window.confirm('Reset the whole matrix to the default course list? Export a CSV first if you need a copy.')) return;
    data = { courses: DEFAULT_COURSES.slice(), staff: [], records: {} };
    save(); render();
  });

  render();
})();
