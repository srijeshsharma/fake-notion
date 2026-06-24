const CACHE = 'fake-notion-v1';

// App shell to cache on install
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Always pass through Firebase, CDN, and font requests to the network
  if (url.includes('firestore') || url.includes('firebase') ||
      url.includes('googleapis') || url.includes('unpkg') ||
      url.includes('cdn.tailwind') || url.includes('gstatic')) {
    return;
  }

  // Cache-first for the app shell, network fallback
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
