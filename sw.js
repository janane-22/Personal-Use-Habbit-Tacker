/**
 * HabitFlow Service Worker
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'habitflow-v1.0.0';
const STATIC_CACHE_NAME = 'habitflow-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'habitflow-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/themes.css',
  '/styles/animations.css',
  '/scripts/database.js',
  '/scripts/auth.js',
  '/scripts/quotes.js',
  '/scripts/animations.js',
  '/scripts/calendar.js',
  '/scripts/habits.js',
  '/scripts/notes.js',
  '/scripts/statistics.js',
  '/scripts/settings.js',
  '/scripts/main.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js'
];

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (external APIs)
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.startsWith('https://fonts.googleapis.com') &&
      !event.request.url.startsWith('https://cdn.jsdelivr.net')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response for caching
            const responseToCache = response.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                // Only cache certain file types
                if (shouldCache(event.request.url)) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(error => {
            console.log('Service Worker: Fetch failed, serving offline page:', error);
            
            // Serve offline fallback for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // For other requests, just fail
            throw error;
          });
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync tasks
      syncData()
        .then(() => {
          console.log('Service Worker: Background sync completed');
        })
        .catch(error => {
          console.error('Service Worker: Background sync failed:', error);
        })
    );
  }
});

// Push notification handling
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'Time to check your habits!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.svg',
    tag: 'habit-reminder',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View Habits',
        icon: '/icons/view-action.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-action.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'HabitFlow Reminder';
  }

  event.waitUntil(
    self.registration.showNotification('HabitFlow Reminder', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from the main app
self.addEventListener('message', event => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    // Cache specific URLs
    event.waitUntil(
      cacheUrls(event.data.urls)
    );
  }
});

// Helper functions
function shouldCache(url) {
  // Cache CSS, JS, and image files
  const cacheableExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];
  return cacheableExtensions.some(ext => url.includes(ext));
}

function cacheUrls(urls) {
  return caches.open(DYNAMIC_CACHE_NAME)
    .then(cache => {
      return cache.addAll(urls);
    });
}

function syncData() {
  // Perform data synchronization when connection is restored
  return new Promise((resolve, reject) => {
    // In a real app, this would sync with a server
    // For now, just resolve to indicate sync is complete
    setTimeout(() => {
      console.log('Service Worker: Data sync simulated');
      resolve();
    }, 1000);
  });
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  console.log('Service Worker: Periodic sync triggered');
  
  if (event.tag === 'habit-reminder') {
    event.waitUntil(
      // Send reminder notification
      self.registration.showNotification('HabitFlow Reminder', {
        body: 'Don\'t forget to check your daily habits!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge.svg',
        tag: 'periodic-reminder'
      })
    );
  }
});

// Error handling
self.addEventListener('error', event => {
  console.error('Service Worker: Global error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker: Unhandled promise rejection:', event.reason);
});

console.log('Service Worker: Loaded successfully');