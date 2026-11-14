/* Self-Destructing SW — DeGirob VIP v33 */
/* Purpose: clear all old caches, never cache anything, let browser fetch fresh */

self.addEventListener('install', () => {
  console.info('[SW] Installing (passthrough mode) v33...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.info('[SW] Activating v33, clearing all caches...');
  event.waitUntil(
    caches.keys()
      .then(keys => {
        console.info('[SW] Clearing caches:', keys);
        return Promise.all(keys.map(k => caches.delete(k)));
      })
      .then(() => self.clients.claim())
      .then(() => console.info('[SW] ✅ v33 ready, passthrough mode'))
  );
});

/* NO fetch handler — browser handles all requests natively, nothing is cached */
