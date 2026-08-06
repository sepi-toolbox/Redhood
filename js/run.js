// run.js — 런 상태, 맵 생성, 보상, 세이브 (v2: 주사위/유물)
import { DB } from './data.js';
import { rng } from './engine.js';

const SAVE_KEY = 'redhood_run_v9';
const META_KEY = 'redhood_meta_v1';

// ---------- 메타 진행 (런 간 유지): 계몽 ----------
export function loadMeta() {
  try {
    const m = JSON.parse(localStorage.getItem(META_KEY)) || {};
    return { enlight: Math.max(0, Math.min(20, m.enlight | 0)) };
  } catch (e) { return { enlight: 0 }; }
}
export function saveMeta(meta) {
  try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (e) {}
}
// 치트 포함 — 계몽 수치 직접 설정 (0~20)
export function setEnlight(n) {
  const meta = loadMeta();
  meta.enlight = Math.max(0, Math.min(20, n | 0));
  saveMeta(meta);
  return meta.enlight;
}
// 3막 보스 처치 = 클리어 → 계몽 +1
export function gainEnlight() {
  const meta = loadMeta();
  meta.enlight = Math.min(20, meta.enlight + 1);
  saveMeta(meta);
  return meta.enlight;
}

// ---------- 막/테마 ----------
export function pickTheme(act) {
  const themes = DB.acts.acts[act - 1].themes;
  return themes[Math.floor(rng.next() * themes.length)].id;
}
export function themeOf(run) {
  const act = Math.min(run.act || 1, 3);
  return DB.acts.acts[act - 1].themes.find(t => t.id === run.theme) || DB.acts.acts[act - 1].themes[0];
}

// v0.10: 시작 족보는 무기 선택으로 결정 — newRun 시점엔 빈 상태
// v0.14: 계몽(enlight) 스냅샷이 런에 박힌다 — 6: 시작 HP -30% / 10: 저주 주사위 / 14: 최대 HP -10%
export function newRun() {
  const enlight = loadMeta().enlight;
  let maxHp = DB.act1.player.maxHp;
  if (enlight >= 14) maxHp = Math.floor(maxHp * 0.9);
  let hp = maxHp;
  if (enlight >= 6) hp = Math.max(1, Math.floor(maxHp * 0.7));
  const dice = DB.act1.player.startDice.slice();
  if (enlight >= 10) dice[dice.length - 1] = 'cursed';
  return {
    hp, maxHp,
    dice,
    relics: [],
    weapon: null,        // 무기 id (인트로에서 선택)
    categories: {},      // 족보 id -> 보유 변형 id 배열 (누적 수집)
    seenEvents: [],      // 이번 런에서 만난 대화 이벤트 id
    coins: 0,            // 🪙 상점 화폐 — 전투 승리로 획득 (v0.13)
    enlight,             // 계몽 스냅샷 (런 시작 시점 고정)
    act: 1,              // 1~3막, 4 = 최종전
    theme: pickTheme(1), // 이번 막의 테마 id
    floor: 0,
    pos: -1,             // 현재 층에서 선 노드 인덱스 (0층이면 -1)
    path: [],            // 지나온 노드 인덱스 기록 (지도에 발자취 표시용)
    map: generateMap(enlight),
  };
}

// 보스 처치 → 다음 막 (최대 체력 50% 회복 — 계몽 5+: 15%)
export function advanceAct(run) {
  const ratio = run.enlight >= 5 ? 0.15 : DB.acts.bossHealRatio;
  const healed = Math.min(run.maxHp - run.hp, Math.floor(run.maxHp * ratio));
  run.hp += healed;
  run.act += 1;
  run.theme = pickTheme(run.act);
  run.floor = 0;
  run.pos = -1;
  run.path = [];
  run.map = generateMap(run.enlight);
  return healed;
}

// 무기 선택 → 시작 족보 3종 지급
export function chooseWeapon(run, weaponId) {
  const w = DB.weaponById[weaponId];
  if (!w) return false;
  run.weapon = weaponId;
  run.categories = {};
  for (const [cid, vid] of Object.entries(w.start)) run.categories[cid] = [vid];
  return true;
}

