// Service Worker para PWA
const CACHE_NAME = "posto-caixa-v1"
const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/js/app.js",
  "/js/storage.js",
  "/js/pwa.js",
  "/manifest.json",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
]

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Install")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching files")
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log("Service Worker: All files cached")
        return self.skipWaiting()
      }),
  )
})

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activate")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache")
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Claiming clients")
        return self.clients.claim()
      }),
  )
})

// Fetch event
self.addEventListener("fetch", (event) => {
  console.log("Service Worker: Fetch", event.request.url)
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
      .catch(() => {
        // Fallback for offline
        if (event.request.destination === "document") {
          return caches.match("/index.html")
        }
      }),
  )
})
