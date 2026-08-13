// engine.js — 전투 상태 머신 v0.5: 다중 적, 단일/전체 공격, 굴림 페이즈 분리
import { DB } from './data.js';
import { computeDamage, rollFace, relicValue, whetMultOf, whetCap } from './yahtzee.js';

export const rng = { next: Math.random };

function ri(min, max) { return min + Math.floor(rng.next() * (max - min + 1)); }

// 계몽에 따른 티어별 배율 — 2/3/4: 공격력 / 7/8/9: 체력
function enlightMults(enlight, tier) {
  let hp = 1, atk = 1;
  if (tier === 'normal') { if (enlight >= 2) atk *= 1.15; if (enlight >= 7) hp *= 1.2; }
  else if (tier === 'elite') { if (enlight >= 3) atk *= 1.15; if (enlight >= 8) hp *= 1.2; }
  else { if (enlight >= 4) atk *= 1.15; if (enlight >= 9) hp *= 1.2; }
  return { hp, atk };
}

// ---------- 전투 생성 ----------
// 옛 저장본(변형 배열)도 받아준다 — 첫 칸을 끼워진 것으로 본다
export function slotsOf(cats) {
  // v3.1 족보 수집제 — 키가 있는 족보만 소유. 없는 족보는 전투에서 아예 안 보인다.
  const out = {};
  for (const c of DB.scoring.categories) {
    if (!cats || !(c.id in cats)) continue;
    const v = cats[c.id];
    out[c.id] = Array.isArray(v) ? (v[0] || null) : (v || null);
  }
  return out;
}

export function createBattle(run, encounterIds) {
  const enlight = run.enlight || 0;
  // 막 스케일 × 층 스케일 (최종전(act 4)은 절대 수치)
  const actKey = String(Math.min(run.act || 1, 3));
  const actHp = (DB.acts.scaling.hp[actKey] || 1);
  const actAtk = (DB.acts.scaling.atk[actKey] || 1);
  const floorScale = 1 + (DB.act1.hpScalePerFloor || 0) * (Math.max(run.floor, 1) - 1);
  const scale = { hp: actHp * floorScale, atk: actAtk, enlight };
  const battle = {
    over: false, result: null, turn: 1,
    await: null,                          // null | 'enemy' (플레이어 확정 후 적 페이즈 대기)
    player: { hp: run.hp, maxHp: run.maxHp, block: 0, dot: 0, dotKind: 'poison' },
    // v1.14 독·출혈: 완전히 같은 장치이고 이름과 연출만 다르다. 한 판에 섞어 쓰지 않는다.
    //   내 행동이 끝나면 쌓인 수치만큼 피해를 받고 누적이 1 줄어든다. 방어도로 막힌다.
    diceDefs: run.dice.map(id => DB.diceById[id]),
    dice: run.dice.map(() => ({ face: 0, held: false, st: null })),  // st: 이 칸에 걸린 상태이상
    rolled: false,                        // 이번 턴 첫 굴림 여부
    relics: run.relics.map(id => DB.relicById[id]),
    categories: slotsOf(run.categories),   // 족보 id -> 끼워진 변형 id (없으면 null = 기본)
    sealed: {},
    lastUsedCat: null,
    lastSealableCat: null,          // 흉내내기가 노려보는 족보 (노페어는 면제라 따로 둔다)
    rollsLeft: 0,
    nextTurnRerolls: 0,
    pendingBuff: 0,
    pendingConfuse: 0,                    // 적 혼란 예약 — 다음 턴 시작 시 주사위 잠금 수
    dodgeActive: false,
    buffs: { strength: 0, focus: 0, regen: 0 }, // v0.19: 전투 내 지속 버프 (스택)
    whet: 0,                              // v1.29 벼름 — 쌓았다가 족보로 터뜨리는 곱연산 자원 (턴마다 안 깎인다)
    whetGained: 0,                        // 이번 턴에 벌어들인 양 (연출용)
    enemies: encounterIds.map((id, i) => spawnEnemy(id, i, scale)),
    lastResult: null,
    coinsLost: 0,                         // v1.17 약탈 — 전투가 끝나면 run에서 깎는다
    voidLocked: false,                    // v1.17 잠식이 다섯 칸을 다 먹은 상태
    lastHits: [],                         // [{uid, amount}] — 연출용
    mods: {},                             // v3.3 행동이 남긴 지속 방해 (rollTax·holdTax·petrify·lockHigh·blind)
  };
  for (const e of battle.enemies) chooseMove(e, 1);
  startTurn(battle, true);
  return battle;
}

function spawnEnemy(id, idx, scale) {
  const def = DB.enemyById[id];
  const em = enlightMults(scale.enlight, def.tier);
  // 최종 보스: 무한 체력(사실상), 막/층 스케일 미적용, 매 턴 점진 강화
  const hp = def.final
    ? def.hp[0]
    : Math.round(ri(def.hp[0], def.hp[1]) * scale.hp * em.hp);
  // 계몽 17/18/19: 티어별 '계몽 패턴' 해금
  const enlightened = !!def.enlightenedMove && (
    (def.tier === 'normal' && scale.enlight >= 17) ||
    (def.tier === 'elite' && scale.enlight >= 18) ||
    (def.tier === 'boss' && scale.enlight >= 19));
  return {
    uid: `${id}_${idx}`, defId: id, name: def.name, tier: def.tier,
    art: def.art || (def.tier === 'boss' ? '🐺' : def.tier === 'elite' ? '💀' : '🌑'),
    final: !!def.final,
    escalation: def.escalation || 0,      // 최종 보스: 매 턴 공격력 +N
    hp, maxHpInit: hp, stunned: false,
    atkScale: (def.final ? 1 : scale.atk) * em.atk,   // v1.0: 전역 보정 제거 — 낮춘 값은 enemies.json 의 기본 피해에 이미 반영돼 있다
    enlightened,
    block: (def.start || {}).block || 0,  // 방어: 자기 다음 행동 때까지 피해 흡수 (start.block 으로 시작 부여 가능)
    power: (def.start || {}).power || 0,  // 강화: 이후 모든 공격 피해 +power (전투 내 누적)
    debuffs: { weak: 0, bleed: 0, vulnerable: 0 }, // v0.19: 약화(공격-N)/출혈(행동마다 피해, -1씩 감소)/취약(받는 피해+N)
    patternState: { index: 0, recent: [], count: 0 }, phaseIndex: 0, nextMove: null,
    cooldown: {},                         // v1.01: 행동 id → 다시 쓸 수 있게 되는 턴. moves.*.cooldown 이 없으면 0(제한 없음)
    breakTaken: 0,                        // v1.08: 지금 예고된 행동을 건 뒤 HP로 받은 피해 누적 (파쇄 판정용)
    // v1.30 정예·보스 기믹 — 머리를 써서 풀라고 거는 조건들
    ward: (def.start || {}).ward || 0, wardLeft: (def.start || {}).ward ? ((def.start || {}).wardTurns || 99) : 0,
    cap: (def.start || {}).cap || 0, capLeft: (def.start || {}).cap ? ((def.start || {}).capTurns || 99) : 0,
    // 적 자기 버프(v3.8) — 문턱·상한과 같은 문법: 행동으로도, 시작 버프로도 얻는다
    regen: (def.start || {}).regen || 0, regenLeft: (def.start || {}).regen ? 99 : 0,   // 매 행동 회복
    enrage: (def.start || {}).enrage || 0,                                              // 맞을 때마다 힘 +N (전투 내)
    reflect: (def.start || {}).reflect || 0, reflectLeft: (def.start || {}).reflect ? 99 : 0, // 맞으면 반사 (방어도로 막힘)
    undying: (def.start || {}).undying || 0,                                            // 죽으면 1회 부활 (비율)
  };
}

// 유물 훅 합산 (같은 훅 여러 개 소지 가능)
function sumRelic(relics, type, field = 'amount') {
  let v = 0;
  for (const r of relics) if (r.hook.type === type) v += r.hook[field] || 0;
  return v;
}
function hasRelic(relics, type) { return relics.some(r => r.hook.type === type); }

// ---------- 턴 ----------
/* ==================== 주사위 상태이상 (v1.17) ====================
   규칙 셋뿐이다.
   1. 상태이상은 주사위 한 칸에 하나씩 붙는다.
   2. 새로 걸면 그 칸의 이전 것을 덮어쓴다.
   3. 무작위로 걸 때는 빈 칸을 먼저 채우고, 다 찼으면 아무 칸이나 덮는다.        */
const stDef = (kind) => (DB.statusById && DB.statusById[kind]) || null;
export const stRule = (d, rule) => !!(d && d.st && stDef(d.st.kind) && stDef(d.st.kind).rule === rule);
// 수치는 statuses.json 값으로 고정이다.
// 적 행동이 덮어쓸 수 있는 건 부패(fuse)의 폭발 피해 하나뿐 — 나머지는 규칙 상수다.
const stAmount = (d) => {
  const x = stDef(d.st.kind); if (!x) return 0;
  if (x.rule === 'fuse' && d.st.power > 0) return d.st.power;
  return x.amount;
};

