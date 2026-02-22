const CACHE_VERSION = 'ice-v1';
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/src/design/theme.css',
  '/src/core/conversion.js',
  '/src/core/proxy-library.js',
  '/src/core/customizer-settings.js',
  '/src/core/formalizer.js',
  '/src/core/share-export.js',
  '/src/core/dashboard-view.js',
  '/src/core/reference-library.js',
  '/src/core/history-archive.js',
  '/public/icons/icon-192.svg',
  '/public/icons/icon-512.svg',
];

const SEED_DATA_ASSETS = ['/src/data/proxies.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_ASSETS)),
      caches.open(DATA_CACHE).then((cache) => cache.addAll(SEED_DATA_ASSETS)),
    ]),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== APP_SHELL_CACHE && key !== DATA_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );

  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')));
    return;
  }

  if (requestUrl.pathname === '/src/data/proxies.json') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const responseClone = response.clone();
          caches.open(DATA_CACHE).then((cache) => cache.put(event.request, responseClone));
          return response;
        });
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => cached);

      return cached ?? networkFetch;
    }),
  );
});
