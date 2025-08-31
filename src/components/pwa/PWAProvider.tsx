'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Download, Monitor, Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show install prompt after a delay (don't be too aggressive)
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 30000); // 30 seconds delay
    };

    // Handle app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInstalled]);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setSwUpdateAvailable(true);
            }
          });
        }
      });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          setSwUpdateAvailable(true);
        }
      });
    } catch (error) {
      console.error('SmartShip PWA: Service worker registration failed:', error);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
      }

      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('SmartShip PWA: Install prompt failed:', error);
    }
  };

  const handleUpdateClick = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  return (
    <>
      {children}

      {/* Install Prompt */}
      {showInstallPrompt && !isInstalled && (
        <div className='fixed bottom-4 right-4 z-50 max-w-sm'>
          <Card className='p-4 shadow-lg border-blue-200'>
            <div className='flex justify-between items-start mb-3'>
              <div className='flex items-center space-x-2'>
                <Smartphone className='w-5 h-5 text-blue-600' />
                <h3 className='font-semibold text-gray-900'>Install SmartShip</h3>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={dismissInstallPrompt}
                className='p-1 h-auto'
              >
                <X className='w-4 h-4' />
              </Button>
            </div>

            <p className='text-sm text-gray-600 mb-4'>
              Install SmartShip for faster access, offline capabilities, and a better mobile
              experience.
            </p>

            <div className='flex items-center space-x-2 mb-4'>
              <div className='flex items-center text-xs text-gray-500'>
                <Monitor className='w-3 h-3 mr-1' />
                Works offline
              </div>
              <div className='flex items-center text-xs text-gray-500'>
                <Download className='w-3 h-3 mr-1' />
                Fast loading
              </div>
            </div>

            <div className='flex space-x-2'>
              <Button onClick={handleInstallClick} size='sm' className='flex-1'>
                <Download className='w-4 h-4 mr-2' />
                Install App
              </Button>
              <Button onClick={dismissInstallPrompt} variant='outline' size='sm'>
                Later
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Update Available Prompt */}
      {swUpdateAvailable && (
        <div className='fixed top-4 right-4 z-50 max-w-sm'>
          <Card className='p-4 shadow-lg border-green-200'>
            <div className='flex justify-between items-start mb-3'>
              <h3 className='font-semibold text-gray-900'>Update Available</h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSwUpdateAvailable(false)}
                className='p-1 h-auto'
              >
                <X className='w-4 h-4' />
              </Button>
            </div>

            <p className='text-sm text-gray-600 mb-4'>
              A new version of SmartShip is available with improvements and bug fixes.
            </p>

            <div className='flex space-x-2'>
              <Button onClick={handleUpdateClick} size='sm' className='flex-1'>
                Update Now
              </Button>
              <Button onClick={() => setSwUpdateAvailable(false)} variant='outline' size='sm'>
                Later
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className='fixed bottom-4 left-4 z-50'>
          <Card className='p-3 shadow-lg border-yellow-200 bg-yellow-50'>
            <div className='flex items-center space-x-2'>
              <div className='w-2 h-2 bg-yellow-500 rounded-full animate-pulse' />
              <span className='text-sm font-medium text-yellow-800'>You&apos;re offline</span>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

interface ExtendedNavigator extends Navigator {
  standalone?: boolean;
}

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if installed
    const checkInstalled = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as ExtendedNavigator).standalone === true ||
        document.referrer.includes('android-app://')
      );
    };

    setIsInstalled(checkInstalled());
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            icon: '/icons/icon-192x192.svg',
            badge: '/icons/icon-32x32.svg',
            ...options,
          });
        });
      }
    }
  };

  const isStandalone = () => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as ExtendedNavigator).standalone === true
    );
  };

  return {
    isInstalled,
    isOnline,
    isStandalone: isStandalone(),
    requestNotificationPermission,
    showNotification,
  };
}
