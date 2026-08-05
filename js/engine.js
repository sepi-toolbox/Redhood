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
    categories: { ...run.categories },
    sealed: {},
    lastUsedCat: null,
    rollsLeft: 0,
    nextTurnRerolls: 0,
    pendingBuff: 0,
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
  battle.player.block = 0;
  battle.rollsLeft = relicValue(battle.relics, 'extraReroll', DB.scoring.rerollsPerTurn) + battle.nextTurnRerolls;
  battle.nextTurnRerolls = 0;
  battle.rolled = false;
  for (const d of battle.dice) { d.held = false; d.face = 0; }
}

export function initialRoll(battle) {
  if (battle.over || battle.rolled || battle.await) return false;
  battle.dice.forEach((d, i) => { d.face = rollFace(battle.diceDefs[i], rng.next); });
  battle.rolled = true;
  return true;
}

export function reroll(battle) {
  if (battle.over || !battle.rolled || battle.await || battle.rollsLeft <= 0) return false;
  if (battle.dice.every(d => d.held)) return false;
  battle.rollsLeft -= 1;
  battle.dice.forEach((d, i) => { if (!d.held) d.face = rollFace(battle.diceDefs[i], rng.next); });
  return true;
}

export function toggleHold(battle, i) {
  if (battle.over || !battle.rolled || battle.await) return;
  battle.dice[i].held = !battle.dice[i].held;
}

export function aliveEnemies(battle) { return battle.enemies.filter(e => e.hp > 0); }

export function isAoE(cat) { return cat.target === 'allEnemies'; }

// ---------- 미리보기 ----------
export function previewAll(battle) {
  const faces = battle.dice.map(d => d.face);
  return DB.scoring.categories
    .filter(cat => battle.categories[cat.id])
    .map(cat => {
      const level = battle.categories[cat.id];
      const seal = battle.sealed[cat.id] || 0;
      const bd = battle.rolled
        ? computeDamage(cat, faces, battle.diceDefs, battle.relics, level)
        : { total: 0, isZero: true, base: 0, gold: 0, mult: 1, bonus: 0, flat: 0, level };
      const total = bd.total > 0 ? bd.total + battle.pendingBuff : bd.total;
      // 성립하지 않는(또는 0점) 족보는 선택 불가
      return { cat, level, seal, locked: seal > 0 || !battle.rolled || total === 0, bd: { ...bd, total } };
    });
}

// ---------- 부가 능력 ----------
function applyAbility(battle, cat, bd, targets) {
  for (const ab of (cat.ability || [])) {
    switch (ab.op) {
      case 'block': {
        const amt = ab.amount !== undefined ? ab.amount : bd.total * (ab.scoreMult || 1);
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
        const n = Object.keys(battle.sealed).length;
        battle.sealed = {};
        if (n > 0) battle.lastResult.bonusHits.push('봉인 해제!');
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

// ---------- 족보 확정 (플레이어 페이즈) ----------
export function confirmCategory(battle, catId, targetUid = null) {
  if (battle.over || !battle.rolled || battle.await) return null;
  const cat = DB.scoring.categories.find(c => c.id === catId);
  const level = battle.categories[catId];
  if (!cat || !level) return null;
  if ((battle.sealed[catId] || 0) > 0) return null;

  const alive = aliveEnemies(battle);
  let targets;
  if (isAoE(cat)) targets = alive;
  else {
    const t = targetUid ? alive.find(e => e.uid === targetUid) : null;
    targets = [t || alive[0]];
  }

  const faces = battle.dice.map(d => d.face);
  const bd = computeDamage(cat, faces, battle.diceDefs, battle.relics, level);
  if (bd.total === 0) return null; // 성립 불가 족보는 확정 불가 (0점 버리기 폐지)
  if (bd.total > 0 && battle.pendingBuff > 0) {
    bd.total += battle.pendingBuff;
    bd.flat += battle.pendingBuff;
    battle.pendingBuff = 0;
  }
  battle.lastResult = { catName: cat.name, ...bd, bonusHits: [] };
  battle.lastUsedCat = catId;
  battle.lastHits = [];

  if (bd.total > 0) {
    for (const t of targets) {
      t.hp -= bd.total;
      battle.lastHits.push({ uid: t.uid, amount: bd.total, killed: t.hp <= 0 });
    }
  }

  applyAbility(battle, cat, bd, targets);

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
            t.hp -= cfg.damage;
            battle.lastHits.push({ uid: t.uid, amount: cfg.damage, killed: t.hp <= 0 });
          }
        }
        battle.lastResult.bonusHits.push(`상단 보너스 ${cfg.damage}!`);
      }
    } else if (!battle.upperBonusFired && battle.upperTotal >= threshold) {
      battle.upperBonusFired = true;
      for (const t of targets) t.hp -= cfg.damage;
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
  for (const e of aliveEnemies(battle)) {
    if (battle.over) break;
    if (e.stunned) { e.stunned = false; chooseMove(e); continue; }
    for (const ef of e.nextMove.effects) {
      if (ef.op === 'damage') {
        if (battle.dodgeActive) continue;
        let dmg = ef.amount;
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
      } else if (ef.op === 'seal') {
        const owned = Object.keys(battle.categories);
        const target = battle.lastUsedCat && battle.categories[battle.lastUsedCat]
          ? battle.lastUsedCat
          : owned[Math.floor(rng.next() * owned.length)];
        if (target) battle.sealed[target] = Math.max(battle.sealed[target] || 0, ef.turns + 1);
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

export function intentOf(enemy) {
  const mv = enemy.nextMove;
  if (!mv) return '';
  if (enemy.stunned) return '💫';
  const dmg = mv.effects.filter(e => e.op === 'damage').reduce((s, e) => s + e.amount, 0);
  if (dmg > 0) return `⚔️${dmg}`;
  if (mv.effects.some(e => e.op === 'seal')) return '🔒';
  return '💤';
}
