// run.js — 런 상태, 맵 생성, 보상, 세이브 (v2: 주사위/유물)
import { DB } from './data.js';
import { rng } from './engine.js';

const SAVE_KEY = 'redhood_run_v8';

// v0.10: 시작 족보는 무기 선택으로 결정 — newRun 시점엔 빈 상태
export function newRun() {
  const maxHp = DB.act1.player.maxHp;
  return {
    hp: maxHp, maxHp,
    dice: DB.act1.player.startDice.slice(),
    relics: [],
    weapon: null,        // 무기 id (인트로에서 선택)
    categories: {},      // 족보 id -> 보유 변형 id 배열 (누적 수집)
    seenEvents: [],      // 이번 런에서 만난 대화 이벤트 id
    coins: 0,            // 🪙 상점 화폐 — 전투 승리로 획득 (v0.13)
    floor: 0,
    map: generateMap(),
  };
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

// ---------- 대화 이벤트 ----------
// 아직 안 본 이벤트 우선 무작위 (모두 봤으면 아무거나)
export function pickEvent(run) {
  const all = DB.events.events;
  const fresh = all.filter(ev => !run.seenEvents.includes(ev.id));
  const pool = fresh.length > 0 ? fresh : all;
  const ev = pool[Math.floor(rng.next() * pool.length)];
  if (!run.seenEvents.includes(ev.id)) run.seenEvents.push(ev.id);
  return ev;
}

// 선택지 효과 적용. 반환: { messages: [], pendingDie: 주사위정의|null }
// (pendingDie가 있으면 UI에서 교체 모달을 띄운다)
export function applyEventEffects(run, effects) {
  const messages = [];
  let pendingDie = null;
  for (const ef of (effects || [])) {
    switch (ef.op) {
      case 'heal': {
        const healed = Math.min(run.maxHp - run.hp, ef.amount);
        run.hp += healed;
        messages.push(`HP +${healed}`);
        break;
      }
      case 'loseHp':
        run.hp = Math.max(1, run.hp - ef.amount); // 이벤트로는 죽지 않는다
        messages.push(`HP -${ef.amount}`);
        break;
      case 'maxHp':
        run.maxHp += ef.amount;
        run.hp += ef.amount;
        messages.push(`최대 HP +${ef.amount}`);
        break;
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

// ---------- 맵 ----------
export function generateMap() {
  const cfg = DB.act1.map;
  const floors = [];
  for (let f = 1; f <= cfg.floors; f++) {
    const fixed = cfg.fixed[String(f)];
    if (fixed) { floors.push([{ type: fixed }]); continue; }
    const n = cfg.choicesMin + Math.floor(rng.next() * (cfg.choicesMax - cfg.choicesMin + 1));
    const nodes = [];
    for (let i = 0; i < n; i++) nodes.push({ type: rollNodeType(cfg, f, nodes) });
    floors.push(nodes);
  }
  return floors;
}

function rollNodeType(cfg, floor, existing) {
  const w = { ...cfg.nodeWeights };
  if (!cfg.eliteFloors.includes(floor)) delete w.elite;
  if (existing.some(nd => nd.type === 'elite')) delete w.elite;
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (const [type, weight] of Object.entries(w)) { roll -= weight; if (roll <= 0) return type; }
  return 'battle';
}

// ---------- 조우 ----------
export function rollEncounter(run, nodeType) {
  const enc = DB.act1.encounters;
  if (nodeType === 'boss') return pickArr(enc.boss);
  if (nodeType === 'elite') return pickArr(enc.elite);
  return enc.easyFloors.includes(run.floor) ? pickArr(enc.easy) : pickArr(enc.hard);
}
function pickArr(arr) { return arr[Math.floor(rng.next() * arr.length)].slice(); }

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
  let tierWeights = cfg.tierWeights;
  const luckMult = run.relics.map(id => DB.relicById[id].hook)
    .filter(h => h.type === 'luck').reduce((m, h) => m * (h.mult || 2), 1);
  if (luckMult > 1) {
    tierWeights = { ...tierWeights };
    for (const t of ['rare', 'epic']) if (tierWeights[t]) tierWeights[t] *= luckMult;
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
  const stock = [];
  const usedDie = new Set();
  for (let i = 0; i < cfg.stockDice; i++) {
    const tier = rollWeight(cfg.dieTierWeights);
    let cand = DB.dice.filter(d => d.id !== 'normal' && d.tier === tier && !usedDie.has(d.id));
    if (cand.length === 0) cand = DB.dice.filter(d => d.id !== 'normal' && d.tier !== 'epic' && !usedDie.has(d.id));
    if (cand.length === 0) break;
    const d = cand[Math.floor(rng.next() * cand.length)];
    usedDie.add(d.id);
    stock.push({ kind: 'die', item: d, price: cfg.prices.diceByTier[d.tier] });
  }
  for (const r of pickN(DB.relics.filter(r => r.tier === 'normal' && !run.relics.includes(r.id)), cfg.stockRelics)) {
    stock.push({ kind: 'relic', item: r, price: cfg.prices.relic });
  }
  return stock;
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

// ---------- 휴식 ----------
export function applyRest(run) {
  const heal = Math.floor(run.maxHp * DB.act1.rest.healRatio);
  run.hp = Math.min(run.maxHp, run.hp + heal);
  return heal;
}

// ---------- 세이브 ----------
export function saveRun(run) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...run, _v: 8 })); } catch (e) {}
}

export function loadRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s._v !== 8) { clearSave(); return null; }
    if (!s.dice.every(id => DB.diceById[id])) { clearSave(); return null; }
    if (!s.relics.every(id => DB.relicById[id])) { clearSave(); return null; }
    if (!s.weapon || !DB.weaponById[s.weapon]) { clearSave(); return null; }
    if (Object.keys(s.categories || {}).length === 0) { clearSave(); return null; }
    if (!Array.isArray(s.seenEvents)) s.seenEvents = [];
    if (typeof s.coins !== 'number') s.coins = 0;
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
