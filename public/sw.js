// Minimal no-op service worker — required for PWA install prompt.
// No caching, no offline support.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// fetch listener intentionally does nothing — browser handles all requests normally.
self.addEventListener("fetch", () => {});
