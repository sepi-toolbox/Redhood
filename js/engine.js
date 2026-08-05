// engine.js — 전투 상태 머신 + 효과 DSL 인터프리터
import { DB } from './data.js';

export const rng = { next: Math.random }; // 테스트 시 교체 가능

function ri(min, max) { return min + Math.floor(rng.next() * (max - min + 1)); }
function pick(arr) { return arr[Math.floor(rng.next() * arr.length)]; }

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- 전투 생성 ----------
export function createBattle(run, encounterIds) {
  const weapon = DB.weapons[run.weapon];
  const res = weapon.resource;
  const battle = {
    weaponId: run.weapon,
    over: false, result: null, turn: 1,
    player: {
      hp: run.hp, maxHp: run.maxHp, block: 0, statuses: {},
      resource: res.type === 'frenzy' ? 0 : res.battleStart,
      frenzy: res.type === 'frenzy' ? res.battleStart : 0,
    },
    enemies: encounterIds.map((id, i) => spawnEnemy(id, i)),
    drawPile: shuffle(run.deck.slice()),
    hand: [], discardPile: [], exhaustPile: [],
    log: [],
  };
  startPlayerTurn(battle, true);
  return battle;
}

function spawnEnemy(id, idx) {
  const def = DB.enemyById[id];
  return {
    uid: `${id}_${idx}`, defId: id, name: def.name, tier: def.tier,
    hp: ri(def.hp[0], def.hp[1]), maxHp: 0, block: 0, statuses: {},
    patternState: { index: 0, recent: [] }, phaseIndex: 0, nextMove: null,
  };
}

// ---------- 턴 흐름 ----------
function startPlayerTurn(battle, first = false) {
  const p = battle.player;
  p.block = 0;
  const res = DB.weapons[battle.weaponId].resource;
  if (res.type !== 'frenzy' && res.turnStartGain > 0) {
    p.resource = Math.min(res.max, p.resource + res.turnStartGain);
  }
  for (const e of battle.enemies) chooseMove(battle, e);
  draw(battle, 5);
  if (first) battle.log.push('전투 시작.');
}

export function endTurn(battle) {
  if (battle.over) return;
  // 플레이어 턴 종료: 손패 버림, 화상, 열광 폭주 자해, 상태 감쇠
  const p = battle.player;
  battle.discardPile.push(...battle.hand); battle.hand = [];
  if (p.statuses.burn) loseHp(battle, p, p.statuses.burn, '화상');
  const stage = frenzyStage(battle);
  if (stage && stage.effects && stage.effects.turnEndSelfDamage) {
    loseHp(battle, p, stage.effects.turnEndSelfDamage, '폭주');
  }
  decayStatuses(p);
  if (battle.over) return;

  // 적 턴
  for (const e of battle.enemies) {
    if (e.hp <= 0 || battle.over) continue;
    e.block = 0;
    if (e.statuses.bleed) loseHp(battle, e, 1, '출혈');
    if (e.hp <= 0) continue;
    execMoveEffects(battle, e, e.nextMove);
    if (e.statuses.burn) loseHp(battle, e, e.statuses.burn, '화상');
    decayStatuses(e);
  }
  battle.enemies = battle.enemies.filter(e => e.hp > 0);
  if (checkBattleEnd(battle)) return;

  battle.turn += 1;
  startPlayerTurn(battle);
}

function decayStatuses(unit) {
  for (const key of Object.keys(unit.statuses)) {
    const decay = (DB.statuses[key] && DB.statuses[key].decay) || 0;
    if (decay > 0) {
      unit.statuses[key] -= decay;
      if (unit.statuses[key] <= 0) delete unit.statuses[key];
    }
  }
}

// ---------- 카드 사용 ----------
export function canPlay(battle, card) {
  if (battle.over) return false;
  const res = DB.weapons[battle.weaponId].resource;
  if (res.type === 'frenzy') return true; // 낫: 항상 사용 가능, 대가는 열광
  return battle.player.resource >= card.cost;
}

