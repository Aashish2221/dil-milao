const CACHE = "dil-milao-v1";
const STATIC = ["/", "/discover", "/offline.html"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC).catch(() => {}))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Only handle GET requests
  if (e.request.method !== "GET") return;
  // Skip Supabase / API calls — always network
  const url = new URL(e.request.url);
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase")) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Cache successful page navigations
        if (res.ok && e.request.mode === "navigate") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((cached) => cached || caches.match("/offline.html")))
  );
});
