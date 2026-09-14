"use client";

import { useEffect } from "react";

const CACHE_NAME = "aprism-field-v1";

export function OfflineRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => undefined);

    // Cache the page the field tech is actively using so it can reopen offline.
    // This is intentionally same-origin and browser-local only.
    void (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const response = await fetch(window.location.href, {
          credentials: "include",
          cache: "no-store",
        });
        if (response.ok) {
          await cache.put(window.location.pathname, response.clone());
        }
      } catch {
        // Weak/no signal is expected in the field. The service worker will use
        // whatever has already been cached.
      }
    })();
  }, []);

  return null;
}
