// run.js — 런 상태, 맵 생성, 보상, 세이브
import { DB } from './data.js';
import { rng, shuffle } from './engine.js';

const SAVE_KEY = 'redhood_run_v1';

export function newRun(weaponId) {
  const maxHp = DB.act1.player.maxHp;
  const run = {
    weapon: weaponId,
    hp: maxHp, maxHp,
    deck: expandDeck(DB.weapons[weaponId].startingDeck),
    floor: 0,
    map: generateMap(),
    chosen: [],
  };
  return run;
}

function expandDeck(ids) { return ids.map(id => ({ ...DB.cardById[id] })); }

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
  if (existing.some(nd => nd.type === 'elite')) delete w.elite; // 한 층에 엘리트 중복 방지
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (const [type, weight] of Object.entries(w)) { roll -= weight; if (roll <= 0) return type; }
  return 'battle';
}

// ---------- 조우 ----------
export function rollEncounter(run, nodeType) {
  const enc = DB.act1.encounters;
  const floor = run.floor;
  if (nodeType === 'boss') return pickArr(enc.boss);
  if (nodeType === 'elite') return pickArr(enc.elite);
  return enc.easyFloors.includes(floor) ? pickArr(enc.easy) : pickArr(enc.hard);
}
function pickArr(arr) { return arr[Math.floor(rng.next() * arr.length)].slice(); }

// ---------- 보상 ----------
export function rollCardRewards(run, nodeType) {
  const cfg = DB.act1.rewards[nodeType];
  if (!cfg || cfg.cardChoices === 0) return [];
  const pool = DB.cards.filter(c =>
    (c.weapon === run.weapon || c.weapon === 'neutral') && c.rarity !== 'basic');
  const picks = [];
  const used = new Set();
  let guard = 0;
  while (picks.length < cfg.cardChoices && guard++ < 200) {
    const rarity = rollRarity(cfg.rarityWeights);
    const candidates = pool.filter(c => c.rarity === rarity && !used.has(c.id));
    if (candidates.length === 0) continue;
    const card = candidates[Math.floor(rng.next() * candidates.length)];
    used.add(card.id); picks.push({ ...card });
  }
  return picks;
}

function rollRarity(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = rng.next() * total;
  for (const [rarity, w] of Object.entries(weights)) { roll -= w; if (roll <= 0) return rarity; }
  return 'common';
}

// ---------- 휴식 ----------
export function applyRest(run) {
  const heal = Math.floor(run.maxHp * DB.act1.rest.healRatio);
  run.hp = Math.min(run.maxHp, run.hp + heal);
  return heal;
}

// ---------- 세이브 ----------
export function saveRun(run) {
  try {
    const slim = { ...run, deck: run.deck.map(c => c.id), _v: 1 };
    localStorage.setItem(SAVE_KEY, JSON.stringify(slim));
  } catch (e) { /* 저장 실패는 치명적이지 않음 */ }
}

export function loadRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const slim = JSON.parse(raw);
    if (slim._v !== 1) { clearSave(); return null; }
    if (!slim.deck.every(id => DB.cardById[id])) { clearSave(); return null; }
    return { ...slim, deck: expandDeck(slim.deck) };
  } catch (e) { return null; }
}

export function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
export function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
