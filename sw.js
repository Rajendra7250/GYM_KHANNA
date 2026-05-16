const CACHE_NAME = 'gymkhanna-v1.0.1';
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
  self.skipWaiting();
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
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Exclude Firebase Firestore, Google Auth, and Gemini API requests from aggressive caching
  if (url.origin.includes('firestore.googleapis.com') || 
      url.origin.includes('identitytoolkit.googleapis.com') ||
      url.origin.includes('generativelanguage.googleapis.com')) {
    return; // Let the browser/Firebase handle these natively
  }

  // API calls (e.g., OpenFoodFacts) -> Network First, fallback to cache
  if (url.origin.includes('world.openfoodfacts.org')) {
    event.respondWith(
      fetch(event.request).then(response => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Stale-While-Revalidate for local assets and CDN scripts
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Only cache successful GET requests
        if (event.request.method === 'GET' && networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return networkResponse;
      }).catch(() => {
        // Catch network errors (offline)
      });
      
      // Return cached immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
