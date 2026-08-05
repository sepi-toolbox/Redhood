// data.js — JSON 로더 + 인덱싱 + 검증
export const DB = {
  dice: null, diceById: {}, relics: null, relicById: {},
  scoring: null, enemies: null, enemyById: {}, act1: null,
};

export async function loadAll() {
  const [dice, relics, scoring, enemies, act1] = await Promise.all([
    fetchJson('./data/dice.json'),
    fetchJson('./data/relics.json'),
    fetchJson('./data/scoring.json'),
    fetchJson('./data/enemies.json'),
    fetchJson('./data/act1.json'),
  ]);
  DB.dice = dice; DB.relics = relics; DB.scoring = scoring;
  DB.enemies = enemies; DB.act1 = act1;
  DB.diceById = {}; for (const d of dice) DB.diceById[d.id] = d;
  DB.relicById = {}; for (const r of relics) DB.relicById[r.id] = r;
  DB.enemyById = {}; for (const e of enemies) DB.enemyById[e.id] = e;
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
  }
  for (const group of ['easy', 'hard', 'elite', 'boss']) {
    for (const enc of DB.act1.encounters[group]) {
      for (const eid of enc) {
        if (!DB.enemyById[eid]) throw new Error(`act1.json: encounters.${group}에 없는 적 id "${eid}"`);
      }
    }
  }
}
