const CACHE_NAME = 'smart-ship-v1.0.0';
const OFFLINE_URL = '/offline';

// Critical resources to cache for offline functionality
const CRITICAL_RESOURCES = [
  '/',
  '/offline',
  '/dashboard',
  '/shipping/enhanced',
  '/tracking/enhanced',
  '/analytics',
  // CSS and JS files will be added by Next.js automatically
  '/manifest.json',
];

// API endpoints to cache for offline access
const _API_CACHE_PATTERNS = ['/api/shipments', '/api/tracking', '/api/analytics'];

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.warn('SmartShip Service Worker: Installing...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.warn('SmartShip Service Worker: Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(() => {
        console.warn('SmartShip Service Worker: Installation complete');
        // Take control immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.warn('SmartShip Service Worker: Activating...');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.warn('SmartShip Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.warn('SmartShip Service Worker: Activation complete');
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement cache strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests with appropriate strategies
  if (request.method !== 'GET') {
    return; // Only handle GET requests
  }

  // Handle navigation requests (page loads)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.includes('.')
  ) {
    event.respondWith(handleStaticAssetRequest(request));
    return;
  }

  // Default handling for other requests
  event.respondWith(handleDefaultRequest(request));
});

// Navigation request handler - Network First with Offline Fallback
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    console.warn('SmartShip Service Worker: Network failed for navigation, checking cache...');

    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page as last resort
    return caches.match(OFFLINE_URL);
  }
}

// API request handler - Network First with Cache Fallback
async function handleApiRequest(request) {
  const _url = new URL(request.url);

  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful GET responses for read operations
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    console.warn('SmartShip Service Worker: Network failed for API, checking cache...');

    // For read operations, try cache
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // Add a header to indicate this is cached data
        const headers = new Headers(cachedResponse.headers);
        headers.append('X-SW-Cache', 'true');

        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: headers,
        });
      }
    }

    // Return error response for failed requests
    return new Response(
      JSON.stringify({
        error: 'Network unavailable',
        message: 'Please check your internet connection and try again.',
        offline: true,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Static asset handler - Cache First
async function handleStaticAssetRequest(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    console.warn('SmartShip Service Worker: Failed to fetch static asset:', request.url);

    // Return a fallback for essential assets
    if (request.url.includes('.css')) {
      return new Response('/* Offline CSS fallback */', {
        headers: { 'Content-Type': 'text/css' },
      });
    }

    if (request.url.includes('.js')) {
      return new Response('// Offline JS fallback', {
        headers: { 'Content-Type': 'application/javascript' },
      });
    }

    throw error;
  }
}

// Default request handler
async function handleDefaultRequest(request) {
  try {
    return await fetch(request);
  } catch {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Background sync for failed requests
self.addEventListener('sync', event => {
  console.warn('SmartShip Service Worker: Background sync triggered:', event.tag);

  if (event.tag === 'shipment-sync') {
    event.waitUntil(syncFailedShipments());
  }

  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalyticsData());
  }
});

// Sync failed shipments when back online
async function syncFailedShipments() {
  try {
    console.warn('SmartShip Service Worker: Syncing failed shipments...');

    // Get failed requests from IndexedDB or cache
    const failedRequests = await getFailedRequests('shipments');

    for (const request of failedRequests) {
      try {
        await fetch(request.url, request.options);
        await removeFailedRequest('shipments', request.id);
        console.warn('SmartShip Service Worker: Synced shipment:', request.id);
      } catch (error) {
        console.error('SmartShip Service Worker: Failed to sync shipment:', request.id, error);
      }
    }
  } catch (error) {
    console.error('SmartShip Service Worker: Sync failed:', error);
  }
}

// Sync analytics data when back online
async function syncAnalyticsData() {
  try {
    console.warn('SmartShip Service Worker: Syncing analytics data...');

    // Implementation for analytics sync
    const analyticsData = await getStoredAnalytics();

    if (analyticsData.length > 0) {
      await fetch('/api/analytics/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsData),
      });

      await clearStoredAnalytics();
      console.warn('SmartShip Service Worker: Analytics data synced');
    }
  } catch (error) {
    console.error('SmartShip Service Worker: Analytics sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', event => {
  console.warn('SmartShip Service Worker: Push notification received');

  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icons/action-view.png',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png',
      },
    ],
    requireInteraction: data.requireInteraction || false,
    silent: false,
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.warn('SmartShip Service Worker: Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'view') {
    const url = event.notification.data?.url || '/dashboard';
    event.waitUntil(clients.openWindow(url));
  }
});

// Message handler for communication with main thread
self.addEventListener('message', event => {
  console.warn('SmartShip Service Worker: Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

// Helper functions for IndexedDB operations
async function getFailedRequests(_store) {
  // Implementation would use IndexedDB to store failed requests
  return [];
}

async function removeFailedRequest(_store, _id) {
  // Implementation would remove the request from IndexedDB
}

async function getStoredAnalytics() {
  // Implementation would get stored analytics from IndexedDB
  return [];
}

async function clearStoredAnalytics() {
  // Implementation would clear stored analytics from IndexedDB
}

console.warn('SmartShip Service Worker: Loaded successfully');