// 적 행동이 정할 수 있는 건 부패의 폭발 피해(power) 하나뿐이다.
// 지속 턴은 상태이상 탭의 값으로 전부 고정 — 같은 걸 두 군데서 정하지 않는다.
// v3.32: 상태이상이 붙고·풀리고·터지는 순간을 화면이 알아야 연출을 건다.
//   엔진은 "무슨 일이 어느 칸에서 일어났는가"만 남기고, 그림은 main.js 가 그린다.
function fxPush(battle, bucket, item) {
  if (!battle.fx) battle.fx = { added: [], removed: [], burst: [] };
  battle.fx[bucket].push(item);
}
export function takeFx(battle) {
  const f = battle.fx || { added: [], removed: [], burst: [] };
  battle.fx = { added: [], removed: [], burst: [] };
  return f;
}

/* 주사위 한 칸에 상태이상은 언제나 하나뿐 (v3.38).
   이미 붙어 있으면 나중에 건 것이 먼저 건 것을 밀어낸다 — 밀려난 쪽은 '풀림' 연출을 받고 사라진다.
   상태이상을 붙이는 길은 전부 이 함수 하나를 지난다. */
function setStatus(battle, i, st) {
  const d = battle.dice[i];
  if (!d) return false;
  if (d.st) fxPush(battle, 'removed', { i, kind: d.st.kind, evicted: true });   // 덮어쓰기 = 먼저 것이 풀린다
  d.st = st;
  fxPush(battle, 'added', { i, kind: st.kind });
  return true;
}

export function applyStatus(battle, kind, count = 1, power = 0) {
  if (!stDef(kind)) return 0;
  const def = stDef(kind);
  if (def.rule !== 'fuse') power = 0;        // 폭발 피해를 정할 수 있는 건 부패뿐
  const life = def.turns || 0;
  let put = 0;
  const touched = new Set();                 // 같은 한 방이 같은 칸을 두 번 덮지 않게
  for (let k = 0; k < count; k++) {
    const free = battle.dice.map((d, i) => (!d.st && !touched.has(i) ? i : -1)).filter(i => i >= 0);
    const rest = battle.dice.map((_, i) => (touched.has(i) ? -1 : i)).filter(i => i >= 0);
    const pool = free.length ? free : (rest.length ? rest : battle.dice.map((_, i) => i));
    const i = pool[Math.floor(rng.next() * pool.length)];
    touched.add(i);
    setStatus(battle, i, { kind, power: power > 0 ? power : 0,
      left: def.rule === 'fuse' ? 0 : life,
      fuse: def.rule === 'fuse' ? (life || 1) : 0, opened: false, fresh: true });
    put++;
  }
  return put;
}

/* 노페어는 언제나 낼 수 있어야 하는 바닥이다 (v3.43).
   이것까지 봉인되면 낼 족보가 하나도 없는 턴이 생겨 그냥 맞고 넘어가게 된다.
   행동표에 뭐라고 적혀 있든 여기서 한 번 걸러, 데이터 실수로도 잠기지 않게 한다. */
const SEAL_EXEMPT = new Set(['chance']);
export const canSeal = (catId) => !SEAL_EXEMPT.has(catId);
function sealCat(battle, catId, turns) {
  if (!canSeal(catId)) return false;
  battle.sealed[catId] = Math.max(battle.sealed[catId] || 0, (turns || 1) + 1);
  // v3.48: 봉인이 걸린 순간을 연출로 알린다 — 전에는 아무 표시 없이 조용히 잠겨서
  //        '아무 일도 안 일어난다'로 읽혔다.
  // 저장값은 '이번 적 페이즈 직후의 감소분'까지 더한 수라, 연출에는 화면에 뜰 턴수를 그대로 넘긴다
  (battle.sealFx || (battle.sealFx = [])).push({ cat: catId, turns: Math.max(1, (turns || 1)) });
  return true;
}
export function takeSealFx(battle) { const f = battle.sealFx || []; battle.sealFx = []; return f; }

export function clearStatuses(battle, kind = null) {
  let n = 0;
  battle.dice.forEach((d, i) => {
    if (d.st && (!kind || d.st.kind === kind)) { fxPush(battle, 'removed', { i, kind: d.st.kind }); d.st = null; n++; }
  });
  battle.voidLocked = false;
  return n;
}

// 봉인은 한 번 다시 굴리기 전에는 값이 없다 — 족보 계산에서 아예 빠진다.
// 물린 주사위(sigLock — 흡착·물어채기 행동)도 같은 취급.
export const faceOf = (d) => ((stRule(d, 'needReroll') && !d.st.opened) || d.sigLock) ? 0 : d.face;
export const facesOf = (battle) => battle.dice.map(faceOf);
// 기절은 족보에는 들어가되 합산에서만 0으로 친다.
// 굳음(petrify)은 그 눈이 나온 칸에 기절 상태이상을 직접 붙인다 — 규칙도 연출도 상태이상 문법 하나로 통일.
const zeroedOf = (battle) => {
  const s = new Set();
  battle.dice.forEach((d, i) => { if (stRule(d, 'zeroValue')) s.add(i); });
  return s;
};
/* ==================== 행동이 남기는 지속 효과 (v3.3 mods) ====================
   적의 "행동"이 걸어두는 플레이어 쪽 지속 방해 — 상태이상과 같은 문법(턴 감쇠).
   rollTax  리롤할 때마다 피해   holdTax  리롤 시 지킨 주사위당 피해
   petrify  그 눈이 나오면 기절st 부착   lockHigh  최고 눈 잠금(+시전자 회복)
   blind    족보 위력 미리보기 숨김
   족보 봉인(sealLast/sealCat)은 기존 sealed 를 그대로 쓴다.                     */
export const modOf = (battle, key) => (battle.mods && battle.mods[key] && battle.mods[key].left > 0) ? battle.mods[key] : null;
function decayMods(battle) {
  for (const k of Object.keys(battle.mods || {})) {
    const m = battle.mods[k];
    if (!m) continue;
    m.left -= 1;
    if (m.left <= 0) delete battle.mods[k];
  }
}
// 굴림 직후 훅 — 굳음(petrify)이 이번에 나온 그 눈들에 기절을 들러붙인다 (다음 턴 시작에 떨어진다)
function modAfterRoll(battle, idxs) {
  const m = modOf(battle, 'petrify');
  if (!m) return;
  for (const i of idxs) {
    const d = battle.dice[i];
    if (d.face === (m.face ?? 6) && !stRule(d, 'zeroValue')) {
      setStatus(battle, i, { kind: 'stun', power: 0, left: 1, fuse: 0, opened: false, fresh: false });
    }
  }
}
// 저주·축복은 나올 수 있는 눈을 자른다
function allowedFaces(die, d) {
  const all = die.faces;
  if (stRule(d, 'faceLow'))  { const f = all.filter(v => v <= stAmount(d)); return f.length ? f : all; }
  if (stRule(d, 'faceHigh')) { const f = all.filter(v => v >= stAmount(d)); return f.length ? f : all; }
  return all;
}
const rollWith = (die, d) => { const f = allowedFaces(die, d); return f[Math.floor(rng.next() * f.length)]; };

// 턴이 시작될 때: 부패 심지가 타고, 지속 턴이 줄고, 잠식이 다 찼는지 본다
// ---------- 벼름(whet) ----------
export function addWhet(battle, n, tag) {
  if (!(n > 0)) return 0;
  const before = battle.whet;
  battle.whet = Math.min(whetCap(), battle.whet + n);
  const got = battle.whet - before;
  if (got > 0) battle.whetGained += got;
  if (got > 0 && battle.lastResult) battle.lastResult.bonusHits.push(`🔥벼름 +${got}${tag ? ' ' + tag : ''}`);
  return got;
}
export const whetMult = (battle) => whetMultOf(battle.whet);

// ---------- 주사위 눈 조작 (v1.29) ----------
// pin   보유만으로 — 확정한 뒤에도 이 칸의 눈이 다음 턴까지 남는다
// nudge 다시 굴릴 때 무작위 대신 눈을 amount 만큼 올린다 (6을 넘으면 1부터)
// mirror 굴린 직후 그 판에서 가장 많이 나온 눈으로 바뀐다
// split 같은 눈 족보에서 자기 눈을 한 번 더 센다 (computeDamage 쪽)
const dieOp = (battle, i) => {
  const def = battle.diceDefs[i];
  return def && def.effect ? def.effect.op : null;
};
export const isPinned = (battle, i) => dieOp(battle, i) === 'pin' && battle.dice[i].pinned;
function nudgeFace(battle, i) {
  const def = battle.diceDefs[i], step = (def.effect && def.effect.amount) || 1;
  const faces = def.faces, cur = battle.dice[i].face;
  const sorted = [...new Set(faces)].sort((a, b) => a - b);
  const at = sorted.indexOf(cur);
  battle.dice[i].face = at < 0 ? sorted[0] : sorted[(at + step) % sorted.length];
}
// 이음 — 굴린 직후, 다른 눈과 겹치지 않고 이어지기 좋은 눈으로 바뀐다 (되비침의 반대)
function applyLadder(battle, rolled) {
  const targets = rolled.filter(i => dieOp(battle, i) === 'ladder');
  if (!targets.length) return;
  for (const i of targets) {
    const others = new Set(battle.dice.map((d, k) => (k === i ? -1 : d.face)).filter(f => f > 0));
    const cand = [...new Set(battle.diceDefs[i].faces)];
    let best = battle.dice[i].face, bestScore = -1;
    for (const f of cand) {
      let sc = others.has(f) ? 0 : 2;                       // 안 겹치면 좋다
      if (others.has(f - 1) || others.has(f + 1)) sc += 1;  // 옆에 붙으면 더 좋다
      if (sc > bestScore) { bestScore = sc; best = f; }
    }
    battle.dice[i].face = best;
  }
}
function applyMirror(battle, rolled) {
  const targets = rolled.filter(i => dieOp(battle, i) === 'mirror');
  if (!targets.length) return;
  const count = {};
  battle.dice.forEach((d, i) => { if (d.face > 0 && dieOp(battle, i) !== 'mirror') count[d.face] = (count[d.face] || 0) + 1; });
  const top = Object.entries(count).sort((a, b) => b[1] - a[1] || b[0] - a[0])[0];
  if (!top) return;
  for (const i of targets) battle.dice[i].face = Number(top[0]);
}

