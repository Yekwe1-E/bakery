const CACHE_NAME = 'ndu-pastry-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './shop.html',
    './cart.html',
    './checkout.html',
    './login.html',
    './register.html',
    './admin.html',
    './css/style.css',
    './js/main.js',
    './js/cart.js',
    './js/shop.js',
    './js/db.js',
    './js/auth.js',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Dynamic data falls mostly to frontend logic with IndexedDB
    // For API calls, let the normal fetch proceed - we handle failure in the frontend (db.js caching)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(fetch(request).catch(() => new Response(null, { status: 503, statusText: 'Offline' })));
        return;
    }

    // Static assets - Cache first, fallback to network
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request).then((networkResponse) => {
                // Return network response without caching dynamically to keep it simple
                return networkResponse;
            }).catch(() => {
                // Optionally return an offline fallback page here if it was a navigation request
                if (request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
