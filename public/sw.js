const CACHE = "dil-milao-v2";
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
      // If app is already open, navigate it and focus
      for (const client of list) {
        if (client.url.startsWith(self.location.origin)) {
          return client.navigate(targetUrl).then(() => client.focus());
        }
      }
      // Otherwise open a new tab
      return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase")) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && e.request.mode === "navigate") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((cached) => cached || caches.match("/offline.html"))
      )
  );
});
