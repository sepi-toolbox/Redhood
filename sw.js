// REDHOOD 서비스 워커 — 오프라인 캐시
// ⚠ 판을 바꾸면 CACHE 번호를 반드시 +1 (runbook 규칙)
const CACHE = 'redhood-v34';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/main.js',
  './js/data.js',
  './js/yahtzee.js',
  './js/engine.js',
  './js/run.js',
  './data/dice.json',
  './data/relics.json',
  './data/scoring.json',
  './data/enemies.json',
  './data/act1.json',
  './data/events.json',
  './data/acts.json',
  './assets/dice/pip1.png',
  './assets/dice/pip2.png',
  './assets/dice/pip3.png',
  './assets/dice/pip4.png',
  './assets/dice/pip5.png',
  './assets/dice/pip6.png',
  './assets/dice/normal1.png',
  './assets/dice/normal2.png',
  './assets/dice/normal3.png',
  './assets/dice/normal4.png',
  './assets/dice/normal5.png',
  './assets/dice/normal6.png',
  './assets/dice/gold1.png',
  './assets/dice/gold2.png',
  './assets/dice/gold3.png',
  './assets/dice/gold4.png',
  './assets/dice/gold5.png',
  './assets/dice/gold6.png',
  './assets/dice/cursed1.png',
  './assets/dice/cursed2.png',
  './assets/dice/cursed3.png',
  './assets/dice/cursed4.png',
  './assets/dice/cursed5.png',
  './assets/dice/cursed6.png',
  './assets/dice/fang1.png',
  './assets/dice/fang2.png',
  './assets/dice/fang3.png',
  './assets/dice/fang4.png',
  './assets/dice/fang5.png',
  './assets/dice/fang6.png',
  './assets/dice/straw1.png',
  './assets/dice/straw2.png',
  './assets/dice/straw3.png',
  './assets/dice/straw4.png',
  './assets/dice/straw5.png',
  './assets/dice/straw6.png',
  './assets/dice/gold.png',
  './assets/dice/cursed.png',
  './assets/dice/fang.png',
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
