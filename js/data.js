// data.js — JSON 로더 + 인덱싱 + 검증
export const DB = {
  dice: null, diceById: {}, relics: null, relicById: {},
  scoring: null, enemies: null, enemyById: {}, act1: null,
  events: null, weaponById: {}, eventById: {},
};

export async function loadAll() {
  const [dice, relics, scoring, enemies, act1, events] = await Promise.all([
    fetchJson('./data/dice.json'),
    fetchJson('./data/relics.json'),
    fetchJson('./data/scoring.json'),
    fetchJson('./data/enemies.json'),
    fetchJson('./data/act1.json'),
    fetchJson('./data/events.json'),
  ]);
  DB.dice = dice; DB.relics = relics; DB.scoring = scoring;
  DB.enemies = enemies; DB.act1 = act1; DB.events = events;
  DB.diceById = {}; for (const d of dice) DB.diceById[d.id] = d;
  DB.relicById = {}; for (const r of relics) DB.relicById[r.id] = r;
  DB.enemyById = {}; for (const e of enemies) DB.enemyById[e.id] = e;
  DB.weaponById = {}; for (const w of events.weapons) DB.weaponById[w.id] = w;
  DB.eventById = {}; for (const ev of events.events) DB.eventById[ev.id] = ev;
  validate();
  return DB;
}

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`데이터 로드 실패: ${path} (${res.status})`);
  return res.json();
}

function validate() {
  for (const id of DB.act1.player.startDice) {
    if (!DB.diceById[id]) throw new Error(`act1.json: startDice에 없는 주사위 id "${id}"`);
  }
  for (const d of DB.dice) {
    if (!Array.isArray(d.faces) || d.faces.length !== 6) throw new Error(`dice.json: ${d.id} faces는 6면이어야 함`);
  }
  const catIds = new Set(DB.scoring.categories.map(c => c.id));
  for (const r of DB.relics) {
    if (r.hook.category && !catIds.has(r.hook.category)) {
      throw new Error(`relics.json: ${r.id}가 없는 족보 "${r.hook.category}" 참조`);
    }
    if (r.tier !== 'normal' && r.tier !== 'elite') {
      throw new Error(`relics.json: ${r.id} 등급은 normal/elite 2단계 (현재 "${r.tier}")`);
    }
  }
  for (const group of ['easy', 'hard', 'elite', 'boss']) {
    for (const enc of DB.act1.encounters[group]) {
      for (const eid of enc) {
        if (!DB.enemyById[eid]) throw new Error(`act1.json: encounters.${group}에 없는 적 id "${eid}"`);
      }
    }
  }
  // 적 행동 6유형 검증 (v0.11)
  const ENEMY_OPS = new Set(['damage', 'block', 'confuse', 'empower', 'heal']);
  for (const e of DB.enemies) {
    for (const [mid, mv] of Object.entries(e.moves)) {
      for (const ef of mv.effects) {
        if (!ENEMY_OPS.has(ef.op)) throw new Error(`enemies.json: ${e.id}.${mid} 미지원 행동 "${ef.op}"`);
      }
    }
  }
  // 무기 시작 족보(변형) 존재 검증
  const catById = {};
  for (const c of DB.scoring.categories) catById[c.id] = c;
  for (const w of DB.events.weapons) {
    for (const [cid, vid] of Object.entries(w.start)) {
      const c = catById[cid];
      if (!c) throw new Error(`events.json: 무기 ${w.id}가 없는 족보 "${cid}" 참조`);
      if (!(c.variants || []).some(v => v.id === vid)) throw new Error(`events.json: 무기 ${w.id}가 없는 변형 "${cid}:${vid}" 참조`);
    }
  }
  // 이벤트 효과 op 검증
  const OPS = new Set(['heal', 'loseHp', 'maxHp', 'gainRelic', 'gainVariant', 'gainDie']);
  for (const ev of DB.events.events) {
    for (const ch of ev.choices) {
      for (const ef of (ch.effects || [])) {
        if (!OPS.has(ef.op)) throw new Error(`events.json: ${ev.id}에 미지원 효과 "${ef.op}"`);
      }
    }
  }
  // 주사위 효과 검증
  const DIE_OPS = { contribute: ['selfDamage', 'heal', 'block'], confirm: ['heal', 'block'], passive: ['extraReroll', 'turnBlock'] };
  for (const d of DB.dice) {
    if (!d.effect) continue;
    const ops = DIE_OPS[d.effect.when];
    if (!ops || !ops.includes(d.effect.op)) throw new Error(`dice.json: ${d.id} 미지원 효과 ${d.effect.when}/${d.effect.op}`);
  }
}
