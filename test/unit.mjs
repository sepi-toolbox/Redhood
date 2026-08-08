// unit.mjs — yahtzee.js 순수 함수 단위 검증 (node test/unit.mjs)
import { evalCategory, computeDamage } from '../js/yahtzee.js';

let fails = 0;
function eq(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ' (기대: ' + JSON.stringify(expected) + ')'}`);
  if (!ok) fails++;
}

const C = {
  onePair: { id: 'onePair', kind: 'ofKind', count: 2, score: 'matchedSum', mult: 1 },
  threeKind: { id: 'threeKind', kind: 'ofKind', count: 3, score: 'matchedSum', mult: 1.5 },
  fourKind: { id: 'fourKind', kind: 'ofKind', count: 4, score: 'matchedSum', mult: 3 },
  fullHouse: { id: 'fullHouse', kind: 'fullHouse', score: 35 },
  small: { id: 'smallStraight', kind: 'straight', length: 4, score: 28 },
  large: { id: 'largeStraight', kind: 'straight', length: 5, score: 60 },
  yahtzee: { id: 'yahtzee', kind: 'ofKind', count: 5, score: 70 },
  chance: { id: 'chance', kind: 'chance', score: 'sumTop3' },
  chanceD: { id: 'chance', kind: 'chance', score: 'sumTop3Distinct' },
  noPair: { id: 'chance', kind: 'chance', score: 'highestDie' },
  twoPair: { id: 'twoPair', kind: 'twoPair', score: 'matchedSum', mult: 1.25 },
};
const N = { faces: [1, 2, 3, 4, 5, 6] };
const G = { faces: [1, 2, 3, 4, 5, 6], gold: true };
const plain5 = [N, N, N, N, N];

// 판정
eq('야찌 [3,3,3,3,3]', evalCategory(C.yahtzee, [3, 3, 3, 3, 3]).base, 70);
eq('풀하우스 [2,2,3,3,3]', evalCategory(C.fullHouse, [2, 2, 3, 3, 3]).base, 35);
eq('풀하우스 실패 [2,2,3,3,4]', evalCategory(C.fullHouse, [2, 2, 3, 3, 4]).valid, false);
eq('풀하우스=야찌 인정 [4,4,4,4,4]', evalCategory(C.fullHouse, [4, 4, 4, 4, 4]).base, 35);
eq('스몰 [1,2,3,4,6]', evalCategory(C.small, [1, 2, 3, 4, 6]).base, 28);
eq('스몰 실패 [1,2,4,5,6]는 4연속? (2,4,5,6→3연속)', evalCategory(C.small, [1, 2, 4, 5, 6]).valid, false);
eq('라지 [2,3,4,5,6]', evalCategory(C.large, [2, 3, 4, 5, 6]).base, 60);
eq('트리플 [4,4,4,2,1] 매칭합×1.5', evalCategory(C.threeKind, [4, 4, 4, 2, 1]).base, 18);
eq('포카드 [5,5,5,5,2] 매칭합×3', evalCategory(C.fourKind, [5, 5, 5, 5, 2]).base, 60);
eq('포카드 실패 [4,4,4,2,1]', evalCategory(C.fourKind, [4, 4, 4, 2, 1]).valid, false);
eq('원페어 [5,5,4,2,1] → 10', evalCategory(C.onePair, [5, 5, 4, 2, 1]).base, 10);
eq('원페어 [5,5,5,2,1] 매칭 전부 → 15', evalCategory(C.onePair, [5, 5, 5, 2, 1]).base, 15);
eq('원페어 실패 [1,2,3,4,6]', evalCategory(C.onePair, [1, 2, 3, 4, 6]).valid, false);
eq('찬스 [6,6,5,4,1] 상위3합', evalCategory(C.chance, [6, 6, 5, 4, 1]).base, 17);
eq('트리플 ×1.5 내림 [3,3,3,1,2] → 13', evalCategory(C.threeKind, [3, 3, 3, 1, 2]).base, 13);
// v0.15 찬스 개정: 서로 다른 눈 상위 3합 — 뭉칠수록 약해진다
eq('찬스(개정) [6,6,5,4,1] → 6+5+4', evalCategory(C.chanceD, [6, 6, 5, 4, 1]).base, 15);
eq('찬스(개정) [6,6,6,6,6] → 6', evalCategory(C.chanceD, [6, 6, 6, 6, 6]).base, 6);
eq('찬스(개정) [6,6,4,4,2] → 12', evalCategory(C.chanceD, [6, 6, 4, 4, 2]).base, 12);
eq('찬스(개정) 기여 3개(중복 제외)', evalCategory(C.chanceD, [6, 6, 5, 4, 1]).contributing.length, 3);
// v0.17 투페어: 서로 다른 눈 2쌍 — 두 쌍의 합 ×1.25 내림
eq('투페어 [5,5,3,3,1] → floor(16×1.25)=20', evalCategory(C.twoPair, [5, 5, 3, 3, 1]).base, 20);
eq('투페어 실패 [5,5,3,2,1]', evalCategory(C.twoPair, [5, 5, 3, 2, 1]).valid, false);
eq('풀하우스도 투페어 인정 [4,4,4,2,2] → floor(12×1.25)=15', evalCategory(C.twoPair, [4, 4, 4, 2, 2]).base, 15);
eq('포카드는 투페어 불인정 [4,4,4,4,1]', evalCategory(C.twoPair, [4, 4, 4, 4, 1]).valid, false);
eq('투페어 기여 4개', evalCategory(C.twoPair, [5, 5, 3, 3, 1]).contributing.length, 4);
eq('세 쌍이면 높은 두 쌍 [6,6,5,5,1... 아님 2,2,x] → [2,2,5,5,6은 불가] 검증 생략', 1, 1);
// v0.16 노페어: 가장 높은 눈 하나
eq('노페어 [6,4,3,2,1] → 6', evalCategory(C.noPair, [6, 4, 3, 2, 1]).base, 6);
eq('노페어 [2,2,1,1,1] → 2', evalCategory(C.noPair, [2, 2, 1, 1, 1]).base, 2);
eq('노페어 기여 주사위 1개', evalCategory(C.noPair, [6, 4, 3, 2, 1]).contributing.length, 1);
eq('금박 노페어 기여: [6,..] 0번 금박 → 6+6=12', computeDamage(C.noPair, [6, 4, 3, 2, 1], [G, N, N, N, N], []).total, 12);
// 금박이 개정 찬스의 채택 눈에 기여: [6,6,5,4,1] 0번(눈6 채택) → 15+6=21
eq('금박 찬스(개정) 기여', computeDamage(C.chanceD, [6, 6, 5, 4, 1], [G, N, N, N, N], []).total, 21);

// 금박·유물 결합: (기본+금박)×배수+가산
const silver = { hook: { type: 'categoryMult', category: 'fourKind', mult: 2 } };
const fang = { hook: { type: 'flatDamage', amount: 3 } };
const charm = { hook: { type: 'categoryBonus', category: 'fullHouse', bonus: 15 } };

// 포카드 [4,4,4,4,1] ×3=48, 은탄환(×2)=96, 금박 0번(눈4 기여) +4 → (48+4)×2+3 = 107
eq('은탄환+금박+이빨 포카드', computeDamage(C.fourKind, [4, 4, 4, 4, 1], [G, N, N, N, N], [silver, fang]).total, 107);
// 금박이 4번(눈1, 포카드 비기여) → (48)×2+3 = 99
eq('금박 비기여 시 미적용', computeDamage(C.fourKind, [4, 4, 4, 4, 1], [N, N, N, N, G], [silver, fang]).total, 99);
// 풀하우스 35 + 부적15 + 이빨3 = 53
eq('풀하우스+부적+이빨', computeDamage(C.fullHouse, [2, 2, 5, 5, 5], plain5, [charm, fang]).total, 53);
// 0점 버리기: 원페어인데 쌍 없음 → total 0, isZero (이빨 미적용)
const zero = computeDamage(C.onePair, [2, 3, 4, 5, 6], plain5, [fang]);
eq('0점 버리기 total', zero.total, 0);
eq('0점 버리기 isZero', zero.isZero, true);
// 금박이 찬스(상위3)에 기여: 상위3합 17 + 금박(0번 눈6, 상위3 포함) = 23
eq('금박 찬스 기여', computeDamage(C.chance, [6, 6, 5, 4, 1], [G, N, N, N, N], []).total, 23);
// 금박이 상위3 밖이면 미기여: 4번(눈1)에 금박 → 17
eq('금박 상위3 밖 미기여', computeDamage(C.chance, [6, 6, 5, 4, 1], [N, N, N, N, G], []).total, 17);
// 금박이 트리플 매칭 눈에 기여: [4,4,4,2,1] 매칭합×1.5=18 + 금박(0번 눈4) = 22
eq('금박 트리플 매칭 기여', computeDamage(C.threeKind, [4, 4, 4, 2, 1], [G, N, N, N, N], []).total, 22);

// v0.8: 레벨 폐지 — 배수는 유물만
eq('찬스 무보정', computeDamage(C.chance, [6, 6, 5, 4, 1], plain5, []).total, 17);

// v0.71: 상태이상 지속시간 — 매 턴 1스택 소멸, 단 얻은 턴에는 안 깎인다(효과를 최소 한 번은 본다)
{
  const { readFileSync } = await import('fs');
  globalThis.fetch = async (u) => ({ ok: true, json: async () => JSON.parse(readFileSync(new URL('../' + String(u).replace(/^\.?\//, ''), import.meta.url), 'utf8')) });
  const { loadAll } = await import('../js/data.js');
  await loadAll();
  const eng = await import('../js/engine.js');
  eng.rng.next = () => 0.5;
  const run = { hp: 70, maxHp: 70, act: 1, floor: 1, enlight: 0, relics: [],
    dice: ['normal', 'normal', 'normal', 'normal', 'normal'], categories: { pair: ['pair_basic'] } };
  const b = eng.createBattle(run, ['stray_dog'], 'battle');
  const baseRerolls = b.rollsLeft;
  b.buffs.focus += 1; b.buffs.strength += 2; b.buffs.regen += 1;
  b.enemies[0].debuffs.weak += 2; b.enemies[0].debuffs.vulnerable += 2;
  b.await = 'enemy'; eng.enemyPhase(b);                       // 1턴 종료 → 2턴
  eq('부여한 턴에는 안 깎임(집중)', b.buffs.focus, 1);
  eq('부여한 턴에는 안 깎임(약화)', b.enemies[0].debuffs.weak, 2);
  eq('집중 효과가 실제로 적용됨', b.rollsLeft, baseRerolls + 1);
  b.await = 'enemy'; eng.enemyPhase(b);                       // 2턴 종료 → 3턴
  eq('한 턴 뒤 집중 소멸', b.buffs.focus, 0);
  eq('한 턴 뒤 힘 1 감소', b.buffs.strength, 1);
  eq('한 턴 뒤 재생 소멸', b.buffs.regen, 0);
  eq('한 턴 뒤 약화 1 감소', b.enemies[0].debuffs.weak, 1);
  eq('한 턴 뒤 취약 1 감소', b.enemies[0].debuffs.vulnerable, 1);
  eq('집중 소멸 후 리롤 원복', b.rollsLeft, baseRerolls);
  b.await = 'enemy'; eng.enemyPhase(b);                       // 3턴 종료 → 4턴
  eq('두 턴 뒤 힘 소멸', b.buffs.strength, 0);
  eq('두 턴 뒤 약화 소멸', b.enemies[0].debuffs.weak, 0);
  b.await = 'enemy'; eng.enemyPhase(b);
  eq('0에서 더 내려가지 않음', b.buffs.strength, 0);
}

// v1.03: 강화 행동은 일반 행동으로 흡수됐다 — 해금 턴 4 + 쿨다운 4 + 가중치로 표현된다
{
  const eng = await import('../js/engine.js');
  const { DB } = await import('../js/data.js');
  eng.rng.next = Math.random;
  const mk = (id) => eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
    dice: ['normal', 'normal', 'normal', 'normal', 'normal'], categories: { pair: ['pair_basic'] } }, [id], 'battle');
  const surgeId = () => 'surge';
  eq('전용 트랙(surgeMove)이 남아 있지 않음', DB.enemies.some(e => e.surgeMove), false);
  eq('순서(sequence) 패턴이 남아 있지 않음',
    DB.enemies.some(e => ((e.phases || []).map(p => p.pattern).concat(e.pattern ? [e.pattern] : []))
      .some(p => p.mode === 'sequence')), false);
  // 효과 종류는 설계자가 자유롭게 정한다 — 여기서 검사할 것은 '장기전에만 나오는 수가 있는가'다
  eq('최종 보스를 뺀 모두가 후반 전용 행동을 가짐',
    DB.enemies.filter(e => !e.final).every(e => Object.values(e.moves).some(m => m.minTurn > 0)), true);
  eq('행동 이름에 공용 라벨 없음',
    DB.enemies.every(e => Object.values(e.moves).every(m => !/격노/.test(m.name))), true);
  // 가중치 0인데 아무도 연계로 부르지 않는 '절대 안 나오는 행동'이 없어야 한다
  const unreachable = [];
  for (const e of DB.enemies) {
    const pats = (e.phases || []).map(p => p.pattern).concat(e.pattern ? [e.pattern] : []);
    const called = new Set(Object.values(e.moves).filter(m => m.followUp).map(m => m.followUp.move));
    for (const id of Object.keys(e.moves)) {
      const anyWeight = pats.some(p => (p.weights || {})[id] > 0);
      if (!anyWeight && !called.has(id)) unreachable.push(`${e.name}/${e.moves[id].name}`);
    }
  }
  eq('절대 등장할 수 없는 행동 없음', unreachable, []);
  // 해금 턴 이전에는 절대 안 나온다
  const def = DB.enemyById.stray_dog; const sid = surgeId(def);
  let early = 0, firsts = [];
  for (let n = 0; n < 300; n++) {
    const b = mk('stray_dog'); let first = 0;
    for (let t = 1; t <= 14; t++) {
      if (b.enemies[0].nextMove.id === sid) { if (t < def.moves[sid].minTurn) early++; if (!first) first = t; }
      b.await = 'enemy'; eng.enemyPhase(b);
    }
    if (first) firsts.push(first);
  }
  eq('해금 턴 이전에 강화 행동 없음', early, 0);
  eq('강화 행동이 실제로 나옴', firsts.length > 250, true);
  eq('첫 발동 턴이 매번 같지는 않음', new Set(firsts).size > 1, true);
  // minTurn 기술은 그 전에 등장하지 않는다
  const heavy = Object.entries(def.moves).find(([k, m]) => m.minTurn && k !== sid);
  eq('최강기에 minTurn이 붙어 있음', !!heavy, true);
  let leaked = 0;
  for (let n = 0; n < 200; n++) {
    const b = mk('stray_dog');
    for (let t = 1; t < heavy[1].minTurn; t++) {
      if (b.enemies[0].nextMove.id === heavy[0]) leaked++;
      b.await = 'enemy'; eng.enemyPhase(b);
    }
  }
  eq('minTurn 이전에 최강기 미등장', leaked, 0);
}

// v0.75: 연계기 — A를 쓰면 확률에 따라 다음 턴 B가 확정된다
{
  const eng = await import('../js/engine.js');
  const { DB } = await import('../js/data.js');
  eng.rng.next = Math.random;
  const mk = (id) => eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
    dice: ['normal', 'normal', 'normal', 'normal', 'normal'], categories: { pair: ['pair_basic'] } }, [id], 'battle');
  const def = DB.enemyById.wolf;
  const [aId, aMv] = Object.entries(def.moves).find(([, m]) => m.followUp);
  eq('보스에 연계기가 설정됨', !!aMv.followUp.move, true);
  let seen = 0, chained = 0, wrong = 0, doubleChain = 0;
  for (let n = 0; n < 300; n++) {
    const b = mk('wolf'); const e = b.enemies[0];
    let prevChained = false;
    for (let t = 1; t <= 14; t++) {
      const wasA = e.nextMove.id === aId;
      // 연계 대상이 후반 전용이면 그 전 턴은 발동률 계산에서 제외한다
      const unlocked = !(def.moves[aMv.followUp.move].minTurn > t + 1);
      b.await = 'enemy'; eng.enemyPhase(b);
      if (wasA && unlocked) { seen++; if (e.nextMove.chained) { chained++; if (e.nextMove.id !== aMv.followUp.move) wrong++; } }
      if (prevChained && e.nextMove.chained) doubleChain++;
      prevChained = !!e.nextMove.chained;
    }
  }
  const rate = chained / seen;
  eq('연계 대상이 정확함', wrong, 0);
  eq('연계 발동률이 설정값 근처', Math.abs(rate - aMv.followUp.chance) < 0.06, true);
  eq('후반 전용 기술은 연계로도 앞당겨지지 않음',
    (() => { let leak = 0;
      for (let n = 0; n < 200; n++) { const b = mk('wolf'); const e = b.enemies[0];
        for (let t = 1; t < def.moves[aMv.followUp.move].minTurn; t++) {
          if (e.nextMove.id === aMv.followUp.move) leak++;
          b.await = 'enemy'; eng.enemyPhase(b); } }
      return leak; })(), 0);
  eq('연계가 무한히 이어지지 않음', doubleChain, 0);
}

// v1.01: 쿨다운 — 한 번 쓴 행동은 지정한 턴 수만큼 다시 안 나온다
{
  const eng = await import('../js/engine.js');
  const { DB } = await import('../js/data.js');
  eng.rng.next = Math.random;
  // 임시 적: 세 행동 중 hammer 에만 쿨다운 3을 건다
  const CD = 3;   // v1.04: '세 턴을 쉰다' → 최소 간격은 4턴
  DB.enemyById.__cdtest = {
    id: '__cdtest', name: '시험체', tier: 'normal', art: '🧪', hp: [9e6, 9e6],
    moves: {
      jab: { name: '잽', effects: [{ op: 'damage', amount: 1 }] },
      poke: { name: '찌르기', effects: [{ op: 'damage', amount: 1 }] },
      hammer: { name: '망치', effects: [{ op: 'damage', amount: 1 }], cooldown: CD },
    },
    pattern: { mode: 'weighted', weights: { jab: 1, poke: 1, hammer: 8 } },
  };
  const mk = () => eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
    dice: ['normal', 'normal', 'normal', 'normal', 'normal'], categories: { pair: ['pair_basic'] } }, ['__cdtest'], 'battle');
  let minGap = 99, uses = 0, tooSoon = 0;
  for (let n = 0; n < 200; n++) {
    const b = mk(); const e = b.enemies[0];
    let last = -99;
    for (let t = 1; t <= 20; t++) {
      if (e.nextMove.id === 'hammer') {
        uses++;
        const gap = t - last;
        if (last > -99) { minGap = Math.min(minGap, gap); if (gap < CD + 1) tooSoon++; }
        last = t;
      }
      b.await = 'enemy'; eng.enemyPhase(b);
    }
  }
  eq('쿨다운 행동이 실제로 쓰이긴 함', uses > 400, true);
  eq('쿨다운보다 빨리 재사용된 적 없음', tooSoon, 0);
  eq('실제 최소 간격이 쿨다운+1', minGap >= CD + 1, true);
  // 쿨다운 0(미지정)인 행동은 제한이 없어야 한다
  DB.enemyById.__cdtest2 = { ...DB.enemyById.__cdtest, id: '__cdtest2',
    moves: { ...DB.enemyById.__cdtest.moves, hammer: { name: '망치', effects: [{ op: 'damage', amount: 1 }] } } };
  let back2back = 0;
  for (let n = 0; n < 120; n++) {
    const b = eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
      dice: ['normal', 'normal', 'normal', 'normal', 'normal'], categories: { pair: ['pair_basic'] } }, ['__cdtest2'], 'battle');
    const e = b.enemies[0]; let last = -99;
    for (let t = 1; t <= 16; t++) {
      if (e.nextMove.id === 'hammer') { if (t - last === 2) back2back++; last = t; }
      b.await = 'enemy'; eng.enemyPhase(b);
    }
  }
  eq('쿨다운 없는 행동은 간격 제한 없음', back2back > 0, true);
}

// v1.02: 가중치 0 = 추첨 제외 (연계로만 등장) · 쿨다운+연계+가중치0 이 '정해진 순서'를 그대로 재현하는가
{
  const eng = await import('../js/engine.js');
  const { DB } = await import('../js/data.js');
  eng.rng.next = Math.random;
  const D = (n) => [{ op: 'damage', amount: n }];
  const mkdef = (id, moves, weights) => { DB.enemyById[id] = { id, name: id, tier: 'normal', art: '🧪',
    hp: [9e6, 9e6], moves, pattern: { mode: 'weighted', weights } }; };
  const play = (id, T) => {
    const b = eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
      dice: ['normal','normal','normal','normal','normal'], categories: { pair: ['pair_basic'] } }, [id], 'battle');
    const e = b.enemies[0]; const out = [];
    for (let t = 1; t <= T; t++) { out.push(e.nextMove.id); b.await = 'enemy'; eng.enemyPhase(b); }
    return out;
  };
  // 가중치 0 인 기술은 연계가 없으면 절대 안 나온다
  mkdef('__w0', { A: { name: 'A', effects: D(1) }, Z: { name: 'Z', effects: D(1) } }, { A: 1, Z: 0 });
  let zLeak = 0;
  for (let n = 0; n < 300; n++) zLeak += play('__w0', 12).filter(x => x === 'Z').length;
  eq('가중치 0은 추첨에서 절대 안 뽑힘', zLeak, 0);

  // 쿨다운 3 + 연계 100% + 가중치 0 → A→B→C 가 매번 정확히 순환
  mkdef('__rot', {
    A: { name: 'A', effects: D(1), cooldown: 2 },
    B: { name: 'B', effects: D(1), cooldown: 2, followUp: { move: 'C', chance: 1 } },
    C: { name: 'C', effects: D(1), cooldown: 2 },
  }, { A: 1, B: 1, C: 0 });
  let cycleBad = 0, orderBad = 0;
  for (let n = 0; n < 400; n++) {
    const s = play('__rot', 12);
    for (let i = 0; i + 3 <= 12; i += 3) if (new Set(s.slice(i, i + 3)).size !== 3) cycleBad++;
    for (let i = 0; i < 12; i++) if (s[i] === 'C' && s[i - 1] !== 'B') orderBad++;
  }
  eq('세 행동이 3턴마다 한 번씩 (주기 유지)', cycleBad, 0);
  eq('큰 공격 앞에는 항상 준비 행동', orderBad, 0);
}

// v1.05: 휴식 효과 — 턴만 넘기고 아무 일도 일어나지 않는다
{
  const eng = await import('../js/engine.js');
  const { DB } = await import('../js/data.js');
  eng.rng.next = Math.random;
  DB.enemyById.__rest = { id: '__rest', name: '쉬는 적', tier: 'normal', art: '🧪', hp: [200, 200],
    moves: { nap: { name: '숨 고르기', effects: [{ op: 'rest' }] } },
    pattern: { mode: 'weighted', weights: { nap: 1 } } };
  const b = eng.createBattle({ hp: 60, maxHp: 60, act: 1, floor: 1, enlight: 0, relics: [],
    dice: ['normal','normal','normal','normal','normal'], categories: { pair: ['pair_basic'] } }, ['__rest'], 'battle');
  const e = b.enemies[0];
  const hp0 = b.player.hp, ehp0 = e.hp;
  for (let t = 0; t < 8; t++) { b.await = 'enemy'; eng.enemyPhase(b); }
  eq('휴식은 플레이어 HP를 안 깎음', b.player.hp, hp0);
  eq('휴식은 적 방어·힘을 안 올림', [e.block, e.power], [0, 0]);
  eq('휴식은 적 HP를 안 바꿈', e.hp, ehp0);
  eq('휴식 중에도 전투는 계속됨', b.over, false);
  eq('휴식의 의도 표시는 💤', eng.intentOf(e), '💤');
}

// v1.06: 연타 — 한 대는 약하지만 강화가 타수마다 붙는다
{
  const eng = await import('../js/engine.js');
  const { DB } = await import('../js/data.js');
  eng.rng.next = Math.random;
  const mkEnemy = (id, ef) => { DB.enemyById[id] = { id, name: id, tier: 'normal', art: '🧪', hp: [9e6, 9e6],
    moves: { hit: { name: '난타', effects: [ef] } }, pattern: { mode: 'weighted', weights: { hit: 1 } } }; };
  const run = (id, turns, power) => {
    const b = eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
      dice: ['normal','normal','normal','normal','normal'], categories: { pair: ['pair_basic'] } }, [id], 'battle');
    b.enemies[0].power = power;
    const hp0 = b.player.hp;
    for (let t = 0; t < turns; t++) { b.await = 'enemy'; eng.enemyPhase(b); b.enemies[0].power = power; }
    return hp0 - b.player.hp;
  };
  mkEnemy('__once', { op: 'damage', amount: 12 });            // 한 방 12
  mkEnemy('__multi', { op: 'damage', amount: 4, hits: 3 });   // 4를 세 번
  eq('강화 0이면 총합이 같다', [run('__once', 1, 0), run('__multi', 1, 0)], [12, 12]);
  // 강화 6: 한 방은 12+6=18, 연타는 (4+6)×3=30
  eq('강화가 타수마다 붙는다', [run('__once', 1, 6), run('__multi', 1, 6)], [18, 30]);
  // 약화도 타수마다 빠진다
  {
    const b = eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
      dice: ['normal','normal','normal','normal','normal'], categories: { pair: ['pair_basic'] } }, ['__multi'], 'battle');
    b.enemies[0].debuffs.weak = 2; const hp0 = b.player.hp;
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('약화도 타수마다 빠진다', hp0 - b.player.hp, (4 - 2) * 3);
  }
  // 방어는 한 대씩 갉힌다 — 방어 5는 첫 대를 막고 남은 두 대가 들어온다
  {
    const b = eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
      dice: ['normal','normal','normal','normal','normal'], categories: { pair: ['pair_basic'] } }, ['__multi'], 'battle');
    b.player.block = 5; const hp0 = b.player.hp;
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('방어를 타수로 갉는다', hp0 - b.player.hp, 12 - 5);
  }
  // 의도 표시에 타수가 보인다
  {
    const b = eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
      dice: ['normal','normal','normal','normal','normal'], categories: { pair: ['pair_basic'] } }, ['__multi'], 'battle');
    eq('의도에 타수 표기', eng.intentOf(b.enemies[0]), '⚔️4×3');
    b.enemies[0].power = 6;
    eq('강화가 반영된 한 대 피해로 표기', eng.intentOf(b.enemies[0]), '⚔️10×3');
  }
  eq('hits 없으면 1타로 동작', eng.hitCount({ op: 'damage', amount: 3 }), 1);
}

// v1.08: 락 턴 · 유니크 행동 · 국면 전환 · 파쇄
{
  const eng = await import('../js/engine.js');
  const { DB } = await import('../js/data.js');
  eng.rng.next = Math.random;
  const D = (n) => [{ op: 'damage', amount: n }];
  const mk = (id) => eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
    dice: ['normal','normal','normal','normal','normal'], categories: { pair: ['pair_basic'] } }, [id], 'battle');

  // --- 락 턴: minTurn 2, lockTurn 5 → 2·3·4턴에만 나온다
  DB.enemyById.__lock = { id: '__lock', name: '락', tier: 'normal', art: '🧪', hp: [9e6, 9e6],
    moves: { base: { name: '평타', effects: D(1) }, win: { name: '구간기', effects: D(1), minTurn: 2, lockTurn: 5 } },
    pattern: { mode: 'weighted', weights: { base: 1, win: 20 } } };
  const seen = new Set();
  for (let n = 0; n < 400; n++) {
    const b = mk('__lock');
    for (let t = 1; t <= 9; t++) { if (b.enemies[0].nextMove.id === 'win') seen.add(t); b.await = 'enemy'; eng.enemyPhase(b); }
  }
  eq('락 턴 구간에서만 등장 (2·3·4턴)', [...seen].sort((a, b2) => a - b2), [2, 3, 4]);

  // --- 파쇄: 예고된 행동에 HP 피해가 쌓이면 유니크 행동으로 교체된다
  DB.enemyById.__brk = { id: '__brk', name: '파쇄', tier: 'normal', art: '🧪', hp: [500, 500],
    moves: { charge: { name: '충전', effects: D(30), break: { damage: 20, move: 'stagger' } } },
    uniqueMoves: { stagger: { name: '휘청임', effects: [{ op: 'rest' }] } },
    pattern: { mode: 'weighted', weights: { charge: 1 } } };
  {
    const b = mk('__brk'); const e = b.enemies[0];
    eq('처음 예고는 일반 행동', e.nextMove.id, 'charge');
    eng.__test_deal(b, e, 19);
    eq('기준에 못 미치면 안 무너짐', [e.nextMove.id, !!e.nextMove.broken], ['charge', false]);
    eng.__test_deal(b, e, 1);
    eq('누적이 기준에 닿으면 파쇄', [e.nextMove.id, !!e.nextMove.broken], ['stagger', true]);
  }
  {   // 방어도로 막힌 피해는 세지 않는다
    const b = mk('__brk'); const e = b.enemies[0];
    e.block = 100; eng.__test_deal(b, e, 60);
    eq('방어도로 막은 피해는 파쇄에 안 셈', [e.nextMove.id, e.breakTaken], ['charge', 0]);
  }
  {   // 유니크 행동은 파쇄되지 않는다
    const b = mk('__brk'); const e = b.enemies[0];
    eng.__test_deal(b, e, 20);
    eq('파쇄 후 유니크 행동 예고', e.nextMove.id, 'stagger');
    eng.__test_deal(b, e, 200);
    eq('유니크 행동은 다시 안 무너짐', e.nextMove.id, 'stagger');
  }

  // --- 국면 전환: HP가 임계를 지나면 예고가 강제 교체된다
  DB.enemyById.__ph = { id: '__ph', name: '국면', tier: 'boss', art: '🧪', hp: [100, 100],
    moves: { a: { name: 'A', effects: D(1) }, b: { name: 'B', effects: D(1) } },
    uniqueMoves: { awaken: { name: '각성', effects: [{ op: 'empower', amount: 9 }] } },
    phases: [ { untilHpRatio: 0.5, pattern: { mode: 'weighted', weights: { a: 1 } } },
              { untilHpRatio: 0.0, pattern: { mode: 'weighted', weights: { b: 1 } }, enter: 'awaken' } ] };
  {
    const b = mk('__ph'); const e = b.enemies[0];
    eq('1국면 예고', e.nextMove.id, 'a');
    eng.__test_deal(b, e, 40);                    // HP 60% — 아직 1국면
    eq('임계 전에는 전환 없음', e.nextMove.id, 'a');
    eng.__test_deal(b, e, 15);                    // HP 45% — 2국면 진입
    eq('임계를 지나면 예고가 강제 교체', [e.nextMove.id, !!e.nextMove.phaseShift], ['awaken', true]);
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('전환 행동이 실제로 발동', e.power, 9);
    eq('이후에는 2국면 행동', e.nextMove.id, 'b');
    eng.__test_deal(b, e, 20);
    eq('전환은 한 번만', e.nextMove.id, 'b');
  }
  // --- 기본 행동: 모두 잠겼을 때 강제로 쓰는 수
  DB.enemyById.__dflt = { id: '__dflt', name: '기본', tier: 'normal', art: '🧪', hp: [9e6, 9e6],
    moves: { only: { name: '한 방', effects: D(1), cooldown: 9 } },
    uniqueMoves: { idle: { name: '숨 고르기', effects: [{ op: 'rest' }] } },
    defaultMove: 'idle',
    pattern: { mode: 'weighted', weights: { only: 1 } } };
  {
    const b = mk('__dflt'); const e = b.enemies[0]; const seq = [];
    for (let t = 1; t <= 6; t++) { seq.push(e.nextMove.id); b.await = 'enemy'; eng.enemyPhase(b); }
    eq('첫 턴은 정상 행동, 이후 쿨다운이라 기본 행동', seq, ['only', 'idle', 'idle', 'idle', 'idle', 'idle']);
    eq('기본 행동은 강제 표시가 붙음', !!e.nextMove.forced, true);
  }
  // 기본 행동은 자신의 해금·락·쿨다운까지 전부 무시하고 시동한다
  DB.enemyById.__dflt2 = { id: '__dflt2', name: '기본2', tier: 'normal', art: '🧪', hp: [9e6, 9e6],
    moves: { only: { name: '한 방', effects: D(1), cooldown: 9 },
             fallback: { name: '되받기', effects: D(1), minTurn: 90, lockTurn: 2, cooldown: 9 } },
    defaultMove: 'fallback',
    pattern: { mode: 'weighted', weights: { only: 1, fallback: 0 } } };
  {
    const b = mk('__dflt2'); const e = b.enemies[0]; const seq = [];
    for (let t = 1; t <= 6; t++) { seq.push(e.nextMove.id); b.await = 'enemy'; eng.enemyPhase(b); }
    eq('기본 행동은 해금·락·쿨다운을 전부 무시', seq, ['only', 'fallback', 'fallback', 'fallback', 'fallback', 'fallback']);
  }
  // 기본 행동이 없으면 제한을 풀어서라도 뭔가는 낸다 (전투가 멈추지 않는다)
  DB.enemyById.__nodflt = { ...DB.enemyById.__dflt, id: '__nodflt', defaultMove: undefined };
  {
    const b = mk('__nodflt'); const e = b.enemies[0]; let blank = 0;
    for (let t = 1; t <= 6; t++) { if (!e.nextMove || !e.nextMove.id) blank++; b.await = 'enemy'; eng.enemyPhase(b); }
    eq('기본 행동이 없어도 예고가 비지 않음', blank, 0);
  }

  // 유니크 행동은 추첨에 절대 안 들어간다
  {
    let leak = 0;
    for (let n = 0; n < 200; n++) { const b = mk('__ph');
      for (let t = 1; t <= 6; t++) { if (b.enemies[0].nextMove.id === 'awaken') leak++; b.await = 'enemy'; eng.enemyPhase(b); } }
    eq('유니크 행동은 추첨으로 안 나옴', leak, 0);
  }
}

// v1.13: 자해 — 적이 스스로 HP를 깎는다. 예고에는 정체가 드러나지 않는다(❓)
{
  const eng = await import('../js/engine.js');
  const { DB } = await import('../js/data.js');
  eng.rng.next = Math.random;
  const mk = (id) => eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
    dice: ['normal','normal','normal','normal','normal'], categories: { pair: ['pair_basic'] } }, [id], 'battle');
  DB.enemyById.__self = { id: '__self', name: '자해', tier: 'normal', art: '🧪', hp: [40, 40],
    moves: { burn: { name: '타들어감', effects: [{ op: 'selfDamage', amount: 15 }] } },
    pattern: { mode: 'weighted', weights: { burn: 1 } } };
  {
    const b = mk('__self'); const e = b.enemies[0];
    eq('자해 예고는 정체 불명(❓)', eng.intentOf(e), '❓');
    const hp0 = b.player.hp;
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('자기 HP가 깎임', e.hp, 25);
    eq('플레이어는 멀쩡함', b.player.hp, hp0);
    e.block = 99; b.await = 'enemy'; eng.enemyPhase(b);
    eq('자기 방어도는 자해를 못 막음', e.hp, 10);
  }
  {   // 자해로 죽으면 그 자리에서 전투가 끝난다
    const b = mk('__self'); const e = b.enemies[0]; e.hp = 10;
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('자해로 쓰러지면 승리 처리', [e.hp <= 0, b.over, b.result], [true, true, 'victory']);
  }
}

// v0.85: 지도 생성 규칙 — 휴식 강제 연속 금지 / 보스 앞 휴식 / 갈림길 구성 상이
{
  const run_ = await import('../js/run.js');
  const { DB } = await import('../js/data.js');
  const fixedCfg = DB.act1.map.fixed;
  let v1 = 0, v2 = 0, v3 = 0;
  const N = 400;
  for (let n = 0; n < N; n++) {
    const { floors, edges } = run_.generateMap(0);
    const F = floors.length;
    for (let f = 0; f < F - 1; f++) {
      for (let i = 0; i < floors[f].length; i++) {
        const kids = edges[f][i] || [];
        if (floors[f][i].type === 'rest' && kids.length && kids.every(j => floors[f + 1][j].type === 'rest')) v1++;
        // 유형이 고정된 층(보스 앞 휴식·보스)은 갈림길 규칙 예외
        if (!fixedCfg[String(f + 2)] && kids.length >= 2) {
          const ts = kids.map(j => floors[f + 1][j].type);
          if (new Set(ts).size !== ts.length) v3++;
        }
      }
    }
    if (!floors[F - 2].every(nd => nd.type === 'rest')) v2++;
  }
  eq('휴식 다음이 휴식뿐인 경우 없음', v1, 0);
  eq('보스 직전 층은 항상 휴식', v2, 0);
  eq('갈림길의 두 갈래는 서로 다름', v3, 0);
}

console.log(fails === 0 ? 'ALL UNIT PASS' : `UNIT FAILS: ${fails}`);
process.exit(fails === 0 ? 0 : 1);
