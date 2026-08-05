// REDHOOD 서비스 워커 — 오프라인 캐시
// 배포 시 버전을 올리면 이전 캐시가 정리되고 새 파일이 받아진다.
const CACHE = 'redhood-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/main.js',
  './js/data.js',
  './js/engine.js',
  './js/run.js',
  './data/weapons.json',
  './data/cards.json',
  './data/enemies.json',
  './data/statuses.json',
  './data/frenzy.json',
  './data/act1.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 네트워크 우선, 실패 시 캐시 (개발 중 최신 반영 우선. 오프라인이면 캐시로 동작)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
