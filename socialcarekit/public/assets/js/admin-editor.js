// Minimal dependency-free rich text editing for the admin panel.
// A visual contenteditable pane synced with the underlying <textarea> (HTML
// source), with a toggle — so editors get formatting buttons and developers
// keep clean HTML.
(function () {
  'use strict';
  document.querySelectorAll('.rte-toolbar[data-rte-for]').forEach(function (bar) {
    var ta = document.getElementById(bar.getAttribute('data-rte-for'));
    if (!ta) return;

    var pane = document.createElement('div');
    pane.className = 'rte-pane';
    pane.contentEditable = 'true';
    pane.style.cssText = 'border:2px solid #47585a;border-radius:6px;background:#fff;min-height:340px;max-height:60vh;overflow:auto;padding:1rem;margin-bottom:.4rem';
    pane.innerHTML = ta.value;
    ta.style.display = 'none';
    ta.parentNode.insertBefore(pane, ta);

    var visual = true;
    function sync() { if (visual) ta.value = pane.innerHTML; }
    pane.addEventListener('input', sync);

    var buttons = [
      ['B', 'bold', 'Bold'],
      ['I', 'italic', 'Italic'],
      ['H2', 'formatBlock:h2', 'Heading 2'],
      ['H3', 'formatBlock:h3', 'Heading 3'],
      ['¶', 'formatBlock:p', 'Paragraph'],
      ['• list', 'insertUnorderedList', 'Bullet list'],
      ['1. list', 'insertOrderedList', 'Numbered list'],
      ['Link', 'link', 'Insert link'],
      ['Unlink', 'unlink', 'Remove link'],
      ['⌫ format', 'removeFormat', 'Clear formatting'],
      ['</>', 'toggle', 'Toggle HTML source']
    ];
    buttons.forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-outline';
      btn.style.marginRight = '.25rem';
      btn.style.marginBottom = '.25rem';
      btn.textContent = b[0];
      btn.title = b[2];
      btn.addEventListener('click', function () {
        if (b[1] === 'toggle') {
          visual = !visual;
          if (visual) { pane.innerHTML = ta.value; ta.style.display = 'none'; pane.style.display = 'block'; }
          else { sync(); ta.style.display = 'block'; pane.style.display = 'none'; }
          return;
        }
        pane.focus();
        if (b[1] === 'link') {
          var url = window.prompt('Link URL (use relative paths for internal links, e.g. /tools/):', '/');
          if (url) document.execCommand('createLink', false, url);
        } else if (b[1].indexOf('formatBlock:') === 0) {
          document.execCommand('formatBlock', false, '<' + b[1].split(':')[1] + '>');
        } else {
          document.execCommand(b[1], false, null);
        }
        sync();
      });
      bar.appendChild(btn);
    });

    // Paste as clean-ish content: strip styles/classes from pasted HTML.
    pane.addEventListener('paste', function () {
      setTimeout(function () {
        pane.querySelectorAll('[style],[class],[id]').forEach(function (el) {
          el.removeAttribute('style'); el.removeAttribute('class'); el.removeAttribute('id');
        });
        pane.querySelectorAll('span,font').forEach(function (el) {
          while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
          el.remove();
        });
        sync();
      }, 0);
    });

    var form = ta.closest('form');
    if (form) form.addEventListener('submit', sync);
  });
})();