export function playCard(battle, handIndex, targetUid = null) {
  const card = battle.hand[handIndex];
  if (!card || !canPlay(battle, card)) return false;
  const p = battle.player;
  const res = DB.weapons[battle.weaponId].resource;

  const context = { ammoBefore: p.resource };
  if (res.type === 'frenzy') {
    const delta = (card.cost || 0) + (card.frenzy || 0);
    p.frenzy = Math.max(0, Math.min(DB.frenzy.max, p.frenzy + delta));
  } else {
    p.resource -= card.cost;
  }

  if (p.statuses.bleed) loseHp(battle, p, 1, '출혈');

  battle.hand.splice(handIndex, 1);
  const target = targetUid ? battle.enemies.find(e => e.uid === targetUid) : battle.enemies[0];
  if (!battle.over) execCardEffects(battle, card, target, context);

  if ((card.keywords || []).includes('exhaust')) battle.exhaustPile.push(card);
  else battle.discardPile.push(card);

  battle.enemies = battle.enemies.filter(e => e.hp > 0);
  if (checkBattleEnd(battle)) return true;

  // 열광 한계 트리거
  if (res.type === 'frenzy' && p.frenzy >= DB.frenzy.max) {
    const limit = DB.frenzy.stages.find(s => s.id === 'limit');
    battle.log.push('한계 돌파! 손패를 모두 잃고 턴이 끝난다.');
    if (limit.trigger.discardHand) { battle.discardPile.push(...battle.hand); battle.hand = []; }
    p.frenzy = limit.trigger.setFrenzy;
    if (limit.trigger.endTurn) endTurn(battle);
  }
  return true;
}

function execCardEffects(battle, card, target, ctx) {
  for (const ef of card.effects) {
    if (battle.over) return;
    switch (ef.op) {
      case 'damage':
        dealAttack(battle, battle.player, targetsOf(battle, card, target), ef.amount, ef.times || 1);
        break;
      case 'damageIfLastAmmo': {
        const amt = ctx.ammoBefore - card.cost <= 0 ? ef.amount : ef.fallback;
        dealAttack(battle, battle.player, targetsOf(battle, card, target), amt, 1);
        break;
      }
      case 'damagePerFrenzy':
        dealAttack(battle, battle.player, targetsOf(battle, card, target), battle.player.frenzy * ef.perStack, 1);
        break;
      case 'block': gainBlock(battle.player, ef.amount, battle); break;
      case 'draw': draw(battle, ef.amount); break;
      case 'gainResource': {
        const res = DB.weapons[battle.weaponId].resource;
        if (res.type !== 'frenzy') battle.player.resource = Math.min(res.max, battle.player.resource + ef.amount);
        break;
      }
      case 'applyStatus': applyStatusFromCard(battle, ef, target); break;
      case 'heal': battle.player.hp = Math.min(battle.player.maxHp, battle.player.hp + ef.amount); break;
      case 'setFrenzy': battle.player.frenzy = Math.max(0, Math.min(DB.frenzy.max, ef.value)); break;
      case 'discardHand': battle.discardPile.push(...battle.hand); battle.hand = []; break;
      case 'selfDamage': loseHp(battle, battle.player, ef.amount, '자해'); break;
      default: console.warn('알 수 없는 op:', ef.op);
    }
  }
}

function targetsOf(battle, card, target) {
  if (card.target === 'allEnemies') return battle.enemies.filter(e => e.hp > 0);
  return target && target.hp > 0 ? [target] : battle.enemies.filter(e => e.hp > 0).slice(0, 1);
}

function applyStatusFromCard(battle, ef, target) {
  let units;
  if (ef.target === 'self') units = [battle.player];
  else if (ef.target === 'allEnemies') units = battle.enemies.filter(e => e.hp > 0);
  else units = target && target.hp > 0 ? [target] : [];
  for (const u of units) u.statuses[ef.status] = (u.statuses[ef.status] || 0) + ef.stacks;
}

