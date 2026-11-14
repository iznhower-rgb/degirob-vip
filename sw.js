/* Service Worker — DeGirob VIP */
const CACHE_VERSION = 'v27';
const CACHE_NAME = `degirob-${CACHE_VERSION}`;

const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/dashboard.css',
  './css/detail.css',
  './js/config.js',
  './js/state.js',
  './js/storage.js',
  './js/i18n/ar.js',
  './js/i18n/en.js',
  './js/i18n.js',
  './js/data/teams-ar.js',
  './js/api.js',
  './js/engine.js',
  './js/ui/helpers.js',
  './js/ui/navigation.js',
  './js/screens/paywall.js',
  './js/screens/dashboard.js',
  './js/screens/detail.js',
  './js/screens/favorites.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/icon-maskable.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .catch((err) => console.warn('[SW] precache partial:', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  if (url.origin !== self.location.origin) {
    event.respondWith(networkFirst(req));
    return;
  }

  event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
  const cached = await caches.match(req, { ignoreSearch: true });
  if (cached) return cached;

  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone());
    }
    return res;
  } catch (err) {
    const fallback = await caches.match('./index.html');
    return fallback || Response.error();
  }
}

async function networkFirst(req) {
  try {
    return await fetch(req);
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    return Response.error();
  }
}
