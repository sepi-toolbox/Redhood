// encsweep.mjs — v3.8 조우 전수 스윕: 44종을 막별 체크포인트에서 직접 붙인다
//   node test/encsweep.mjs [판수]   — 기믹 ON/OFF 비교로 방해율까지 측정
import { readFileSync } from 'fs';
globalThis.localStorage = { _d: {}, getItem(k){return this._d[k]??null;}, setItem(k,v){this._d[k]=String(v);}, removeItem(k){delete this._d[k];} };
const load = p => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), 'utf8'));
const { DB } = await import('../js/data.js');
Object.assign(DB, {
  dice: load('dice.json'), relics: load('relics.json'), scoring: load('scoring.json'),
  enemies: load('enemies.json'), act1: load('act1.json'), events: load('events.json'), acts: load('acts.json'),
  statuses: load('statuses.json'), cards: load('cards.json'), layout: load('layout.json'),
});
DB.statusById = Object.fromEntries(DB.statuses.list.map(x => [x.id, x]));
DB.cardById = Object.fromEntries(DB.cards.list.map(c => [c.id, c]));
DB.diceById = Object.fromEntries(DB.dice.map(d => [d.id, d]));
DB.relicById = Object.fromEntries(DB.relics.map(r => [r.id, r]));
DB.enemyById = Object.fromEntries(DB.enemies.map(e => [e.id, e]));
DB.weaponById = Object.fromEntries(DB.events.weapons.map(w => [w.id, w]));
DB.eventById = Object.fromEntries(DB.events.events.map(e => [e.id, e]));
const eng = await import('../js/engine.js');
const { previewAll, createBattle, initialRoll, reroll, confirmCategory, enemyPhase, aliveEnemies, toggleHold, confirmVoidCall } = eng;

function gimAdjust(battle, p, v) {
  for (const e of aliveEnemies(battle)) {
    if (e.demand) {
      const ok = e.demand.category ? p.cat.id === e.demand.category : p.cat.kind === e.demand.kind;
      if (ok) v += e.demand.damage * 1.5;
    }
    if (e.wardLeft > 0 && p.bd.total > 0 && p.bd.total <= e.ward) v -= p.bd.total;
    if (e.capLeft > 0 && p.bd.total > e.cap) v -= (p.bd.total - e.cap);
  }
  return v;
}

function scoreChoice(battle, p) {
  const ab = p.variant.ability;
  const ops = ab ? (Array.isArray(ab) ? ab : [ab]) : [];
  const p_ = battle.player;
  const danger = 1 - p_.hp / p_.maxHp;                        // 0(만피) ~ 1(빈사)
  const incoming = aliveEnemies(battle).reduce((s, e) =>
    s + (e.nextMove?.effects || []).filter(f => f.op === 'damage')
        .reduce((t, f) => t + Math.round(f.amount * (e.atkScale || 1)) + (e.power || 0), 0), 0);
  const turnsLeft = Math.max(1, 12 - battle.turn);            // 장기전이면 버프 가치↑
  let v = p.bd.total;
  for (const o of ops) {
    const amt = o.amount || 0;
    if (o.op === 'block') v += Math.min(amt, incoming) * (1 + danger * 2);
    else if (o.op === 'strength') v += amt * turnsLeft * 0.8;
    else if (o.op === 'focus') v += amt * turnsLeft * 1.2;
    else if (o.op === 'regen') v += amt * turnsLeft * (0.6 + danger);
    else if (o.op === 'weakEnemy') v += amt * turnsLeft * 0.7;
    else if (o.op === 'bleed') v += amt * 2.2;
    else if (o.op === 'vulnerable') v += amt * turnsLeft * 0.5;
    // v1.29 벼름: 다음 한 방이 amt*0.5 배만큼 커진다
    else if (o.op === 'whet') v += (battle.whet >= 6 ? 0 : amt * 0.5 * Math.max(12, p.bd.total)) * (turnsLeft > 1 ? 1 : 0);
  }
  return gimAdjust(battle, p, v);
}


