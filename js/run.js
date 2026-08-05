// run.js — 런 상태, 맵 생성, 보상, 세이브 (v2: 주사위/유물)
import { DB } from './data.js';
import { rng } from './engine.js';

const SAVE_KEY = 'redhood_run_v7';

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
        run.relics.push(r.id);
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

// ---------- 보상: 범주(족보/주사위/유물)를 먼저 하나 뽑고, 그 범주 안에서만 3택1 ----------
// 족보 풀 = (족보, 변형) 쌍. 이미 보유한 변형만 제외 — 획득은 교체가 아니라 추가(v0.9).
// owned = 해당 족보를 하나라도 보유 중인지 (신규 족보 연출 판단용). 등급은 변형 등급.
function rewardPoolOf(run, kind) {
  if (kind === 'dice') return DB.dice.filter(d => d.id !== 'normal');
  if (kind === 'relic') return DB.relics.filter(r => !run.relics.includes(r.id));
  const pool = [];
  for (const c of DB.scoring.categories) {
    const ownedList = run.categories[c.id] || [];
    for (const v of (c.variants || [])) {
      if (ownedList.includes(v.id)) continue;
      pool.push({ id: `${c.id}:${v.id}`, tier: v.tier, cat: c, variant: v, owned: ownedList.length > 0 });
    }
  }
  return pool;
}

export function rollRewards(run, nodeType) {
  const cfg = DB.act1.rewards[nodeType];
  if (!cfg || cfg.choices === 0) return [];
  // 1) 범주 추첨 (빈 풀이면 다른 범주로) — 단, 첫 전투(1층) 보상은 무조건 족보
  let kind = null, pool = [];
  if (nodeType === 'battle' && run.floor === 1) {
    kind = 'category';
    pool = rewardPoolOf(run, 'category');
  }
  for (let g = 0; g < 30 && pool.length === 0; g++) {
    kind = rollWeight(cfg.pool);
    pool = rewardPoolOf(run, kind);
  }
  if (pool.length === 0) return [];
  // 2) 범주 안에서 등급 가중으로 3개 추첨 (중복 없음, 등급 소진 시 아무거나로 채움)
  const picks = [];
  const usedIds = new Set();
  let guard = 0;
  while (picks.length < cfg.choices && guard++ < 200) {
    const tier = rollWeight(cfg.tierWeights);
    let cand = pool.filter(x => x.tier === tier && !usedIds.has(x.id));
    if (cand.length === 0) cand = pool.filter(x => !usedIds.has(x.id));
    if (cand.length === 0) break;
    const item = cand[Math.floor(rng.next() * cand.length)];
    usedIds.add(item.id);
    picks.push({ kind: kind === 'dice' ? 'die' : kind === 'relic' ? 'relic' : 'category', item });
  }
  return picks;
}

function rollWeight(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (const [key, w] of Object.entries(weights)) { roll -= w; if (roll <= 0) return key; }
  return Object.keys(weights)[0];
}

// ---------- 휴식 ----------
export function applyRest(run) {
  const heal = Math.floor(run.maxHp * DB.act1.rest.healRatio);
  run.hp = Math.min(run.maxHp, run.hp + heal);
  return heal;
}

// ---------- 세이브 ----------
export function saveRun(run) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...run, _v: 7 })); } catch (e) {}
}

export function loadRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s._v !== 7) { clearSave(); return null; }
    if (!s.dice.every(id => DB.diceById[id])) { clearSave(); return null; }
    if (!s.relics.every(id => DB.relicById[id])) { clearSave(); return null; }
    if (!s.weapon || !DB.weaponById[s.weapon]) { clearSave(); return null; }
    if (Object.keys(s.categories || {}).length === 0) { clearSave(); return null; }
    if (!Array.isArray(s.seenEvents)) s.seenEvents = [];
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
