import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Register service worker and listen for updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    // Register Service Worker if supported and NOT running inside an iframe (e.g. AI Studio preview)
    let isInsideIframe = false;
    try {
      isInsideIframe = window.self !== window.top;
    } catch {
      isInsideIframe = true;
    }
    if ('serviceWorker' in navigator && !isInsideIframe) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          setSwRegistration(reg);

          // Check if a worker is already waiting
          if (reg.waiting) {
            setHasUpdate(true);
          }

          // Listen for new worker updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // A new version has been installed and is ready
                  setHasUpdate(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[PWA] Service worker registration error:', err);
        });
    }

    // Capture install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Install PWA
  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    } catch (e) {
      console.warn('[PWA] Install prompt error:', e);
    }
    return false;
  }, [deferredPrompt]);

  // Manually check for updates from server
  const checkForUpdates = useCallback(async () => {
    setIsCheckingUpdate(true);
    try {
      if (swRegistration) {
        await swRegistration.update();
        if (swRegistration.waiting) {
          setHasUpdate(true);
          return true;
        }
      }
      // Check if server HTML has changed by comparing etag / time
      const res = await fetch('/?_pwa_check=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        // If sw is not waiting, simple soft notification or reload
        console.log('[PWA] Check update completed, status:', res.status);
      }
    } catch (err) {
      console.warn('[PWA] Update check failed:', err);
    } finally {
      setTimeout(() => setIsCheckingUpdate(false), 800);
    }
    return false;
  }, [swRegistration]);

  // Reload the application with the new version (guaranteed cache purge)
  const reloadApp = useCallback(async () => {
    try {
      // 1. Tell SW to clear its cache
      if (swRegistration?.active) {
        swRegistration.active.postMessage({ type: 'CLEAR_CACHE' });
      }
      if (swRegistration?.waiting) {
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      // 2. Clear browser CacheStorage directly
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      // 3. Try to trigger sw update check
      if (swRegistration) {
        await swRegistration.update().catch(() => {});
      }
    } catch (e) {
      console.warn('[PWA] Cache purge error (continuing reload):', e);
    } finally {
      // 4. Force hard reload with timestamp to bust any intermediary proxy cache
      const url = new URL(window.location.href);
      url.searchParams.set('_v', Date.now().toString());
      window.location.href = url.toString();
    }
  }, [swRegistration]);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    hasUpdate,
    isCheckingUpdate,
    install,
    checkForUpdates,
    reloadApp,
    dismissUpdate: () => setHasUpdate(false),
  };
}
