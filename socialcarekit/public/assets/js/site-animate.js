// SocialCareKit — scroll-reveal, staggered grids, countUp, parallax. Vanilla JS.
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ---- Scroll-reveal via IntersectionObserver ----
  function reveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  // ---- Auto-stagger grid children ----
  function staggerGrids() {
    document.querySelectorAll('.grid').forEach(function (grid) {
      var children = grid.querySelectorAll('[data-reveal]');
      children.forEach(function (child, i) {
        child.style.transitionDelay = (i * 0.08) + 's';
      });
    });
  }

  // ---- Footer reveal ----
  function footerReveal() {
    var footerGrid = document.querySelector('.footer-grid');
    if (!footerGrid) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    observer.observe(footerGrid);
  }

  // ---- CountUp animation for .result-figure ----
  function countUp(el) {
    var text = el.textContent.trim();
    var match = text.match(/^([£$]?)(\d[\d,]*\.?\d*)(.*)$/);
    if (!match) return;

    var prefix = match[1];
    var target = parseFloat(match[2].replace(/,/g, ''));
    var suffix = match[3];
    var hasDecimal = match[2].indexOf('.') !== -1;
    var decimals = hasDecimal ? (match[2].split('.')[1] || '').length : 0;
    var useCommas = match[2].indexOf(',') !== -1;
    var duration = 800;
    var start = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function format(n) {
      var s = hasDecimal ? n.toFixed(decimals) : Math.round(n).toString();
      if (useCommas) {
        var parts = s.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        s = parts.join('.');
      }
      return prefix + s + suffix;
    }

    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      el.textContent = format(target * easeOut(progress));
      if (progress < 1) requestAnimationFrame(step);
    }

    el.textContent = format(0);
    requestAnimationFrame(step);
  }

  function observeCountUps() {
    var figures = document.querySelectorAll('.result-figure');
    if (!figures.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    figures.forEach(function (el) { observer.observe(el); });
  }

  // ---- Tool result animation ----
  function observeToolResults() {
    var results = document.querySelectorAll('.tool-result');
    if (!results.length) return;

    var mo = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.type === 'attributes' && m.attributeName === 'hidden') {
          var el = m.target;
          if (!el.hidden && el.classList.contains('tool-result')) {
            el.setAttribute('data-animate-in', '');
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                el.classList.add('visible');
              });
            });
          }
        }
      });
    });

    results.forEach(function (el) {
      mo.observe(el, { attributes: true, attributeFilter: ['hidden'] });
    });
  }

  // ---- Hero parallax ----
  function heroParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrolled = window.scrollY;
          if (scrolled < hero.offsetHeight + 200) {
            hero.style.backgroundPosition = '50% ' + (50 + scrolled * 0.08) + '%';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ---- Nav link stagger (mobile) ----
  function navStagger() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    var links = nav.querySelectorAll('li');
    toggle.addEventListener('click', function () {
      var opening = nav.classList.contains('open');
      if (opening) {
        links.forEach(function (li, i) {
          li.style.opacity = '0';
          li.style.transform = 'translateX(-10px)';
          li.style.transition = 'opacity .25s ease, transform .25s ease';
          li.style.transitionDelay = (i * 0.04) + 's';
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              li.style.opacity = '1';
              li.style.transform = 'none';
            });
          });
        });
      }
    });
  }

  // ---- Init ----
  document.addEventListener('DOMContentLoaded', function () {
    staggerGrids();
    reveal();
    footerReveal();
    observeCountUps();
    observeToolResults();
    heroParallax();
    navStagger();
  });
})();
