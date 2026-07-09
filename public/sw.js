// Minimal service worker — required for Android Chrome PWA install prompt.
// Caches nothing, just satisfies the SW requirement for beforeinstallprompt.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through: don't cache, just proxy the network request
  event.respondWith(fetch(event.request));
});