// 인트로에서 제안할 무기 n종 무작위 추출
export function offerWeapons(n) {
  const pool = DB.events.weapons.slice();
  const out = [];
  while (out.length < n && pool.length > 0) {
    out.push(pool.splice(Math.floor(rng.next() * pool.length), 1)[0]);
  }
  return out;
}

// ---------- 대화 이벤트 (v0.14: 테마 풀) ----------
// 현재 테마의 이벤트 중 아직 안 본 것 우선 (모두 봤으면 테마 내 아무거나)
export function pickEvent(run) {
  const theme = themeOf(run);
  const all = DB.events.events.filter(ev => (ev.themes || []).includes(theme.id));
  const pool0 = all.length > 0 ? all : DB.events.events;
  const fresh = pool0.filter(ev => !run.seenEvents.includes(ev.id));
  const pool = fresh.length > 0 ? fresh : pool0;
  const ev = pool[Math.floor(rng.next() * pool.length)];
  if (!run.seenEvents.includes(ev.id)) run.seenEvents.push(ev.id);
  return ev;
}

// 선택지 효과 적용. 반환: { messages: [], pendingDie: 주사위정의|null }
// (pendingDie가 있으면 UI에서 교체 모달을 띄운다)
export function applyEventEffects(run, effects) {
  const messages = [];
  let pendingDie = null;
  // 계몽 15: 이벤트의 대가가 더 가혹해진다 (부정 효과 ×1.5)
  const grim = run.enlight >= 15 ? 1.5 : 1;
  for (const ef of (effects || [])) {
    switch (ef.op) {
      case 'heal': {
        const healed = Math.min(run.maxHp - run.hp, ef.amount);
        run.hp += healed;
        messages.push(`HP +${healed}`);
        break;
      }
      case 'loseHp': {
        const amt = Math.ceil(ef.amount * grim);
        run.hp = Math.max(1, run.hp - amt); // 이벤트로는 죽지 않는다
        messages.push(`HP -${amt}`);
        break;
      }
      case 'maxHp':
        run.maxHp += ef.amount;
        run.hp += ef.amount;
        messages.push(`최대 HP +${ef.amount}`);
        break;
      case 'maxHpLoss': {
        const amt = Math.ceil(ef.amount * grim);
        run.maxHp = Math.max(10, run.maxHp - amt);
        run.hp = Math.min(run.hp, run.maxHp);
        messages.push(`최대 HP -${amt}`);
        break;
      }
      case 'gainCoins':
        run.coins += ef.amount;
        messages.push(`🪙 +${ef.amount}`);
        break;
      case 'loseCoins': {
        const amt = Math.min(run.coins, Math.ceil(ef.amount * grim));
        run.coins -= amt;
        messages.push(`🪙 -${amt}`);
        break;
      }
      case 'gainRelicElite': {
        let pool = DB.relics.filter(r => r.tier === 'elite' && !run.relics.includes(r.id));
        if (pool.length === 0) pool = DB.relics.filter(r => !run.relics.includes(r.id));
        if (pool.length === 0) { messages.push('더 얻을 유물이 없다'); break; }
        const r = pool[Math.floor(rng.next() * pool.length)];
        applyRelicPickup(run, r);
        messages.push(`${r.icon} ${r.name} 획득`);
        break;
      }
      case 'gainRelic': {
        const pool = DB.relics.filter(r => !run.relics.includes(r.id));
        if (pool.length === 0) { run.hp = Math.min(run.maxHp, run.hp + 5); messages.push('줄 것이 없어 HP +5'); break; }
        const r = pool[Math.floor(rng.next() * pool.length)];
        applyRelicPickup(run, r);
        messages.push(`${r.icon} ${r.name} 획득`);
        break;
      }
      case 'gainVariant': {
        const pool = [];
        for (const c of DB.scoring.categories) {
          const owned = run.categories[c.id] || [];
          for (const v of (c.variants || [])) if (!owned.includes(v.id)) pool.push({ c, v });
        }
        if (pool.length === 0) { messages.push('더 얻을 족보가 없다'); break; }
        const { c, v } = pool[Math.floor(rng.next() * pool.length)];
        (run.categories[c.id] = run.categories[c.id] || []).push(v.id);
        messages.push(`📜 ${v.name}(${c.name}) 획득`);
        break;
      }
      case 'gainDie': {
        const pool = DB.dice.filter(d => d.id !== 'normal');
        pendingDie = pool[Math.floor(rng.next() * pool.length)];
        messages.push(`🎲 ${pendingDie.name} 발견`);
        break;
      }
    }
  }
  return { messages, pendingDie };
}

