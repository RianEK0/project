'use client';

import { useEffect } from 'react';

export function PwaBootstrap() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      const cleanupDevelopmentCache = async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));

          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(
              keys.filter((key) => key.startsWith('novaerp-')).map((key) => caches.delete(key)),
            );
          }
        } catch {
          // Dev cleanup is best-effort so local work can continue even if the browser blocks it.
        }
      };

      void cleanupDevelopmentCache();

      return;
    }

    if (!window.isSecureContext) {
      return;
    }

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // PWA registration is best-effort during the current foundation sprint.
      });
    };

    if (document.readyState === 'complete') {
      register();

      return;
    }

    window.addEventListener('load', register, { once: true });

    return () => {
      window.removeEventListener('load', register);
    };
  }, []);

  return null;
}
