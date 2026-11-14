/* Service Worker — DeGirob VIP (Network-First) */
const CACHE_VERSION = 'v31';
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

// ✅ Network-First لكل شيء: يجلب من الإنترنت أولاً، ويستخدم الكاش فقط عند فشل الشبكة
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(networkFirst(req));
});

async function networkFirst(req) {
  try {
    const res = await fetch(req, { cache: 'no-store' });
    if (res && res.ok && req.url.startsWith(self.location.origin)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone());
    }
    return res;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    if (req.mode === 'navigate') {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }
    return Response.error();
  }
}
