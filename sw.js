
const CACHE_NAME = 'naijascholar-ai-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx', // Main JS module entry point
  '/manifest.json',
  '/public/icons/icon-192.png',
  '/public/icons/icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
  // Note: Dynamically imported esm.sh modules will be cached by the fetch handler.
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching initial assets');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache initial assets:', error);
      })
  );
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, try network first, then cache (Network-first strategy for HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Check if we received a valid response
          if (response && response.status === 200 && event.request.url.startsWith('http')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              return cachedResponse || caches.match('/index.html'); // Fallback to cached index.html
            });
        })
    );
    return;
  }

  // For other requests (assets), use Cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response and it's not an opaque response for critical CDNs (or handle them)
            // Only cache if it's a valid response and the URL is http/https
            if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith('http')) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          }
        ).catch(error => {
          console.log('Fetch failed; returning offline page instead.', error);
          // Optionally, return a specific offline fallback page or resource for assets
          // For now, just let the browser handle the error if asset not in cache and network fails.
        });
      })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
