// engine.js — 전투 상태 머신 v0.4: 부가 능력(방어/회피/스턴/해제/충전/회복/리롤)
import { DB } from './data.js';
import { computeDamage, rollFace, relicValue } from './yahtzee.js';

export const rng = { next: Math.random };

function ri(min, max) { return min + Math.floor(rng.next() * (max - min + 1)); }

// ---------- 전투 생성 ----------
export function createBattle(run, encounterIds) {
  const enemyDef = DB.enemyById[encounterIds[0]];
  const scale = 1 + (DB.act1.hpScalePerFloor || 0) * (run.floor - 1);
  const battle = {
    over: false, result: null, turn: 1,
    player: { hp: run.hp, maxHp: run.maxHp, block: 0 },
    diceDefs: run.dice.map(id => DB.diceById[id]),
    dice: run.dice.map(() => ({ face: 1, held: false })),
    relics: run.relics.map(id => DB.relicById[id]),
    categories: { ...run.categories },   // id -> level
    sealed: {},                           // id -> 남은 턴
    lastUsedCat: null,
    rollsLeft: 0,
    nextTurnRerolls: 0,                   // rerollNext 능력 누적분
    pendingBuff: 0,                       // buffNext 능력 (다음 확정 피해 +N)
    dodgeActive: false,                   // 이번 적 행동 피해 무효
    stunActive: false,                    // 이번 적 행동 전체 취소
    upperTotal: 0,
    upperBonusFired: false,
    enemy: {
      defId: enemyDef.id, name: enemyDef.name, tier: enemyDef.tier,
      hp: Math.round(ri(enemyDef.hp[0], enemyDef.hp[1]) * scale), maxHpInit: 0,
      patternState: { index: 0, recent: [] }, phaseIndex: 0, nextMove: null,
    },
    lastResult: null,
  };
  battle.enemy.maxHpInit = battle.enemy.hp;
  chooseMove(battle.enemy);
  startTurn(battle, true);
  return battle;
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
  for (const d of battle.dice) d.held = false;
  rollDice(battle, true);
}

function rollDice(battle, all = false) {
  battle.dice.forEach((d, i) => {
    if (all || !d.held) d.face = rollFace(battle.diceDefs[i], rng.next);
  });
}

export function reroll(battle) {
  if (battle.over || battle.rollsLeft <= 0) return false;
  if (battle.dice.every(d => d.held)) return false;
  battle.rollsLeft -= 1;
  rollDice(battle);
  return true;
}

export function toggleHold(battle, i) {
  if (battle.over) return;
  battle.dice[i].held = !battle.dice[i].held;
}

// ---------- 미리보기 (소유 족보만) ----------
export function previewAll(battle) {
  const faces = battle.dice.map(d => d.face);
  return DB.scoring.categories
    .filter(cat => battle.categories[cat.id])
    .map(cat => {
      const level = battle.categories[cat.id];
      const seal = battle.sealed[cat.id] || 0;
      const bd = computeDamage(cat, faces, battle.diceDefs, battle.relics, level);
      const total = bd.total > 0 ? bd.total + battle.pendingBuff : bd.total;
      return { cat, level, seal, locked: seal > 0, bd: { ...bd, total } };
    });
}

// ---------- 부가 능력 ----------
function applyAbility(battle, cat, bd) {
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
        battle.stunActive = true;
        battle.lastResult.bonusHits.push('적 행동 취소!');
        break;
      case 'dodge':
        battle.dodgeActive = true;
        battle.lastResult.bonusHits.push('회피!');
        break;
    }
  }
}

// ---------- 족보 확정 ----------
export function confirmCategory(battle, catId) {
  if (battle.over) return null;
  const cat = DB.scoring.categories.find(c => c.id === catId);
  const level = battle.categories[catId];
  if (!cat || !level) return null;
  if ((battle.sealed[catId] || 0) > 0) return null;

  const faces = battle.dice.map(d => d.face);
  const bd = computeDamage(cat, faces, battle.diceDefs, battle.relics, level);
  if (bd.total > 0 && battle.pendingBuff > 0) {
    bd.total += battle.pendingBuff;
    bd.flat += battle.pendingBuff;
    battle.pendingBuff = 0;
  }
  battle.lastResult = { catName: cat.name, ...bd, bonusHits: [] };
  battle.lastUsedCat = catId;

  if (bd.total > 0) battle.enemy.hp -= bd.total;

  if (bd.isZero) {
    // 0점 버리기: 부가 능력 미발동 (빵부스러기만)
    const heal = battle.relics.filter(r => r.hook.type === 'healOnZero')
      .reduce((s, r) => s + r.hook.amount, 0);
    if (heal > 0) {
      battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + heal);
      battle.lastResult.bonusHits.push(`HP +${heal}`);
    }
  } else {
    applyAbility(battle, cat, bd);
  }

  // 상단 보너스 (기본 점수 기준). repeat: 누적이 기준을 넘을 때마다 발동, 초과분 이월
  if (cat.kind === 'upper') {
    battle.upperTotal += bd.base;
    const cfg = DB.scoring.upperBonus;
    const threshold = relicValue(battle.relics, 'upperBonusThreshold', cfg.threshold);
    if (cfg.repeat) {
      while (battle.upperTotal >= threshold) {
        battle.upperTotal -= threshold;
        battle.enemy.hp -= cfg.damage;
        battle.lastResult.bonusHits.push(`상단 보너스 ${cfg.damage}!`);
      }
    } else if (!battle.upperBonusFired && battle.upperTotal >= threshold) {
      battle.upperBonusFired = true;
      battle.enemy.hp -= cfg.damage;
      battle.lastResult.bonusHits.push(`상단 보너스 ${cfg.damage}!`);
    }
  }

  if (battle.enemy.hp <= 0) {
    battle.enemy.hp = 0; battle.over = true; battle.result = 'victory';
    return battle.lastResult;
  }

  enemyAct(battle);
  battle.dodgeActive = false;
  battle.stunActive = false;
  if (battle.over) return battle.lastResult;

  battle.turn += 1;
  startTurn(battle);
  return battle.lastResult;
}

// ---------- 적 ----------
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

function enemyAct(battle) {
  const e = battle.enemy;
  if (!battle.stunActive) {
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
      // 'charge' = 행동 없음
    }
  }
  chooseMove(e);
}

export function intentOf(battle) {
  const mv = battle.enemy.nextMove;
  if (!mv) return '';
  const dmg = mv.effects.filter(e => e.op === 'damage').reduce((s, e) => s + e.amount, 0);
  if (dmg > 0) return `⚔️${dmg}`;
  if (mv.effects.some(e => e.op === 'seal')) return '🔒';
  return '💤';
}
