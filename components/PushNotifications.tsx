"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase";

export default function PushNotifications() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const perm = Notification.permission;

    if (perm === "denied") return; // user explicitly blocked — nothing to do

    if (perm === "granted") {
      // Already allowed — (re-)register subscription on every load so the
      // server always has a valid endpoint even after a db wipe or new device
      subscribeAndSave();
      return;
    }

    // perm === "default": wait a few seconds then ask
    const timer = setTimeout(async () => {
      try {
        const granted = await Notification.requestPermission();
        if (granted === "granted") subscribeAndSave();
      } catch {}
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

async function subscribeAndSave() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // not logged in — no point saving

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    }

    const json = sub.toJSON();
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(json),
    });
  } catch (err) {
    console.error("Push subscribe error:", err);
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
