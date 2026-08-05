// run.js — 런 상태, 맵 생성, 보상, 세이브 (v2: 주사위/유물)
import { DB } from './data.js';
import { rng } from './engine.js';

const SAVE_KEY = 'redhood_run_v2';

export function newRun() {
  const maxHp = DB.act1.player.maxHp;
  return {
    hp: maxHp, maxHp,
    dice: DB.act1.player.startDice.slice(),
    relics: [],
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

// ---------- 보상: 주사위/유물 혼합 3택1 ----------
export function rollRewards(run, nodeType) {
  const cfg = DB.act1.rewards[nodeType];
  if (!cfg || cfg.choices === 0) return [];
  const picks = [];
  const usedIds = new Set();
  let guard = 0;
  while (picks.length < cfg.choices && guard++ < 200) {
    const isDie = rollWeight(cfg.pool) === 'dice';
    const tier = rollWeight(cfg.tierWeights);
    let pool;
    if (isDie) {
      pool = DB.dice.filter(d => d.tier === tier && d.id !== 'normal' && !usedIds.has('d_' + d.id));
    } else {
      pool = DB.relics.filter(r => r.tier === tier && !run.relics.includes(r.id) && !usedIds.has('r_' + r.id));
    }
    if (pool.length === 0) continue;
    const item = pool[Math.floor(rng.next() * pool.length)];
    usedIds.add((isDie ? 'd_' : 'r_') + item.id);
    picks.push({ kind: isDie ? 'die' : 'relic', item });
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
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...run, _v: 2 })); } catch (e) {}
}

export function loadRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s._v !== 2) { clearSave(); return null; }
    if (!s.dice.every(id => DB.diceById[id])) { clearSave(); return null; }
    if (!s.relics.every(id => DB.relicById[id])) { clearSave(); return null; }
    return s;
  } catch (e) { return null; }
}

export function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
export function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
