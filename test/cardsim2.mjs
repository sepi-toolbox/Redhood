// cardsim2.mjs — v2.17 밸런스 시뮬레이터: 눈 능력·면체·개수·오버라이드 인지
//   node test/cardsim2.mjs enc [판수]                — 조우별 승률표 (1~3막)
//   node test/cardsim2.mjs run [판수]                — 1막 전체 런 곡선 (HP 이월·휴식·보상 포함)
//   node test/cardsim2.mjs enc 400 --config x.json  — 제안 밸런스(battleDice/faceAbilities 오버라이드) 주입
//
// 실제 엔진(js/cardbattle.js)을 그대로 사용한다. 오버라이드는 로드 뒤 DB에 주입하므로
// data/*.json 을 건드리지 않고 제안 수치를 실측할 수 있다.
import { readFileSync } from 'fs';
globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
globalThis.fetch = async (u) => ({ ok: true, json: async () => JSON.parse(readFileSync(new URL('../' + String(u).replace(/^\.?\//, ''), import.meta.url), 'utf8')) });
const { loadAll, DB } = await import('../js/data.js');
await loadAll();
const CB = await import('../js/cardbattle.js');

// ---------- 오버라이드 주입 ----------
const argv = process.argv.slice(2);
const mode = argv[0] === 'run' ? 'run' : 'enc';
const N = Number(argv.find(a => /^\d+$/.test(a)) || 400);
const cfgIdx = argv.indexOf('--config');
if (cfgIdx >= 0) {
  const ov = JSON.parse(readFileSync(argv[cfgIdx + 1], 'utf8'));
  for (const [id, o] of Object.entries(ov.enemies || {})) {
    const e = DB.enemyById[id];
    if (!e) { console.error(`오버라이드: 없는 적 "${id}"`); process.exit(1); }
    if (o.battleDice !== undefined) e.battleDice = o.battleDice;
    if (o.faceAbilities !== undefined) e.faceAbilities = o.faceAbilities;
    if (o.hp) e.hp = o.hp;
  }
  if (ov.config) Object.assign(DB.cards.config, ov.config);
  if (ov.scaling) { Object.assign(DB.acts.scaling.hp, ov.scaling.hp || {}); Object.assign(DB.acts.scaling.atk, ov.scaling.atk || {}); }
  console.log(`(오버라이드 주입: ${argv[cfgIdx + 1]})\n`);
}

// ---------- 예고 인지 위협 평가 (v2.17) ----------
// 적의 위협 = 예고한 행동이 아프게 하는 정도. 유틸 예고(방어·회복·강화)를 깎는 가치는 낮다.
function opWeight(mv) {
  if (!mv) return 1;
  if (mv.op === 'damage' || mv.op === 'lifesteal') return 1;
  if (mv.op === 'bleed') return 1.15;         // 도트가 얹힌다
  if (mv.op === 'empower') return mv.mult ?? 0.25;   // 다음 턴 위협의 선지불
  if (mv.op === 'heal') return 0.3;           // 깎기보다 그냥 때리는 게 낫다
  return 0.1;                                 // armor
}
const foeThreat = (e) => CB.movePower(e) * opWeight(e.move) + (e.move && e.move.op === 'bleed' ? (e.move.amount ?? 2) * 2 : 0);
const dieThreat = (e, d) => (d.dead ? 0 : d.v * opWeight(e.move));

// ---------- 플레이 정책 (능력 인지) ----------
function playTurn(b) {
  const foes = CB.aliveFoes(b);
  if (!foes.length) return;
  const myVal = () => CB.aliveVal(b.myDice);
  const handIdx = (key) => b.hand.indexOf(key);

  // 카드: 추적(작은 눈→6) → 용기(가치 3+) → 고양(남는 자원)
  let g = 0;
  while (b.res >= 2 && handIdx('stalk') >= 0 && g++ < 4) {
    const idxs = b.myDice.map((d, i) => (!d.dead && d.v < 4 ? i : -1)).filter(i => i >= 0)
      .sort((a, c) => b.myDice[a].v - b.myDice[c].v);
    if (!idxs.length) break;
    if (!CB.playCard(b, handIdx('stalk'), idxs[0])) break;
  }
  if (b.res >= 2 && handIdx('courage') >= 0) {
    const alive = b.myDice.filter(d => !d.dead);
    if (alive.length) {
      const mn = Math.min(...alive.map(d => d.v));
      if (mn * alive.filter(d => d.v === mn).length >= 3) CB.playCard(b, handIdx('courage'));
    }
  }
  g = 0;
  while (b.res >= 1 && handIdx('elate') >= 0 && g++ < 4) {
    if (!CB.playCard(b, handIdx('elate'))) break;
  }

  // 표적: 방어도 포함 처치 가능한 놈(체력 낮은 순) 우선, 아니면 위협 큰 놈
  const killable = foes.filter(e => !e.final && e.hp + (e.block || 0) <= myVal()).sort((a, c) => a.hp - c.hp);
  const tgt = killable[0] || foes.slice().sort((a, c) => foeThreat(c) - foeThreat(a))[0];
  CB.setTarget(b, tgt.uid);

  // 방어: 빈사일수록 더 막는다. 능력 주사위는 "완전 파괴"를 노린다.
  const hpFear = b.player.hp <= b.player.maxHp * 0.4 ? 1.5 : 1.0;
  const reserve = killable[0] ? tgt.hp + (tgt.block || 0) : 0;   // 처치용으로 남겨둘 값
  const incoming = foes.reduce((s, e) => s + (killable[0] && e.uid === tgt.uid ? 0 : foeThreat(e)), 0);
  let wantBlock = Math.min(Math.max(0, myVal() - reserve), Math.ceil(incoming * (hpFear - 0.4)));
  // 격앙이 돌기 시작하면 레이스 전환 — 빈사만 면할 만큼만 막고 최대한 때린다
  if (foes.some(e => (e.rage || 0) > 0)) {
    const allow = Math.max(0, b.player.hp - b.player.maxHp * 0.3);
    wantBlock = Math.min(wantBlock, Math.max(0, Math.ceil(incoming - allow)));
  }
  let blocked = 0;
  g = 0;
  while (blocked < wantBlock && g++ < 40) {
    const cand = [];
    for (const e of CB.aliveFoes(b)) {
      if (killable[0] && e.uid === tgt.uid) continue;            // 어차피 불발
      e.dice.forEach((d, di) => { if (!d.dead) cand.push({ e, di, d, th: dieThreat(e, d) }); });
    }
    if (!cand.length) break;
    cand.sort((a, c) => c.th - a.th);                            // 능력 포함 위협 순
    const f = cand[0];
    const mine = b.myDice.map((d, i) => (!d.dead ? { i, v: d.v } : null)).filter(Boolean)
      .sort((a, c) => a.v - c.v);
    if (!mine.length) {
      // 복구로 하나 살려서라도 마저 막을까 — 원값 2 이상만 가치가 있다
      if (b.res >= 1 && handIdx('repair') >= 0) {
        const deadIdx = b.myDice.findIndex(d => d.dead && d.orig >= 2);
        if (deadIdx >= 0 && CB.playCard(b, handIdx('repair'), deadIdx)) continue;
      }
      break;
    }
    // 능력 주사위: 완전히 깰 수 있는 가장 작은 내 주사위. 없으면 제일 큰 걸로 깎아두고 다음 루프에서 마저 깬다.
    const pick = mine.find(m => m.v >= f.d.v) || mine[mine.length - 1];
    const r = CB.clashDice(b, pick.i, f.e.uid, f.di);
    if (!r) break;
    blocked += r.x;
  }
  CB.endCardTurn(b);
}

function fight(ids, floor, act = 1, hp = 60, maxHp = 60, deck = null) {
  const run = { hp, maxHp, act, floor, cards: (deck || DB.cards.starterDeck).slice() };
  const b = CB.createCardBattle(run, ids);
  let g = 0;
  while (!b.over && g++ < 60) playTurn(b);
  return { win: b.result === 'victory', turns: b.turn, hpLeft: b.player.hp };
}

// ---------- enc: 조우별 승률표 ----------
if (mode === 'enc') {
  const SETUPS = [
    // 1막
    ['1막 1층 일반1 들개', ['stray_dog'], 1, 1],
    ['1막 1층 일반1 까마귀', ['crow'], 1, 1],
    ['1막 3층 일반2', ['crow', 'forest_spider'], 3, 1],
    ['1막 5층 일반2', ['thorn_bush', 'stray_dog'], 5, 1],
    ['1막 6층 정예', ['alpha_dog'], 6, 1],
    ['1막 12층 보스 늑대', ['wolf'], 12, 1],
    ['1막 보스·도착HP42', ['wolf'], 12, 1, 42],
    // 2막 (min+1 보정·HP×2.1)
    ['2막 1층 일반1', ['bog_toad'], 1, 2],
    ['2막 5층 일반2', ['mist_wraith', 'skeleton'], 5, 2],
    ['2막 6층 정예', ['mud_golem'], 6, 2],
    ['2막 12층 보스', ['swamp_king'], 12, 2],
    // 3막 (min+2 보정·HP×3.3)
    ['3막 1층 일반1', ['nightmare_hare'], 1, 3],
    ['3막 6층 정예', ['sandman'], 6, 3],
    ['3막 12층 보스', ['lucid_king'], 12, 3],
    ['최종 이름없는공포 10턴', ['nameless_dread'], 12, 4],
  ];
  console.log(`=== 조우 실측 (판당 ${N}회, 시작 덱, HP 60)\n`);
  console.log('조우'.padEnd(20) + '   승률    평균턴   생존HP(승리시)');
  for (const [name, ids, fl, act, hp0] of SETUPS) {
    let w = 0, t = 0, hpSum = 0, survive10 = 0;
    for (let k = 0; k < N; k++) {
      if (ids[0] === 'nameless_dread') {
        // 최종보스: 승리 없음 — 10턴 생존율만 본다
        const run = { hp: hp0 || 60, maxHp: 60, act: 3, floor: fl, cards: DB.cards.starterDeck.slice() };
        const b = CB.createCardBattle(run, ids);
        let g2 = 0;
        while (!b.over && b.turn <= 10 && g2++ < 30) playTurn(b);
        if (b.result !== 'defeat') survive10++;
        t += Math.min(b.turn, 10);
        continue;
      }
      const r = fight(ids, fl, act, hp0 || 60);
      if (r.win) { w++; hpSum += r.hpLeft; }
      t += r.turns;
    }
    if (ids[0] === 'nameless_dread') {
      console.log(name.padEnd(20) + `${(survive10 / N * 100).toFixed(0).padStart(6)}% (10턴 생존)`);
    } else {
      console.log(name.padEnd(20) + `${(w / N * 100).toFixed(0).padStart(6)}% ${(t / N).toFixed(1).padStart(8)} ${(w ? hpSum / w : 0).toFixed(1).padStart(12)}`);
    }
  }
}

// ---------- run: 1막 전체 런 곡선 ----------
// 지도 단순화: 1층 전투(easy), 2~9층 전투(3층까지 easy, 이후 hard, 정예층이면 30% 정예),
// 10층 휴식(30% 회복), 11층 보스. 승리마다 카드 보상 1장(선호: 희귀>비범>공용).
if (mode === 'run') {
  const prefOrder = ['stalk', 'courage', 'elate', 'repair'];
  const pickReward = () => {
    // rollCardRewards 흉내: weight 추첨 3장 → 선호 순 선택
    const pool = DB.cards.list.map(c => ({ c, w: c.weight || 1 }));
    const out = [];
    const used = new Set();
    while (out.length < 3 && used.size < pool.length) {
      const cand = pool.filter(p => !used.has(p.c.id));
      const total = cand.reduce((s, p) => s + p.w, 0);
      let roll = Math.random() * total;
      for (const p of cand) { roll -= p.w; if (roll <= 0) { used.add(p.c.id); out.push(p.c.id); break; } }
    }
    return out.sort((a, c) => prefOrder.indexOf(a) - prefOrder.indexOf(c))[0];
  };
  const enc = DB.act1.encounters;
  const pickEnc = (pool) => pool[Math.floor(Math.random() * pool.length)];
  let wins = 0, bossReach = 0, hpAtBossSum = 0;
  const deathFloors = [];
  for (let k = 0; k < N; k++) {
    let hp = 60;
    const deck = DB.cards.starterDeck.slice();
    let dead = false;
    for (let fl = 1; fl <= 11 && !dead; fl++) {
      if (fl === 10) { hp = Math.min(60, hp + Math.round(60 * (DB.act1.rest.healRatio || 0.3))); continue; }
      let ids;
      if (fl === 11) { hpAtBossSum += hp; bossReach++; ids = ['wolf']; }
      else if (fl <= DB.act1.encounters.easyFloors) ids = pickEnc(enc.easy);
      else if (DB.act1.map.eliteFloors.includes(fl) && Math.random() < 0.3) ids = pickEnc(enc.elite);
      else ids = pickEnc(enc.hard);
      const r = fight(ids, fl, 1, hp, 60, deck);
      if (!r.win) { dead = true; deathFloors.push(fl); break; }
      hp = Math.min(60, r.hpLeft + (fl < 11 ? (DB.cards.config.victoryHeal || 0) : 0));
      if (fl < 11) deck.push(pickReward());
      else wins++;
    }
  }
  console.log(`=== 1막 전체 런 (${N}회)\n`);
  console.log(`클리어율      ${(wins / N * 100).toFixed(1)}%`);
  console.log(`보스 도달률   ${(bossReach / N * 100).toFixed(1)}%`);
  console.log(`보스 도착 HP  평균 ${(bossReach ? hpAtBossSum / bossReach : 0).toFixed(1)}`);
  console.log(`보스전 승률   ${(bossReach ? wins / bossReach * 100 : 0).toFixed(1)}% (도달 시)`);
  if (deathFloors.length) {
    const cnt = {};
    for (const f of deathFloors) cnt[f] = (cnt[f] || 0) + 1;
    console.log(`사망 층 분포  ${Object.entries(cnt).sort((a, c) => a[0] - c[0]).map(([f, c]) => `${f}층:${c}`).join('  ')}`);
  }
}
