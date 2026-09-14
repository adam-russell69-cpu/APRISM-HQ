const CACHE_NAME = "aprism-field-v1";
const FALLBACK = "/admin";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith("aprism-field-") && key !== CACHE_NAME).map((key) => caches.delete(key)))
      ),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(url.pathname, response.clone());
          }
          return response;
        } catch {
          return (
            (await cache.match(url.pathname)) ||
            (await cache.match(FALLBACK)) ||
            new Response(
              "APRISM HQ is offline. Reconnect briefly, open the Admin page once, then it will be available offline.",
              { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
            )
          );
        }
      })()
    );
  }
});
