// audio.js — 배경음 (v0.90)
// 설계 요지
//  · Web Audio로 버퍼를 한 번 디코드해 loop=true로 돌린다. MP3 컨테이너의 앞뒤 패딩과 무관하게 이음매가 없다.
//  · 화면이 바뀌면 1초 크로스페이드. 뚝 끊기면 싸구려로 들린다.
//  · 곡이 없으면 폴백 사슬을 타고 내려간다. 한 곡씩 추가해도 게임이 안 깨진다.
//  · 브라우저는 사용자가 화면을 한 번 만지기 전에는 소리를 못 낸다. 그전 요청은 기억해뒀다가 첫 입력에 재생한다.

const MUTE_KEY = 'redhood_mute';
const FADE = 1.0;          // 크로스페이드 초
const VOLUME = 0.55;       // 배경음 기본 볼륨 (효과음 자리를 남겨둔다)

// 실제로 파일이 있는 곡만 적는다 — 없는 곡을 요청하면 404가 쌓인다
const HAVE = new Set([
  'bgm_map', 'bgm_event', 'bgm_shop', 'bgm_rest',
  'bgm_battle1', 'bgm_battle2', 'bgm_battle3',
  'bgm_elite1', 'bgm_elite2', 'bgm_elite3',
  // v0.92: 보스 9인 전용 테마 + 최종전
  'bgm_boss_wolf', 'bgm_boss_river_hag', 'bgm_boss_old_teddy',
  'bgm_boss_swamp_king', 'bgm_boss_fog_mother', 'bgm_boss_the_buried',
  'bgm_boss_lucid_king', 'bgm_boss_the_maw', 'bgm_boss_false_saint',
  'bgm_final',
]);

// 장면 → 곡 후보 (앞에서부터 있는 것을 쓴다)
const CHAIN = {
  title: ['bgm_title', 'bgm_map'],
  map: ['bgm_map'],
  event: ['bgm_event', 'bgm_map'],
  shop: ['bgm_shop', 'bgm_event', 'bgm_map'],
  rest: ['bgm_rest', 'bgm_event', 'bgm_map'],
  end: ['bgm_title', 'bgm_map'],
};
function battleChain(act, kind, bossId) {
  const a = Math.min(Math.max(act || 1, 1), 3);
  const base = [`bgm_battle${a}`, 'bgm_battle1'];
  if (kind === 'final') return ['bgm_final', 'bgm_battle3', ...base];
  if (kind === 'boss') return [bossId ? `bgm_boss_${bossId}` : '', `bgm_boss${a}`, ...base].filter(Boolean);
  if (kind === 'elite') return [`bgm_elite${a}`, ...base];
  return base;
}

let actx = null, master = null;
let cur = null;                    // { id, src, gain }
let pending = null;                // 첫 입력 전에 요청된 장면
let muted = localStorage.getItem(MUTE_KEY) === '1';
const buffers = new Map();         // id → AudioBuffer
const loading = new Map();         // id → Promise
let ext = null;                    // 'ogg' | 'mp3'

function pickExt() {
  if (ext) return ext;
  const a = document.createElement('audio');
  ext = a.canPlayType('audio/ogg; codecs=vorbis') ? 'ogg' : 'mp3';
  return ext;
}

function ensureCtx() {
  if (actx) return actx;
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) return null;
  actx = new C();
  master = actx.createGain();
  master.gain.value = muted ? 0 : VOLUME;
  master.connect(actx.destination);
  return actx;
}

function load(id) {
  if (buffers.has(id)) return Promise.resolve(buffers.get(id));
  if (loading.has(id)) return loading.get(id);
  const p = fetch(`assets/bgm/${id}.${pickExt()}`)
    .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('404'))))
    .then(b => new Promise((res, rej) => actx.decodeAudioData(b, res, rej)))
    .then(buf => { buffers.set(id, buf); return buf; })
    .catch(() => null);
  loading.set(id, p);
  return p;
}

function resolve(chain) {
  for (const id of chain) if (HAVE.has(id)) return id;
  return null;
}

function fadeOutAndStop(node, t) {
  if (!node) return;
  const g = node.gain.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(0, t + FADE);
  try { node.src.stop(t + FADE + 0.05); } catch (e) { /* 이미 멈춤 */ }
}

function start(id) {
  if (cur && cur.id === id) return;               // 같은 곡이면 끊지 않고 이어간다
  const buf = buffers.get(id);
  if (!buf) return;
  const t = actx.currentTime;
  const gain = actx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(1, t + FADE);
  gain.connect(master);
  const src = actx.createBufferSource();
  src.buffer = buf;
  src.loop = true;                                 // 샘플 단위 반복 — 이음매 없음
  src.connect(gain);
  src.start(t);
  fadeOutAndStop(cur, t);
  cur = { id, src, gain };
}

/** 화면이 바뀔 때 호출한다. scene: 'title'|'map'|'event'|'shop'|'rest'|'end'|'battle' */
export function setScene(scene, opts = {}) {
  const chain = scene === 'battle'
    ? battleChain(opts.act, opts.kind, opts.bossId)
    : (CHAIN[scene] || CHAIN.map);
  const id = resolve(chain);
  if (!id) return;
  if (!ensureCtx() || actx.state === 'suspended') { pending = id; return; }
  load(id).then(buf => { if (buf) start(id); });
}

/** 첫 사용자 입력에서 오디오를 깨운다 (브라우저 자동재생 정책) */
export function wakeAudio() {
  if (!ensureCtx()) return;
  if (actx.state === 'suspended') actx.resume();
  if (pending) { const id = pending; pending = null; load(id).then(buf => { if (buf) start(id); }); }
}

export function isMuted() { return muted; }
export function toggleMute() {
  muted = !muted;
  localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  if (master) {
    const t = actx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(muted ? 0 : VOLUME, t + 0.25);
  }
  return muted;
}

/** 다음에 쓸 곡을 미리 받아둔다 (보스로 향할 때 등) */
export function prefetch(scene, opts = {}) {
  const chain = scene === 'battle' ? battleChain(opts.act, opts.kind, opts.bossId) : (CHAIN[scene] || []);
  const id = resolve(chain);
  if (id && ensureCtx()) load(id);
}

// 첫 입력 한 번만 잡아 오디오를 깨운다
['pointerdown', 'touchstart', 'keydown'].forEach(ev =>
  window.addEventListener(ev, wakeAudio, { once: true, passive: true }));