// ---------- 맵 (v0.26: 슬더스식 분기 그래프) ----------
// 무작위 행보(walk) 여러 개를 아래→위로 그어 골격을 만들고, 겹치는 칸은 합친다.
// floors[f] = [{type, lane}...] (lane 오름차순), edges[f][i] = 다음 층에서 갈 수 있는 노드 인덱스들
export const MAP_LANES = 5;
export function generateMap(enlight = 0) {
  const cfg = DB.act1.map;
  const F = cfg.floors;                       // 마지막 층 = 보스 (단일)
  const laneSet = Array.from({ length: F - 1 }, () => new Set());
  const edgePairs = new Set();                // "f:laneA>laneB" (f = 층 인덱스)
  const starts = [0, 1, 2, 3, 4].sort(() => rng.next() - 0.5).slice(0, 4);
  for (const s of starts) {
    let lane = s;
    for (let f = 0; f < F - 1; f++) {
      laneSet[f].add(lane);
      if (f === F - 2) break;                 // 보스 직전 층까지
      const moves = [lane - 1, lane, lane + 1].filter(l => l >= 0 && l < MAP_LANES);
      const next = moves[Math.floor(rng.next() * moves.length)];
      edgePairs.add(`${f}:${lane}>${next}`);
      lane = next;
    }
  }
  // 층별 노드 배열 (lane 오름차순) + 유형 배정
  const floors = [];
  for (let f = 0; f < F - 1; f++) {
    const lanes = [...laneSet[f]].sort((a, b) => a - b);
    const nodes = [];
    for (const lane of lanes) {
      const fixed = cfg.fixed[String(f + 1)];
      nodes.push({ type: fixed || rollNodeType(cfg, f + 1, nodes, enlight), lane });
    }
    floors.push(nodes);
  }
  floors.push([{ type: cfg.fixed[String(F)] || 'boss', lane: 2 }]); // 보스 층
  // 간선 인덱스화
  const idxOf = (f, lane) => floors[f].findIndex(nd => nd.lane === lane);
  const edges = floors.map(fl => fl.map(() => []));
  for (const key of edgePairs) {
    const [fPart, lanes] = key.split(':');
    const f = parseInt(fPart, 10);
    const [a, b] = lanes.split('>').map(Number);
    const ia = idxOf(f, a), ib = idxOf(f + 1, b);
    if (ia >= 0 && ib >= 0 && !edges[f][ia].includes(ib)) edges[f][ia].push(ib);
  }
  for (const nd of floors[F - 2].map((_, i) => i)) edges[F - 2][nd] = [0]; // 마지막 휴식 → 보스
  edges[F - 1] = [[]];
  for (const fl of edges) for (const list of fl) list.sort((a, b) => a - b);
  return { floors, edges };
}

// 지금 위치에서 갈 수 있는 다음 층 노드 인덱스들
export function reachableNodes(run) {
  if (run.floor === 0) return run.map.floors[0].map((_, i) => i);
  if (run.floor >= run.map.floors.length) return [];
  return run.map.edges[run.floor - 1][run.pos] || [];
}

