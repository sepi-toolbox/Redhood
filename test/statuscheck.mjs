// statuscheck.mjs — 상태이상 13종이 "걸리는가"와 "작동하는가"를 셋으로 나눠 본다.
//  A. 규칙 검사 — 붙여 놓고 그 규칙이 정말 발동하는지
//  B. 도달 검사 — 적 행동표상 걸릴 경로가 있는지 (가중치 0 = 절대 안 나옴)
//  C. 실판 검사 — 진짜 전투 흐름으로 돌려 실제 몇 턴이나 화면에 뜨는지
// 실행: node test/statuscheck.mjs [적당 판수]
import { readFileSync } from 'fs';
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
const load = p => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), 'utf8'));
const { DB } = await import('../js/data.js');
Object.assign(DB, {
  dice: load('dice.json'), relics: load('relics.json'), scoring: load('scoring.json'),
  enemies: load('enemies.json'), act1: load('act1.json'), events: load('events.json'), acts: load('acts.json'),
  statuses: load('statuses.json'), cards: load('cards.json'), layout: load('layout.json'),
});
DB.statusById = Object.fromEntries(DB.statuses.list.map(x => [x.id, x]));
DB.diceById = Object.fromEntries(DB.dice.map(d => [d.id, d]));
DB.relicById = Object.fromEntries(DB.relics.map(r => [r.id, r]));
DB.enemyById = Object.fromEntries(DB.enemies.map(e => [e.id, e]));
const E = await import('../js/engine.js');

const S = DB.statuses.list;
const byId = Object.fromEntries(S.map(x => [x.id, x]));
const CAT = Object.fromEntries(DB.scoring.categories.map(c => [c.id, c]));
const V0 = c => E.baseIdOf(c.id);   // 슬롯이 빈 족보는 '기본 변형'으로만 확정된다

function mkBattle(enemyId = 'stray_dog') {
  const run = {
    hp: 200, maxHp: 200, coins: 50, act: 1, floor: 1, enlight: 0,
    dice: ['normal', 'normal', 'normal', 'normal', 'normal'], relics: [],
    categories: Object.fromEntries(DB.scoring.categories.map(c => [c.id, null])),
  };
  const b = E.createBattle(run, [enemyId]);
  E.initialRoll(b);
  b.player.block = 0;
  return b;
}
function put(b, i, kind, power = 0) {
  const def = byId[kind];
  b.dice[i].st = { kind, power, left: def.rule === 'fuse' ? 0 : (def.turns || 0),
    fuse: def.rule === 'fuse' ? (def.turns || 1) : 0, opened: true, fresh: false };
}
const setFaces = (b, arr) => b.dice.forEach((d, i) => { d.face = arr[i]; d.held = true; });

const rows = [];
const ok = (id, what, pass, note = '') => rows.push({ id, name: byId[id].name, what, pass, note });

