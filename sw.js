/* Self-Destructing SW v35 — يمسح كل شيء ويلغي نفسه */
self.addEventListener('install', () => {
  console.info('[SW] v35 installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.info('[SW] v35 activating, clearing ALL caches...');
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => console.info('[SW] v35 unregistered permanently'))
  );
});
