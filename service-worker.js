// --- Padel Tournament Service Worker ---
// Version: v1.0.0
// Provides offline access and auto-updates cache when files change.

const CACHE_NAME = "padel-tournament-v1";
const ASSETS = [
  "index.html",
  "padel-icon.png",
  "manifest.json"
];

// --- Install: cache app shell ---
self.addEventListener("install", event => {
  console.log("[ServiceWorker] Install");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[ServiceWorker] Caching app files");
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// --- Fetch: serve cached content when offline ---
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchRes => {
        // Cache new requests dynamically
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request.url, fetchRes.clone());
          return fetchRes;
        });
      }).catch(() => caches.match("index.html"));
    })
  );
});

// --- Activate: clean up old caches ---
self.addEventListener("activate", event => {
  console.log("[ServiceWorker] Activate");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log("[ServiceWorker] Removing old cache:", key);
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim();
});