function rollNodeType(cfg, floor, existing, enlight = 0) {
  const w = { ...cfg.nodeWeights };
  if (enlight >= 1 && w.elite) w.elite *= 2; // 계몽 1: 엘리트가 더 자주 나온다
  if (!cfg.eliteFloors.includes(floor)) delete w.elite;
  if (existing.some(nd => nd.type === 'elite')) delete w.elite;
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (const [type, weight] of Object.entries(w)) { roll -= weight; if (roll <= 0) return type; }
  return 'battle';
}

// ---------- 조우 (v0.14: 테마 풀 기반) ----------
export function rollEncounter(run, nodeType) {
  const theme = themeOf(run);
  if (nodeType === 'boss') return [theme.boss];
  if (nodeType === 'elite') return [pick(theme.elites)];
  // 일반: 쉬운 층은 1마리, 이후 55% 1마리 / 45% 2마리
  if (DB.act1.encounters.easyFloors.includes(run.floor)) return [pick(theme.normals)];
  if (rng.next() < 0.55) return [pick(theme.normals)];
  return [pick(theme.normals), pick(theme.normals)];
}
function pick(arr) { return arr[Math.floor(rng.next() * arr.length)]; }

// 최종전 조우: 무한 체력 보스 (계몽 20: 두 마리)
export function finalEncounter(run) {
  const id = DB.acts.finalBoss;
  return run.enlight >= 20 ? [id, id] : [id];
}

// ---------- 보상 경제 (v0.13, 성권 지시) ----------
// 일반 전투 = 커먼~언커먼 족보·주사위 / 엘리트 = 언커먼~레어 족보·주사위 + 일반 유물
// 보스 = 정예 유물 + 전설(에픽) 족보/주사위 / 이벤트 = 무엇이든 (대가 지불) / 상점 = 커먼~레어 주사위 + 일반 유물
// 족보 풀 = (족보, 변형) 쌍. 이미 보유한 변형만 제외 — 획득은 추가(v0.9).
function rewardPoolOf(run, kind, allowedTiers = null) {
  if (kind === 'dice') {
    let pool = DB.dice.filter(d => d.id !== 'normal');
    if (allowedTiers) pool = pool.filter(d => allowedTiers.has(d.tier));
    return pool;
  }
  if (kind === 'relic') {
    // 전투 보상 유물은 '일반' 등급만 — 정예 유물은 보스 전리품 전용
    return DB.relics.filter(r => r.tier === 'normal' && !run.relics.includes(r.id));
  }
  const pool = [];
  for (const c of DB.scoring.categories) {
    const ownedList = run.categories[c.id] || [];
    for (const v of (c.variants || [])) {
      if (ownedList.includes(v.id)) continue;
      if (allowedTiers && !allowedTiers.has(v.tier)) continue;
      pool.push({ id: `${c.id}:${v.id}`, tier: v.tier, cat: c, variant: v, owned: ownedList.length > 0 });
    }
  }
  return pool;
}

// 보유 변형 수 (족보 누적 → 주사위 확률 보정용)
function ownedVariantCount(run) {
  return Object.values(run.categories).reduce((s, a) => s + a.length, 0);
}

