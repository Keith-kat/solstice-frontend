/**
 * Solstice service worker — the actual mechanism behind "browse on
 * spotty 3G in Naivasha or Diani and it still works":
 *
 *  - App shell (HTML/CSS/JS) is cache-first: once loaded, it opens
 *    instantly on a repeat visit even with no signal at all.
 *  - GET /api/properties* calls are network-first with a cache
 *    fallback: try the network briefly, but if it's too slow or the
 *    connection drops, serve the last listings you successfully
 *    fetched instead of a blank screen or a spinner that never ends.
 *  - Everything else (POST bookings, M-Pesa calls, WhatsApp) always
 *    goes to the network — money and messages are never served stale.
 *
 * Register this from your app's entry point — see pwa-register.js.
 */

const CACHE_NAME = "solstice-cache-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.json"];
const NETWORK_TIMEOUT_MS = 4000; // beyond this, a 3G connection is treated as "not fast enough right now"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {
      // Don't fail install just because one shell asset 404s in dev — log and move on.
      console.warn("Solstice SW: app shell caching had a partial failure");
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Listings API — network-first, cache fallback, so a dropped connection
  // shows the last-seen listings instead of an empty browse page.
  if (request.method === "GET" && url.pathname.startsWith("/api/properties")) {
    event.respondWith(
      withTimeout(fetch(request), NETWORK_TIMEOUT_MS)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || new Response(
          JSON.stringify({ offline: true, message: "Showing saved listings — you're offline or on a slow connection." }),
          { headers: { "Content-Type": "application/json" } }
        )))
    );
    return;
  }

  // Everything that touches money or messaging must always hit the network.
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/payments") ||
    url.pathname.startsWith("/api/bookings")
  ) {
    return; // let the browser handle it normally
  }

  // App shell / static assets — cache-first for instant repeat loads.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
    )
  );
});
