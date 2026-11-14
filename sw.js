/* Self-Destructing SW v34 — ينظف نفسه ولا يخزّن شيئاً */
self.addEventListener('install', () => {
  console.info('[SW] v34 installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.info('[SW] v34 activating, then unregistering...');
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => console.info('[SW] v34 unregistered itself — passthrough mode'))
  );
});

/* لا يوجد fetch handler — المتصفح يعمل بحرية */