function statusTurn(battle) {
  battle.stEvents = [];
  battle.dice.forEach((d, i) => {
    if (!d.st) return;
    if (stRule(d, 'fuse')) {
      if (d.st.fresh) { d.st.fresh = false; return; }
      d.st.fuse -= 1;
      if (d.st.fuse <= 0) {                       // 터진다
        const dmg = stAmount(d);
        d.st = null;
        fxPush(battle, 'burst', { i, kind: 'rot', amount: dmg });
        fxPush(battle, 'removed', { i, kind: 'rot' });
        battle.stEvents.push({ kind: 'rot', amount: dmg });
        battle.player.hp -= dmg;
        if (battle.player.hp <= 0) { battle.player.hp = 0; battle.over = true; battle.result = 'defeat'; }
      }
      return;
    }
    if (d.st.fresh) { d.st.fresh = false; return; }   // 걸린 턴에는 안 깎인다 (최소 한 턴은 겪는다)
    if (d.st.left > 0) {
      d.st.left -= 1;
      if (d.st.left <= 0) { fxPush(battle, 'removed', { i, kind: d.st.kind }); d.st = null; }
    }
  });
  if (stRule(battle.dice[0], 'spread') && battle.dice.every(d => stRule(d, 'spread'))) battle.voidLocked = true;
}

function startTurn(battle, first = false) {
  // v0.71: 상태이상은 매 턴 1스택씩 빠진다. 단 "이번 턴에 새로 붙은 것"은 깎지 않는다.
  //        (집중 1을 얻으면 다음 턴에 리롤을 한 번 받고 그 턴 끝에 사라진다 — 효과를 못 보는 일이 없다)
  battle.decaySnap = {
    buffs: { ...battle.buffs },
    enemies: Object.fromEntries(battle.enemies.map(e => [e.uid, { weak: e.debuffs.weak, vulnerable: e.debuffs.vulnerable }])),
  };
  if (!first) {
    for (const id of Object.keys(battle.sealed)) {
      battle.sealed[id] -= 1;
      if (battle.sealed[id] <= 0) delete battle.sealed[id];
    }
  }
  // 방어: 기본은 초기화. 문지기의 빗장(blockKeep)이 있으면 유지 + 턴 시작 방어 가산
  const keepR = battle.relics.find(r => r.hook.type === 'blockKeep');
  const kept = keepR ? Math.floor(battle.player.block * (keepR.hook.ratio != null ? keepR.hook.ratio : 0.5)) : 0;
  battle.player.block = kept + dicePassive(battle, 'turnBlock') + sumRelic(battle.relics, 'turnBlock');
  // 따뜻한 우유·재생 버프: 턴 시작 회복
  const th = sumRelic(battle.relics, 'turnHeal') + battle.buffs.regen;
  if (th > 0) battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + th);
  // 리롤: 기본 + 유물 + 주사위 패시브 + 집중 버프
  battle.rollsLeft = relicValue(battle.relics, 'extraReroll', DB.scoring.rerollsPerTurn)
    + dicePassive(battle, 'extraReroll') + battle.buffs.focus + battle.nextTurnRerolls;
  battle.nextTurnRerolls = 0;
  battle.rolled = false;
  // 못 주사위(pin): 확정 때 새겨둔 눈을 지우지 않고 그대로 가지고 간다
  battle.dice.forEach((d, i) => {
    const keep = dieOp(battle, i) === 'pin' && d.pinned && d.face > 0;
    d.held = false; d.confused = false; d.sigLock = false;
    if (!keep) { d.face = 0; d.pinned = false; }
  });
  battle.whetGained = 0;
  addWhet(battle, sumRelic(battle.relics, 'turnWhet') + dicePassive(battle, 'whet'));  // 숫돌 등
  statusTurn(battle);
  if (!first) decayMods(battle);
  if (hasRelic(battle.relics, 'confuseImmune')) battle.pendingConfuse = 0; // 수지 양초: 혼란 면역
  // 혼란(🌀): 무작위 주사위 N개가 뒤틀림 — 이번 턴 다시 굴릴 수 없다
  if (battle.pendingConfuse > 0) {
    const idx = battle.dice.map((_, i) => i);
    const n = Math.min(battle.pendingConfuse, idx.length);
    for (let k = 0; k < n; k++) {
      const j = Math.floor(rng.next() * idx.length);
      battle.dice[idx[j]].confused = true;
      idx.splice(j, 1);
    }
    battle.pendingConfuse = 0;
  }
}

export function initialRoll(battle) {
  if (battle.over || battle.rolled || battle.await) return false;
  const rolled = [];
  battle.dice.forEach((d, i) => {
    if (dieOp(battle, i) === 'pin' && d.pinned && d.face > 0) { d.held = true; return; }  // 새겨둔 눈은 그대로
    // v3.29: 봉인된 칸은 턴 첫 굴림에 아예 안 굴러간다. 밀랍이 붙들고 있다.
    //   푸는 길은 리롤 하나뿐이라는 게 이 상태이상의 값이다 (엔진은 예전부터 그랬는데
    //   화면에서는 같이 굴러가는 것처럼 보여 "풀린 줄 알았는데 안 풀린다"가 됐다).
    if (stRule(d, 'needReroll') && !d.st.opened) { d.held = true; return; }
    d.face = rollWith(battle.diceDefs[i], d); d.held = true; rolled.push(i);
  });
  applyMirror(battle, battle.dice.map((_, i) => i));
  applyLadder(battle, battle.dice.map((_, i) => i));
  modAfterRoll(battle, battle.dice.map((_, i) => i));
  // 흡착·물어채기(lockHigh 행동) — 가장 높은 눈 하나가 물린다 (족보 제외·리롤 불가)
  {
    const m = modOf(battle, 'lockHigh');
    if (m) {
      let hi = -1;
      battle.dice.forEach((d, i) => { if (d.face > 0 && (hi < 0 || d.face > battle.dice[hi].face)) hi = i; });
      if (hi >= 0) {
        const d = battle.dice[hi];
        d.sigLock = true;
        fxPush(battle, 'added', { i: hi, kind: 'bite' });   // 무는 순간도 연출한다
        if (m.heal) {
          const e = battle.enemies.find(x => x.uid === m.from);
          if (e && e.hp > 0) e.hp = Math.min(e.maxHpInit, e.hp + d.face);
        }
      }
    }
  }
  battle.rolled = true;
  return true;
}

// 조작 규칙(v0.6): 기본은 전부 유지, 탭한 주사위(held=false)만 다시 굴린다
export function rerollCost(battle) {
  // 마비가 하나라도 끼면 그 수치만큼 리롤을 먹는다 (여럿이면 가장 비싼 것 하나)
  let c = 1;
  battle.dice.forEach(d => { if (!d.held && stRule(d, 'rerollCost')) c = Math.max(c, stAmount(d)); });
  return c;
}

export function reroll(battle) {
  if (battle.over || !battle.rolled || battle.await) return false;
  if (battle.dice.every(d => d.held)) return false; // 다시 굴릴 주사위 미선택
  const cost = rerollCost(battle);
  if (battle.rollsLeft < cost) return false;
  battle.rollsLeft -= cost;
  const keptIdx = battle.dice.map((d, i) => (d.held ? i : -1)).filter(i => i >= 0);   // 시그니처용: 지킨 칸
  const rolled = [];
  battle.dice.forEach((d, i) => {
    if (!d.held) {
      if (dieOp(battle, i) === 'nudge' && d.face > 0) nudgeFace(battle, i);   // 길잡이 — 굴리지 않고 한 칸 올린다
      else { d.face = rollWith(battle.diceDefs[i], d); rolled.push(i); }
      d.pinned = false;                                   // 다시 굴리면 새김이 풀린다
      // v3.30: 봉인은 한 번 굴리면 할 일이 끝난다. 표식을 남겨두면 "아직 봉인"으로 읽히므로
      //        상태 자체를 걷어낸다 — 덮개도 이름표도 같이 사라져야 풀린 게 보인다 (성권).
      if (d.st) {
        if (stRule(d, 'needReroll')) { fxPush(battle, 'removed', { i, kind: d.st.kind }); d.st = null; }
        else d.st.opened = true;
      }
    }
    d.held = true; // 선택 초기화
  });
  applyMirror(battle, rolled);
  applyLadder(battle, rolled);
  modAfterRoll(battle, rolled);
  // 행동이 남긴 세금 — 이빨 자국(리롤당)·가시(지킨 주사위당). 방어도 무시.
  {
    const rt = modOf(battle, 'rollTax');
    const ht = modOf(battle, 'holdTax');
    let tax = 0;
    if (rt) tax += rt.amount ?? 1;
    if (ht) tax += Math.ceil(keptIdx.length * (ht.per ?? 0.5));
    if (tax > 0) {
      battle.player.hp -= tax;
      if (battle.player.hp <= 0) { battle.player.hp = 0; battle.over = true; battle.result = 'defeat'; }
    }
  }
  return true;
}

