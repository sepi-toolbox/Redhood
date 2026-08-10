// data.js — JSON 로더 + 인덱싱 + 검증
export const DB = {
  dice: null, diceById: {}, relics: null, relicById: {},
  scoring: null, enemies: null, enemyById: {}, act1: null,
  events: null, weaponById: {}, eventById: {}, acts: null,
  statuses: null, statusById: {},
  cards: null, cardById: {},            // v2.0 감정 카드
};

export async function loadAll() {
  const [dice, relics, scoring, enemies, act1, events, acts, statuses, cards, layout] = await Promise.all([
    fetchJson('./data/dice.json'),
    fetchJson('./data/relics.json'),
    fetchJson('./data/scoring.json'),
    fetchJson('./data/enemies.json'),
    fetchJson('./data/act1.json'),
    fetchJson('./data/events.json'),
    fetchJson('./data/acts.json'),
    fetchJson('./data/statuses.json'),
    fetchJson('./data/cards.json'),
    fetchJson('./data/layout.json'),
  ]);
  DB.dice = dice; DB.relics = relics; DB.scoring = scoring;
  DB.enemies = enemies; DB.act1 = act1; DB.events = events; DB.acts = acts;
  DB.statuses = statuses; DB.cards = cards; DB.layout = layout;
  DB.cardById = {}; for (const c of cards.list) DB.cardById[c.id] = c;
  DB.statusById = {}; for (const st of statuses.list) DB.statusById[st.id] = st;
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
  // v2.0 감정 카드: 시작 덱은 전부 존재하는 카드여야 한다
  for (const id of DB.cards.starterDeck) {
    if (!DB.cardById[id]) throw new Error(`cards.json: starterDeck에 없는 카드 id "${id}"`);
  }
  for (const c of DB.cards.list) {
    if (!(c.cost >= 0)) throw new Error(`cards.json: ${c.id} cost가 없습니다`);
    if (c.target && !['active', 'dead'].includes(c.target)) throw new Error(`cards.json: ${c.id} 미지원 target "${c.target}"`);
  }
  for (const id of DB.act1.player.startDice) {
    if (!DB.diceById[id]) throw new Error(`act1.json: startDice에 없는 주사위 id "${id}"`);
  }
  // v2.17 적 주사위(눈 목록·개수)와 예고 행동(battleMoves) — 위력 = 남은 주사위 합
  const MOVE_OPS = new Set(['damage', 'bleed', 'armor', 'lifesteal', 'heal', 'empower']);
  for (const e of DB.enemies) {
    const bd = e.battleDice;
    if (bd && bd.faces) {
      if (!Array.isArray(bd.faces) || !bd.faces.every(f => Number.isInteger(f) && f >= 1 && f <= 20)) {
        throw new Error(`enemies.json: ${e.id} battleDice.faces 는 1~20 정수 목록이어야 합니다`);
      }
    }
    if (e.faceAbilities) throw new Error(`enemies.json: ${e.id} faceAbilities 는 v2.17에서 폐기 — battleMoves 로 옮기세요`);
    // v3.0 시그니처 방해
    if (e.signature) {
      const SIG_OPS = new Set(['echo', 'web', 'haze', 'sealDie', 'rollTax', 'holdTax', 'petrify',
        'forceReroll', 'lockHigh', 'gnaw', 'blind', 'minRank', 'bloodhunt']);
      const s = e.signature;
      if (!SIG_OPS.has(s.op)) throw new Error(`enemies.json: ${e.id} 미지원 시그니처 "${s.op}"`);
      if (!s.name || !s.desc) throw new Error(`enemies.json: ${e.id} 시그니처에 name/desc 가 필요합니다`);
      if (s.break && !(s.break.count >= 2)) throw new Error(`enemies.json: ${e.id} 시그니처 해제 count 는 2 이상`);
      if (s.op === 'minRank' && !(Array.isArray(s.cats) && s.cats.length)) throw new Error(`enemies.json: ${e.id} minRank 는 cats 목록 필요`);
    }
    if (e.battleMoves) {
      if (!Array.isArray(e.battleMoves) || !e.battleMoves.length) throw new Error(`enemies.json: ${e.id} battleMoves 는 비어있지 않은 목록이어야 합니다`);
      const seen = new Set();
      for (const m of e.battleMoves) {
        if (!m.id || seen.has(m.id)) throw new Error(`enemies.json: ${e.id} battleMoves id 누락/중복 "${m.id || '?'}"`);
        seen.add(m.id);
        if (!m.name) throw new Error(`enemies.json: ${e.id}.${m.id} 행동 이름이 없습니다`);
        if (!MOVE_OPS.has(m.op)) throw new Error(`enemies.json: ${e.id}.${m.id} 미지원 행동 "${m.op}"`);
        if (m.weight !== undefined && !(m.weight > 0)) throw new Error(`enemies.json: ${e.id}.${m.id} weight 는 양수`);
        if (m.mult !== undefined && !(m.mult > 0)) throw new Error(`enemies.json: ${e.id}.${m.id} mult 는 양수`);
      }
    }
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
  // 적 행동 효과 검증 (v1.08: 휴식 추가, 유니크 행동·기본 행동·파쇄 대상까지 함께 본다)
  const ENEMY_OPS = new Set(['damage', 'block', 'confuse', 'empower', 'heal', 'rest', 'selfDamage', 'poison', 'bleed', 'status',
  'ward', 'cap', 'demand', 'drainWhet', 'unpin']);
  for (const e of DB.enemies) {
    const all = { ...e.moves, ...(e.uniqueMoves || {}) };
    for (const [mid, mv] of Object.entries(all)) {
      for (const ef of mv.effects) {
        if (!ENEMY_OPS.has(ef.op)) throw new Error(`enemies.json: ${e.id}.${mid} 미지원 효과 "${ef.op}"`);
        if (ef.op === 'demand') {
      const KINDS = new Set(DB.scoring.categories.map(c => c.kind));
      const IDS = new Set(DB.scoring.categories.map(c => c.id));
      if (!ef.kind && !ef.category) throw new Error(`enemies.json: ${e.id}/${mid} 요구에 대상 족보가 없습니다`);
      if (ef.kind && !KINDS.has(ef.kind)) throw new Error(`enemies.json: ${e.id}/${mid} 없는 족보군 "${ef.kind}"`);
      if (ef.category && !IDS.has(ef.category)) throw new Error(`enemies.json: ${e.id}/${mid} 없는 족보 "${ef.category}"`);
      if (!(ef.amount > 0)) throw new Error(`enemies.json: ${e.id}/${mid} 요구에 벌 피해가 없습니다`);
    }
    if (ef.op === 'status') {
          if (!DB.statusById[ef.kind]) throw new Error(`enemies.json: ${e.id}.${mid} 없는 상태이상 "${ef.kind}"`);
          if (ef.power < 0) throw new Error(`enemies.json: ${e.id}.${mid} 상태이상 수치가 음수입니다`);
          if (ef.turns !== undefined) throw new Error(`enemies.json: ${e.id}.${mid} 지속 턴은 statuses.json 에서만 정합니다`);
          const NO_POWER = new Set(['onUseFaceDamage', 'onUseFaceCoin', 'noReroll', 'zeroValue', 'hideFace', 'needReroll', 'linked', 'spread', 'faceLow', 'faceHigh', 'rerollCost']);  // 세기를 적 행동에서 정하는 건 부패뿐
          if (ef.power > 0 && NO_POWER.has(DB.statusById[ef.kind].rule))
            throw new Error(`enemies.json: ${e.id}.${mid} "${ef.kind}" 은(는) 세기를 쓰지 않습니다`);
        }
      }
      if (mv.break) {
        if (!(e.uniqueMoves || {})[mv.break.move]) throw new Error(`enemies.json: ${e.id}.${mid} 파쇄 대상 "${mv.break.move}" 은(는) 유니크 행동이어야 합니다`);
        if (!(mv.break.damage > 0)) throw new Error(`enemies.json: ${e.id}.${mid} 파쇄 피해가 0 이하입니다`);
      }
    }
    if (e.defaultMove && !all[e.defaultMove]) throw new Error(`enemies.json: ${e.id} 기본 행동 "${e.defaultMove}" 이(가) 없습니다`);
    for (const p of (e.phases || [])) {
      if (p.enter && !(e.uniqueMoves || {})[p.enter]) throw new Error(`enemies.json: ${e.id} 국면 전환 행동 "${p.enter}" 은(는) 유니크 행동이어야 합니다`);
    }
    for (const p of ((e.phases || []).map(x => x.pattern).concat(e.pattern ? [e.pattern] : []))) {
      for (const id of Object.keys(p.weights || {})) {
        if (!e.moves[id]) throw new Error(`enemies.json: ${e.id} 가중치의 "${id}" 는 일반 행동이 아닙니다 (유니크는 추첨에 못 들어갑니다)`);
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
  // 막/테마 참조 무결성 (v0.14)
  const evIds = new Set(DB.events.events.map(e => e.id));
  for (const a of DB.acts.acts) {
    for (const t of a.themes) {
      for (const eid of [...t.normals, ...t.elites, t.boss]) {
        if (!DB.enemyById[eid]) throw new Error(`acts.json: ${t.id} 테마가 없는 적 "${eid}" 참조`);
      }
      for (const ev of t.events) {
        if (!evIds.has(ev)) throw new Error(`acts.json: ${t.id} 테마가 없는 이벤트 "${ev}" 참조`);
      }
    }
  }
  if (!DB.enemyById[DB.acts.finalBoss]) throw new Error(`acts.json: 최종 보스 "${DB.acts.finalBoss}" 없음`);
  // 이벤트 효과 op 검증
  const OPS = new Set(['heal', 'loseHp', 'maxHp', 'maxHpLoss', 'gainRelic', 'gainRelicElite', 'gainVariant', 'gainDie', 'gainCoins', 'loseCoins']);
  for (const ev of DB.events.events) {
    for (const ch of ev.choices) {
      for (const ef of (ch.effects || [])) {
        if (!OPS.has(ef.op)) throw new Error(`events.json: ${ev.id}에 미지원 효과 "${ef.op}"`);
      }
    }
  }
  // 주사위 효과 검증
  const DIE_OPS = {
    contribute: ['selfDamage', 'heal', 'block', 'split'],
    confirm: ['heal', 'block', 'whet'],
    idle: ['whet'],                                            // v1.29 기여하지 않았을 때
    passive: ['extraReroll', 'turnBlock', 'whet', 'pin', 'nudge', 'mirror', 'ladder'],
  };
  for (const d of DB.dice) {
    if (!d.effect) continue;
    const ops = DIE_OPS[d.effect.when];
    if (!ops || !ops.includes(d.effect.op)) throw new Error(`dice.json: ${d.id} 미지원 효과 ${d.effect.when}/${d.effect.op}`);
  }
}
