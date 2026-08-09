// cardsim.mjs — v2.0 카드 전투 실측: 시작 덱으로 1막 적들을 상대한 승률
//   node test/cardsim.mjs [판수]
import { readFileSync } from 'fs';
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
globalThis.fetch = async (u) => ({ ok: true, json: async () => JSON.parse(readFileSync(new URL('../' + String(u).replace(/^\.?\//, ''), import.meta.url), 'utf8')) });
const { loadAll, DB } = await import('../js/data.js');
await loadAll();
const CB = await import('../js/cardbattle.js');

// ---------- 플레이 정책 ----------
// 1) 죽일 수 있으면 죽인다 (처치 = 그 적의 공격이 통째로 불발)
// 2) 남는 값으로 가장 큰 적 주사위부터 부딪쳐 깎는다 (위험할수록 더 많이)
// 3) 카드: 추적은 부서진 큰 자리 대신 작은 눈을 6으로, 고양은 남으면, 복구는 방벽이 모자랄 때
function playTurn(b) {
  const foes = CB.aliveFoes(b);
  if (!foes.length) return;
  // 표적: 죽일 수 있는 놈 우선(체력 낮은 순), 아니면 가장 아픈 놈
  const myVal = () => CB.aliveVal(b.myDice);
  const threat = (e) => CB.aliveVal(e.dice);
  const killable = foes.filter(e => !e.final && e.hp <= myVal()).sort((a, c) => a.hp - c.hp);
  const tgt = killable[0] || foes.slice().sort((a, c) => threat(c) - threat(a))[0];
  CB.setTarget(b, tgt.uid);

  // 카드 1: 추적 — 제일 작은 살아있는 눈을 6으로 (가성비 최대)
  const handIdx = (key) => b.hand.indexOf(key);
  let g = 0;
  while (b.res >= 2 && handIdx('stalk') >= 0 && g++ < 4) {
    const idxs = b.myDice.map((d, i) => (!d.dead && d.v < 4 ? i : -1)).filter(i => i >= 0)
      .sort((a, c) => b.myDice[a].v - b.myDice[c].v);
    if (!idxs.length) break;
    if (!CB.playCard(b, handIdx('stalk'), idxs[0])) break;
  }
  // 카드 2: 용기 — 최저 눈이 3 이상이거나 동률이 2개 이상일 때만 (가치 ≥ 3)
  if (b.res >= 2 && handIdx('courage') >= 0) {
    const alive = b.myDice.filter(d => !d.dead);
    if (alive.length) {
      const mn = Math.min(...alive.map(d => d.v));
      const cnt = alive.filter(d => d.v === mn).length;
      if (mn * cnt >= 3) CB.playCard(b, handIdx('courage'));
    }
  }
  // 카드 3: 고양 — 자원이 남으면
  g = 0;
  while (b.res >= 1 && handIdx('elate') >= 0 && g++ < 4) {
    if (!CB.playCard(b, handIdx('elate'))) break;
  }

  // 방어 결정: 총알받이로 쓸 수 있는 값 = 내 값 − (죽일 대상이면 그 체력만큼은 남겨둔다)
  const hpFear = b.player.hp <= b.player.maxHp * 0.4 ? 1.5 : 1.0;   // 빈사면 더 막는다
  let spare = myVal() - (killable[0] ? tgt.hp : 0);
  const wantBlock = Math.min(spare, Math.ceil(foes.reduce((s, e) => s + (killable[0] && e.uid === tgt.uid ? 0 : threat(e)), 0) * (hpFear - 0.4)));
  let blocked = 0;
  g = 0;
  while (blocked < wantBlock && g++ < 30) {
    // 처치할 대상의 주사위는 어차피 불발 — 다른 적의 제일 큰 주사위부터
    const cand = [];
    for (const e of CB.aliveFoes(b)) {
      if (killable[0] && e.uid === tgt.uid) continue;
      e.dice.forEach((d, di) => { if (!d.dead) cand.push({ uid: e.uid, di, v: d.v }); });
    }
    if (!cand.length) break;
    cand.sort((a, c) => c.v - a.v);
    const f = cand[0];
    // 딱 맞거나 살짝 큰 내 주사위부터 (잔존을 살린다)
    const mine = b.myDice.map((d, i) => (!d.dead ? { i, v: d.v } : null)).filter(Boolean)
      .sort((a, c) => a.v - c.v);
    if (!mine.length) break;
    const pick = mine.find(m => m.v >= f.v) || mine[mine.length - 1];
    const r = CB.clashDice(b, pick.i, f.uid, f.di);
    if (!r) break;
    blocked += r.x;
    // 복구: 방벽이 더 필요한데 주사위가 다 부서졌으면 하나 살린다
    if (blocked < wantBlock && b.res >= 1 && b.hand.indexOf('repair') >= 0) {
      const deadIdx = b.myDice.findIndex(d => d.dead && d.orig >= 2);
      if (deadIdx >= 0 && CB.aliveVal(b.myDice) === 0) CB.playCard(b, b.hand.indexOf('repair'), deadIdx);
    }
  }
  CB.endCardTurn(b);
}

function fight(ids, floor, hp = 60) {
  const run = { hp, maxHp: 60, act: 1, floor, cards: DB.cards.starterDeck.slice() };
  const b = CB.createCardBattle(run, ids);
  let g = 0;
  while (!b.over && g++ < 40) playTurn(b);
  return { win: b.result === 'victory', turns: b.turn, hpLeft: b.player.hp };
}

const N = Number(process.argv[2] || 400);
const SETUPS = [
  ['1층 일반 1', ['stray_dog'], 1],
  ['3층 일반 2', ['crow', 'forest_spider'], 3],
  ['5층 일반 2', ['thorn_bush', 'stray_dog'], 5],
  ['6층 정예', ['alpha_dog'], 6],
  ['9층 정예', ['old_pike'], 9],
  ['12층 보스 늑대', ['wolf'], 12],
  ['12층 보스 곰인형', ['old_teddy'], 12],
  ['보스 늑대·도착HP42', ['wolf'], 12, 42],
];
console.log(`=== 카드 전투 실측 (판당 ${N}회, 시작 덱 그대로, HP 60 시작)\n`);
console.log('조우'.padEnd(16) + '   승률    평균턴   생존HP(승리시)');
for (const [name, ids, fl, hp0] of SETUPS) {
  let w = 0, t = 0, hpSum = 0;
  for (let k = 0; k < N; k++) {
    const r = fight(ids, fl, hp0 || 60);
    if (r.win) { w++; hpSum += r.hpLeft; }
    t += r.turns;
  }
  console.log(name.padEnd(16) + `${(w / N * 100).toFixed(0).padStart(6)}% ${(t / N).toFixed(1).padStart(8)} ${(w ? hpSum / w : 0).toFixed(1).padStart(12)}`);
}