export function toggleHold(battle, i) {
  if (battle.over || !battle.rolled || battle.await) return;
  const d = battle.dice[i];
  if (d.sigLock) return;                             // 시그니처에 잠긴 주사위는 못 건드린다
  if (d.confused || stRule(d, 'noReroll')) return;   // 포박 — 다시 굴릴 수 없다
  const next = !d.held;
  d.held = next;
  // 결속 — 묶인 것들은 항상 같이 움직인다
  if (stRule(d, 'linked')) {
    battle.dice.forEach(o => { if (o !== d && stRule(o, 'linked')) o.held = next; });
  }
}

export function aliveEnemies(battle) { return battle.enemies.filter(e => e.hp > 0); }

export function isAoE(cat) { return cat.target === 'allEnemies'; }

// v1.34 슬롯 구조 — 아홉 족보는 처음부터 전부 가지고 있다.
//   기본 족보는 배수만 있고 부가 능력이 없다. 얻은 변형을 그 자리에 끼우면 기본을 대신한다.
export const baseIdOf = (catId) => `${catId}__base`;
export function baseVariantOf(cat) {
  return { id: baseIdOf(cat.id), name: cat.short || cat.name, ability: [], base: true, tier: 'common',
           abilityText: '기본 — 부가 능력 없음' };
}
// 이 자리에 끼워진 변형 정의 (빈 자리면 기본 족보)
export function variantOf(cat, variantId) {
  if (!variantId || variantId === baseIdOf(cat.id)) return baseVariantOf(cat);
  return (cat.variants || []).find(v => v.id === variantId) || baseVariantOf(cat);
}

// 저체력 보너스(독사과 등): 조건 충족 시 모든 족보 피해 가산
function situationalFlat(battle) {
  let v = 0;
  for (const r of battle.relics) {
    const h = r.hook;
    if (h.type === 'lowHpDamage' && battle.player.hp <= battle.player.maxHp * h.ratio) v += h.amount;
    // 곰의 등 — 지금 두른 방어도 per 마다 amount
    if (h.type === 'blockScaleDamage') v += Math.floor(battle.player.block / (h.per || 10)) * h.amount;
  }
  return v;
}
const dmgOpts = (battle, variant) => ({ whet: (variant && variant.burst) ? battle.whet : 0,
  hpRatio: battle.player.hp / Math.max(1, battle.player.maxHp) });

// ---------- 미리보기 ----------
// v0.9: 족보당 변형을 여러 개 보유(누적) — 같은 족보의 변형은 목록에서 이웃하게 정렬됨
const VOID_CAT = { id: 'void_call', name: '공허', kind: 'void', target: 'oneEnemy', fx: 'slash', variants: [] };

export function previewAll(battle) {
  const faces = facesOf(battle);
  const zero = zeroedOf(battle);
  const situ = situationalFlat(battle);
  const out = [];
  // 잠식이 다섯 칸을 다 먹으면 족보가 이것 하나만 남는다
  if (battle.voidLocked) {
    const self = faces.reduce((a, b) => a + b, 0) * (DB.statuses.voidCall.selfDamageMult || 1);
    return [{ cat: VOID_CAT, variant: { id: 'void_call', name: DB.statuses.voidCall.name, ability: [], abilityText: DB.statuses.voidCall.text },
              seal: 0, locked: !battle.rolled, voidCall: true, selfDamage: self,
              bd: { total: 0, isZero: true, base: 0, gold: 0, mult: 1, bonus: 0, flat: 0 } }];
  }
  for (const cat of DB.scoring.categories) {
    if (!(cat.id in battle.categories)) continue;        // v3.1 미보유 족보
    const seal = canSeal(cat.id) ? (battle.sealed[cat.id] || 0) : 0;   // 노페어는 어떤 경로로든 잠기지 않는다
    {
      const variant = variantOf(cat, battle.categories[cat.id]);
      // v1.31 일격(burst) — 이 변형만 벼름을 태우고 그만큼 증폭된다. 나머지는 벼름을 건드리지 않는다.
      const bd0 = battle.rolled
        ? computeDamage(cat, faces, battle.diceDefs, battle.relics, zero, dmgOpts(battle, variant))
        : { total: 0, isZero: true, base: 0, gold: 0, mult: 1, whetMult: 1, bonus: 0, flat: 0 };
      const total = bd0.total > 0 ? bd0.total + battle.pendingBuff + situ + battle.buffs.strength : bd0.total;
      const locked = seal > 0 || !battle.rolled || total === 0;
      out.push({ cat, variant, seal, locked, burst: !!variant.burst, bd: { ...bd0, total } });
    }
  }
  return out;
}

// ---------- 주사위 효과 (v0.10: 효과 스펙트럼) ----------
// when: 'passive'(보유만으로) / 'confirm'(기여 무관, 족보 확정 시) / 'contribute'(피해에 기여한 경우만)
function dicePassive(battle, op) {
  let v = 0;
  for (const d of battle.diceDefs) {
    if (d.effect && d.effect.when === 'passive' && d.effect.op === op) v += d.effect.amount;
  }
  return v;
}

function applyDiceEffects(battle, bd) {
  const contributing = new Set(bd.contributing || []);
  battle.diceDefs.forEach((def, i) => {
    const ef = def.effect;
    if (!ef) return;
    const active = ef.when === 'confirm'
      || (ef.when === 'contribute' && contributing.has(i))
      || (ef.when === 'idle' && !contributing.has(i));       // v1.29 불티 — 안 쓴 칸이 벼름을 만든다
    if (!active) return;
    switch (ef.op) {
      case 'whet':
        addWhet(battle, ef.amount, '🎲');
        break;
      case 'selfDamage':
        battle.player.hp -= ef.amount;
        battle.lastResult.bonusHits.push(`🎲🩸-${ef.amount}`);
        // 거머리 반지 — 자해한 만큼 벼름이 오른다
        addWhet(battle, sumRelic(battle.relics, 'whetOnSelfDamage') > 0
          ? sumRelic(battle.relics, 'whetOnSelfDamage') : 0, '🩸');
        if (battle.player.hp <= 0) { battle.player.hp = 0; battle.over = true; battle.result = 'defeat'; }
        break;
      case 'heal':
        battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + ef.amount);
        battle.lastResult.bonusHits.push(`🎲+${ef.amount}HP`);
        break;
      case 'block':
        battle.player.block += ef.amount;
        battle.lastResult.bonusHits.push(`🎲🛡${ef.amount}`);
        break;
    }
  });
}

// ---------- 부가 능력 ----------
function applyAbility(battle, variant, bd, targets) {
  for (const ab of (variant.ability || [])) {
    switch (ab.op) {
      case 'block': {
        const amt = Math.floor(ab.amount !== undefined ? ab.amount : bd.total * (ab.scoreMult || 1));
        battle.player.block += amt;
        battle.lastResult.bonusHits.push(`🛡${amt}`);
        break;
      }
      case 'heal':
        battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + ab.amount);
        battle.lastResult.bonusHits.push(`HP +${ab.amount}`);
        break;
      case 'rerollNext':
        battle.nextTurnRerolls += ab.amount;
        battle.lastResult.bonusHits.push(`다음 턴 리롤 +${ab.amount}`);
        break;
      case 'buffNext':
        battle.pendingBuff += ab.amount;
        battle.lastResult.bonusHits.push(`다음 피해 +${ab.amount}`);
        break;
      case 'cleanse': {
        // v0.11: 해제 = 혼란(🌀) 제거 (현재 뒤틀린 주사위 + 예약된 혼란)
        let n = 0;
        for (const d of battle.dice) if (d.confused) { d.confused = false; n++; }
        n += clearStatuses(battle);
        n += battle.pendingConfuse;
        battle.pendingConfuse = 0;
        battle.sealed = {};
        if (n > 0) battle.lastResult.bonusHits.push('혼란 해제!');
        break;
      }
      case 'stun':
        for (const t of targets) t.stunned = true;
        battle.lastResult.bonusHits.push('행동 취소!');
        break;
      case 'dodge':
        battle.dodgeActive = true;
        battle.lastResult.bonusHits.push('회피!');
        break;
      // ---- v0.19 전투 내 지속 버프 (플레이어) ----
      case 'strength':
        battle.buffs.strength += ab.amount;
        battle.lastResult.bonusHits.push(`🗡️+${ab.amount}`);
        break;
      case 'focus':
        battle.buffs.focus += ab.amount;
        battle.rollsLeft += ab.amount; // 이번 턴 남은 시간에도 즉시 반영
        battle.lastResult.bonusHits.push(`🎲+${ab.amount}`);
        break;
      case 'regen':
        battle.buffs.regen += ab.amount;
        battle.lastResult.bonusHits.push(`❤️+${ab.amount}`);
        break;
      // v1.29 벼름 — 다음에 터뜨릴 족보의 배수를 올린다
      case 'whet':
        addWhet(battle, ab.amount);
        break;
      // ---- v0.19 적 디버프 (피해 준 대상에게) ----
      case 'weakEnemy':
        for (const t of targets) t.debuffs.weak += ab.amount;
        battle.lastResult.bonusHits.push(`🔻${ab.amount}`);
        break;
      case 'bleed':
        for (const t of targets) t.debuffs.bleed += ab.amount;
        battle.lastResult.bonusHits.push(`🩸${ab.amount}`);
        break;
      case 'vulnerable':
        // 세기는 안 쌓인다 — 남은 턴만 늘어난다
        for (const t of targets) t.debuffs.vulnerable += ab.amount;
        battle.lastResult.bonusHits.push(`🎯${ab.amount}`);
        break;
    }
  }
}

