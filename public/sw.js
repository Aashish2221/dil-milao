const CACHE_STATIC = "dil-milao-static-v3";
const CACHE_IMAGES = "dil-milao-images-v3";
const STATIC_PAGES = ["/", "/offline.html"];

// Install: pre-cache shell pages
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_STATIC).then((c) => c.addAll(STATIC_PAGES).catch(() => {}))
  );
});

// Activate: evict old caches
self.addEventListener("activate", (e) => {
  const KEEP = [CACHE_STATIC, CACHE_IMAGES];
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener("push", (e) => {
  if (!e.data) return;
  let data = { title: "Dil Milao", body: "You have a new notification!", url: "/discover" };
  try { data = JSON.parse(e.data.text()); } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon.svg",
      badge: "/icons/icon.svg",
      data: { url: data.url },
      vibrate: [200, 100, 200],
      requireInteraction: false,
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const targetUrl = e.notification.data?.url || "/discover";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.startsWith(self.location.origin)) {
          return client.navigate(targetUrl).then(() => client.focus());
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // Skip Supabase API calls (auth, realtime, RPC) — always fresh
  if (url.hostname.includes("supabase") && !url.pathname.includes("/storage/")) return;
  // Skip Next.js API routes
  if (url.pathname.startsWith("/api/")) return;

  // Cache-first for Supabase Storage images (profile photos, etc.)
  if (url.hostname.includes("supabase") && url.pathname.includes("/storage/")) {
    e.respondWith(
      caches.open(CACHE_IMAGES).then(async (cache) => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        const res = await fetch(e.request);
        if (res.ok) cache.put(e.request, res.clone());
        return res;
      })
    );
    return;
  }

  // Cache-first for Next.js static assets (_next/static)
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.open(CACHE_STATIC).then(async (cache) => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        const res = await fetch(e.request);
        if (res.ok) cache.put(e.request, res.clone());
        return res;
      })
    );
    return;
  }

  // Network-first for navigation (HTML pages) with offline fallback
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) {
            caches.open(CACHE_STATIC).then((c) => c.put(e.request, res.clone()));
          }
          return res;
        })
        .catch(() =>
          caches.match(e.request).then((cached) => cached || caches.match("/offline.html"))
        )
    );
  }
});
