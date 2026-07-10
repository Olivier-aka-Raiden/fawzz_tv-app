// Minimal service worker — required for Android Chrome PWA install prompt.
// Caches nothing, just satisfies the SW requirement for beforeinstallprompt.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only intercept same-origin requests — let cross-origin (Mapbox, etc.) pass through natively.
  // The SW still satisfies Chrome's beforeinstallprompt requirement just by being registered.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(fetch(event.request));
  }
});