// ---------- A. 규칙 검사 ----------
for (const k of ['bleed', 'poison']) {
  const b = mkBattle(); setFaces(b, [5, 5, 1, 2, 3]);
  put(b, 0, k);
  const hp0 = b.player.hp;
  E.confirmCategory(b, 'onePair', V0(CAT.onePair), b.enemies[0].uid);
  ok(k, '쓴 칸이면 눈금만큼 자해', b.player.hp === hp0 - 5, `HP ${hp0}→${b.player.hp} (기대 ${hp0 - 5})`);
}
{
  const b = mkBattle(); setFaces(b, [5, 5, 1, 2, 3]);
  put(b, 2, 'bleed');
  const hp0 = b.player.hp;
  E.confirmCategory(b, 'onePair', V0(CAT.onePair), b.enemies[0].uid);
  ok('bleed', '안 쓴 칸은 안 아프다', b.player.hp === hp0, `HP ${hp0}→${b.player.hp}`);
}
{
  const b = mkBattle(); setFaces(b, [5, 5, 1, 2, 3]);
  put(b, 0, 'plunder');
  E.confirmCategory(b, 'onePair', V0(CAT.onePair), b.enemies[0].uid);
  ok('plunder', '쓴 칸의 눈금만큼 코인 상실', b.coinsLost === 5, `coinsLost=${b.coinsLost}`);
}
{
  const b = mkBattle(); setFaces(b, [4, 4, 4, 4, 4]);
  put(b, 0, 'bind');
  b.dice.forEach((_, i) => E.toggleHold(b, i));
  const lockedOut = b.dice[0].held === true;
  const f0 = b.dice[0].face;
  b.rollsLeft = 50;
  for (let t = 0; t < 20; t++) { b.dice.forEach((_, i) => E.toggleHold(b, i)); E.reroll(b); }
  ok('bind', '탭해도 안 풀리고 안 굴러간다', lockedOut && b.dice[0].face === f0, `잠김=${lockedOut} 눈 ${f0}→${b.dice[0].face}`);
}
{
  const b = mkBattle(); setFaces(b, [5, 5, 1, 2, 3]);
  const before = E.previewAll(b).find(p => p.cat.id === 'onePair').bd.total;
  put(b, 0, 'stun');
  const after = E.previewAll(b).find(p => p.cat.id === 'onePair').bd.total;
  ok('stun', '족보엔 들어가되 눈금 0', after < before, `${before} → ${after}`);
}
for (const k of ['curse', 'blessing']) {
  const b = mkBattle();
  put(b, 0, k);
  const lim = byId[k].amount;
  const test = f => (k === 'curse' ? f <= lim : f >= lim);
  let bad = 0;
  b.rollsLeft = 9999;
  for (let t = 0; t < 500; t++) { E.toggleHold(b, 0); E.reroll(b); if (!test(b.dice[0].face)) bad++; }
  ok(k, `눈이 ${lim} ${k === 'curse' ? '이하' : '이상'}만`, bad === 0, `위반 ${bad}/500`);
}
{
  const b = mkBattle(); setFaces(b, [4, 4, 4, 4, 4]);
  put(b, 0, 'confuse');
  ok('confuse', '가려져도 계산엔 들어간다', E.facesOf(b)[0] === 4, `faceOf=${E.facesOf(b)[0]}`);
}
{
  const b = mkBattle(); setFaces(b, [4, 4, 4, 4, 4]);
  put(b, 0, 'seal'); b.dice[0].st.opened = false;
  const off = E.facesOf(b)[0] === 0;
  b.rollsLeft = 9; E.toggleHold(b, 0); E.reroll(b);
  ok('seal', '굴리기 전 0 → 굴린 뒤 부활', off && E.facesOf(b)[0] > 0, `전0=${off} 후=${E.facesOf(b)[0]}`);
}
{
  const b = mkBattle();
  put(b, 0, 'rot'); b.dice[0].st.fresh = true;
  const hp0 = b.player.hp;
  for (let t = 0; t < 10 && b.dice[0].st && !b.over; t++) {
    setFaces(b, [1, 2, 3, 4, 5]);            // 0번 칸(눈 1)은 상위3합에 안 들어간다 = 안 쓰인다
    E.confirmCategory(b, 'chance', V0(CAT.chance), b.enemies[0].uid);
    if (b.over || b.enemies.every(e => e.hp <= 0)) break;
    E.enemyPhase(b); E.initialRoll(b);
  }
  ok('rot', '방치하면 터져서 피해', b.player.hp < hp0 && !b.dice[0].st, `HP ${hp0}→${b.player.hp} 남음=${!!b.dice[0].st}`);

  const b2 = mkBattle(); setFaces(b2, [5, 5, 1, 2, 3]);
  put(b2, 0, 'rot');
  E.confirmCategory(b2, 'onePair', V0(CAT.onePair), b2.enemies[0].uid);
  ok('rot', '족보에 쓰면 해제된다', !b2.dice[0].st, `남음=${!!b2.dice[0].st}`);
}
{
  const b = mkBattle(); setFaces(b, [1, 2, 3, 4, 5]);
  put(b, 0, 'chain'); put(b, 2, 'chain');
  E.toggleHold(b, 0);
  ok('chain', '한쪽을 건드리면 같이', b.dice[0].held === b.dice[2].held, `0=${b.dice[0].held} 2=${b.dice[2].held}`);
}
{
  const b = mkBattle(); setFaces(b, [1, 2, 3, 4, 5]);
  b.dice.forEach((_, i) => E.toggleHold(b, i));
  const c0 = E.rerollCost(b);
  put(b, 0, 'numb');
  ok('numb', '리롤 비용이 오른다', E.rerollCost(b) > c0, `${c0} → ${E.rerollCost(b)}`);
}
{
  const b = mkBattle(); setFaces(b, [5, 5, 1, 2, 3]);
  put(b, 3, 'devour');
  const n0 = b.dice.filter(d => d.st && d.st.kind === 'devour').length;
  E.confirmCategory(b, 'onePair', V0(CAT.onePair), b.enemies[0].uid);
  const n1 = b.dice.filter(d => d.st && d.st.kind === 'devour').length;
  ok('devour', '안 쓰면 양옆으로 번진다', n1 > n0, `${n0} → ${n1}칸`);
}

