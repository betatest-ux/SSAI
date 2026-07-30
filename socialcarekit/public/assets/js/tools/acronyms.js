// Acronym Decoder — client-side search & filter over the server-rendered table.
(function () {
  'use strict';
  var search = document.getElementById('ac-search');
  if (!search) return;
  var rows = Array.prototype.slice.call(document.querySelectorAll('#ac-table tbody tr'));
  var chips = document.querySelectorAll('#ac-filters .chip');
  var countEl = document.getElementById('ac-count');
  var noneEl = document.getElementById('ac-none');
  var sector = 'all';

  function apply() {
    var q = search.value.trim().toLowerCase();
    var visible = 0;
    rows.forEach(function (row) {
      var okSector = sector === 'all' || row.getAttribute('data-sector') === sector;
      var okSearch = !q || row.getAttribute('data-search').indexOf(q) !== -1 ||
        row.cells[2].textContent.toLowerCase().indexOf(q) !== -1;
      var show = okSector && okSearch;
      row.hidden = !show;
      if (show) visible++;
    });
    countEl.textContent = visible + ' of ' + rows.length + ' acronyms shown';
    noneEl.hidden = visible !== 0;
  }

  search.addEventListener('input', apply);
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      sector = chip.getAttribute('data-sector');
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
      apply();
    });
  });

  // Support /tools/acronym-decoder/?q=LADO deep links (from site search).
  var m = window.location.search.match(/[?&]q=([^&]+)/);
  if (m) {
    search.value = decodeURIComponent(m[1].replace(/\+/g, ' '));
  }
  apply();
})();