function fight(ids, run0) {
  const run = JSON.parse(JSON.stringify(run0));
  const battle = createBattle(run, ids, 'battle');
  let guard = 0;
  while (!battle.over && guard++ < 60) {
    initialRoll(battle);
    for (let rr = 0; rr < 2 && battle.rollsLeft > 0; rr++) {
      const pv0 = previewAll(battle).filter(p => !p.locked && p.bd.total > 0);
      const best0 = pv0.sort((a, b) => scoreChoice(battle, b) - scoreChoice(battle, a))[0];
      if (best0 && scoreChoice(battle, best0) >= 32) break;
      const keep = new Set((best0?.bd.contributing) || []);
      battle.dice.forEach((d, i) => { if (keep.has(i) !== d.held) toggleHold(battle, i); });
      if (!reroll(battle)) break;
    }
    const pv = previewAll(battle).filter(p => !p.locked && p.bd.total > 0);
    if (pv.length === 0) { if (battle.voidLocked && confirmVoidCall(battle)) { if (battle.over) break; enemyPhase(battle); continue; } enemyPhaseSafe(battle); continue; }
    const best = pv.sort((a, b) => scoreChoice(battle, b) - scoreChoice(battle, a))[0];
    const alive = aliveEnemies(battle);
    confirmCategory(battle, best.cat.id, best.variant.id, alive[0]?.uid);
    if (battle.over) break;
    enemyPhase(battle);
  }
  return { win: battle.result === 'victory', turns: battle.turn, lost: run0.hp - battle.player.hp };
}
function enemyPhaseSafe(b) { b.await = 'enemy'; enemyPhase(b); }   // 낼 족보가 없으면 한 턴을 그냥 맞는다

// 기믹 제거 사본 (방해율 대조군)
const GIM = new Set(['status','sealLast','sealCat','rollTax','holdTax','petrify','lockHigh','blind','regen','enrage','reflect','ward','cap']);
function stripTheme(id) {
  const e = JSON.parse(JSON.stringify(DB.enemyById[id]));
  delete e.start;
  for (const pool of ['moves','uniqueMoves']) for (const m of Object.values(e[pool]||{}))
    m.effects = (m.effects||[]).filter(f => !GIM.has(f.op));
  for (const pool of ['moves','uniqueMoves']) for (const k of Object.keys(e[pool]||{}))
    if (!(e[pool][k].effects||[]).length) e[pool][k].effects=[{op:'rest'}];
  return e;
}

// 체크포인트 빌드 — 막이 갈수록 족보를 더 모았다고 가정
const CATS1 = { chance:'instinct', threeKind:'chopping', onePair:'clash' };
const CATS2 = { ...CATS1, twoPair:null, fullHouse:null };
const CATS3 = { ...CATS2, largeStraight:null, fourKind:null };
const RUNBASE = (act, floor, cats, hp=70) => ({ hp, maxHp: hp, act, floor, enlight: 0, relics: [],
  dice: ['normal','normal','normal','normal','normal'], categories: cats });

const N = Number(process.argv[2] || 150);
const STRONG = process.argv[3] === 'strong';   // 정예·보스용 강화 빌드 (변형·주사위 성장 가정)
const CATS_STRONG = { chance:'catch_breath', onePair:'red_shoes', threeKind:'nettle',
  twoPair:'twin_sisters', fourKind:'heavy_blow', fullHouse:'cottage', largeStraight:'windpath' };
const ACTOF = {};
(function() {
  for (const a of DB.acts.acts) for (const t of a.themes) {
    for (const x of t.normals) ACTOF[x] = a.act;
    for (const x of t.elites) ACTOF[x] = a.act;
    ACTOF[t.boss] = a.act;
  }
})();
const rows = [];
for (const e of DB.enemies) {
  if (e.final) continue;
  if (STRONG && e.tier==='normal') continue;
  if (!STRONG && false) continue;
  const act = ACTOF[e.id] || 1;
  const cats = STRONG ? CATS_STRONG : (act===1?CATS1:act===2?CATS2:CATS3);
  const floor = e.tier==='boss'?11:e.tier==='elite'?7:3;
  const hp = STRONG ? 85 : 70;   // act1.json 의 player.maxHp 와 맞춘다
  const run = RUNBASE(act, floor, cats, hp);
  if (STRONG) run.dice = ['gold','gold','normal','normal','normal'].map(x => DB.diceById[x]?x:'normal');
  const measure = (ids) => {
    let w=0,t=0,l=0;
    for (let k=0;k<N;k++) { const r=fight(ids,run); if(r.win){w++;l+=r.lost;} t+=r.turns; }
    return { win:w/N, turns:t/N, lost:w?l/w:hp };
  };
  const on = measure([e.id]);
  DB.enemyById['__ctrl'] = stripTheme(e.id);
  const off = measure(['__ctrl']);
  delete DB.enemyById['__ctrl'];
  rows.push({ id:e.id, name:e.name, tier:e.tier, act, on, off });
  console.error(`${e.id} done`);
}
console.log(JSON.stringify(rows));
