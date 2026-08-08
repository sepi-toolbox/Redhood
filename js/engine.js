// engine.js — 전투 상태 머신 v0.5: 다중 적, 단일/전체 공격, 굴림 페이즈 분리
import { DB } from './data.js';
import { computeDamage, rollFace, relicValue } from './yahtzee.js';

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
    player: { hp: run.hp, maxHp: run.maxHp, block: 0 },
    diceDefs: run.dice.map(id => DB.diceById[id]),
    dice: run.dice.map(() => ({ face: 0, held: false })),
    rolled: false,                        // 이번 턴 첫 굴림 여부
    relics: run.relics.map(id => DB.relicById[id]),
    categories: Object.fromEntries(Object.entries(run.categories).map(([k, v]) => [k, [...v]])),
    sealed: {},
    lastUsedCat: null,
    rollsLeft: 0,
    nextTurnRerolls: 0,
    pendingBuff: 0,
    pendingConfuse: 0,                    // 적 혼란 예약 — 다음 턴 시작 시 주사위 잠금 수
    dodgeActive: false,
    buffs: { strength: 0, focus: 0, regen: 0 }, // v0.19: 전투 내 지속 버프 (스택)
    enemies: encounterIds.map((id, i) => spawnEnemy(id, i, scale)),
    lastResult: null,
    lastHits: [],                         // [{uid, amount}] — 연출용
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
    block: 0,                             // 방어: 자기 다음 행동 때까지 피해 흡수
    power: 0,                             // 강화: 이후 모든 공격 피해 +power (전투 내 누적)
    debuffs: { weak: 0, bleed: 0, vulnerable: 0 }, // v0.19: 약화(공격-N)/출혈(행동마다 피해, -1씩 감소)/취약(받는 피해+N)
    patternState: { index: 0, recent: [], count: 0 }, phaseIndex: 0, nextMove: null,
    cooldown: {},                         // v1.01: 행동 id → 다시 쓸 수 있게 되는 턴. moves.*.cooldown 이 없으면 0(제한 없음)
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
  const kept = hasRelic(battle.relics, 'blockKeep') ? battle.player.block : 0;
  battle.player.block = kept + dicePassive(battle, 'turnBlock') + sumRelic(battle.relics, 'turnBlock');
  // 따뜻한 우유·재생 버프: 턴 시작 회복
  const th = sumRelic(battle.relics, 'turnHeal') + battle.buffs.regen;
  if (th > 0) battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + th);
  // 리롤: 기본 + 유물 + 주사위 패시브 + 집중 버프
  battle.rollsLeft = relicValue(battle.relics, 'extraReroll', DB.scoring.rerollsPerTurn)
    + dicePassive(battle, 'extraReroll') + battle.buffs.focus + battle.nextTurnRerolls;
  battle.nextTurnRerolls = 0;
  battle.rolled = false;
  for (const d of battle.dice) { d.held = false; d.face = 0; d.confused = false; }
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
  battle.dice.forEach((d, i) => { d.face = rollFace(battle.diceDefs[i], rng.next); d.held = true; });
  battle.rolled = true;
  return true;
}

// 조작 규칙(v0.6): 기본은 전부 유지, 탭한 주사위(held=false)만 다시 굴린다
export function reroll(battle) {
  if (battle.over || !battle.rolled || battle.await || battle.rollsLeft <= 0) return false;
  if (battle.dice.every(d => d.held)) return false; // 다시 굴릴 주사위 미선택
  battle.rollsLeft -= 1;
  battle.dice.forEach((d, i) => {
    if (!d.held) d.face = rollFace(battle.diceDefs[i], rng.next);
    d.held = true; // 선택 초기화
  });
  return true;
}

export function toggleHold(battle, i) {
  if (battle.over || !battle.rolled || battle.await) return;
  if (battle.dice[i].confused) return; // 혼란 주사위는 다시 굴릴 수 없음
  battle.dice[i].held = !battle.dice[i].held;
}