export function rollRewards(run, nodeType) {
  const cfg = DB.act1.rewards[nodeType];
  if (!cfg || cfg.choices === 0) return [];
  const allowed = new Set(Object.keys(cfg.tierWeights));
  // 범주 가중 보정: 족보(변형)가 많아질수록 주사위 확률↑ (족보만 쌓이면 복잡해지는 것 방지)
  const poolW = { ...cfg.pool };
  const ds = DB.act1.diceShift;
  if (ds && poolW.category && poolW.dice) {
    const extra = Math.max(0, ownedVariantCount(run) - ds.freeVariants);
    const shift = Math.min(poolW.category * ds.maxRatio, extra * ds.perVariant);
    poolW.category -= shift;
    poolW.dice += shift;
  }
  // 1) 범주 추첨 (빈 풀이면 다른 범주로) — 단, 첫 전투(1층) 보상은 무조건 족보
  let kind = null, pool = [];
  if (nodeType === 'battle' && run.floor === 1) {
    kind = 'category';
    pool = rewardPoolOf(run, 'category', allowed);
  }
  for (let g = 0; g < 30 && pool.length === 0; g++) {
    kind = rollWeight(poolW);
    pool = rewardPoolOf(run, kind, allowed);
  }
  if (pool.length === 0) return [];
  // 2) 범주 안에서 등급 가중으로 3개 추첨 (허용 등급 밖으로는 절대 나가지 않음)
  // 네잎클로버(luck): 상위 등급 가중 배가 / 유물은 등급 가중 없음(일반 균등)
  let tierWeights = { ...cfg.tierWeights };
  const luckMult = run.relics.map(id => DB.relicById[id].hook)
    .filter(h => h.type === 'luck').reduce((m, h) => m * (h.mult || 2), 1);
  if (luckMult > 1) {
    for (const t of ['rare', 'epic']) if (tierWeights[t]) tierWeights[t] *= luckMult;
  }
  // 계몽 12: 상위 등급 확률 절반 (일반 전투의 언커먼, 엘리트의 레어)
  if ((run.enlight || 0) >= 12) {
    if (nodeType === 'battle' && tierWeights.uncommon) tierWeights.uncommon *= 0.5;
    if (nodeType === 'elite' && tierWeights.rare) tierWeights.rare *= 0.5;
  }
  const picks = [];
  const usedIds = new Set();
  let guard = 0;
  while (picks.length < cfg.choices && guard++ < 200) {
    let cand;
    if (kind === 'relic') {
      cand = pool.filter(x => !usedIds.has(x.id));
    } else {
      const tier = rollWeight(tierWeights);
      cand = pool.filter(x => x.tier === tier && !usedIds.has(x.id));
      if (cand.length === 0) cand = pool.filter(x => !usedIds.has(x.id));
    }
    if (cand.length === 0) break;
    const item = cand[Math.floor(rng.next() * cand.length)];
    usedIds.add(item.id);
    picks.push({ kind: kind === 'dice' ? 'die' : kind === 'relic' ? 'relic' : 'category', item });
  }
  return picks;
}

// ---------- 보스 전리품: 정예 유물 → 전설(에픽) 족보/주사위 ----------
function pickN(pool, n) {
  const p = pool.slice(); const out = [];
  while (out.length < n && p.length > 0) out.push(p.splice(Math.floor(rng.next() * p.length), 1)[0]);
  return out;
}

export function bossRelicChoices(run) {
  return pickN(DB.relics.filter(r => r.tier === 'elite' && !run.relics.includes(r.id)), 3)
    .map(r => ({ kind: 'relic', item: r }));
}

export function bossLegendaryChoices(run) {
  const pool = [];
  for (const c of DB.scoring.categories) {
    const ownedList = run.categories[c.id] || [];
    for (const v of (c.variants || [])) {
      if (v.tier !== 'epic' || ownedList.includes(v.id)) continue;
      pool.push({ kind: 'category', item: { id: `${c.id}:${v.id}`, tier: 'epic', cat: c, variant: v, owned: ownedList.length > 0 } });
    }
  }
  for (const d of DB.dice) if (d.tier === 'epic') pool.push({ kind: 'die', item: d });
  return pickN(pool, 3);
}

// ---------- 상점: 커먼~레어 주사위 + 일반 유물 (전설 없음) ----------
export function rollShopStock(run) {
  const cfg = DB.act1.shop;
  let priceMult = (run.enlight || 0) >= 16 ? 1.3 : 1; // 계몽 16: 상점 가격 증가
  // 가계부: 상점 가격 -20%
  priceMult *= run.relics.map(id => DB.relicById[id].hook)
    .filter(h => h.type === 'shopDiscount').reduce((m, h) => m * (h.mult || 1), 1);
  const stock = [];
  const usedDie = new Set();
  for (let i = 0; i < cfg.stockDice; i++) {
    const tier = rollWeight(cfg.dieTierWeights);
    let cand = DB.dice.filter(d => d.id !== 'normal' && d.tier === tier && !usedDie.has(d.id));
    if (cand.length === 0) cand = DB.dice.filter(d => d.id !== 'normal' && d.tier !== 'epic' && !usedDie.has(d.id));
    if (cand.length === 0) break;
    const d = cand[Math.floor(rng.next() * cand.length)];
    usedDie.add(d.id);
    stock.push({ kind: 'die', item: d, price: Math.round(cfg.prices.diceByTier[d.tier] * priceMult) });
  }
  for (const r of pickN(DB.relics.filter(r => r.tier === 'normal' && !run.relics.includes(r.id)), cfg.stockRelics)) {
    stock.push({ kind: 'relic', item: r, price: Math.round(cfg.prices.relic * priceMult) });
  }
  return stock;
}