// v3.73 취약 — 세기를 쌓는 게 아니라 '받는 피해 ×1.5'. 여러 번 걸면 배율은 그대로고 턴만 늘어난다.
//   (성권) 예전엔 +N 가산이라 족보가 세질수록 존재감이 사라졌다. 이제 내 한 방에 비례한다.
export const vulnMult = () => (DB.scoring && DB.scoring.vulnMult != null) ? DB.scoring.vulnMult : 1.5;
// 적에게 피해 — 취약 배율을 먹인 뒤 방어(block)가 흡수 (v0.19)
function dealToEnemy(battle, t, amount) {
  let total = (t.debuffs && t.debuffs.vulnerable > 0) ? Math.floor(amount * vulnMult()) : amount;
  // 문턱 — 얕은 타격은 아예 안 닿는다. 한 번 넘겨서 뚫으면 그대로 부서진다(자물쇠).
  if (t.wardLeft > 0 && total > 0) {
    if (total <= t.ward) {
      battle.lastHits.push({ uid: t.uid, amount: 0, warded: true });
      if (battle.lastResult) battle.lastResult.bonusHits.push(`🪨문턱 ${t.ward} — 안 통했다`);
      return 0;
    }
    t.ward = 0; t.wardLeft = 0;                       // 뚫렸다 — 다시 걸기 전까지 열려 있다
    if (battle.lastResult) battle.lastResult.bonusHits.push('🪨문턱을 부쉈다!');
  }
  // 상한 — 한 번에 이 이상은 못 준다. 크게 벼려도 소용없으니 꾸준히 쳐야 한다.
  if (t.capLeft > 0 && total > t.cap) {
    if (battle.lastResult) battle.lastResult.bonusHits.push(`⛓상한 ${t.cap}`);
    total = t.cap;
  }
  const absorbed = Math.min(t.block || 0, total);
  t.block -= absorbed;
  const dealt = total - absorbed;
  t.hp -= dealt;
  // 불사 — 처음 쓰러지는 순간 한 번은 뼈를 다시 맞춘다
  if (t.hp <= 0 && t.undying > 0) {
    t.hp = Math.max(1, Math.round(t.maxHpInit * t.undying));
    t.undying = 0;
    if (battle.lastResult) battle.lastResult.bonusHits.push('💀다시 일어선다!');
  }
  battle.lastHits.push({ uid: t.uid, amount: dealt, absorbed, killed: t.hp <= 0 });
  if (t.hp > 0 && dealt > 0) {
    // 격노 — 맞을 때마다 사나워진다 (잔펀치가 벌을 받는다)
    if (t.enrage > 0) {
      t.power = (t.power || 0) + t.enrage;
      if (battle.lastResult) battle.lastResult.bonusHits.push(`💢격노 +${t.enrage}`);
    }
    // 반사 — 되받아친다. 방어도로 막힌다 (막을 수 있는 세금)
    if (t.reflectLeft > 0 && t.reflect > 0) {
      const ab = Math.min(battle.player.block, t.reflect);
      battle.player.block -= ab;
      battle.player.hp -= (t.reflect - ab);
      if (battle.lastResult) battle.lastResult.bonusHits.push(`🌵반사 ${t.reflect}`);
      if (battle.player.hp <= 0) { battle.player.hp = 0; battle.over = true; battle.result = 'defeat'; }
    }
    interrupt(t, dealt);
  }
}

// HP에 실제로 들어간 피해만 받아서 국면 전환과 파쇄를 판정한다 (방어도로 막힌 몫은 넘어오지 않는다)
function interrupt(enemy, dealt) {
  const def = DB.enemyById[enemy.defId];
  // (1) 국면 전환이 최우선 — 예고가 무엇이든 밀어낸다
  if (def.phases) {
    const idx = phaseIndexFor(def, enemy);
    if (idx !== enemy.phaseIndex) {
      const prev = enemy.phaseIndex;
      enemy.phaseIndex = idx;
      enemy.patternState = { index: 0, recent: [] };
      const enter = def.phases[idx].enter;
      if (enter && idx > prev && moveDef(def, enter)) {
        setNextMove(enemy, def, enter, { phaseShift: true });
        return;
      }
    }
  }
  // (2) 파쇄 — 유니크 행동은 무너지지 않는다
  const mv = enemy.nextMove;
  if (!mv || mv.phaseShift || mv.broken) return;
  if (isUnique(def, mv.id)) return;
  const br = mv.break;
  if (!br || !(br.damage > 0)) return;
  enemy.breakTaken = (enemy.breakTaken || 0) + dealt;
  if (enemy.breakTaken >= br.damage && moveDef(def, br.move)) {
    setNextMove(enemy, def, br.move, { broken: true });
  }
}

// 시험용 — 족보를 거치지 않고 적에게 직접 피해를 넣는다 (파쇄·국면 전환 검증)
export function __test_deal(battle, enemy, amount) { battle.lastHits = battle.lastHits || []; dealToEnemy(battle, enemy, amount); }

// ---------- 족보 확정 (플레이어 페이즈) — 사용할 변형을 지정 ----------
export function confirmCategory(battle, catId, variantId, targetUid = null) {
  if (battle.over || !battle.rolled || battle.await) return null;
  const cat = DB.scoring.categories.find(c => c.id === catId);
  if (!cat) return null;
  if (!(catId in battle.categories)) return null;        // v3.1 미보유 족보
  const slot = battle.categories[catId] || baseIdOf(catId);
  if (variantId !== slot && variantId !== baseIdOf(catId)) return null;   // 그 자리에 없는 변형은 못 쓴다
  const variant = variantOf(cat, slot);
  if (canSeal(catId) && (battle.sealed[catId] || 0) > 0) return null;

  const alive = aliveEnemies(battle);
  if (alive.length === 0) return null; // v0.32: 전멸 후 중복 확정 가드 (대상 없음)
  let targets;
  if (isAoE(cat)) targets = alive;
  else {
    const t = targetUid ? alive.find(e => e.uid === targetUid) : null;
    targets = [t || alive[0]];
  }

  const faces = facesOf(battle);
  const bd = computeDamage(cat, faces, battle.diceDefs, battle.relics, zeroedOf(battle), dmgOpts(battle, variant));
  if (bd.total === 0) return null; // 성립 불가 족보는 확정 불가 (0점 버리기 폐지)
  if (bd.total > 0) {
    const situ = situationalFlat(battle); // 독사과 등 조건부 가산 + 힘 버프
    const add = battle.pendingBuff + situ + battle.buffs.strength;
    bd.total += add;
    bd.flat += add;
    battle.pendingBuff = 0;
  }
  battle.lastResult = { catName: `${variant.name}(${cat.name})`, ...bd, bonusHits: [], aoe: isAoE(cat), fx: cat.fx || 'slash' };
  battle.lastUsedCat = catId;
  // v3.48: 노페어는 봉인 면제라, 직전에 노페어를 쓰면 흉내내기가 그냥 헛방이었다 (12%).
  //        봉인할 수 있는 족보를 따로 기억해 둔다 — '흉내낸다'는 뜻은 그대로다.
  if (canSeal(catId)) battle.lastSealableCat = catId;
  battle.lastHits = [];

  if (bd.total > 0) {
    for (const t of targets) dealToEnemy(battle, t, bd.total);
  }

  // 벼름은 일격에만 쓰인다. 일격이 아니면 그대로 남아 다음을 기다린다.
  const spentWhet = variant.burst ? battle.whet : 0;
  if (variant.burst) battle.whet = 0;
  battle.lastResult.spentWhet = spentWhet;
  battle.lastResult.burst = !!variant.burst;
  // 못 주사위: 이번에 굴러 나온 눈을 그대로 새겨 다음 턴까지 들고 간다
  battle.dice.forEach((d, i) => { if (dieOp(battle, i) === 'pin' && d.face > 0) d.pinned = true; });
  applyAbility(battle, variant, bd, targets);
  applyDiceEffects(battle, bd);
  applyStatusCost(battle, bd);
  applyConfirmRelics(battle, cat, faces, bd);
  if (battle.over && battle.result === 'defeat') return battle.lastResult; // 저주 주사위 등으로 자멸

  // 늑대 가죽: 처치한 적 수만큼 회복
  const hk = sumRelic(battle.relics, 'healOnKill');
  if (hk > 0) {
    const kills = new Set(battle.lastHits.filter(h => h.killed).map(h => h.uid)).size;
    if (kills > 0) {
      const heal = hk * kills;
      battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + heal);
      battle.lastResult.bonusHits.push(`🐺+${heal}HP`);
    }
  }

  if (aliveEnemies(battle).length === 0) {
    battle.over = true; battle.result = 'victory';
    return battle.lastResult;
  }
  tickDot(battle);
  if (battle.over) return battle.lastResult;
  battle.await = 'enemy';
  return battle.lastResult;
}