export function aliveEnemies(battle) { return battle.enemies.filter(e => e.hp > 0); }

export function isAoE(cat) { return cat.target === 'allEnemies'; }

// 보유 중인 변형 정의 (없으면 첫 변형으로 방어)
export function variantOf(cat, variantId) {
  return (cat.variants || []).find(v => v.id === variantId) || (cat.variants || [])[0] || { id: 'none', name: cat.name, ability: [], abilityText: '' };
}

// 저체력 보너스(독사과 등): 조건 충족 시 모든 족보 피해 가산
function situationalFlat(battle) {
  let v = 0;
  for (const r of battle.relics) {
    const h = r.hook;
    if (h.type === 'lowHpDamage' && battle.player.hp <= battle.player.maxHp * h.ratio) v += h.amount;
  }
  return v;
}

// ---------- 미리보기 ----------
// v0.9: 족보당 변형을 여러 개 보유(누적) — 같은 족보의 변형은 목록에서 이웃하게 정렬됨
export function previewAll(battle) {
  const faces = battle.dice.map(d => d.face);
  const situ = situationalFlat(battle);
  const out = [];
  for (const cat of DB.scoring.categories) {
    const ownedList = battle.categories[cat.id];
    if (!ownedList || ownedList.length === 0) continue;
    const bd0 = battle.rolled
      ? computeDamage(cat, faces, battle.diceDefs, battle.relics)
      : { total: 0, isZero: true, base: 0, gold: 0, mult: 1, bonus: 0, flat: 0 };
    const total = bd0.total > 0 ? bd0.total + battle.pendingBuff + situ + battle.buffs.strength : bd0.total;
    const seal = battle.sealed[cat.id] || 0;
    // 성립하지 않는(또는 0점) 족보는 선택 불가
    const locked = seal > 0 || !battle.rolled || total === 0;
    for (const vid of ownedList) {
      out.push({ cat, variant: variantOf(cat, vid), seal, locked, bd: { ...bd0, total } });
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
    const active = ef.when === 'confirm' || (ef.when === 'contribute' && contributing.has(i));
    if (!active) return;
    switch (ef.op) {
      case 'selfDamage':
        battle.player.hp -= ef.amount;
        battle.lastResult.bonusHits.push(`🎲🩸-${ef.amount}`);
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
        for (const t of targets) t.debuffs.vulnerable += ab.amount;
        battle.lastResult.bonusHits.push(`🎯${ab.amount}`);
        break;
    }
  }
}

// 적에게 피해 — 취약(받는 피해 +N) 가산 후 방어(block)가 흡수 (v0.19)
function dealToEnemy(battle, t, amount) {
  const total = amount + (t.debuffs ? t.debuffs.vulnerable : 0);
  const absorbed = Math.min(t.block || 0, total);
  t.block -= absorbed;
  const dealt = total - absorbed;
  t.hp -= dealt;
  battle.lastHits.push({ uid: t.uid, amount: dealt, absorbed, killed: t.hp <= 0 });
}

// ---------- 족보 확정 (플레이어 페이즈) — 사용할 변형을 지정 ----------
export function confirmCategory(battle, catId, variantId, targetUid = null) {
  if (battle.over || !battle.rolled || battle.await) return null;
  const cat = DB.scoring.categories.find(c => c.id === catId);
  const ownedList = battle.categories[catId] || [];
  if (!cat || !ownedList.includes(variantId)) return null;
  const variant = variantOf(cat, variantId);
  if ((battle.sealed[catId] || 0) > 0) return null;

  const alive = aliveEnemies(battle);
  if (alive.length === 0) return null; // v0.32: 전멸 후 중복 확정 가드 (대상 없음)
  let targets;
  if (isAoE(cat)) targets = alive;
  else {
    const t = targetUid ? alive.find(e => e.uid === targetUid) : null;
    targets = [t || alive[0]];
  }

  const faces = battle.dice.map(d => d.face);
  const bd = computeDamage(cat, faces, battle.diceDefs, battle.relics);
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
  battle.lastHits = [];

  if (bd.total > 0) {
    for (const t of targets) dealToEnemy(battle, t, bd.total);
  }

  applyAbility(battle, variant, bd, targets);
  applyDiceEffects(battle, bd);
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
  battle.await = 'enemy';
  return battle.lastResult;
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
  for (const e of aliveEnemies(battle)) {
    if (battle.over) break;
    e.block = 0; // 자기 차례가 돌아오면 이전 방어는 소멸
    // 🩸 출혈: 행동할 때마다 스택만큼 피해(방어 무시), 이후 스택 -1
    if (e.debuffs.bleed > 0) {
      e.hp -= e.debuffs.bleed;
      e.debuffs.bleed -= 1;
      if (e.hp <= 0) continue; // 출혈사 — 행동 없이 쓰러진다
    }
    if (e.stunned) { e.stunned = false; chooseMove(e, battle.turn + 1); continue; }
    for (const ef of e.nextMove.effects) {
      switch (ef.op) {
        case 'damage': {                                   // ⚔️ 공격 (막·계몽 스케일 + 강화 - 약화)
          if (battle.dodgeActive) break;
          let dmg = Math.max(0, Math.round(ef.amount * (e.atkScale || 1)) + (e.power || 0) - e.debuffs.weak);
          const absorbed = Math.min(battle.player.block, dmg);
          battle.player.block -= absorbed;
          dmg -= absorbed;
          if (dmg > 0) {
            battle.player.hp -= dmg;
            if (battle.player.hp <= 0) {
              battle.player.hp = 0; battle.over = true; battle.result = 'defeat';
              return;
            }
          }
          break;
        }
        case 'block':                                      // 🛡 방어
          e.block += ef.amount;
          break;
        case 'confuse':                                    // 🌀 혼란 — 다음 턴 주사위 잠금
          battle.pendingConfuse += ef.amount;
          break;
        case 'empower':                                    // 💪 강화 — 전투 내 공격력 누적
          e.power = (e.power || 0) + ef.amount;
          break;
        case 'heal':                                       // 💚 치료
          e.hp = Math.min(e.maxHpInit, e.hp + ef.amount);
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

// ---------- 적 행동 선택 ----------
function currentPattern(enemy) {
  const def = DB.enemyById[enemy.defId];
  if (!def.phases) return def.pattern;
  const ratio = enemy.hp / enemy.maxHpInit;
  let idx = def.phases.length - 1;
  for (let i = 0; i < def.phases.length; i++) {
    if (ratio > def.phases[i].untilHpRatio) { idx = i; break; }
  }
  if (idx !== enemy.phaseIndex) { enemy.phaseIndex = idx; enemy.patternState = { index: 0, recent: [] }; }
  return def.phases[idx].pattern;
}

// v0.74 트랙 A: 몬스터는 4~6턴마다 한 번 자기 결에 맞는 '힘을 끌어올리는 행동'을 한다.
// 첫 발동 턴도 4~6 사이로 흔들어 매번 같은 턴에 오지 않게 한다. 예고에 그대로 보인다.
function rollSurgeTurn(from, range) {
  const [lo, hi] = range;
  return from + lo + Math.floor(rng.next() * (hi - lo + 1));
}
// v1.01: 행동별 재사용 대기.
//   "moves.bristle.cooldown": 4  → 한 번 쓰면 4턴이 지나야 다시 나온다.
//   값이 없거나 0이면 제한 없음. 해금 턴(minTurn)과 나란히 쓰는 발동 조건이다.
function onCooldown(enemy, id, turn) { return (enemy.cooldown[id] || 0) > turn; }
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
  if (prev && prev.followUp && !prev.chained) {
    const list = Array.isArray(prev.followUp) ? prev.followUp : [prev.followUp];
    for (const fu of list) {
      const target = def.moves[fu.move];
      if (!target) continue;
      if (target.minTurn > turn) continue;   // 후반 전용 기술은 연계로도 앞당겨지지 않는다
      if (onCooldown(enemy, fu.move, turn)) continue;   // 대기 중인 기술은 연계로도 못 당긴다
      if (rng.next() >= (fu.chance != null ? fu.chance : 1)) continue;
      stampCooldown(enemy, def, fu.move, turn);
      enemy.nextMove = { id: fu.move, chained: true, ...def.moves[fu.move] };
      return;
    }
  }
  const sc = DB.acts.surge;
  if (sc && def.surgeMove && !enemy.final) {
    if (enemy.nextSurgeTurn == null) enemy.nextSurgeTurn = rollSurgeTurn(0, sc.firstTurn);
    if (turn >= enemy.nextSurgeTurn) {
      enemy.nextSurgeTurn = rollSurgeTurn(turn, sc.interval);
      enemy.nextMove = { id: '__surge', surging: true, ...def.surgeMove };
      return;
    }
  }
  const st = enemy.patternState;
  st.count = (st.count || 0) + 1;
  // 계몽 패턴: 3번째 행동마다 강력한 계몽 기술 사용
  if (enemy.enlightened && def.enlightenedMove && st.count % 3 === 0) {
    enemy.nextMove = { id: '__enlightened', ...def.enlightenedMove };
    return;
  }
  const pat = currentPattern(enemy);
  let moveId;
  // v0.74 트랙 B: minTurn이 붙은 기술은 그 턴 전에는 아예 나오지 않는다 (긴 싸움에서만 보는 수)
  const unlocked = (id) => !(def.moves[id] && def.moves[id].minTurn > turn) && !onCooldown(enemy, id, turn);
  if (pat.mode === 'sequence') {
    const order = pat.order.filter(unlocked);
    const use = order.length ? order : pat.order;
    moveId = use[st.index % use.length];
    st.index += 1;
  } else {
    const entries = Object.entries(pat.weights).filter(([id]) => {
      if (!unlocked(id)) return false;
      if (!pat.noRepeat) return true;
      const recent = st.recent.slice(-(pat.noRepeat - 1));
      return !(recent.length === pat.noRepeat - 1 && recent.every(r => r === id));
    });
    if (entries.length === 0) entries.push(...Object.entries(pat.weights).filter(([id]) => unlocked(id)));
    if (entries.length === 0) entries.push(...Object.entries(pat.weights));
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let roll = rng.next() * total;
    moveId = entries[entries.length - 1][0];
    for (const [id, w] of entries) { roll -= w; if (roll <= 0) { moveId = id; break; } }
    st.recent.push(moveId);
  }
  stampCooldown(enemy, def, moveId, turn);
  enemy.nextMove = { id: moveId, ...def.moves[moveId] };
}

// 의도 표기 (v0.11): ⚔️공격 / 🛡방어 / 🌀혼란 / 💪강화 / 💚치료 / ❓의문 — 혼합은 병기
export function intentOf(enemy) {
  const mv = enemy.nextMove;
  if (!mv) return '';
  if (enemy.stunned) return '💫';
  if (mv.hidden) return '❓';
  const parts = [];
  const dmg = mv.effects.filter(e => e.op === 'damage')
    .reduce((s, e) => s + Math.max(0, Math.round(e.amount * (enemy.atkScale || 1)) + (enemy.power || 0) - (enemy.debuffs ? enemy.debuffs.weak : 0)), 0);
  if (dmg > 0) parts.push(`⚔️${dmg}`);
  for (const ef of mv.effects) {
    if (ef.op === 'block') parts.push(`🛡${ef.amount}`);
    else if (ef.op === 'confuse') parts.push('🌀');
    else if (ef.op === 'empower') parts.push('💪');
    else if (ef.op === 'heal') parts.push(`💚${ef.amount}`);
  }
  return parts.join(' ') || '💤';
}