// ---------- 적 행동 ----------
function currentPattern(battle, enemy) {
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

function chooseMove(battle, enemy) {
  const def = DB.enemyById[enemy.defId];
  if (!enemy.maxHpInit) enemy.maxHpInit = enemy.hp;
  const pat = currentPattern(battle, enemy);
  const st = enemy.patternState;
  let moveId;
  if (pat.mode === 'sequence') {
    moveId = pat.order[st.index % pat.order.length];
    st.index += 1;
  } else {
    const entries = Object.entries(pat.weights).filter(([id]) => {
      if (!pat.noRepeat) return true;
      const recent = st.recent.slice(-pat.noRepeat + 1);
      return !(recent.length === pat.noRepeat - 1 && recent.every(r => r === id) && recent.length > 0);
    });
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let roll = rng.next() * total;
    moveId = entries[entries.length - 1][0];
    for (const [id, w] of entries) { roll -= w; if (roll <= 0) { moveId = id; break; } }
    st.recent.push(moveId);
  }
  enemy.nextMove = { id: moveId, ...def.moves[moveId] };
}

function execMoveEffects(battle, enemy, move) {
  for (const ef of move.effects) {
    if (battle.over) return;
    switch (ef.op) {
      case 'damage': dealAttack(battle, enemy, [battle.player], ef.amount, ef.times || 1); break;
      case 'block': gainBlock(enemy, ef.amount, battle); break;
      case 'applyStatus': {
        const unit = ef.target === 'self' ? enemy : battle.player;
        unit.statuses[ef.status] = (unit.statuses[ef.status] || 0) + ef.stacks;
        break;
      }
      case 'heal': enemy.hp = Math.min(enemy.maxHpInit || enemy.hp, enemy.hp + ef.amount); break;
      default: console.warn('알 수 없는 적 op:', ef.op);
    }
  }
}

// ---------- 피해 계산 ----------
export function previewMoveDamage(battle, enemy) {
  // 의도 표시용: 피해 op 합산 (힘/약화/취약/열광 반영)
  let total = 0, hits = 0, per = 0;
  for (const ef of (enemy.nextMove ? enemy.nextMove.effects : [])) {
    if (ef.op !== 'damage') continue;
    const times = ef.times || 1;
    per = calcDamage(battle, enemy, battle.player, ef.amount);
    hits += times; total += per * times;
  }
  return hits > 1 ? `${per}×${hits}` : hits === 1 ? `${total}` : null;
}

function calcDamage(battle, attacker, defender, base) {
  let amt = base + (attacker.statuses.strength || 0);
  if (attacker.statuses.weak) amt = Math.floor(amt * 0.75);
  if (defender.statuses.vulnerable) amt = Math.floor(amt * 1.5);
  if (defender === battle.player) {
    const stage = frenzyStage(battle);
    if (stage && stage.effects && stage.effects.damageTakenMult) {
      amt = Math.floor(amt * stage.effects.damageTakenMult);
    }
  }
  return Math.max(0, amt);
}

function dealAttack(battle, attacker, defenders, base, times) {
  for (let t = 0; t < times; t++) {
    for (const d of defenders) {
      if (battle.over || d.hp <= 0) continue;
      const amt = calcDamage(battle, attacker, d, base);
      const absorbed = Math.min(d.block, amt);
      d.block -= absorbed;
      const hpLoss = amt - absorbed;
      if (hpLoss > 0) loseHp(battle, d, hpLoss, null);
    }
  }
}

function gainBlock(unit, amount, battle) { unit.block += amount; }

function loseHp(battle, unit, amount, source) {
  unit.hp -= amount;
  if (unit === battle.player && unit.hp <= 0) {
    unit.hp = 0; battle.over = true; battle.result = 'defeat';
  }
}

export function frenzyStage(battle) {
  if (DB.weapons[battle.weaponId].resource.type !== 'frenzy') return null;
  const f = battle.player.frenzy;
  return DB.frenzy.stages.find(s => f >= s.range[0] && f <= s.range[1]) || null;
}

// ---------- 드로우 / 종료 ----------
function draw(battle, n) {
  for (let i = 0; i < n; i++) {
    if (battle.hand.length >= 10) return;
    if (battle.drawPile.length === 0) {
      if (battle.discardPile.length === 0) return;
      battle.drawPile = shuffle(battle.discardPile); battle.discardPile = [];
    }
    battle.hand.push(battle.drawPile.pop());
  }
}

function checkBattleEnd(battle) {
  if (battle.result === 'defeat') return true;
  if (battle.enemies.every(e => e.hp <= 0) || battle.enemies.length === 0) {
    battle.over = true; battle.result = 'victory';
    return true;
  }
  return false;
}