// 확정하는 순간 켜지는 유물들 (v1.29)
function applyConfirmRelics(battle, cat, faces, bd) {
  const count = {};
  for (const f of faces) if (f > 0) count[f] = (count[f] || 0) + 1;
  const most = Math.max(0, ...Object.values(count));
  for (const r of battle.relics) {
    const h = r.hook;
    // 사냥꾼의 눈 — 같은 눈이 N개 이상 나온 판이면 벼름
    if (h.type === 'whetOnKind' && most >= (h.count || 3)) addWhet(battle, h.amount || 1, '🔍');
    // 길표 — 이 족보군을 확정하면 다음 턴 리롤
    if (h.type === 'rerollOnCategory' && (h.kind ? cat.kind === h.kind : cat.id === h.category)) {
      if (h.amount > 0) {
        battle.nextTurnRerolls += h.amount;
        battle.lastResult.bonusHits.push(`다음 턴 리롤 +${h.amount}`);
      }
      addWhet(battle, h.whet || 0, '🪧');
    }
  }
}

// 족보에 쓴 주사위가 물리는 대가 — 출혈·독은 피해, 약탈은 코인, 부패는 해제, 잠식은 번짐
function applyStatusCost(battle, bd) {
  const used = new Set(bd.contributing || []);
  let hurt = 0, coin = 0;
  battle.dice.forEach((d, i) => {
    if (!d.st) return;
    if (used.has(i)) {
      // 눈금 그대로다. 세기라는 손잡이를 두지 않는다 — 적이 조절하는 건 몇 칸에 거는가뿐.
      if (stRule(d, 'onUseFaceDamage')) { hurt += d.face; fxPush(battle, 'burst', { i, kind: d.st.kind, amount: d.face }); }
      if (stRule(d, 'onUseFaceCoin'))   { coin += d.face; fxPush(battle, 'burst', { i, kind: d.st.kind, amount: d.face, coin: true }); }
      if (stRule(d, 'fuse')) { fxPush(battle, 'removed', { i, kind: d.st.kind }); d.st = null; }   // 부패는 쓰면 해제된다
    }
  });
  // 잠식 — 쓰지 않은 것만 양옆으로 번진다
  const grow = [];
  battle.dice.forEach((d, i) => {
    if (stRule(d, 'spread') && !used.has(i)) { grow.push(i - 1); grow.push(i + 1); }
  });
  for (const j of grow) {
    const t = battle.dice[j];
    if (t && !stRule(t, 'spread')) {
      setStatus(battle, j, { kind: 'devour', power: 0, left: 0, fuse: 0, opened: false });
    }
  }
  if (battle.dice.every(d => stRule(d, 'spread'))) battle.voidLocked = true;
  if (coin > 0) { battle.coinsLost += coin; battle.lastResult.bonusHits.push(`🪙-${coin}`); }
  if (hurt > 0) {
    const absorbed = Math.min(battle.player.block, hurt);
    battle.player.block -= absorbed; const raw = hurt - absorbed;
    if (raw > 0) battle.player.hp -= raw;
    battle.lastResult.bonusHits.push(`🩸-${hurt}`);
    if (battle.player.hp <= 0) { battle.player.hp = 0; battle.over = true; battle.result = 'defeat'; }
  }
}

// 공허의 부름 — 잠식을 전부 걷어내는 대신 눈의 총합만큼 내가 아프다
export function confirmVoidCall(battle) {
  if (battle.over || !battle.rolled || battle.await || !battle.voidLocked) return null;
  const self = facesOf(battle).reduce((a, b) => a + b, 0) * (DB.statuses.voidCall.selfDamageMult || 1);
  clearStatuses(battle, 'devour');
  battle.voidLocked = false;
  battle.lastResult = { catName: DB.statuses.voidCall.name, total: 0, base: 0, gold: 0, mult: 1, bonus: 0, flat: 0,
                        bonusHits: [`🩸-${self}`], aoe: false, fx: 'slash' };
  battle.player.hp -= self;
  if (battle.player.hp <= 0) { battle.player.hp = 0; battle.over = true; battle.result = 'defeat'; return battle.lastResult; }
  battle.await = 'enemy';
  return battle.lastResult;
}

// 독·출혈 — 내 행동이 끝난 직후 쌓인 만큼 아프고 누적이 1 줄어든다. 방어도가 먼저 막는다.
export function tickDot(battle) {
  const p = battle.player;
  if (!(p.dot > 0)) return 0;
  let dmg = p.dot;
  const absorbed = Math.min(p.block, dmg);
  p.block -= absorbed; dmg -= absorbed;
  if (dmg > 0) {
    p.hp -= dmg;
    if (p.hp <= 0) { p.hp = 0; battle.over = true; battle.result = 'defeat'; }
  }
  p.dot -= 1;
  if (battle.lastResult) battle.lastResult.dotHit = { amount: absorbed + dmg, kind: p.dotKind };
  return absorbed + dmg;
}

// v0.71: 상태이상 지속시간 — 턴이 끝날 때 스택 1 감소.
// 이번 턴 시작 시점에 이미 있던 스택만 깎으므로, 이번 턴에 얻은 것은 최소 한 번은 효과를 본다.
function decayStatuses(battle) {
  const snap = battle.decaySnap;
  if (!snap) return;
  for (const k of ['strength', 'focus', 'regen']) {
    if (snap.buffs[k] > 0 && battle.buffs[k] > 0) battle.buffs[k] -= 1;
  }
  for (const e of battle.enemies) {
    const es = snap.enemies[e.uid];
    if (!es) continue;
    for (const k of ['weak', 'vulnerable']) {
      if (es[k] > 0 && e.debuffs[k] > 0) e.debuffs[k] -= 1;
    }
  }
  battle.decaySnap = null;
}

