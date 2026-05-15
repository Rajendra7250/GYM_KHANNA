const CACHE_NAME = 'gymkhanna-v1';
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
  './icon.svg',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
