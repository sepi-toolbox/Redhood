// data.js — JSON 로더 + 인덱싱
export const DB = {
  weapons: null, cards: null, cardById: {}, enemies: null, enemyById: {},
  statuses: null, frenzy: null, act1: null,
};

export async function loadAll() {
  const [weapons, cards, enemies, statuses, frenzy, act1] = await Promise.all([
    fetchJson('./data/weapons.json'),
    fetchJson('./data/cards.json'),
    fetchJson('./data/enemies.json'),
    fetchJson('./data/statuses.json'),
    fetchJson('./data/frenzy.json'),
    fetchJson('./data/act1.json'),
  ]);
  DB.weapons = weapons; DB.cards = cards; DB.enemies = enemies;
  DB.statuses = statuses; DB.frenzy = frenzy; DB.act1 = act1;
  DB.cardById = {}; for (const c of cards) DB.cardById[c.id] = c;
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
  // 시작 덱의 카드 id가 실제로 존재하는지 검사 — 데이터 작업 실수를 즉시 표면화
  for (const wid of Object.keys(DB.weapons)) {
    if (wid.startsWith('_')) continue;
    for (const cid of DB.weapons[wid].startingDeck) {
      if (!DB.cardById[cid]) throw new Error(`weapons.json: ${wid} 시작 덱에 없는 카드 id "${cid}"`);
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
