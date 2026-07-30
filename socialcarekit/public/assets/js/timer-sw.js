// Service worker for the Visual Timer — caches the page so it runs offline.
var CACHE = 'sck-timer-v1';
var ASSETS = [
  '/tools/visual-timer/',
  '/assets/css/site.css',
  '/assets/js/site.js',
  '/assets/js/tools/visual-timer.js',
  '/assets/img/favicon.svg',
  '/assets/img/timer-icon.svg'
];

self.addEventListener('install', function (ev) {
  ev.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (ev) {
  ev.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (ev) {
  ev.respondWith(
    caches.match(ev.request, { ignoreSearch: true }).then(function (hit) {
      return hit || fetch(ev.request).then(function (resp) {
        var copy = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(ev.request, copy); });
        return resp;
      }).catch(function () { return caches.match('/tools/visual-timer/'); });
    })
  );
});
