// run.js — 런 상태, 맵 생성, 보상, 세이브 (v2: 주사위/유물)
import { DB } from './data.js';
import { rng } from './engine.js';

const SAVE_KEY = 'redhood_run_v4';

export function newRun() {
  const maxHp = DB.act1.player.maxHp;
  const categories = {};
  for (const c of DB.scoring.categories) if (c.startOwned) categories[c.id] = 1;
  return {
    hp: maxHp, maxHp,
    dice: DB.act1.player.startDice.slice(),
    relics: [],
    categories,          // id -> level
    floor: 0,
    map: generateMap(),
  };
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
function rewardPoolOf(run, kind) {
  const levelCap = DB.scoring.levelCap;
  if (kind === 'dice') return DB.dice.filter(d => d.id !== 'normal');
  if (kind === 'relic') return DB.relics.filter(r => !run.relics.includes(r.id));
  return DB.scoring.categories.filter(c =>
    (run.categories[c.id] || 0) < (c.maxLevel !== undefined ? c.maxLevel : levelCap));
}

export function rollRewards(run, nodeType) {
  const cfg = DB.act1.rewards[nodeType];
  if (!cfg || cfg.choices === 0) return [];
  // 1) 범주 추첨 (빈 풀이면 다른 범주로)
  let kind = null, pool = [];
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
    picks.push({
      kind: kind === 'dice' ? 'die' : kind === 'relic' ? 'relic' : 'category',
      item,
      newLevel: kind === 'category' ? (run.categories[item.id] || 0) + 1 : undefined,
    });
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
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...run, _v: 4 })); } catch (e) {}
}

export function loadRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s._v !== 4) { clearSave(); return null; }
    if (!s.dice.every(id => DB.diceById[id])) { clearSave(); return null; }
    if (!s.relics.every(id => DB.relicById[id])) { clearSave(); return null; }
    const catIds = new Set(DB.scoring.categories.map(c => c.id));
    if (!Object.keys(s.categories || {}).every(id => catIds.has(id))) { clearSave(); return null; }
    return s;
  } catch (e) { return null; }
}

export function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
export function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
