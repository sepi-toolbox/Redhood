// cardbattle.js — v2.0 카드 전투: 상호 차감 배정 + 감정 카드
//
// 규칙 (docs/battle_mockup.html 시안에서 확정):
//  · 적이 먼저 주사위를 공개하고, 내가 5개를 굴린다. 리롤 없음 — 조작은 전부 카드.
//  · 내 주사위를 적 주사위에 대면 서로 값을 깎는다(즉시 판정). 0이 된 쪽은 부서지고,
//    큰 쪽은 차액만큼 남아 계속 쓸 수 있다.
//  · 턴 종료: 내가 먼저 — 남은 내 주사위 합이 🎯 대상에게 들어가고, 그때 죽은 적의
//    공격은 불발. 그 뒤 살아남은 적들의 남은 주사위 합이 나를 때린다.
//  · 카드: 덱에서 매 턴 5장이 되도록 뽑고, 안 쓴 카드는 턴 종료에 버린다. 자원 3/턴.
//
// 족보(야찌) 판정은 engine.js/yahtzee.js 에 휴면 보존 — 이후 감정 카드의 발동
// 조건("투페어가 있으면 …")으로 되살린다. 여기서는 참조하지 않는다.
import { DB } from './data.js';
import { rng } from './engine.js';

const ri = (min, max) => min + Math.floor(rng.next() * (max - min + 1));
const cfgOf = () => DB.cards.config;
export const cardOf = (id) => DB.cardById[id];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createCardBattle(run, encounterIds) {
  const cfg = cfgOf();
  const actKey = String(Math.min(run.act || 1, 3));
  const floorScale = 1 + (cfg.floorHpScale || 0) * (Math.max(run.floor, 1) - 1);
  const hpScale = (DB.acts.scaling.hp[actKey] || 1) * floorScale;
  const deckSrc = (Array.isArray(run.cards) && run.cards.length) ? run.cards : DB.cards.starterDeck;
  const b = {
    over: false, result: null, turn: 0,
    player: { hp: run.hp, maxHp: run.maxHp },
    res: 0,
    deck: shuffle(deckSrc.slice()), discard: [], hand: [],
    myDice: [],
    enemies: encounterIds.map((id, i) => spawnFoe(id, i, hpScale, actKey)),
    target: null,
  };
  b.target = b.enemies[0].uid;
  nextCardTurn(b);
  return b;
}

function spawnFoe(id, idx, hpScale, actKey) {
  const def = DB.enemyById[id];
  const cfg = cfgOf();
  const t = cfg.tiers[def.tier] || cfg.tiers.normal;
  const ov = def.battleDice || {};   // enemies.json 에 명시하면 그 값, 없으면 등급 기본값
  const ab = (cfg.acts || {})[actKey] || {};
  const hp = def.final ? def.hp[0]
    : Math.max(8, Math.round(ri(def.hp[0], def.hp[1]) * hpScale * (t.hpMult ?? 1)));
  return {
    uid: `${id}_${idx}`, defId: id, name: def.name, tier: def.tier,
    art: def.art || (def.tier === 'boss' ? '🐺' : def.tier === 'elite' ? '💀' : '🌑'),
    final: !!def.final,
    hp, maxHpInit: hp,
    diceN: ov.n ?? t.dice ?? 2,
    dmin: Math.min(4, (ov.min ?? t.min ?? 1) + (ab.minBonus || 0)),
    dmax: ov.max ?? t.max ?? 6,
    dice: [],
  };
}

export const aliveFoes = (b) => b.enemies.filter(e => e.hp > 0);
export const aliveVal = (ds) => ds.filter(d => !d.dead).reduce((s, d) => s + d.v, 0);

function rollFoe(b, e) {
  const cfg = cfgOf();
  // 최종 보스: 죽지 않는 대신 주사위가 점점 는다 — 버틸 수 있는 만큼 버텨라
  const extra = e.final ? Math.min(cfg.finalExtraMax ?? 4, Math.floor((b.turn - 1) / (cfg.finalExtraEvery ?? 2))) : 0;
  e.dice = Array.from({ length: e.diceN + extra }, () => {
    const v = ri(e.dmin, e.dmax);
    return { v, orig: v, dead: false };
  });
}

function nextCardTurn(b) {
  b.turn += 1;
  b.res = cfgOf().resPerTurn ?? 3;
  b.myDice = Array.from({ length: cfgOf().playerDice ?? 5 }, () => {
    const v = ri(1, 6);
    return { v, orig: v, dead: false };
  });
  for (const e of aliveFoes(b)) rollFoe(b, e);
  b.discard.push(...b.hand);
  b.hand = [];
  drawTo(b, cfgOf().handSize ?? 5);
  if (!b.enemies.some(e => e.uid === b.target && e.hp > 0)) {
    b.target = (aliveFoes(b)[0] || {}).uid || null;
  }
}