// ---------- 적 페이즈 ----------
export function enemyPhase(battle) {
  if (battle.over || battle.await !== 'enemy') return;
  battle.lastHits = []; // 사체 연출 종료 — 다음 렌더부터 죽은 적 제거
  battle.enemyHits = [];  // v3.26: 연타를 한 대씩 기록한다 — 화면에서 따로따로 때려야 한다
  for (const e of aliveEnemies(battle)) {
    if (battle.over) break;
    e.block = 0; // 자기 차례가 돌아오면 이전 방어는 소멸
    // 🩸 출혈: 행동할 때마다 스택만큼 피해(방어 무시), 이후 스택 -1
    if (e.debuffs.bleed > 0) {
      e.hp -= e.debuffs.bleed;
      e.debuffs.bleed -= 1;
      if (e.hp <= 0) continue; // 출혈사 — 행동 없이 쓰러진다
    }
    if (e.wardLeft > 0) { e.wardLeft -= 1; if (e.wardLeft <= 0) e.ward = 0; }
    if (e.reflectLeft > 0) { e.reflectLeft -= 1; if (e.reflectLeft <= 0) e.reflect = 0; }
    // 재생 — 자기 차례마다 아문다. 순 피해가 이걸 못 넘으면 영원히 못 잡는다
    if (e.regenLeft > 0 && e.regen > 0 && e.hp > 0) {
      e.hp = Math.min(e.maxHpInit, e.hp + e.regen);
      e.regenLeft -= 1; if (e.regenLeft <= 0) e.regen = 0;
    }
    if (e.capLeft > 0) { e.capLeft -= 1; if (e.capLeft <= 0) e.cap = 0; }
    if (e.stunned) { e.stunned = false; chooseMove(e, battle.turn + 1); continue; }
    // v1.06 연타(hits): 피해 효과에만 적용된다. 다른 효과에서는 무시되므로 0이나 1을 적어두면 된다.
    //   강화(power)와 약화(weak)가 '한 대마다' 적용되고 방어도 한 대씩 갉히기 때문에,
    //   한 방이 약해도 강화가 쌓이면 급격히 세지고 얇은 방어로는 다 못 막는다.
    for (const ef of e.nextMove.effects) {
      if (e.hp <= 0) break;                                // 자해로 쓰러졌으면 남은 효과는 없던 일이 된다
      switch (ef.op) {
        case 'damage': {                                   // ⚔️ 공격 — hits 만큼 한 대씩 따로 때린다
          if (battle.dodgeActive) break;
          for (let h = 0, times = hitCount(ef); h < times; h++) {
            let dmg = hitDamage(e, ef);
            const absorbed = Math.min(battle.player.block, dmg);
            battle.player.block -= absorbed;
            dmg -= absorbed;
            battle.enemyHits.push({ uid: e.uid, blocked: absorbed, taken: Math.max(0, dmg) });
            if (dmg > 0) {
              battle.player.hp -= dmg;
              if (battle.player.hp <= 0) {
                battle.player.hp = 0; battle.over = true; battle.result = 'defeat';
                return;
              }
            }
          }
          break;
        }
        case 'block':                                      // 🛡 방어
          e.block += ef.amount;
          break;
        case 'confuse':                                    // 🌀 (구) 혼란 — 다음 턴 주사위 잠금
          battle.pendingConfuse += ef.amount;
          break;
        case 'status':                                     // v1.17 주사위에 상태이상을 건다
          // amount = 몇 칸에 거는가 · power = 부패의 폭발 피해(0이면 기본값)
          applyStatus(battle, ef.kind, Math.max(1, ef.amount || 1), ef.power || 0);
          break;
        case 'empower':                                    // 💪 강화 — 전투 내 공격력 누적
          e.power = (e.power || 0) + ef.amount;
          break;
        case 'heal':                                       // 💚 치료
          e.hp = Math.min(e.maxHpInit, e.hp + ef.amount);
          break;
        case 'rest':                                       // 💤 휴식 — 아무것도 하지 않고 턴을 넘긴다
          break;                                           //   (숨 고르는 틈을 의도적으로 만들 때 쓴다)
        case 'poison':                                     // 🌀 독 — 지속 피해를 건다 (아래 bleed 와 같은 장치)
        case 'bleed':                                      // 🌀 출혈 — 이름과 연출만 다르다
          battle.player.dot += ef.amount;
          battle.player.dotKind = ef.op;
          break;
        case 'selfDamage':                                 // ❓ 자해 — 제 HP를 깎는다 (방어도 무시, 죽을 수도 있다)
          e.hp -= ef.amount;                                //   예고로는 무슨 행동인지 알 수 없다
          break;
        // ---- v1.30 정예·보스 기믹 ----
        case 'sealLast':                                   // 🔒 직전에 쓴 족보를 봉인한다 (흉내내기)
          if (battle.lastSealableCat) sealCat(battle, battle.lastSealableCat, ef.turns);
          break;
        case 'sealCat':                                    // 🔒 지정 족보들을 봉인한다 (솜 채우기)
          for (const cid of (ef.cats || [])) sealCat(battle, cid, ef.turns);
          break;
        case 'rollTax':                                    // 🩸 리롤할 때마다 피해 (이빨 자국)
          battle.mods.rollTax = { amount: ef.amount || 1, left: (ef.turns || 1) + 1, name: e.nextMove.name };
          break;
        case 'holdTax':                                    // 🩸 리롤 시 지킨 주사위당 피해 (가시)
          battle.mods.holdTax = { per: ef.per || 0.5, left: (ef.turns || 1) + 1, name: e.nextMove.name };
          break;
        case 'petrify':                                    // 🗿 그 눈이 나오면 기절이 붙는다 (굳음)
          battle.mods.petrify = { face: ef.face || 6, left: (ef.turns || 1) + 1, name: e.nextMove.name };
          break;
        case 'lockHigh':                                   // 🧲 매 굴림 최고 눈을 문다 (흡착·물어채기)
          battle.mods.lockHigh = { heal: !!ef.heal, from: e.uid, left: (ef.turns || 1) + 1, name: e.nextMove.name };
          break;
        case 'blind':                                      // 🌫 족보 위력 미리보기 숨김 (스멀거림)
          battle.mods.blind = { left: (ef.turns || 1) + 1, name: e.nextMove.name };
          break;
        case 'regen':                                      // 💗 재생 — 자기 차례마다 amount 회복
          e.regen = ef.amount; e.regenLeft = Math.max(1, ef.turns || 3);
          break;
        case 'enrage':                                     // 💢 격노 — 맞을 때마다 힘 +amount (전투 내)
          e.enrage = ef.amount || 1;
          break;
        case 'reflect':                                    // 🌵 반사 — 맞으면 amount 되돌려준다
          e.reflect = ef.amount; e.reflectLeft = Math.max(1, ef.turns || 3);
          break;
        case 'ward':                                       // 🪨 문턱 — amount 이하의 단발 피해를 무시한다
          e.ward = ef.amount; e.wardLeft = Math.max(1, ef.turns || 2);
          break;
        case 'cap':                                        // ⛓ 상한 — 단발 피해를 amount 로 깎는다
          e.cap = ef.amount; e.capLeft = Math.max(1, ef.turns || 2);
          break;
        case 'drainWhet':                                  // 🌀 벼름 흡수 — 쌓아둔 벼름을 빼앗는다
          battle.whet = ef.amount > 0 ? Math.max(0, battle.whet - ef.amount) : 0;
          break;
        case 'unpin':                                      // 💨 흩기 — 새겨둔 눈을 전부 푼다
          battle.dice.forEach(d => { d.pinned = false; });
          break;
      }
    }
    if (e.escalation) e.power += e.escalation; // 최종 보스: 매 턴 점진적으로 강해진다
    chooseMove(e, battle.turn + 1);
  }
  battle.dodgeActive = false;
  decayStatuses(battle); // v0.71: 한 턴에 한 스택씩 소멸
  // 출혈사 등으로 적이 전멸했으면 승리
  if (!battle.over && aliveEnemies(battle).length === 0) {
    battle.over = true;
    battle.result = 'victory';
    return;
  }
  battle.await = null;
  battle.turn += 1;
  startTurn(battle);
}

// ---------- 유니크 행동 (v1.08) ----------
// 일반 행동(moves)은 가중치 추첨으로 나온다. 유니크 행동(uniqueMoves)은 절대 추첨되지 않고
// 조건이 맞을 때만 '현재 예고된 행동을 밀어내고' 나온다. 두 가지 경로가 있다.
//   · 국면 전환 — phases[i].enter 에 적힌 유니크 행동. HP가 그 국면에 들어서는 순간 강제로 나온다.
//   · 파쇄     — moves.X.break = { damage, move } . X가 예고된 동안 적의 HP에 그만큼 피해가 누적되면
//                예고가 break.move(유니크)로 바뀐다. 방어도로 막힌 피해는 세지 않는다.
// 유니크 행동은 파쇄되지 않는다.
const moveDef = (def, id) => (def.moves && def.moves[id]) || (def.uniqueMoves && def.uniqueMoves[id]) || null;
// v1.08 등장 구간: 해금 턴(minTurn) 이상이고 락 턴(lockTurn) 미만일 때만 쓸 수 있다.
//   minTurn 2, lockTurn 5 → 2·3·4턴에만 나온다. 둘 다 0이면 제한 없음.
function usableAt(def, id, turn) {
  const m = moveDef(def, id);
  if (!m) return false;
  if (m.minTurn > 0 && turn < m.minTurn) return false;
  if (m.lockTurn > 0 && turn >= m.lockTurn) return false;
  return true;
}
const isUnique = (def, id) => !(def.moves && def.moves[id]) && !!(def.uniqueMoves && def.uniqueMoves[id]);
function setNextMove(enemy, def, id, extra = {}) {
  const m = moveDef(def, id);
  if (!m) return;
  enemy.breakTaken = 0;                 // 예고가 바뀌면 파쇄 누적도 처음부터
  enemy.nextMove = { id, ...m, ...extra };
}
function phaseIndexFor(def, enemy) {
  const ratio = enemy.hp / enemy.maxHpInit;
  for (let i = 0; i < def.phases.length; i++) if (ratio > def.phases[i].untilHpRatio) return i;
  return def.phases.length - 1;
}

// ---------- 적 행동 선택 ----------
function currentPattern(enemy) {
  const def = DB.enemyById[enemy.defId];
  if (!def.phases) return def.pattern;
  const idx = phaseIndexFor(def, enemy);
  if (idx !== enemy.phaseIndex) { enemy.phaseIndex = idx; enemy.patternState = { index: 0, recent: [] }; }
  return def.phases[idx].pattern;
}

// v1.04: 행동별 재사용 대기 — 값은 '몇 턴 쉬는가'다.
//   "moves.bristle.cooldown": 3  → 쓰고 나서 세 턴을 쉬고, 네 턴째에 다시 나올 수 있다.
//   0이거나 없으면 제한 없음. 세 행동을 번갈아 돌리려면 각자 2를 준다.
//   (v1.03까지는 '몇 턴 뒤에 다시'라 1이 아무 턴도 막지 못했다 — 직관과 어긋나 바꿨다)
function onCooldown(enemy, id, turn) { return (enemy.cooldown[id] || 0) >= turn; }
function stampCooldown(enemy, def, id, turn) {
  const cd = def.moves[id] && def.moves[id].cooldown;
  if (cd > 0) enemy.cooldown[id] = turn + cd;
}

