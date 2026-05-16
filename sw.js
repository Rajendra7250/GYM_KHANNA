const CACHE_NAME = 'gymkhanna-v6';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/storage.js',
  './js/settings.js',
  './js/timer.js',
  './js/exercises.js',
  './js/charts.js',
  './js/dashboard.js',
  './js/workouts.js',
  './js/nutrition.js',
  './js/progress.js',
  './js/app.js',
  './js/auth.js',
  './js/db.js',
  './js/ai.js',
  './logo.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force activate new version immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network-first for navigation requests so updates show immediately
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }
  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