function drawTo(b, n) {
  while (b.hand.length < n) {
    if (b.deck.length === 0) {
      if (b.discard.length === 0) break;
      b.deck = shuffle(b.discard);
      b.discard = [];
    }
    b.hand.push(b.deck.pop());
  }
}

// ---------- 대결: 즉시 판정 ----------
// 서로 값을 깎고, 0이 된 쪽은 부서지고, 큰 쪽은 차액이 남는다.
export function clashDice(b, mi, uid, di) {
  if (b.over) return null;
  const m = b.myDice[mi];
  const e = b.enemies.find(x => x.uid === uid);
  const f = e && e.hp > 0 ? e.dice[di] : null;
  if (!m || m.dead || !f || f.dead) return null;
  const x = Math.min(m.v, f.v);
  m.v -= x;
  f.v -= x;
  if (m.v <= 0) m.dead = true;
  if (f.v <= 0) f.dead = true;
  return { x, myDead: m.dead, foeDead: f.dead };
}

export function setTarget(b, uid) {
  const e = b.enemies.find(x => x.uid === uid);
  if (e && e.hp > 0) { b.target = uid; return true; }
  return false;
}

export const cardTargetKind = (id) => (cardOf(id) || {}).target || null;

// ---------- 카드 ----------
// 대상이 필요한 카드(target: 'active'|'dead')는 dieIdx 를 받는다.
// 성공: { key, fx: [{i, txt}] } / 실패(자원 부족·대상 없음): null
export function playCard(b, hi, dieIdx = -1) {
  if (b.over) return null;
  const key = b.hand[hi];
  const c = cardOf(key);
  if (!c || b.res < c.cost) return null;
  const fx = [];
  if (key === 'courage') {
    const alive = b.myDice.filter(d => !d.dead);
    if (!alive.length) return null;
    const mn = Math.min(...alive.map(d => d.v));
    b.myDice.forEach((d, i) => { if (!d.dead && d.v === mn) { d.v *= 2; fx.push({ i, txt: '×2' }); } });
  } else if (key === 'stalk') {
    const d = b.myDice[dieIdx];
    if (!d || d.dead) return null;
    d.v = 6;
    fx.push({ i: dieIdx, txt: '→6' });
  } else if (key === 'elate') {
    const idxs = b.myDice.map((d, i) => (d.dead ? -1 : i)).filter(i => i >= 0);
    if (!idxs.length) return null;
    const i = idxs[Math.floor(rng.next() * idxs.length)];
    b.myDice[i].v += 1;
    fx.push({ i, txt: '+1' });
  } else if (key === 'repair') {
    const d = b.myDice[dieIdx];
    if (!d || !d.dead) return null;
    d.v = Math.min(d.orig, d.v + (c.amount ?? 2));
    if (d.v <= 0) return null;
    d.dead = false;
    fx.push({ i: dieIdx, txt: `+${c.amount ?? 2}` });
  } else return null;
  b.res -= c.cost;
  b.discard.push(b.hand.splice(hi, 1)[0]);
  return { key, fx };
}

// ---------- 미리보기: 이대로 턴을 마치면 ----------
export function previewTurn(b) {
  const atk = aliveVal(b.myDice);
  const tgt = b.enemies.find(x => x.uid === b.target && x.hp > 0) || null;
  const kills = !!tgt && !tgt.final && atk >= tgt.hp;
  let take = 0;
  for (const e of aliveFoes(b)) {
    if (!(kills && e.uid === tgt.uid)) take += aliveVal(e.dice);
  }
  return { atk, kills, take, targetUid: tgt ? tgt.uid : null };
}

// ---------- 턴 종료 ----------
// 내 공격 먼저 → 처치된 적의 공격은 불발 → 살아남은 적들이 나를 때린다.
// 상태는 여기서 전부 반영되고, 연출용 대본을 돌려준다.
export function endCardTurn(b) {
  if (b.over) return null;
  const atk = aliveVal(b.myDice);
  const tgt = b.enemies.find(x => x.uid === b.target && x.hp > 0) || aliveFoes(b)[0] || null;
  const script = { atk, targetUid: tgt ? tgt.uid : null, killed: false, foeHits: [], result: null };
  if (tgt && atk > 0) {
    if (tgt.final) tgt.hp = Math.max(1, tgt.hp - Math.min(atk, tgt.hp - 1)); // 최종 보스는 죽지 않는다
    else { tgt.hp = Math.max(0, tgt.hp - atk); script.killed = tgt.hp <= 0; }
  }
  for (const e of aliveFoes(b)) {
    const dmg = aliveVal(e.dice);
    if (dmg > 0) {
      b.player.hp = Math.max(0, b.player.hp - dmg);
      script.foeHits.push({ uid: e.uid, dmg });
      if (b.player.hp <= 0) break;
    }
  }
  if (b.player.hp <= 0) { b.over = true; b.result = 'defeat'; }
  else if (b.enemies.every(e => e.hp <= 0)) { b.over = true; b.result = 'victory'; }
  else nextCardTurn(b);
  script.result = b.result;
  return script;
}
