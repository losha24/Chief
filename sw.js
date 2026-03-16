const CACHE_NAME = 'chef-pro-v1.1.0';
const assets = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './logo.png'
];

// התקנה ושמירת קבצים במטמון
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('ChefPro: Caching assets');
      return cache.addAll(assets);
    })
  );
});

// ניקוי גרסאות ישנות מהזיכרון
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      );
    })
  );
});

// שליפת נתונים - תמיכה באופליין
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
