// engine.js — 전투 상태 머신 v0.5: 다중 적, 단일/전체 공격, 굴림 페이즈 분리
import { DB } from './data.js';
import { computeDamage, rollFace, relicValue } from './yahtzee.js';

export const rng = { next: Math.random };

function ri(min, max) { return min + Math.floor(rng.next() * (max - min + 1)); }

// ---------- 전투 생성 ----------
export function createBattle(run, encounterIds) {
  const scale = 1 + (DB.act1.hpScalePerFloor || 0) * (run.floor - 1);
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
    upperTotal: 0,
    upperBonusFired: false,
    enemies: encounterIds.map((id, i) => spawnEnemy(id, i, scale)),
    lastResult: null,
    lastHits: [],                         // [{uid, amount}] — 연출용
  };
  for (const e of battle.enemies) chooseMove(e);
  startTurn(battle, true);
  return battle;
}

function spawnEnemy(id, idx, scale) {
  const def = DB.enemyById[id];
  const hp = Math.round(ri(def.hp[0], def.hp[1]) * scale);
  return {
    uid: `${id}_${idx}`, defId: id, name: def.name, tier: def.tier,
    hp, maxHpInit: hp, stunned: false,
    block: 0,                             // 방어: 자기 다음 행동 때까지 피해 흡수
    power: 0,                             // 강화: 이후 모든 공격 피해 +power (전투 내 누적)
    patternState: { index: 0, recent: [] }, phaseIndex: 0, nextMove: null,
  };
}

// ---------- 턴 ----------
function startTurn(battle, first = false) {
  if (!first) {
    for (const id of Object.keys(battle.sealed)) {
      battle.sealed[id] -= 1;
      if (battle.sealed[id] <= 0) delete battle.sealed[id];
    }
  }
  battle.player.block = dicePassive(battle, 'turnBlock'); // 패시브 주사위(가시덤불 등): 턴 시작 방어
  battle.rollsLeft = relicValue(battle.relics, 'extraReroll', DB.scoring.rerollsPerTurn)
    + dicePassive(battle, 'extraReroll') + battle.nextTurnRerolls;
  battle.nextTurnRerolls = 0;
  battle.rolled = false;
  for (const d of battle.dice) { d.held = false; d.face = 0; d.confused = false; }
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

// ---------- 미리보기 ----------
// v0.9: 족보당 변형을 여러 개 보유(누적) — 같은 족보의 변형은 목록에서 이웃하게 정렬됨
export function previewAll(battle) {
  const faces = battle.dice.map(d => d.face);
  const out = [];
  for (const cat of DB.scoring.categories) {
    const ownedList = battle.categories[cat.id];
    if (!ownedList || ownedList.length === 0) continue;
    const bd0 = battle.rolled
      ? computeDamage(cat, faces, battle.diceDefs, battle.relics)
      : { total: 0, isZero: true, base: 0, gold: 0, mult: 1, bonus: 0, flat: 0 };
    const total = bd0.total > 0 ? bd0.total + battle.pendingBuff : bd0.total;
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
    }
  }
}

// 적에게 피해 — 방어(block)가 먼저 흡수 (v0.11)
function dealToEnemy(battle, t, amount) {
  const absorbed = Math.min(t.block || 0, amount);
  t.block -= absorbed;
  const dealt = amount - absorbed;
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
  let targets;
  if (isAoE(cat)) targets = alive;
  else {
    const t = targetUid ? alive.find(e => e.uid === targetUid) : null;
    targets = [t || alive[0]];
  }

  const faces = battle.dice.map(d => d.face);
  const bd = computeDamage(cat, faces, battle.diceDefs, battle.relics);
  if (bd.total === 0) return null; // 성립 불가 족보는 확정 불가 (0점 버리기 폐지)
  if (bd.total > 0 && battle.pendingBuff > 0) {
    bd.total += battle.pendingBuff;
    bd.flat += battle.pendingBuff;
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

  // 상단 보너스 — 발동분은 같은 대상(들)에게
  if (cat.kind === 'upper') {
    battle.upperTotal += bd.base;
    const cfg = DB.scoring.upperBonus;
    const threshold = relicValue(battle.relics, 'upperBonusThreshold', cfg.threshold);
    if (cfg.repeat) {
      while (battle.upperTotal >= threshold) {
        battle.upperTotal -= threshold;
        for (const t of targets) {
          if (t.hp > 0 || battle.lastHits.some(h => h.uid === t.uid)) {
            dealToEnemy(battle, t, cfg.damage);
          }
        }
        battle.lastResult.bonusHits.push(`상단 보너스 ${cfg.damage}!`);
      }
    } else if (!battle.upperBonusFired && battle.upperTotal >= threshold) {
      battle.upperBonusFired = true;
      for (const t of targets) dealToEnemy(battle, t, cfg.damage);
      battle.lastResult.bonusHits.push(`상단 보너스 ${cfg.damage}!`);
    }
  }

  if (aliveEnemies(battle).length === 0) {
    battle.over = true; battle.result = 'victory';
    return battle.lastResult;
  }
  battle.await = 'enemy';
  return battle.lastResult;
}

// ---------- 적 페이즈 ----------
export function enemyPhase(battle) {
  if (battle.over || battle.await !== 'enemy') return;
  battle.lastHits = []; // 사체 연출 종료 — 다음 렌더부터 죽은 적 제거
  for (const e of aliveEnemies(battle)) {
    if (battle.over) break;
    e.block = 0; // 자기 차례가 돌아오면 이전 방어는 소멸
    if (e.stunned) { e.stunned = false; chooseMove(e); continue; }
    for (const ef of e.nextMove.effects) {
      switch (ef.op) {
        case 'damage': {                                   // ⚔️ 공격 (+강화 누적분)
          if (battle.dodgeActive) break;
          let dmg = ef.amount + (e.power || 0);
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
    chooseMove(e);
  }
  battle.dodgeActive = false;
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

function chooseMove(enemy) {
  const def = DB.enemyById[enemy.defId];
  const pat = currentPattern(enemy);
  const st = enemy.patternState;
  let moveId;
  if (pat.mode === 'sequence') {
    moveId = pat.order[st.index % pat.order.length];
    st.index += 1;
  } else {
    const entries = Object.entries(pat.weights).filter(([id]) => {
      if (!pat.noRepeat) return true;
      const recent = st.recent.slice(-(pat.noRepeat - 1));
      return !(recent.length === pat.noRepeat - 1 && recent.every(r => r === id));
    });
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let roll = rng.next() * total;
    moveId = entries[entries.length - 1][0];
    for (const [id, w] of entries) { roll -= w; if (roll <= 0) { moveId = id; break; } }
    st.recent.push(moveId);
  }
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
    .reduce((s, e) => s + e.amount + (enemy.power || 0), 0);
  if (dmg > 0) parts.push(`⚔️${dmg}`);
  for (const ef of mv.effects) {
    if (ef.op === 'block') parts.push(`🛡${ef.amount}`);
    else if (ef.op === 'confuse') parts.push('🌀');
    else if (ef.op === 'empower') parts.push('💪');
    else if (ef.op === 'heal') parts.push(`💚${ef.amount}`);
  }
  return parts.join(' ') || '💤';
}