// 전투 승리 코인 (계몽 13: -25%)
export function coinReward(run, nodeType) {
  const cr = DB.act1.coins[nodeType === 'elite' ? 'elite' : 'battle'];
  let got = cr[0] + Math.floor(rng.next() * (cr[1] - cr[0] + 1));
  // 은저울: 코인 +25%
  const cm = run.relics.map(id => DB.relicById[id].hook)
    .filter(h => h.type === 'coinBonus').reduce((m, h) => m * (h.mult || 1), 1);
  got = Math.round(got * cm);
  if ((run.enlight || 0) >= 13) got = Math.floor(got * 0.75);
  run.coins += got;
  return got;
}

function rollWeight(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (const [key, w] of Object.entries(weights)) { roll -= w; if (roll <= 0) return key; }
  return Object.keys(weights)[0];
}

// ---------- 유물 획득 (즉발 훅 적용: 유리병 최대 HP 등) ----------
export function applyRelicPickup(run, relic) {
  run.relics.push(relic.id);
  if (relic.hook.type === 'maxHp') {
    run.maxHp += relic.hook.amount;
    run.hp += relic.hook.amount;
  }
}

// ---------- 휴식 (계몽 11: 회복량 -50%) ----------
export function restHealAmount(run) {
  const ratio = DB.act1.rest.healRatio * ((run.enlight || 0) >= 11 ? 0.5 : 1);
  return Math.floor(run.maxHp * ratio);
}
export function applyRest(run) {
  const heal = restHealAmount(run);
  run.hp = Math.min(run.maxHp, run.hp + heal);
  return heal;
}

// ---------- 세이브 ----------
export function saveRun(run) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...run, _v: 10 })); } catch (e) {}
}

export function loadRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s._v !== 10) { clearSave(); return null; } // v0.26: 분기 지도로 세이브 구조 변경
    if (!s.map || !Array.isArray(s.map.floors) || !Array.isArray(s.map.edges)) { clearSave(); return null; }
    if (typeof s.pos !== 'number') s.pos = -1;
    if (!Array.isArray(s.path)) s.path = [];
    if (!s.dice.every(id => DB.diceById[id])) { clearSave(); return null; }
    if (!s.relics.every(id => DB.relicById[id])) { clearSave(); return null; }
    if (!s.weapon || !DB.weaponById[s.weapon]) { clearSave(); return null; }
    if (Object.keys(s.categories || {}).length === 0) { clearSave(); return null; }
    if (!Array.isArray(s.seenEvents)) s.seenEvents = [];
    if (typeof s.coins !== 'number') s.coins = 0;
    if (typeof s.enlight !== 'number') s.enlight = 0;
    if (![1, 2, 3].includes(s.act)) { clearSave(); return null; } // 최종전(4) 중 세이브는 없음
    const actDef = DB.acts.acts[s.act - 1];
    if (!actDef || !actDef.themes.some(t => t.id === s.theme)) { clearSave(); return null; }
    const byId = {};
    for (const c of DB.scoring.categories) byId[c.id] = c;
    for (const [cid, vids] of Object.entries(s.categories || {})) {
      const c = byId[cid];
      if (!c || !Array.isArray(vids) || vids.length === 0) { clearSave(); return null; }
      if (!vids.every(vid => (c.variants || []).some(v => v.id === vid))) { clearSave(); return null; }
    }
    return s;
  } catch (e) { return null; }
}

export function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
export function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
