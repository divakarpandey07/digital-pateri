const CACHE_NAME = 'pateri-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/#/search-residents',
  '/#/timeline',
  '/#/registry',
  '/#/demographics',
  '/#/sos',
  '/#/archive',
  '/#/agriculture'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  
  // Dynamic network-first caching for API routes
  if (
    url.includes('/api/v1/crops') ||
    url.includes('/api/v1/schemes') ||
    url.includes('/api/v1/residents/me') ||
    url.includes('/api/v1/residents/public/')
  ) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, cacheCopy);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(e.request);
        })
    );
  } else {
    // Static assets: cache-first with network fallback
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        return cachedResponse || fetch(e.request);
      })
    );
  }
});