function chooseMove(enemy, turn = 1) {
  const def = DB.enemyById[enemy.defId];
  if (!enemy.cooldown) enemy.cooldown = {};   // 예전 저장본 호환
  // v0.75 연계기: 방금 쓴 기술에 followUp이 걸려 있으면 확률에 따라 다음 기술이 확정된다.
  //   "moves.stalk.followUp": { "move": "pounce", "chance": 0.7 }  (배열로 여러 후보도 가능)
  //   확정된 연계는 minTurn·강화 행동보다 우선한다 — 말 그대로 무조건 이어진다.
  const prev = enemy.nextMove;
  if (prev && prev.followUp && (prev.chainDepth || 0) < 8) {
    const list = Array.isArray(prev.followUp) ? prev.followUp : [prev.followUp];
    for (const fu of list) {
      const target = moveDef(def, fu.move);
      if (!target) continue;
      if (!usableAt(def, fu.move, turn)) continue;   // 등장 구간 밖이면 연계로도 못 당긴다
      if (onCooldown(enemy, fu.move, turn)) continue;   // 대기 중인 기술은 연계로도 못 당긴다
      if (rng.next() >= (fu.chance != null ? fu.chance : 1)) continue;
      stampCooldown(enemy, def, fu.move, turn);
      setNextMove(enemy, def, fu.move, { chained: true, chainDepth: (prev.chainDepth || 0) + 1 });
      return;
    }
  }
  const st = enemy.patternState;
  st.count = (st.count || 0) + 1;
  // 계몽 패턴: 3번째 행동마다 강력한 계몽 기술 사용
  if (enemy.enlightened && def.enlightenedMove && st.count % 3 === 0) {
    enemy.breakTaken = 0;
    enemy.nextMove = { id: '__enlightened', ...def.enlightenedMove };
    return;
  }
  const pat = currentPattern(enemy);
  let moveId;
  // v1.03: 행동 선택은 가중치 추첨 하나로 통일됐다. 발동 조건은 네 가지뿐이다.
  //   가중치  — 뽑힐 상대 확률. 0이면 추첨에서 빠지고 연계로만 나온다.
  //   minTurn — 이 턴이 되기 전에는 아예 나오지 않는다 (후반 전용 기술).
  //   cooldown— 한 번 쓰면 이 턴 수만큼 쉰다. 주기적인 리듬은 이걸로 만든다.
  //   followUp— 앞 행동 다음에 확률로 확정된다. 순서를 강제할 때 쓴다.
  //   (예전의 sequence 모드와 강화 전용 트랙은 이 넷의 조합으로 그대로 표현된다)
  const unlocked = (id) => usableAt(def, id, turn) && !onCooldown(enemy, id, turn);
  {
    // v1.01: 가중치 0 = 추첨에 안 들어간다. 연계(followUp)로만 나오는 기술을 이렇게 표현한다.
    //   준비 동작 → 큰 공격 처럼 '반드시 앞선 행동이 있어야 하는' 기술에 쓴다.
    const entries = Object.entries(pat.weights).filter(([id, w]) => {
      if (!(w > 0)) return false;
      if (!unlocked(id)) return false;
      if (!pat.noRepeat) return true;
      const recent = st.recent.slice(-(pat.noRepeat - 1));
      return !(recent.length === pat.noRepeat - 1 && recent.every(r => r === id));
    });
    // v1.08 기본 행동(defaultMove) — 예외 처리용 안전망이다.
    //   쓸 수 있는 수가 하나도 남지 않았을 때(전부 쿨다운·락·해금에 걸렸을 때) 강제로 시동한다.
    //   해금 턴·락 턴·쿨다운·가중치를 전부 무시한다. 일반이든 유니크든 아무 행동이나 지정할 수 있지만,
    //   유니크 행동 체계(국면 전환·파쇄)와는 아무 관계가 없다 — 순수한 예외 처리 장치다.
    //   데이터를 어떻게 짜든 적이 아무것도 못 하고 멈추는 상황을 없애는 게 목적이다.
    if (entries.length === 0 && def.defaultMove && moveDef(def, def.defaultMove)) {
      setNextMove(enemy, def, def.defaultMove, { forced: true });
      return;
    }
    if (entries.length === 0) entries.push(...Object.entries(pat.weights).filter(([id, w]) => w > 0 && usableAt(def, id, turn)));
    if (entries.length === 0) entries.push(...Object.entries(pat.weights).filter(([, w]) => w > 0));
    if (entries.length === 0) entries.push(...Object.entries(pat.weights));
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let roll = rng.next() * total;
    moveId = entries[entries.length - 1][0];
    for (const [id, w] of entries) { roll -= w; if (roll <= 0) { moveId = id; break; } }
    st.recent.push(moveId);
  }
  stampCooldown(enemy, def, moveId, turn);
  setNextMove(enemy, def, moveId);
}

// 한 대의 피해 — 기본 수치에 막·계몽 배율을 곱한 뒤 강화를 더하고 약화를 뺀다.
// 연타는 이 값을 타수만큼 반복한다 (강화가 타수마다 붙는 게 연타의 핵심).
export function hitDamage(enemy, ef) {
  const weak = (enemy.debuffs && enemy.debuffs.weak) || 0; // 약화 칸이 아직 안 생겼어도 NaN 이 되지 않게
  return Math.max(0, Math.round(ef.amount * (enemy.atkScale || 1)) + (enemy.power || 0) - weak);
}
export const hitCount = (ef) => Math.max(1, Math.floor(ef.hits || 1));

// 의도 표기 (v0.11): ⚔️공격 / 🛡방어 / 🌀혼란 / 💪강화 / ❓의문 — 혼합은 병기
// v3.59: 네 갈래(공격·방어·강화·방해) 중 둘이 한꺼번에 오는 행동은 표식을 나란히 두 개 세우지 않고
//        조합 전용 표식 하나로 묶는다. 이모지와 겹치지 않게 사설 사용 영역 글자를 쓴다 —
//        어떤 그림인지는 화면 쪽(main.js)이 안다. 여기서는 '무슨 조합인가'만 말한다.
export const INTENT_COMBO = {
  '공격+방해': '\uE001',
  '공격+방어': '\uE002',
  '공격+강화': '\uE003',
  '방어+방해': '\uE004',
  '방어+강화': '\uE005',
};
// 데이터가 예고를 직접 못 박고 싶을 때 쓰는 값 (moves[*].intent)
const INTENT_FORCED = { attack: '⚔️', defend: '🛡', empower: '💪', confuse: '🌀', unknown: '❓', rest: '💤' };
const DISRUPT_OPS = new Set(['confuse', 'poison', 'bleed', 'status', 'sealLast', 'sealCat',
  'rollTax', 'holdTax', 'petrify', 'lockHigh', 'blind', 'drainWhet', 'unpin']);
// 예고 줄로는 말할 수 없는 것 — 걸리고 나서 배지로 보는 지속 효과
const OPAQUE_OPS = new Set(['ward', 'cap', 'regen', 'enrage', 'reflect']);

export function intentOf(enemy) {
  const mv = enemy.nextMove;
  if (!mv) return '';
  if (enemy.stunned) return '💫';
  if (mv.hidden) return '❓';
  // 자해처럼 예고로 읽어낼 수 없는 효과가 섞이면 통째로 '?' 로 가린다
  if (mv.effects.some(ef => ef.op === 'selfDamage')) return '❓';
  // v3.60: 몸에 얹혀 여러 턴 남는 것(문턱·상한·재생·격노·반사)도 마찬가지다. 저건 '이번에 뭘 하겠다'가
  //        아니라 '앞으로 이런 몸이 되겠다'라서 예고 줄의 다섯 갈래로는 말할 수 없다. 걸리고 나면
  //        배지로 보이니 예고에서는 정체를 밝히지 않는다. (성권: 상태이상은 예고에 표시되는 게 아니다)
  if (mv.effects.some(ef => OPAQUE_OPS.has(ef.op))) return '❓';
  // 예고가 텅 비는 자리(치유만 있는 행동 따위)는 데이터가 직접 지정한다
  if (mv.intent && INTENT_FORCED[mv.intent]) return INTENT_FORCED[mv.intent];

  const dmg = [];            // 한 대 피해 × 타수
  let blockAmt = null, emp = false, dis = false;
  for (const ef of mv.effects) {
    if (ef.op === 'damage') {
      const per = hitDamage(enemy, ef), n = hitCount(ef);
      if (per * n > 0) dmg.push(n > 1 ? `${per}×${n}` : `${per}`);
    } else if (ef.op === 'block') blockAmt = (blockAmt || 0) + ef.amount;
    else if (ef.op === 'empower') emp = true;
    // v3.59: 치유는 예고에 그리지 않는다 — 적이 제 몸을 아무는 건 이번 턴 내 선택을 바꾸지 않는다
    else if (ef.op === 'heal') { /* 표기 없음 */ }
    // 방해 효과는 종류를 뭉뚱그려 🌀 하나로만 예고한다 — 행동의 정체는 이름이 말하고,
    // 무슨 장치인지(결속×2 따위)는 길게 눌러 상세에서 본다. (성권: 예고는 '행동'이다)
    else if (DISRUPT_OPS.has(ef.op)) dis = true;
  }
  const atk = dmg.length > 0, def = blockAmt !== null;
  const core = [atk && '공격', def && '방어', emp && '강화', dis && '방해'].filter(Boolean);
  const combo = core.length === 2 ? INTENT_COMBO[core.join('+')] : null;

  const parts = [];
  if (combo) {
    // 묶인 표식이 앞선 갈래의 수치를 그대로 데리고 간다 — 공격이면 피해, 아니면 방어도
    parts.push(combo + (atk ? dmg[0] : String(blockAmt)));
    for (const d of dmg.slice(1)) parts.push(`⚔️${d}`);
  } else {
    for (const d of dmg) parts.push(`⚔️${d}`);
    if (def) parts.push(`🛡${blockAmt}`);
    if (emp) parts.push('💪');
  }
  if (!combo && dis) parts.push('🌀');
  // 파쇄 기준치(🔨N)는 예고에 내보내지 않는다 — 적을 길게 눌러 여는 치트 창에서만 보인다
  return parts.join(' ') || '💤';
}
