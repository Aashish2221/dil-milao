"use client";
import { useEffect } from "react";

export default function PushNotifications() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "default") return; // already granted or denied

    // Wait a bit so the user is engaged before asking
    const timer = setTimeout(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;
        await subscribe();
      } catch {}
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

async function subscribe() {
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) { await saveSubscription(existing); return; }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });
  await saveSubscription(sub);
}

async function saveSubscription(sub: PushSubscription) {
  const json = sub.toJSON();
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