// ---------- B. 도달 검사 ----------
const reach = Object.fromEntries(S.map(x => [x.id, []]));
for (const e of DB.enemies) {
  const P = e.pattern || {}; const W = P.weights || {};
  for (const [key, mv] of Object.entries(e.moves || {})) {
    const efs = mv.effects || (mv.effect ? [mv.effect] : []);
    for (const ef of efs) {
      if (ef.op === 'status' && reach[ef.kind]) {
        const w = W[key] == null ? (P.mode === 'weighted' ? 0 : 1) : W[key];
        reach[ef.kind].push({ enemy: e.name, move: mv.name, key, weight: w, chain: !!mv.chainFrom });
      }
    }
  }
}

// ---------- C. 실판 검사 ----------
const N = parseInt(process.argv[2] || '6', 10);
const hit = Object.fromEntries(S.map(x => [x.id, 0]));
let fights = 0, turns = 0;
for (const e of DB.enemies) {
  for (let t = 0; t < N; t++) {
    const b = mkBattle(e.id);
    fights++;
    for (let k = 0; k < 12 && !b.over && b.enemies.some(x => x.hp > 0); k++) {
      const pv = E.previewAll(b).filter(p => !p.locked && p.bd.total > 0);
      if (!pv.length) break;
      const alive = E.aliveEnemies(b);
      E.confirmCategory(b, pv[0].cat.id, pv[0].variant.id, alive[0] && alive[0].uid);
      if (b.over) break;
      E.enemyPhase(b);
      E.initialRoll(b);          // 새 턴 첫 굴림 — 이걸 빼면 두 턴째부터 아무 일도 안 난다
      turns++;
      const seen = new Set();
      for (const d of b.dice) if (d.st) seen.add(d.st.kind);
      for (const s of seen) hit[s]++;
    }
  }
}

// ---------- 출력 ----------
const RED = s => `\x1b[31m${s}\x1b[0m`, GRN = s => `\x1b[32m${s}\x1b[0m`, YEL = s => `\x1b[33m${s}\x1b[0m`;
console.log('\n=== A. 규칙이 실제로 작동하는가 ===');
let fail = 0;
for (const r of rows) {
  if (!r.pass) fail++;
  console.log(`${r.pass ? GRN('✅') : RED('❌')} ${r.name.padEnd(4)} ${r.what.padEnd(26)} ${r.note}`);
}

console.log('\n=== B. 적 행동표에 걸릴 경로가 있는가 ===');
const dead = [];
for (const x of S) {
  const list = reach[x.id];
  const live = list.filter(s => s.weight > 0 || s.chain);
  const zero = list.filter(s => s.weight === 0 && !s.chain);
  if (!live.length) dead.push(x.name);
  const tag = live.length === 0 ? RED('경로 없음') : live.length <= 2 ? YEL(`${live.length}곳`) : GRN(`${live.length}곳`);
  console.log(`${x.name.padEnd(4)} ${tag.padEnd(20)} ${live.slice(0, 3).map(s => `${s.enemy}·${s.move}`).join(', ')}${live.length > 3 ? ` 외 ${live.length - 3}` : ''}`);
  if (zero.length) console.log(`      ${RED('가중치 0 · 연계 아님 → 절대 안 나옴')}: ${zero.map(s => `${s.enemy}·${s.move}`).join(', ')}`);
}

console.log(`\n=== C. ${fights}판 · ${turns}턴 돌려 실제로 뜬 턴수 ===`);
const never = [];
for (const x of S) {
  const n = hit[x.id];
  if (n === 0) never.push(x.name);
  console.log(`${x.name.padEnd(4)} ${n === 0 ? RED('0턴 — 한 번도 안 뜸') : `${String(n).padStart(4)}턴 (${(n / turns * 100).toFixed(1)}%)`}`);
}

console.log('');
if (fail) console.log(RED(`규칙 실패 ${fail}건`));
if (dead.length) console.log(RED(`경로가 아예 없음: ${dead.join(', ')}`));
if (never.length) console.log(YEL(`실판에서 한 번도 안 뜸: ${never.join(', ')}`));
if (!fail && !dead.length && !never.length) console.log(GRN('13종 전부 작동하고 전부 실제로 뜬다'));
