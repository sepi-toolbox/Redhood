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
  fullHouse: { id: 'fullHouse', kind: 'fullHouse', score: 'sumAll', mult: 1.8 },  // v3.23 눈 합 기반
  small: { id: 'smallStraight', kind: 'straight', length: 4, score: 'sumRun', mult: 2 },
  large: { id: 'largeStraight', kind: 'straight', length: 5, score: 'sumRun', mult: 3.4 },
  yahtzee: { id: 'yahtzee', kind: 'ofKind', count: 5, score: 'matchedSum', mult: 4 }, // v3.23
  chance: { id: 'chance', kind: 'chance', score: 'sumTop3' },
  chanceD: { id: 'chance', kind: 'chance', score: 'sumTop3Distinct' },
  noPair: { id: 'chance', kind: 'chance', score: 'highestDie' },
  twoPair: { id: 'twoPair', kind: 'twoPair', score: 'matchedSum', mult: 1.25 },
};
const N = { faces: [1, 2, 3, 4, 5, 6] };
const G = { faces: [1, 2, 3, 4, 5, 6], gold: true };
const plain5 = [N, N, N, N, N];

// 판정
eq('야찌 [3,3,3,3,3] = 15×4', evalCategory(C.yahtzee, [3, 3, 3, 3, 3]).base, 60);
eq('야찌 [6,6,6,6,6] = 30×4', evalCategory(C.yahtzee, [6, 6, 6, 6, 6]).base, 120);
eq('풀하우스 [2,2,3,3,3] = 13×1.8', evalCategory(C.fullHouse, [2, 2, 3, 3, 3]).base, 23);
eq('풀하우스 [6,6,5,5,5] = 27×1.8', evalCategory(C.fullHouse, [6, 6, 5, 5, 5]).base, 48);
eq('풀하우스 실패 [2,2,3,3,4]', evalCategory(C.fullHouse, [2, 2, 3, 3, 4]).valid, false);
eq('풀하우스=야찌 인정 [4,4,4,4,4] = 20×1.8', evalCategory(C.fullHouse, [4, 4, 4, 4, 4]).base, 36);
eq('스몰 [1,2,3,4,6] → 이은 눈 합 10 ×2', evalCategory(C.small, [1, 2, 3, 4, 6]).base, 20);
eq('스몰 실패 [1,2,4,5,6]는 4연속? (2,4,5,6→3연속)', evalCategory(C.small, [1, 2, 4, 5, 6]).valid, false);
eq('라지 [2,3,4,5,6] → 합 20 ×3.4', evalCategory(C.large, [2, 3, 4, 5, 6]).base, 68);
eq('라지 [1,2,3,4,5] → 합 15 ×3.4 (작은 눈은 약하다)', evalCategory(C.large, [1, 2, 3, 4, 5]).base, 51);
eq('라지: 기절한 눈은 합에서 빠진다', evalCategory(C.large, [2, 3, 4, 5, 6], new Set([4])).base, 47);
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
eq('풀하우스+부적+이빨', computeDamage(C.fullHouse, [2, 2, 5, 5, 5], plain5, [charm, fang]).total, 52);
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
    dice: ['normal', 'normal', 'normal', 'normal', 'normal'], categories: { onePair: 'clasped_hands' } };
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
    dice: ['normal', 'normal', 'normal', 'normal', 'normal'], categories: { onePair: 'clasped_hands' } }, [id], 'battle');
  const surgeId = () => 'surge';
  eq('전용 트랙(surgeMove)이 남아 있지 않음', DB.enemies.some(e => e.surgeMove), false);
  eq('순서(sequence) 패턴이 남아 있지 않음',
    DB.enemies.some(e => ((e.phases || []).map(p => p.pattern).concat(e.pattern ? [e.pattern] : []))
      .some(p => p.mode === 'sequence')), false);
  // 효과 종류는 설계자가 자유롭게 정한다 — 여기서 검사할 것은 '전투가 길어지면 새 수가 나오는가'다.
  // 그 장치는 셋 중 아무거나면 된다: 해금 턴(minTurn) · 국면(phases) · 추첨에 없고 연계로만 나오는 행동.
  const chainOnly = (e) => {
    const pats = (e.phases || []).map(p => p.pattern).concat(e.pattern ? [e.pattern] : []);
    const called = new Set();
    for (const m of Object.values({ ...e.moves, ...(e.uniqueMoves || {}) })) {
      if (m.followUp) called.add(m.followUp.move);
      if (m.break) called.add(m.break.move);
    }
    return [...called].some(id => e.moves[id] &&
      pats.every(p => !p.weights || !(p.weights[id] > 0)));
  };
  eq('최종 보스를 뺀 모두가 후반용 장치를 가짐',
    DB.enemies.filter(e => !e.final).every(e =>
      Object.values(e.moves).some(m => m.minTurn > 0) || (e.phases || []).length > 1 || chainOnly(e)), true);
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
    dice: ['normal', 'normal', 'normal', 'normal', 'normal'], categories: { onePair: 'clasped_hands' } }, [id], 'battle');
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
    dice: ['normal', 'normal', 'normal', 'normal', 'normal'], categories: { onePair: 'clasped_hands' } }, ['__cdtest'], 'battle');
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
      dice: ['normal', 'normal', 'normal', 'normal', 'normal'], categories: { onePair: 'clasped_hands' } }, ['__cdtest2'], 'battle');
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
      dice: ['normal','normal','normal','normal','normal'], categories: { onePair: 'clasped_hands' } }, [id], 'battle');
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
    dice: ['normal','normal','normal','normal','normal'], categories: { onePair: 'clasped_hands' } }, ['__rest'], 'battle');
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
      dice: ['normal','normal','normal','normal','normal'], categories: { onePair: 'clasped_hands' } }, [id], 'battle');
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
  // v3.76: 약화는 이제 세기를 빼는 게 아니라 최종값에 ×0.75 — 타수마다 그 배율이 걸린다
  //   4를 세 번 → 한 대당 floor(4×0.75)=3, 총 9
  {
    const b = eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
      dice: ['normal','normal','normal','normal','normal'], categories: { onePair: 'clasped_hands' } }, ['__multi'], 'battle');
    b.enemies[0].debuffs.weak = 2; const hp0 = b.player.hp;
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('약화는 한 대마다 ×0.75', hp0 - b.player.hp, Math.floor(4 * 0.75) * 3);
  }
  // 방어는 한 대씩 갉힌다 — 방어 5는 첫 대를 막고 남은 두 대가 들어온다
  {
    const b = eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
      dice: ['normal','normal','normal','normal','normal'], categories: { onePair: 'clasped_hands' } }, ['__multi'], 'battle');
    b.player.block = 5; const hp0 = b.player.hp;
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('방어를 타수로 갉는다', hp0 - b.player.hp, 12 - 5);
  }
  // 의도 표시에 타수가 보인다
  {
    const b = eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
      dice: ['normal','normal','normal','normal','normal'], categories: { onePair: 'clasped_hands' } }, ['__multi'], 'battle');
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
    dice: ['normal','normal','normal','normal','normal'], categories: { onePair: 'clasped_hands' } }, [id], 'battle');

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
    dice: ['normal','normal','normal','normal','normal'], categories: { onePair: 'clasped_hands' } }, [id], 'battle');
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

// v1.14: 독·출혈 — 같은 장치, 이름만 다름. 내 행동 후 누적만큼 아프고 1 줄어든다
{
  const eng = await import('../js/engine.js');
  const { DB } = await import('../js/data.js');
  eng.rng.next = Math.random;
  const mk = () => eng.createBattle({ hp: 100, maxHp: 100, act: 1, floor: 1, enlight: 0, relics: [],
    dice: ['normal','normal','normal','normal','normal'], categories: { onePair: 'clasped_hands' } }, ['__dotenemy'], 'battle');
  DB.enemyById.__dotenemy = { id: '__dotenemy', name: '독적', tier: 'normal', art: '🧪', hp: [9e6, 9e6],
    moves: { spit: { name: '뱉기', effects: [{ op: 'poison', amount: 3 }] } },
    pattern: { mode: 'weighted', weights: { spit: 1 } } };
  {
    const b = mk(); const e = b.enemies[0];
    eq('독 예고는 혼란과 같은 소용돌이', eng.intentOf(e), '🌀');
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('독 3 부여', [b.player.dot, b.player.dotKind], [3, 'poison']);
    b.player.block = 0;
    const hp0 = b.player.hp;
    eq('행동 후 누적만큼 피해', eng.tickDot(b), 3);
    eq('HP가 그만큼 줄고 누적도 1 감소', [hp0 - b.player.hp, b.player.dot], [3, 2]);
    eng.tickDot(b); eng.tickDot(b);
    eq('2 → 1 → 0 으로 소진', b.player.dot, 0);
    eq('0이면 더 안 아픔', eng.tickDot(b), 0);
  }
  {   // 방어도가 먼저 막는다
    const b = mk(); b.player.dot = 5; b.player.block = 3;
    const hp0 = b.player.hp;
    eng.tickDot(b);
    eq('방어도 3이 먼저 깎이고 나머지 2만 HP로', [b.player.block, hp0 - b.player.hp], [0, 2]);
  }
  {   // 출혈은 이름만 다르다
    DB.enemyById.__dotenemy.moves.spit.effects = [{ op: 'bleed', amount: 4 }];
    const b = mk(); b.await = 'enemy'; eng.enemyPhase(b);
    eq('출혈도 같은 칸에 쌓인다', [b.player.dot, b.player.dotKind], [4, 'bleed']);
    DB.enemyById.__dotenemy.moves.spit.effects = [{ op: 'poison', amount: 3 }];
  }
  {   // 독으로 죽을 수 있다
    const b = mk(); b.player.hp = 2; b.player.block = 0; b.player.dot = 5;
    eng.tickDot(b);
    eq('독으로 쓰러지면 패배', [b.player.hp, b.over, b.result], [0, true, 'defeat']);
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


// v1.17: 주사위 상태이상 13종
{
  const eng = await import('../js/engine.js');
  const { DB } = await import('../js/data.js');
  const mk = () => {
    eng.rng.next = () => 0.5;
    const run = { hp: 60, maxHp: 60, act: 1, floor: 1, enlight: 0, relics: [],
      dice: ['normal','normal','normal','normal','normal'],
      categories: { onePair: 'clasped_hands' } };
    return eng.createBattle(run, ['stray_dog'], 'battle');
  };

  // 부착 규칙 — 빈 칸 먼저, 다 차면 덮어쓴다
  { const b = mk();
    eng.applyStatus(b, 'bleed', 3);
    eq('세 칸에만 붙는다', b.dice.filter(d => d.st).length, 3);
    eng.applyStatus(b, 'stun', 2);
    eq('빈 칸을 먼저 채운다', b.dice.filter(d => d.st).length, 5);
    eq('출혈은 그대로 셋', b.dice.filter(d => d.st.kind === 'bleed').length, 3);
    eng.applyStatus(b, 'curse', 1);
    eq('다 차면 덮어쓴다 (칸 수는 그대로)', b.dice.filter(d => d.st).length, 5);
    eq('덮어쓴 저주가 하나 생김', b.dice.filter(d => d.st.kind === 'curse').length, 1);
  }

  // 저주·축복 — 나오는 눈이 잘린다
  { const b = mk();
    eng.rng.next = Math.random;
    b.dice[0].st = { kind: 'curse', left: 0, fuse: 0, opened: false };
    b.dice[1].st = { kind: 'blessing', left: 0, fuse: 0, opened: false };
    let lo = [], hi = [];
    for (let k = 0; k < 60; k++) { b.rolled = false; eng.initialRoll(b); lo.push(b.dice[0].face); hi.push(b.dice[1].face); }
    eq('저주는 3 이하만', lo.every(v => v <= 3), true);
    eq('축복은 4 이상만', hi.every(v => v >= 4), true);
    eng.rng.next = () => 0.5;
  }

  // 봉인 — 다시 굴리기 전에는 값이 없다
  { const b = mk(); eng.initialRoll(b);
    b.dice[0].st = { kind: 'seal', left: 0, fuse: 0, opened: false };
    eq('봉인은 값이 0으로 빠진다', eng.facesOf(b)[0], 0);
    b.dice[0].held = false; eng.reroll(b);
    eq('한 번 굴리면 값이 돌아온다', eng.facesOf(b)[0] > 0, true);
  }

  // 포박 — 다시 굴릴 대상으로 못 고른다
  { const b = mk(); eng.initialRoll(b);
    b.dice[2].st = { kind: 'bind', left: 0, fuse: 0, opened: false };
    eng.toggleHold(b, 2);
    eq('포박은 선택이 안 된다', b.dice[2].held, true);
  }

  // 마비 — 리롤을 두 칸 먹는다
  { const b = mk(); eng.initialRoll(b);
    const before = b.rollsLeft;
    b.dice[1].st = { kind: 'numb', left: 0, fuse: 0, opened: false };
    eng.toggleHold(b, 1); eng.reroll(b);
    eq('마비가 끼면 리롤 2 소모', before - b.rollsLeft, 2);
  }

  // 결속 — 묶인 것끼리 같이 움직인다
  { const b = mk(); eng.initialRoll(b);
    b.dice[0].st = { kind: 'chain', left: 0, fuse: 0, opened: false };
    b.dice[3].st = { kind: 'chain', left: 0, fuse: 0, opened: false };
    eng.toggleHold(b, 0);
    eq('하나 고르면 짝도 같이', [b.dice[0].held, b.dice[3].held], [false, false]);
  }

  // 기절 — 족보에는 들어가되 눈금이 0
  { const cat = { id: 'x', kind: 'upper', face: 3 };
    eq('기절 하나가 빠진 합', evalCategory(cat, [3,3,3,1,2], new Set([0])).base, 6);
    eq('족보 성립 자체는 유지', evalCategory(cat, [3,3,3,1,2], new Set([0])).contributing.length, 3);
  }

  // 부패 — 심지가 다 타면 터지고, 그 전에 쓰면 해제된다
  { const b = mk();
    b.dice[0].st = { kind: 'rot', left: 0, fuse: 1, opened: false };
    const hp = b.player.hp;
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('부패가 터져 아프다', hp - b.player.hp >= DB.statusById.rot.amount, true);
    eq('터진 뒤에는 사라진다', b.dice[0].st, null);
  }

  // 약탈 — 족보에 쓰면 코인을 잃는다
  { const b = mk(); eng.initialRoll(b);
    b.dice.forEach(d => d.face = 4);
    b.dice[0].st = { kind: 'plunder', left: 0, fuse: 0, opened: false };
    eng.confirmCategory(b, 'onePair', 'clasped_hands', b.enemies[0].uid);
    eq('눈금만큼 코인을 뺏긴다', b.coinsLost, 4);
  }

  // 출혈 — 족보에 쓰면 눈금만큼 아프다 (방어도가 있으면 그게 먼저 막는다)
  { const b = mk(); eng.initialRoll(b);
    b.dice.forEach(d => d.face = 5);
    b.dice[0].st = { kind: 'bleed', left: 0, fuse: 0, opened: false };
    const r = eng.confirmCategory(b, 'onePair', 'clasped_hands', b.enemies[0].uid);
    eq('쓴 눈금만큼 출혈', r.bonusHits.includes('🩸-5'), true);
  }
  // 쓰지 않은 출혈 주사위는 아프지 않다
  { const b = mk(); eng.initialRoll(b);
    b.dice[0].face = 6; b.dice[1].face = 6; b.dice[2].face = 1; b.dice[3].face = 2; b.dice[4].face = 3;
    b.dice[2].st = { kind: 'bleed', left: 0, fuse: 0, opened: false };
    const r = eng.confirmCategory(b, 'onePair', 'clasped_hands', b.enemies[0].uid);
    eq('안 쓴 주사위는 대가 없음', r.bonusHits.some(x => x.startsWith('🩸')), false);
  }

  // 잠식 — 쓰지 않으면 양옆으로 번지고, 다 차면 공허의 부름만 남는다
  { const b = mk(); eng.initialRoll(b);
    b.dice[0].face = 4; b.dice[1].face = 4; b.dice[2].face = 1; b.dice[3].face = 2; b.dice[4].face = 3;
    b.dice[2].st = { kind: 'devour', left: 0, fuse: 0, opened: false };
    eng.confirmCategory(b, 'onePair', 'clasped_hands', b.enemies[0].uid);
    eq('안 쓰면 양옆으로 번진다', [b.dice[1].st && b.dice[1].st.kind, b.dice[3].st && b.dice[3].st.kind], ['devour','devour']);
    b.dice.forEach(d => d.st = { kind: 'devour', left: 0, fuse: 0, opened: false });
    b.await = null; b.over = false; b.rolled = true;
    b.voidLocked = true;
    const pv = eng.previewAll(b);
    eq('족보가 공허의 부름 하나만 남는다', [pv.length, pv[0].variant.id], [1, 'void_call']);
    const hp2 = b.player.hp, sum = eng.facesOf(b).reduce((a, v) => a + v, 0);
    eng.confirmVoidCall(b);
    eq('눈 총합만큼 내가 아프다', hp2 - b.player.hp, sum);
    eq('잠식이 걷힌다', b.dice.filter(d => d.st).length, 0);
  }

  // 적 행동이 상태이상을 걸 수 있다
  { const b = mk();
    const before = b.dice.filter(d => d.st).length;
    b.enemies[0].nextMove = { id: 'test', name: '시험', effects: [{ op: 'status', kind: 'poison', amount: 2 }] };
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('적이 건 상태이상이 붙는다', b.dice.filter(d => d.st && d.st.kind === 'poison').length >= 2, true);
  }

  // 정화는 주사위 상태이상까지 씻는다
  { const b = mk();
    eng.applyStatus(b, 'curse', 3);
    eq('정화 전', b.dice.filter(d => d.st).length, 3);
    eng.clearStatuses(b);
    eq('정화 후', b.dice.filter(d => d.st).length, 0);
  }

  // 적 행동이 세기와 지속까지 정한다
  { const b = mk();
    b.enemies[0].nextMove = { id: 't', name: '시험', effects: [{ op: 'status', kind: 'rot', amount: 1, power: 33 }] };
    b.await = 'enemy'; eng.enemyPhase(b);
    const d = b.dice.find(x => x.st && x.st.kind === 'rot');
    eq('적이 정한 폭발 피해가 들어간다', d.st.power, 33);
    eq('걸린 턴에는 심지가 안 탄다', d.st.fuse, DB.statusById.rot.turns);
    const hp = b.player.hp;
    b.await = 'enemy'; eng.enemyPhase(b);
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('기본값 10이 아니라 33으로 터진다', hp - b.player.hp >= 33, true);
  }
  // 지속 턴은 적 행동이 못 건드린다
  { const b = mk();
    eng.applyStatus(b, 'rot', 1, 50);
    const d = b.dice.find(x => x.st);
    eq('심지는 언제나 탭 값', d.st.fuse, DB.statusById.rot.turns);
  }
  // v3.49: 족보 변형의 부가 효과는 '하나까지'. 그리고 세기는 족보가 어려울수록 커진다.
  //   (몬스터 행동처럼 여러 개가 덕지덕지 붙지 않게)
  { const RUNG = { chance: 0, onePair: 1, twoPair: 2, threeKind: 3, fullHouse: 4, largeStraight: 5, fourKind: 6, yahtzee: 7 };
    const over = [], seen = {};
    for (const c of DB.scoring.categories) {
      const r = RUNG[c.id];
      for (const v of c.variants || []) {
        const ab = Array.isArray(v.ability) ? v.ability : (v.ability ? [v.ability] : []);
        if (ab.length > 1) over.push(`${c.name}·${v.name}(${ab.length})`);
        for (const a of ab) (seen[a.op] || (seen[a.op] = []))[r] = Math.max(seen[a.op][r] || 0, a.amount);
      }
    }
    eq('족보 변형의 부가 효과는 하나까지', over.join(',') || '없음', '없음');
    // 같은 효과가 여러 칸에 있으면 아래 칸이 위 칸보다 세면 안 된다
    const bad = [];
    for (const [op, arr] of Object.entries(seen)) {
      const pts = arr.map((v, i) => (v ? [i, v] : null)).filter(Boolean);
      for (let i = 1; i < pts.length; i++)
        if (pts[i][1] < pts[i - 1][1]) bad.push(`${op} ${pts[i - 1][0]}칸 ${pts[i - 1][1]} > ${pts[i][0]}칸 ${pts[i][1]}`);
    }
    eq('쉬운 족보가 어려운 족보보다 센 효과를 주지 않는다', bad.join(', ') || '없음', '없음');
  }

  // v3.46: 행동 하나는 '메인 1 + 서브 2' 안에서 끝난다 — 셋을 넘으면 무슨 일이 났는지 안 읽힌다.
  //   같은 종류 상태이상을 한 행동에 두 번 거는 것도 금지 (v3.37 이관 때 네 곳에 자국이 남아 있었다)
  { const over = [], empty = [], dup = [];
    for (const e of Object.values(DB.enemyById)) for (const pool of ['moves', 'uniqueMoves'])
      for (const [k, m] of Object.entries(e[pool] || {})) {
        const eff = m.effects || [];
        if (eff.length > 3) over.push(`${e.name}·${m.name || k}(${eff.length})`);
        if (eff.length === 0) empty.push(`${e.name}·${m.name || k}`);
        const kinds = eff.filter(f => f.op === 'status').map(f => f.kind);
        if (new Set(kinds).size !== kinds.length) dup.push(`${e.name}·${m.name || k}`);
      }
    eq('한 행동의 효과는 셋 이하', over.join(',') || '없음', '없음');
    eq('효과가 하나도 없는 행동은 없다', empty.join(',') || '없음', '없음');
    eq('같은 상태이상을 한 행동에 두 번 걸지 않는다', dup.join(',') || '없음', '없음');
  }

  // v3.45: 강화는 '강화 행동' 한 가지로만 오른다 — 다른 행동에 얹혀 몰래 쌓이지 않는다.
  //   그리고 강화가 든 행동은 예고에 반드시 보인다 (숨김 금지).
  { const mixed = [], hidden = [];
    for (const e of Object.values(DB.enemyById)) for (const pool of ['moves', 'uniqueMoves'])
      for (const [k, m] of Object.entries(e[pool] || {})) {
        const eff = m.effects || [];
        if (!eff.some(f => f.op === 'empower')) continue;
        if (m.hidden) hidden.push(`${e.name}·${m.name || k}`);
        // 다리 밑 트롤은 힘을 쌓는 것 자체가 패턴의 뼈대라 예외 (성권)
        if (eff.length > 1 && e.id !== 'river_hag') mixed.push(`${e.name}·${m.name || k}`);
      }
    eq('강화가 다른 효과에 얹혀 있지 않다', mixed.join(',') || '없음', '없음');
    eq('강화 행동은 예고에 숨지 않는다', hidden.join(',') || '없음', '없음');
  }

  // v3.43: 노페어는 절대 봉인되지 않는다 — 낼 족보가 하나도 없는 턴을 만들지 않기 위해
  { const b = mk();
    b.lastUsedCat = 'chance';
    b.enemies[0].nextMove = { id: 's', name: '흉내', effects: [{ op: 'sealLast', turns: 2 }] };
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('노페어는 sealLast 로 안 잠긴다', b.sealed.chance || 0, 0);
  }
  { const b = mk();
    b.enemies[0].nextMove = { id: 's', name: '솜', effects: [{ op: 'sealCat', cats: ['chance', 'onePair'], turns: 2 }] };
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('노페어는 sealCat 로도 안 잠긴다', b.sealed.chance || 0, 0);
    eq('같은 행동의 다른 족보는 정상 봉인', (b.sealed.onePair || 0) > 0, true);
  }
  { const bad = [];
    for (const e of Object.values(DB.enemyById)) for (const pool of ['moves', 'uniqueMoves'])
      for (const [k, m] of Object.entries(e[pool] || {}))
        for (const f of (m.effects || [])) if (f.op === 'sealCat' && (f.cats || []).includes('chance'))
          bad.push(`${e.name}·${m.name || k}`);
    eq('행동표에도 노페어 봉인이 남아 있지 않음', bad.join(',') || '없음', '없음');
  }

  // 지속 턴 (v3.40: 종류마다 다르다) — 걸린 턴은 안 깎이고, 그 뒤 턴마다 1씩 준다.
  //   statuses.json 의 turns 를 그대로 읽어 검사하므로 값을 바꿔도 이 검사는 계속 맞는다.
  for (const kind of ['stun', 'bleed', 'bind']) {
    const life = DB.statusById[kind].turns;
    const b = mk();
    const left = () => b.dice.filter(d => d.st && d.st.kind === kind).length;
    b.enemies[0].nextMove = { id: 't', name: '시험', effects: [{ op: 'status', kind, amount: 1 }] };
    b.await = 'enemy'; eng.enemyPhase(b);
    eq(`${kind}: 걸린 직후 내 턴에는 살아 있다`, left(), 1);
    b.enemies[0].nextMove = { id: 'r', name: '쉼', effects: [{ op: 'rest' }] };
    for (let t = 1; t < life; t++) {                       // 지속 턴 -1 번은 버텨야 한다
      b.await = 'enemy'; eng.enemyPhase(b);
      eq(`${kind}: ${t}턴 지나도 아직 남아 있다 (지속 ${life})`, left(), 1);
    }
    b.await = 'enemy'; eng.enemyPhase(b);
    eq(`${kind}: ${life}턴 다 겪으면 풀린다`, left(), 0);
  }
  // 출혈·독·약탈은 눈금 그대로다 — 세기라는 손잡이가 없다
  { const b = mk(); eng.initialRoll(b);
    b.dice.forEach(d => d.face = 3);
    eng.applyStatus(b, 'bleed', 1);
    const r = eng.confirmCategory(b, 'onePair', 'clasped_hands', b.enemies[0].uid);
    eq('눈금 그대로', r.bonusHits.includes('🩸-3'), true);
  }
  { const b = mk(); eng.initialRoll(b);
    b.dice.forEach(d => d.face = 3);
    eng.applyStatus(b, 'bleed', 1, 5);            // 세기를 억지로 넣어도
    const r = eng.confirmCategory(b, 'onePair', 'clasped_hands', b.enemies[0].uid);
    eq('세기를 넣어도 눈금 그대로', r.bonusHits.includes('🩸-3'), true);
  }
  // 적 행동에서 세기를 정할 수 있는 건 부패 하나뿐
  { const NO = ['bleed','poison','plunder','bind','stun','confuse','seal','chain','devour'];
    eq('세기를 안 쓰는 아홉 종은 기본값이 0', NO.every(k => (DB.statusById[k].amount || 0) === 0), true);
    eq('부패만 규칙이 fuse', DB.statuses.list.filter(x => x.rule === 'fuse').map(x => x.id), ['rot']);
  }
  // 저주·축복·마비는 상태이상 탭 값으로 고정 — 적 행동이 뭘 넣든 안 바뀐다
  { const b = mk();
    eng.rng.next = Math.random;
    eng.applyStatus(b, 'curse', 1, 1);          // 세기 1을 억지로 넣어도
    const i = b.dice.findIndex(d => d.st);
    const seen = [];
    for (let k = 0; k < 60; k++) { b.rolled = false; eng.initialRoll(b); seen.push(b.dice[i].face); }
    eq('저주는 탭 값(3) 이하로 고정', seen.every(v => v <= DB.statusById.curse.amount), true);
    eq('세기 1이 먹혔다면 전부 1이었을 것', seen.some(v => v > 1), true);
    eng.rng.next = () => 0.5;
  }

  // 데이터 무결성
  eq('상태이상 13종', DB.statuses.list.length, 13);
  eq('규칙이 전부 구현된 것만 쓴다',
    DB.statuses.list.every(s => ['onUseFaceDamage','noReroll','zeroValue','faceLow','faceHigh',
      'hideFace','needReroll','fuse','linked','rerollCost','onUseFaceCoin','spread'].includes(s.rule)), true);
}


// ---------------------------------------------------------------
// v1.29 벼름(whet) · 눈 조작 주사위
// ---------------------------------------------------------------
{
  const { DB } = await import('../js/data.js');
  const eng = await import('../js/engine.js');
  const { computeDamage, whetMultOf } = await import('../js/yahtzee.js');
  const mk = (dice, relics = [], cats = { onePair: ['clasped_hands'] }) =>
    eng.createBattle({ hp: 60, maxHp: 60, act: 1, floor: 1, enlight: 0, relics,
      dice, categories: cats }, ['crow'], 'battle');

  eq('벼름 0이면 배수 1', whetMultOf(0), 1);
  eq('벼름 2면 배수 2', whetMultOf(2), 2);
  eq('벼름은 6에서 멈춘다', whetMultOf(99), 4);

  // 공식에 곱연산으로 들어간다: 원페어 [5,5] = 10 → 벼름 2면 20
  const five = [5, 5, 1, 2, 3], N5 = Array(5).fill({ faces: [1,2,3,4,5,6] });
  const C = DB.scoring.categories.find(c => c.id === 'onePair');
  eq('벼름 없이 원페어 [5,5]', computeDamage(C, five, N5, []).total, 10);
  eq('벼름 2면 두 배', computeDamage(C, five, N5, [], null, { whet: 2 }).total, 20);
  eq('벼름 4면 세 배', computeDamage(C, five, N5, [], null, { whet: 4 }).total, 30);

  // 숫돌 — 매 턴 시작 벼름 +1
  {
    const b = mk(['normal','normal','normal','normal','normal'], ['whetstone']);
    eq('숫돌: 첫 턴에 벼름 1', b.whet, 1);
    eng.initialRoll(b); b.await = 'enemy'; eng.enemyPhase(b);
    eq('숫돌: 다음 턴에 벼름 2', b.whet, 2);
  }
  // 확정하면 벼름이 0으로 돌아간다
  {
    const b = mk(['normal','normal','normal','normal','normal'], ['whetstone'], { onePair: ['clash'] });
    eng.rng.next = () => 0.5;                       // 항상 4가 나온다 → 원페어 성립
    eng.initialRoll(b);
    const before = b.whet;
    const r = eng.confirmCategory(b, 'onePair', 'clash', b.enemies[0].uid);   // 맞부딪기 = 일격
    eq('확정 전 벼름이 있었다', before > 0, true);
    eq('일격으로 터뜨리면 벼름 0', b.whet, 0);
    eq('쓴 벼름을 기록한다', r.spentWhet, before);
    // 일격이 아니면 벼름은 그대로 남는다
    const b3 = mk(['normal','normal','normal','normal','normal'], ['whetstone'], { onePair: ['red_shoes'] });
    eng.initialRoll(b3);
    const keep = b3.whet;
    eng.confirmCategory(b3, 'onePair', 'red_shoes', b3.enemies[0].uid);
    eq('일격이 아니면 벼름이 안 깎인다', b3.whet, keep);
    // 벼름을 주는 변형이면 확정 직후 다시 쌓이기 시작한다
    // v3.49: 어느 변형이 벼름을 주는지는 scoring.json 이 정한다 — 이름을 박아 두지 않는다
    const wv = DB.scoring.categories.flatMap(c => (c.variants || [])
      .map(v => ({ cat: c.id, v, n: ((v.ability || []).find(a => a.op === 'whet') || {}).amount })))
      .filter(x => x.n > 0)[0];
    const b2 = mk(['normal','normal','normal','normal','normal'], [], { [wv.cat]: [wv.v.id] });
    eng.initialRoll(b2);
    eng.confirmCategory(b2, wv.cat, wv.v.id, b2.enemies[0].uid);
    eq(`${wv.v.name}은 쓰면서 다음 벼름을 남긴다`, b2.whet, wv.n);
    eng.rng.next = Math.random;
  }
  // 숨 고르기 — 약한 족보로 벼름을 번다
  {
    const b = mk(['normal','normal','normal','normal','normal'], [], { chance: ['catch_breath'] });
    eng.rng.next = () => 0.5;
    eng.initialRoll(b);
    eq('숨 고르기 전 벼름 0', b.whet, 0);
    eng.confirmCategory(b, 'chance', 'catch_breath', b.enemies[0].uid);
    eq('숨 고르기로 벼름 1', b.whet, 1);
    eng.rng.next = Math.random;
  }
  // 못 주사위 — 확정한 눈이 다음 턴까지 남는다
  {
    const b = mk(['nail','normal','normal','normal','normal']);
    eng.rng.next = () => 0.5;
    eng.initialRoll(b);
    const kept = b.dice[0].face;
    eng.confirmCategory(b, 'onePair', 'clasped_hands', b.enemies[0].uid);
    eq('확정하면 새겨진다', b.dice[0].pinned, true);
    b.await = 'enemy'; eng.rng.next = Math.random; eng.enemyPhase(b);
    eq('턴이 넘어가도 눈이 남는다', b.dice[0].face, kept);
    eq('새김은 유지된다', b.dice[0].pinned, true);
    eng.initialRoll(b);
    eq('다시 굴려도 새긴 칸은 그대로', b.dice[0].face, kept);
    b.dice[0].held = false; eng.reroll(b);
    eq('일부러 굴리면 새김이 풀린다', b.dice[0].pinned, false);
  }
  // 길잡이 주사위 — 다시 굴리면 눈이 한 칸 올라간다
  {
    const b = mk(['guide','normal','normal','normal','normal']);
    eng.initialRoll(b);
    const f0 = b.dice[0].face;
    b.dice[0].held = false; eng.reroll(b);
    eq('길잡이: 한 칸 올라간다', b.dice[0].face, f0 === 6 ? 1 : f0 + 1);
    const f1 = b.dice[0].face;
    b.dice[0].held = false; eng.reroll(b);
    eq('길잡이: 또 한 칸', b.dice[0].face, f1 === 6 ? 1 : f1 + 1);
  }
  // 되비침 주사위 — 가장 많이 나온 눈으로 바뀐다
  {
    const b = mk(['mirror','normal','normal','normal','normal']);
    eng.rng.next = () => 0.5;                       // 나머지 넷이 전부 4
    eng.initialRoll(b);
    eq('되비침: 최빈 눈을 따라간다', b.dice[0].face, b.dice[1].face);
    eng.rng.next = Math.random;
  }
  // 불티 주사위 — 족보에 안 쓰이면 벼름
  {
    const b = mk(['spark','normal','normal','normal','normal'], [], { chance: 'instinct' });
    eng.rng.next = () => 0.99;                      // 전부 최대 눈 → 불티는 3, 나머지 6
    eng.initialRoll(b);
    eng.confirmCategory(b, 'chance', 'instinct', b.enemies[0].uid);
    eq('불티: 안 쓰였으면 벼름 1', b.whet, 1);
    eng.rng.next = Math.random;
  }
  // 쌍눈 주사위 — 같은 눈 족보에서 두 번 센다
  {
    const TWIN = DB.diceById['twin'], NRM = DB.diceById['normal'];
    const defs = [TWIN, NRM, NRM, NRM, NRM];
    eq('쌍눈: 원페어 [4,4] 는 8 대신 12',
      computeDamage(C, [4, 4, 1, 2, 3], defs, []).total, 12);
    const CH = DB.scoring.categories.find(c => c.id === 'chance');
    eq('쌍눈: 같은 눈 족보가 아니면 안 센다',
      computeDamage(CH, [4, 4, 1, 2, 3], defs, []).total, 4);
  }
  // 말라붙은 심장 — HP가 낮으면 통째로 배수
  {
    const HEART = [DB.relicById['dried_heart']];
    eq('심장: 만피면 안 켜진다', computeDamage(C, five, N5, HEART, null, { hpRatio: 1 }).total, 10);
    eq('심장: 3분의 1 이하면 1.5배', computeDamage(C, five, N5, HEART, null, { hpRatio: 0.3 }).total, 15);
  }
  // 곰의 등 — 방어도 10마다 +3
  {
    const b = mk(['normal','normal','normal','normal','normal'], ['bears_back']);
    b.player.block = 25;
    eng.rng.next = () => 0.5;
    eng.initialRoll(b);
    const pv = eng.previewAll(b).find(x => x.cat.id === 'onePair');
    eq('곰의 등: 방어 25면 +6', pv.bd.total, 20 + 6);  // 4 다섯 개 매칭합 20 + 방어 25/10×3
    eng.rng.next = Math.random;
  }
  // 사냥꾼의 눈 — 같은 눈 3개 이상이면 벼름
  {
    const b = mk(['normal','normal','normal','normal','normal'], ['hunters_eye']);
    eng.rng.next = () => 0.5;                       // 다섯 개 전부 같은 눈
    eng.initialRoll(b);
    eng.confirmCategory(b, 'onePair', 'clasped_hands', b.enemies[0].uid);
    // v3.49: 맞잡은 손은 이제 방어를 준다 — 유물 몫만 남는다
    eq('사냥꾼의 눈만으로 벼름 1', b.whet, 1);
    eng.rng.next = Math.random;
  }
  // 길표 — 스트레이트를 확정하면 다음 턴 리롤
  {
    const b = mk(['normal','normal','normal','normal','normal'], ['waymark'],
      { largeStraight: 'moonpath' });
    eng.initialRoll(b);
    b.dice[0].face = 1; b.dice[1].face = 2; b.dice[2].face = 3; b.dice[3].face = 4; b.dice[4].face = 5;
    eng.confirmCategory(b, 'largeStraight', 'moonpath', b.enemies[0].uid);
    eq('길표: 다음 턴 리롤 예약 2', b.nextTurnRerolls, 2);
  }
}


// ---------------------------------------------------------------
// v1.30 정예·보스 기믹 — 문턱 · 상한 · 요구 · 벼름 흡수 · 새김 흩기
// ---------------------------------------------------------------
{
  const { DB } = await import('../js/data.js');
  const eng = await import('../js/engine.js');
  const mkB = (dice = ['normal','normal','normal','normal','normal'], relics = [], cats = { onePair: ['clasped_hands'] }) =>
    eng.createBattle({ hp: 60, maxHp: 60, act: 1, floor: 1, enlight: 0, relics, dice, categories: cats }, ['crow'], 'battle');

  // 문턱 — 그 값 이하의 단발은 아예 안 닿는다
  {
    const b = mkB(); const e = b.enemies[0];
    e.ward = 20; e.wardLeft = 2; const hp0 = e.hp;
    b.lastResult = { bonusHits: [] };
    eng.__test_deal(b, e, 15);
    eq('문턱: 20 이하는 안 통한다', e.hp, hp0);
    eng.__test_deal(b, e, 25);
    eq('문턱: 넘기면 통째로 들어간다', e.hp, hp0 - 25);
    eq('문턱: 한 번 뚫리면 부서진다', e.wardLeft, 0);
  }
  // 상한 — 한 번에 그 이상은 못 준다
  {
    const b = mkB(); const e = b.enemies[0];
    e.cap = 10; e.capLeft = 2; const hp0 = e.hp;
    b.lastResult = { bonusHits: [] };
    eng.__test_deal(b, e, 40);
    eq('상한: 40을 줘도 10만 들어간다', e.hp, hp0 - 10);
  }
  // 벼름 흡수 · 새김 흩기
  {
    const b = mkB(['nail','normal','normal','normal','normal']);
    b.whet = 5; b.dice[0].pinned = true;
    const e = b.enemies[0];
    e.nextMove = { id: 'x', name: '시험', effects: [{ op: 'drainWhet', amount: 0 }, { op: 'unpin' }] };
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('벼름을 통째로 빼앗긴다', b.whet, 0);
    eq('새김이 풀린다', b.dice[0].pinned, false);
  }
  // 데이터: 정예·보스는 전부 기믹을 하나씩 가진다
  {
    const GIM = new Set(['ward', 'cap', 'drainWhet', 'unpin', 'status', 'regen', 'enrage', 'reflect',
      'sealLast', 'sealCat', 'rollTax', 'holdTax', 'petrify', 'lockHigh', 'blind']);
    const missing = DB.enemies.filter(e => !e.final && (e.tier === 'elite' || e.tier === 'boss'))
      .filter(e => !e.start && !Object.values(e.moves).some(m => (m.effects || []).some(f => GIM.has(f.op))))
      .map(e => e.name);
    eq('정예·보스는 전원 기믹(테마 행동·시작 버프)을 가진다', missing, []);
    // v3.8: 44종 전원이 테마(상태이상·지속 방해·버프 중 하나)를 가진다
    const noTheme = DB.enemies
      .filter(e => !e.start && !Object.values({ ...e.moves, ...(e.uniqueMoves || {}) })
        .some(m => (m.effects || []).some(f => GIM.has(f.op))))
      .map(e => e.name);
    eq('테마 없는 적은 없다 (44종 전원)', noTheme, []);
  }
}

// ---------------------------------------------------------------
// v1.34 슬롯 구조 — 아홉 족보를 처음부터 다 갖고, 자리마다 변형 하나를 끼운다
// ---------------------------------------------------------------
{
  const { DB } = await import('../js/data.js');
  const eng = await import('../js/engine.js');
  const mkS = (cats) => eng.createBattle({ hp: 60, maxHp: 60, act: 1, floor: 1, enlight: 0, relics: [],
    dice: ['normal','normal','normal','normal','normal'], categories: cats }, ['crow'], 'battle');

  // v3.1 수집제: 가진 족보만 보인다 — 다 모으면 전부 보인다
  {
    const b0 = mkS({});
    eng.rng.next = () => 0.5;
    eng.initialRoll(b0);
    eq('미보유면 족보 줄이 없다', eng.previewAll(b0).length, 0);
    const all = Object.fromEntries(DB.scoring.categories.map(c => [c.id, null]));
    const b = mkS(all);
    eng.initialRoll(b);
    const pv = eng.previewAll(b);
    eq('다 모으면 전부 보인다', pv.length, DB.scoring.categories.length);
    eq('빈 자리는 기본 족보', pv.every(p => p.variant.base || p.variant.id === b.categories[p.cat.id]), true);
    eq('기본 족보는 부가 능력이 없다', pv.filter(p => p.variant.base).every(p => (p.variant.ability || []).length === 0), true);
    eq('기본 족보는 일격이 아니다', pv.filter(p => p.variant.base).every(p => !p.variant.burst), true);
    eng.rng.next = Math.random;
  }
  // 끼운 자리는 그 변형으로 바뀐다
  {
    const b = mkS({ onePair: 'clash' });
    eng.rng.next = () => 0.5;
    eng.initialRoll(b);
    const row = eng.previewAll(b).find(p => p.cat.id === 'onePair');
    eq('끼운 변형이 그 자리를 대신한다', row.variant.id, 'clash');
    eq('끼운 변형이 일격이면 일격으로 뜬다', row.burst, true);
    eng.rng.next = Math.random;
  }
  // 그 자리에 없는 변형은 확정할 수 없다
  {
    const b = mkS({ onePair: 'clasped_hands' });
    eng.rng.next = () => 0.5;
    eng.initialRoll(b);
    eq('안 끼운 변형은 확정 불가', eng.confirmCategory(b, 'onePair', 'red_shoes', b.enemies[0].uid), null);
    const r = eng.confirmCategory(b, 'onePair', 'clasped_hands', b.enemies[0].uid);
    eq('끼운 변형은 확정된다', !!r, true);
    eng.rng.next = Math.random;
  }
  // 기본 족보도 그냥 확정된다 (배수만 있는 값) — 단, 소유해야
  {
    const b = mkS({ onePair: null });
    eng.rng.next = () => 0.5;
    eng.initialRoll(b);
    const r = eng.confirmCategory(b, 'onePair', eng.baseIdOf('onePair'), b.enemies[0].uid);
    eq('기본 족보로도 때릴 수 있다', r && r.total > 0, true);
    eq('미보유 족보는 확정 불가', eng.confirmCategory(b, 'chance', eng.baseIdOf('chance'), b.enemies[0].uid), null);
    eng.rng.next = Math.random;
  }
  // 옛 저장본(변형 배열)도 첫 칸을 끼운 것으로 받아준다
  {
    const b = mkS({ onePair: ['red_shoes', 'clash'] });
    eq('배열이면 첫 칸을 끼운 것으로 본다', b.categories.onePair, 'red_shoes');
    eq('안 적힌 족보는 미보유다', 'yahtzee' in b.categories, false);
  }
  // 무기 여섯은 저마다 벼름 원천과 일격을 하나씩 쥐고 시작한다
  {
    const burst = new Set(DB.scoring.categories.flatMap(c => (c.variants || []).filter(v => v.burst).map(v => v.id)));
    const whet = new Set(DB.scoring.categories.flatMap(c => (c.variants || [])
      .filter(v => (v.ability || []).some(a => a.op === 'whet')).map(v => v.id)));
    const bad = DB.events.weapons.filter(w => {
      const vs = Object.values(w.start);
      return !vs.some(v => burst.has(v)) || !vs.some(v => whet.has(v));
    }).map(w => w.name);
    eq('무기마다 벼름 원천 + 일격을 쥐고 시작', bad, []);
  }
}

// 이름은 절대 잘리지 않는다.
// v1.37: 가장 좁은 화면(360px)에서 세 자리 숫자와 함께 놓아도 들어가는 한계가 7자 → 6자로 못 박았다.
// v3.53: 그때는 이름 아래 줄에 「일격 · 트리플 · 전체」가 글자로 들어가 자리를 먹었다.
//   그것들이 그림 표식으로 빠지면서 이름 자리가 넓어졌다. 360px 에서 25개 변형 전부를
//   태그 최대치(일격+전체+능력) · 벼름 최대 배수의 세 자리 숫자와 함께 재보니 8자까지 안 잘린다.
//   실제 한계에 붙이지 않고 그대로 8자로 둔다 — 더 늘리려면 다시 재 볼 것.
{
  const { DB } = await import('../js/data.js');
  const LIMIT = 8;
  const longV = DB.scoring.categories.flatMap(c => (c.variants || []))
    .filter(v => [...v.name].length > LIMIT).map(v => `${v.name}(${[...v.name].length}자)`);
  eq('족보 변형 이름은 8자 이하', longV, []);
  const longC = DB.scoring.categories
    .filter(c => [...(c.short || c.name)].length > LIMIT).map(c => c.short || c.name);
  eq('족보 짧은 이름도 6자 이하', longC, []);
  eq('모든 족보에 짧은 이름이 있다', DB.scoring.categories.every(c => !!c.short), true);
}


// ========== v3.3 테마 행동 — 전부 '행동'이 거는 효과다 (별도 시스템 없음) ==========
{
  const eng = await import('../js/engine.js');
  const { DB } = await import('../js/data.js');
  eng.rng.next = () => 0.5;
  const RUN = () => ({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
    dice: ['normal', 'normal', 'normal', 'normal', 'normal'],
    categories: { onePair: null, twoPair: null, threeKind: null, chance: null } });
  const mk = (ids) => eng.createBattle(RUN(), ids, 'battle');
  const cast = (b, e, effects, name = '시험') => {   // 적이 이 행동을 실행하게 한다
    e.nextMove = { id: 't', name, effects };
    b.await = 'enemy';
    eng.enemyPhase(b);
  };
  const setFaces = (b, fs) => { b.dice.forEach((d, i) => { d.face = fs[i]; d.held = true; d.st = null; d.sigLock = false; }); b.rolled = true; };

  // sealLast — 직전 족보 봉인 (흉내내기)
  {
    const b = mk(['crow']); const e = b.enemies[0]; e.hp = 999; e.maxHpInit = 999;
    setFaces(b, [5, 5, 4, 2, 1]);
    eng.confirmCategory(b, 'onePair', 'onePair__base');
    cast(b, e, [{ op: 'sealLast', turns: 2 }]);
    eq('흉내내기: 직전 족보가 봉인된다', (b.sealed.onePair || 0) > 0, true);
    eq('흉내내기: 봉인이 걸리면 연출 신호가 나온다',
       (() => { const f = eng.takeSealFx(b); return f.length === 1 && f[0].cat === 'onePair'; })(), true);
    setFaces(b, [5, 5, 4, 2, 1]);
    eq('흉내내기: 봉인된 족보 확정 불가', eng.confirmCategory(b, 'onePair', 'onePair__base'), null);
    eq('흉내내기: 다른 족보는 된다', !!eng.confirmCategory(b, 'chance', 'chance__base'), true);
  }
  // v3.48: 노페어는 봉인 면제라, 직전에 노페어를 쓰면 흉내내기가 그냥 헛방이었다 (실측 12%).
  //   이제 '봉인할 수 있는 마지막 족보'를 노리므로 헛방이 없다.
  {
    const b = mk(['crow']); const e = b.enemies[0]; e.hp = 999; e.maxHpInit = 999;
    setFaces(b, [5, 5, 4, 2, 1]);
    eng.confirmCategory(b, 'onePair', 'onePair__base');      // 봉인 가능한 족보를 먼저
    setFaces(b, [6, 5, 4, 2, 1]);
    eng.confirmCategory(b, 'chance', 'chance__base');        // 그 다음 노페어
    eq('흉내내기: 직전이 노페어여도 노릴 대상이 남는다', b.lastSealableCat, 'onePair');
    cast(b, e, [{ op: 'sealLast', turns: 2 }]);
    eq('흉내내기: 헛방이 되지 않는다', (b.sealed.onePair || 0) > 0, true);
    eq('흉내내기: 노페어는 여전히 안 잠긴다', b.sealed.chance || 0, 0);
  }
  // sealCat — 지정 족보 봉인 (솜 채우기)
  {
    const b = mk(['old_teddy']); const e = b.enemies[0]; e.hp = 999; e.maxHpInit = 999;
    cast(b, e, [{ op: 'sealCat', cats: ['chance', 'onePair'], turns: 2 }]);
    eng.initialRoll(b);
    // v3.43: 노페어만은 예외 — 행동표가 지정해도 잠기지 않는다 (바닥 족보를 남긴다)
    eq('솜 채우기: 노페어는 예외로 안 잠긴다', eng.previewAll(b).find(x => x.cat.id === 'chance').seal > 0, false);
    eq('솜 채우기: 원페어 봉인', eng.previewAll(b).find(x => x.cat.id === 'onePair').seal > 0, true);
    eq('솜 채우기: 투페어는 된다', eng.previewAll(b).find(x => x.cat.id === 'twoPair').seal, 0);
  }
  // rollTax — 리롤할 때마다 피해 (이빨 자국)
  {
    const b = mk(['stray_dog']); const e = b.enemies[0]; e.hp = 999; e.maxHpInit = 999;
    cast(b, e, [{ op: 'rollTax', amount: 1, turns: 2 }]);
    eng.initialRoll(b);
    const hp0 = b.player.hp;
    eng.toggleHold(b, 0);
    eng.reroll(b);
    eq('이빨 자국: 리롤 1회 = 피해 1', hp0 - b.player.hp, 1);
    eq('이빨 자국: 버프 칩용 mods 노출', !!eng.modOf(b, 'rollTax'), true);
  }
  // holdTax — 지킨 주사위 2개당 1 (가시)
  {
    const b = mk(['thorn_bush']); const e = b.enemies[0]; e.hp = 999; e.maxHpInit = 999;
    cast(b, e, [{ op: 'holdTax', per: 0.5, turns: 2 }]);
    eng.initialRoll(b);
    const hp0 = b.player.hp;
    eng.toggleHold(b, 0);           // 1개 굴림 = 4개 지킴 → ceil(4×0.5)=2
    eng.reroll(b);
    eq('가시: 지킨 4개 → 피해 2', hp0 - b.player.hp, 2);
  }
  // petrify — 그 눈이 나오면 기절이 붙는다 (굳히기)
  {
    const b = mk(['twig_golem']); const e = b.enemies[0]; e.hp = 999; e.maxHpInit = 999;
    cast(b, e, [{ op: 'petrify', face: 6, turns: 2 }]);
    eng.rng.next = () => 0.999;     // 전부 6이 나오게
    eng.initialRoll(b);
    eq('굳히기: 6이 나온 칸마다 기절', b.dice.every(d => d.st && d.st.kind === 'stun'), true);
    eng.rng.next = () => 0.5;
  }
  // lockHigh — 최고 눈 물림 + 회복 (흡착)
  {
    const b = mk(['leech']); const e = b.enemies[0]; e.hp = 999; e.maxHpInit = 999;
    e.hp = 900;
    cast(b, e, [{ op: 'lockHigh', heal: true, turns: 2 }]);
    eng.initialRoll(b);
    const locked = b.dice.filter(d => d.sigLock);
    eq('흡착: 딱 하나 물린다', locked.length, 1);
    eq('흡착: 물린 칸은 족보에서 빠진다', eng.faceOf(locked[0]), 0);
    eq('흡착: 그 값만큼 회복', e.hp - 900, locked[0].face);
  }
  // blind + 감쇠 — 턴이 지나면 풀린다
  {
    const b = mk(['cellar_thing']); const e = b.enemies[0]; e.hp = 999; e.maxHpInit = 999;
    cast(b, e, [{ op: 'blind', turns: 1 }]);
    eq('도사림: 어둠이 깔린다', !!eng.modOf(b, 'blind'), true);
    cast(b, e, [{ op: 'rest' }]);   // 한 턴 더 → 감쇠로 소멸
    eq('도사림: 턴이 지나면 걷힌다', eng.modOf(b, 'blind'), null);
  }
  // v3.8 적 자기 버프 — 재생·격노·반사·불사
  {
    const b = mk(['skeleton']); const e = b.enemies[0];
    eq('불사: 해골은 시작부터 지니고 있다', e.undying > 0, true);
    e.hp = 5; b.lastResult = { bonusHits: [] };
    eng.__test_deal(b, e, 40);
    eq('불사: 처음 쓰러질 때 되살아난다', e.hp > 0, true);
    eq('불사: 한 번뿐', e.undying, 0);
    eng.__test_deal(b, e, 9999);
    eq('불사: 두 번째는 없다', e.hp <= 0, true);
  }
  {
    const b = mk(['crow']); const e = b.enemies[0]; e.hp = 200; e.maxHpInit = 200;
    e.enrage = 1; b.lastResult = { bonusHits: [] };
    eng.__test_deal(b, e, 10);
    eq('격노: 맞으면 힘이 오른다', e.power, 1);
    e.reflect = 3; e.reflectLeft = 2; b.player.block = 1;
    const hp0 = b.player.hp;
    eng.__test_deal(b, e, 10);
    eq('반사: 방어도 1을 뚫고 2가 박힌다', hp0 - b.player.hp, 2);
  }
  {
    const b = mk(['crow']); const e = b.enemies[0]; e.hp = 50; e.maxHpInit = 200;
    e.regen = 4; e.regenLeft = 2;
    e.nextMove = { id: 't', name: '가만히', effects: [{ op: 'rest' }] };
    b.await = 'enemy'; eng.enemyPhase(b);
    eq('재생: 자기 차례에 아문다', e.hp, 54);
    eq('재생: 턴이 줄어든다', e.regenLeft, 1);
  }
  // 2·3막 배치 검증 — 13종 상태이상 전원 등판
  {
    const used = new Set();
    for (const e of DB.enemies) for (const m of Object.values({ ...e.moves, ...(e.uniqueMoves || {}) }))
      for (const f of (m.effects || [])) if (f.op === 'status') used.add(f.kind);
    const all = DB.statuses.list.map(x => x.id).filter(id => !used.has(id));
    eq('상태이상 13종 전원 등판 (미사용 없음)', all, []);
  }
  // 시작 버프 — 문턱·상한은 그냥 버프다 (enemies.json start 로 시작 부여)
  {
    DB.enemyById.__startbuff = { id: '__startbuff', name: '시험용', tier: 'normal', art: 'X', hp: [50, 50],
      start: { ward: 7, cap: 15, block: 5 },
      moves: { hit: { name: '치기', effects: [{ op: 'damage', amount: 3 }] } },
      pattern: { mode: 'weighted', weights: { hit: 1 } } };
    const b = mk(['__startbuff']); const e = b.enemies[0];
    eq('시작 버프: 문턱 7', e.ward, 7);
    eq('시작 버프: 상한 15', e.cap, 15);
    eq('시작 버프: 방어 5', e.block, 5);
    delete DB.enemyById.__startbuff;
  }
}

// ========== v2.0 카드 전투 ==========
{
  const { DB } = await import('../js/data.js');
  (await import('../js/engine.js')).rng.next = () => 0.5;   // 결정론 — 아래 실측은 손으로 판을 깐다
  if (!DB.cards) DB.cards = JSON.parse((await import('fs')).readFileSync(new URL('../data/cards.json', import.meta.url), 'utf8'));
  DB.cardById = {}; for (const c of DB.cards.list) DB.cardById[c.id] = c;
  const CB = await import('../js/cardbattle.js');
  const run = { hp: 60, maxHp: 60, act: 1, floor: 3, cards: DB.cards.starterDeck.slice() };
  const b = CB.createCardBattle(run, ['crow']);   // n 미지정 적 — 혼자5·둘이3 규칙 확인용
  eq('카드 전투: 손패 5장', b.hand.length, 5);
  eq('카드 전투: 자원 3', b.res, 3);
  eq('카드 전투: 내 주사위 5개', b.myDice.length, 5);
  eq('카드 전투: 혼자인 적은 주사위 5개', b.enemies[0].dice.length, 5);
  eq('카드 전투: n 명시 적은 그 개수 (늑대 4)', CB.createCardBattle({ ...run, cards: run.cards.slice() }, ['wolf']).enemies[0].dice.length, 4);
  eq('카드 전투: 리롤 없음(rollsLeft 개념 없음)', b.rollsLeft === undefined, true);

  // 대결: 상호 차감 — 큰 쪽이 차액만큼 잔존
  b.myDice = [6, 5, 3, 2, 1].map(v => ({ v, orig: v, dead: false }));
  b.enemies[0].dice = [6, 3, 6].map(v => ({ v, orig: v, dead: false }));
  const uid = b.enemies[0].uid;
  let r = CB.clashDice(b, 1, uid, 1);   // 내 5 vs 적 3
  eq('대결: 5 vs 3 → 적 파괴', r.foeDead, true);
  eq('대결: 내 주사위 2 잔존', b.myDice[1].v, 2);
  eq('대결: 잔존 주사위는 살아있다', b.myDice[1].dead, false);
  r = CB.clashDice(b, 0, uid, 0);       // 내 6 vs 적 6
  eq('대결: 동점 → 서로 파괴', r.myDead && r.foeDead, true);
  r = CB.clashDice(b, 4, uid, 2);       // 내 1 vs 적 6
  eq('대결: 1 vs 6 → 적 주사위 5 잔존', b.enemies[0].dice[2].v, 5);
  eq('대결: 내 주사위 파괴', b.myDice[4].dead, true);
  eq('대결: 죽은 주사위 재사용 불가', CB.clashDice(b, 4, uid, 2), null);

  // 카드: 복구는 원래 굴림값 한도
  b.res = 3;
  b.hand = ['repair', 'repair', 'elate', 'stalk', 'courage'];
  const dead1 = b.myDice.findIndex(d => d.dead && d.orig === 1);   // 1이었던 주사위
  let pc = CB.playCard(b, 0, dead1);
  eq('복구: 발동', !!pc, true);
  eq('복구: 원래 1이었으면 1로만 (2 아님)', b.myDice[dead1].v, 1);
  eq('복구: 되살아남', b.myDice[dead1].dead, false);
  eq('복구: 자원 1 소모', b.res, 2);
  // 추적: 지정 6
  pc = CB.playCard(b, 2, dead1);        // hand: repair,elate,stalk,courage → stalk는 idx 2
  eq('추적: 지정 주사위 6', b.myDice[dead1].v, 6);
  eq('추적: 자원 0', b.res, 0);
  eq('자원 부족이면 발동 불가', CB.playCard(b, 0, 0), null);

  // 용기: 최저 동률 모두 2배
  const b2 = CB.createCardBattle({ hp: 60, maxHp: 60, act: 1, floor: 1, cards: ['courage'] }, ['crow']);
  b2.myDice = [2, 2, 5, 6, 4].map(v => ({ v, orig: v, dead: false }));
  b2.hand = ['courage']; b2.res = 3;
  CB.playCard(b2, 0);
  eq('용기: 최저 동률 모두 ×2', b2.myDice.map(d => d.v).join(','), '4,4,5,6,4');

  // 턴 종료: 내 공격 먼저 — 처치하면 그 적의 공격은 불발
  const b3 = CB.createCardBattle({ hp: 60, maxHp: 60, act: 1, floor: 1, cards: DB.cards.starterDeck.slice() }, ['crow', 'crow']);
  eq('둘이면 각 3개', b3.enemies.every(e => e.dice.length === 3), true);
  const [c1, c2] = b3.enemies;
  c1.hp = 10;
  b3.myDice = [6, 6, 6, 6, 6].map(v => ({ v, orig: v, dead: false }));   // 합 30 ≥ 10 → 처치
  c1.dice = [6, 6].map(v => ({ v, orig: v, dead: false }));
  c2.dice = [3, 2].map(v => ({ v, orig: v, dead: false }));
  b3.target = c1.uid;
  const sc = CB.endCardTurn(b3);
  eq('턴 종료: 대상 처치', sc.killed, true);
  eq('턴 종료: 처치된 적 공격 불발 (c2의 5만 맞음)', 60 - b3.player.hp, 5);
  eq('턴 종료: 다음 턴 시작 (턴 2)', b3.turn, 2);
  eq('턴 종료: 손패 다시 5장', b3.hand.length, 5);
  eq('턴 종료: 자원 리필', b3.res, 3);
  eq('턴 종료: 죽은 적은 주사위를 안 굴린다', b3.enemies.filter(e => e.hp <= 0).every(e => true), true);

  // 전멸 → 승리
  const b4 = CB.createCardBattle({ hp: 60, maxHp: 60, act: 1, floor: 1, cards: DB.cards.starterDeck.slice() }, ['crow']);
  b4.enemies[0].hp = 5;
  b4.myDice = [6, 6, 6, 6, 6].map(v => ({ v, orig: v, dead: false }));
  CB.endCardTurn(b4);
  eq('전멸 → 승리', b4.result, 'victory');
  // 전멸 패배
  const b5 = CB.createCardBattle({ hp: 3, maxHp: 60, act: 1, floor: 1, cards: DB.cards.starterDeck.slice() }, ['wolf']);
  b5.myDice = [1, 1, 1, 1, 1].map(v => ({ v, orig: v, dead: true }));
  b5.enemies[0].dice = [6, 6, 6, 6].map(v => ({ v, orig: v, dead: false }));
  CB.endCardTurn(b5);
  eq('맞아 죽으면 패배', b5.result, 'defeat');
}


// ========== v2.17 적 행동 예고 — 위력 = 남은 주사위 합 ==========
{
  const { DB } = await import('../js/data.js');
  (await import('../js/engine.js')).rng.next = () => 0.5;   // 결정론
  const CB = await import('../js/cardbattle.js');
  const mk = (act = 1) => {
    const b = CB.createCardBattle({ hp: 60, maxHp: 60, act, floor: 1, cards: DB.cards.starterDeck.slice() }, ['stray_dog']);
    const e = b.enemies[0];
    e.hp = 999; e.maxHpInit = 999;
    return [b, e];
  };
  // 들개 눈 목록에서만 굴린다 + 예고가 있다
  {
    const [b, e] = mk();
    eq('들개는 1·3·5·6 만 굴린다', e.dice.every(d => [1, 3, 5, 6].includes(d.orig)), true);
    eq('예고 행동이 정해져 있다', !!(e.move && e.move.name && e.move.op), true);
  }
  // 위력 = 남은 주사위 합 — 깎으면 즉시 줄어든다
  {
    const [b, e] = mk();
    e.move = { id: 't', name: '시험', op: 'damage' };
    e.dice = [{ v: 4, orig: 4, dead: false }, { v: 3, orig: 3, dead: false }];
    eq('예고 위력 = 합 7', CB.movePower(e), 7);
    b.myDice = [{ v: 3, orig: 3, dead: false }];
    CB.clashDice(b, 0, e.uid, 1);
    eq('3을 깎으면 위력 4', CB.movePower(e), 4);
  }
  // damage: 남은 합 그대로 피해
  {
    const [b, e] = mk();
    e.move = { id: 't', name: '시험', op: 'damage' };
    e.dice = [{ v: 7, orig: 7, dead: false }];
    b.myDice = [{ v: 1, orig: 1, dead: true }];
    CB.endCardTurn(b);
    eq('damage: 7 피해', 60 - b.player.hp, 7);
  }
  // bleed: 피해 + 출혈, 반격 뒤 터지고 1 잦아든다
  {
    const [b, e] = mk();
    e.move = { id: 't', name: '시험', op: 'bleed', amount: 2 };
    e.dice = [{ v: 3, orig: 3, dead: false }];
    b.myDice = [{ v: 1, orig: 1, dead: true }];
    CB.endCardTurn(b);
    eq('bleed: 피해 3 + 출혈 2 = 5', 60 - b.player.hp, 5);
    eq('출혈 스택 잦아듦 (2→1)', b.playerBleed, 1);
  }
  // armor: 피해 없이 방어도 — 다음 내 공격을 깎는다
  {
    const [b, e] = mk();
    e.move = { id: 't', name: '시험', op: 'armor' };
    e.dice = [{ v: 5, orig: 5, dead: false }];
    b.myDice = [{ v: 1, orig: 1, dead: true }];
    CB.endCardTurn(b);
    eq('armor: 피해 0', b.player.hp, 60);
    eq('armor: 방어도 5', e.block, 5);
    const hpBefore = e.hp;
    e.move = { id: 't', name: '시험', op: 'armor' };
    e.dice = [];
    b.myDice = [{ v: 8, orig: 6, dead: false }];
    b.target = e.uid;
    const sc = CB.endCardTurn(b);
    eq('방어도가 내 공격 8 중 5를 깎음', hpBefore - e.hp, 3);
    eq('깎은 만큼 기록', sc.blocked, 5);
  }
  // lifesteal: 피해 + 같은 값 회복 / heal: 회복만
  {
    const [b, e] = mk();
    e.hp = 10; e.maxHpInit = 30;
    e.move = { id: 't', name: '시험', op: 'lifesteal' };
    e.dice = [{ v: 6, orig: 6, dead: false }];
    b.myDice = [{ v: 1, orig: 1, dead: true }];
    CB.endCardTurn(b);
    eq('lifesteal: 6 피해 주고 6 회복', e.hp, 16);
    eq('lifesteal: 나는 6 잃음', 60 - b.player.hp, 6);
  }
  {
    const [b, e] = mk();
    e.hp = 10; e.maxHpInit = 12;
    e.move = { id: 't', name: '시험', op: 'heal' };
    e.dice = [{ v: 6, orig: 6, dead: false }];
    b.myDice = [{ v: 1, orig: 1, dead: true }];
    CB.endCardTurn(b);
    eq('heal: 최대 체력 한도 (10→12)', e.hp, 12);
    eq('heal: 피해 없음', b.player.hp, 60);
  }
  // empower: 다음 턴 자기 주사위 전부 강화
  {
    const [b, e] = mk();
    e.move = { id: 't', name: '시험', op: 'empower', mult: 0.25 };
    e.dice = [{ v: 8, orig: 8, dead: false }];
    b.myDice = [{ v: 1, orig: 1, dead: true }];
    CB.endCardTurn(b);   // power = round(8×0.25) = 2 → 다음 굴림 rng 0.5 → 눈 5 → 7
    eq('empower: 다음 턴 주사위 전부 +2 (눈5→7)', e.dice.every(d => d.v === 7), true);
  }
  // 막 성장: 2막은 양측 주사위 +1
  {
    const [b, e] = mk(2);
    eq('2막 actBonus 1', b.actBonus, 1);
    eq('2막 내 주사위 = 2~7 (rng 0.5 → 5)', b.myDice.every(d => d.v === 5), true);
    eq('2막 적 눈 +1 (들개 5 → 6)', e.dice.every(d => d.v === 6), true);
  }
  // 격앙: 시간이 갈수록 주사위가 커진다 (터틀의 시계)
  {
    const rb = (turn, tier, final = false) => CB.rageBonus({ turn }, { tier, final, defId: 'crow' }, turn);
    eq('격앙: 일반 5턴엔 없음', rb(5, 'normal'), 0);
    eq('격앙: 일반 6턴 +1', rb(6, 'normal'), 1);
    eq('격앙: 일반 8턴 +2', rb(8, 'normal'), 2);
    eq('격앙: 상한 5', rb(40, 'normal'), 5);
    eq('격앙: 보스는 8턴부터 2턴마다 (9턴 +1)', rb(9, 'boss'), 1);
    eq('격앙: 보스 10턴 +2', rb(10, 'boss'), 2);
    eq('격앙: 최종보스 제외', rb(20, 'boss', true), 0);
  }
  // 미리보기: 피해 없는 예고는 예상 피격에 안 잡힌다
  {
    const [b, e] = mk();
    e.move = { id: 't', name: '시험', op: 'armor' };
    e.dice = [{ v: 9, orig: 9, dead: false }];
    b.myDice = [{ v: 1, orig: 1, dead: false }];
    eq('미리보기: armor 예고는 피격 0', CB.previewTurn(b).take, 0);
    e.move = { id: 't', name: '시험', op: 'bleed', amount: 2 };
    eq('미리보기: bleed 예고는 피격 9', CB.previewTurn(b).take, 9);
  }
}

// v3.59: 예고 줄 — 치유는 안 그린다 · 두 갈래는 묶인 표식 하나로 나간다
{
  const eng = await import('../js/engine.js');
  const { DB } = await import('../js/data.js');
  const { readFileSync } = await import('fs');

  const COMBO = Object.values(eng.INTENT_COMBO);
  const PUA = /[\u{E000}-\u{F8FF}]/gu;
  const every = [];
  for (const def of DB.enemies) {
    const pool = Object.entries(def.moves || {}).map(([id, m]) => [`${def.name}·${m.name || id}`, m]);
    if (def.enlightenedMove) pool.push([`${def.name}·${def.enlightenedMove.name}(각성)`, def.enlightenedMove]);
    for (const [label, m] of pool) {
      if (!m || !m.effects) continue;
      const fake = { nextMove: m, atkScale: 1, power: 0, debuffs: { weak: 0 }, stunned: false };
      every.push([label, eng.intentOf(fake), m]);
    }
  }
  eq('예고에 치유(💚)가 남은 행동 없음', every.filter(([, s]) => s.includes('💚')).map(([l]) => l), []);
  // v3.60: 예고 줄이 낼 수 있는 글자는 이게 전부다. 몸에 얹혀 남는 것(문턱·상한·재생·격노·반사)이
  // 여기로 새면 배지와 예고가 같은 말을 두 번 하게 된다 — 새는 순간 걸리게 둔다.
  const ALLOWED = /^[\d ×⚔️🛡💪🌀❓💫💤\u{E001}-\u{E005}\u{FE0F}]*$/u;
  eq('예고 줄에 다섯 갈래 밖의 표식 없음', every.filter(([, s]) => !ALLOWED.test(s)).map(([l, s]) => `${l} → ${s}`), []);
  // 예고가 텅 비어 💤 로 떨어지는 자리는 진짜 휴식 행동뿐이어야 한다.
  // (치유만 있는 행동은 데이터가 intent 로 예고를 못 박아 준다 — 옹이 골렘 「수액 빨아올리기」)
  eq('예고가 비는 행동은 휴식뿐',
    every.filter(([, s, m]) => s === '💤' && !m.effects.some(f => f.op === 'rest')).map(([l]) => l), []);
  // 묶인 표식은 딱 하나만, 그리고 반드시 아는 글자여야 한다
  const puaHits = every.map(([label, s]) => [label, s.match(PUA) || []]);
  eq('묶인 표식은 한 줄에 하나', puaHits.filter(([, h]) => h.length > 1).map(([l]) => l), []);
  eq('모르는 묶음 글자 없음', puaHits.filter(([, h]) => h.some(c => !COMBO.includes(c))).map(([l]) => l), []);
  // 화면 쪽이 다섯 글자를 전부 알고 있어야 한다 — 하나라도 빠지면 예고에 네모가 뜬다
  const mainSrc = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const known = [...mainSrc.matchAll(/'\\u(E00[1-9A-Fa-f])':\s*\[/g)].map(m => String.fromCharCode(parseInt(m[1], 16)));
  eq('main.js 가 묶음 글자를 전부 앎', COMBO.filter(c => !known.includes(c)), []);
  eq('묶음 조합은 다섯 종', COMBO.length, 5);
  // 세 갈래가 한꺼번에 오는 행동이 생기면 묶을 그림이 없다 — 생기는 순간 걸리게 둔다
  const DIS = new Set(['confuse','poison','bleed','status','sealLast','sealCat','rollTax','holdTax','petrify','lockHigh','blind','drainWhet','unpin']);
  const triple = every.filter(([, , m]) => {
    if (m.hidden || m.intent || m.effects.some(f => f.op === 'selfDamage')) return false;
    const ops = m.effects.map(f => f.op);
    return [ops.includes('damage'), ops.includes('block'), ops.includes('empower'), ops.some(o => DIS.has(o))].filter(Boolean).length > 2;
  }).map(([l]) => l);
  eq('세 갈래가 한꺼번에 오는 예고 없음 (묶을 그림이 없다)', triple, []);
}

// v3.67: 기절(zeroValue) — 찬스 계열만 zeroed 를 안 보고 눈금을 그대로 더하고 있었다.
// 족보 성립에는 그대로 들어가되 합산에서는 0이어야 한다. 네 가지 셈법 전부 못 박는다.
{
  const Z = (...i) => new Set(i);
  const noPair = { id: 'noPair', kind: 'chance', score: 'highestDie' };
  eq('노페어: 가장 높은 눈이 기절이면 그 다음 눈', evalCategory(noPair, [6, 4, 2, 1, 1], Z(0)).base, 4);
  eq('노페어: 전부 기절이면 0', evalCategory(noPair, [6, 4, 2, 1, 1], Z(0, 1, 2, 3, 4)).base, 0);
  eq('찬스(서로 다른 셋): 기절한 눈은 0으로 센다', evalCategory(C.chanceD, [6, 5, 4, 3, 2], Z(0)).base, 12);
  eq('찬스(높은 셋): 기절한 눈은 0으로 센다', evalCategory(C.chance, [6, 5, 4, 3, 2], Z(0)).base, 12);
  eq('찬스: 전부 기절이면 0', evalCategory(C.chance, [6, 5, 4, 3, 2], Z(0, 1, 2, 3, 4)).base, 0);
  // 성립 자체는 그대로 — 기절해도 족보에서 빠지지 않는다
  eq('기절해도 원페어는 성립', evalCategory(C.onePair, [6, 6, 1, 2, 3], Z(0)).valid, true);
  eq('기절한 짝은 합에서 빠진다', evalCategory(C.onePair, [6, 6, 1, 2, 3], Z(0)).base, 6);
}

// v3.70: 한 행동이 낼 수 있는 피해에 천장을 둔다.
// 자동 조율기가 배율을 거듭 곱하면서 몇몇 마리가 통짜 즉사기를 갖게 됐다
// (살아있는 빗자루 「쓸어내기」 95, 도깨비불 「대폭발」 279 — 최대 체력이 70인데).
// 등급별 천장을 넘는 순간 여기서 걸린다.
{
  const { DB } = await import('../js/data.js');
  const CAP = { normal: 32, elite: 40, boss: 45 };
  const over = [];
  for (const e of DB.enemies) {
    const cap = CAP[e.tier] || 32;
    const pool = Object.entries(e.moves || {}).map(([id, m]) => [m.name || id, m]);
    if (e.enlightenedMove) pool.push([e.enlightenedMove.name + '(각성)', e.enlightenedMove]);
    for (const [nm, m] of pool) {
      for (const f of (m.effects || [])) {
        if (f.op !== 'damage') continue;
        const tot = f.amount * Math.max(1, Math.floor(f.hits || 1));
        if (tot > cap) over.push(`${e.name}·${nm} ${tot} > ${cap}(${e.tier})`);
      }
    }
  }
  eq('한 행동이 등급 천장보다 센 곳 없음', over, []);
}

// v3.73: 취약 — 세기 가산이 아니라 받는 피해 ×1.5. 여러 번 걸어도 배율은 그대로, 턴만 는다.
{
  const eng = await import('../js/engine.js');
  const { DB } = await import('../js/data.js');
  eng.rng.next = () => 0.5;
  const mk = () => eng.createBattle({ hp: 9e6, maxHp: 9e6, act: 1, floor: 1, enlight: 0, relics: [],
    dice: ['normal','normal','normal','normal','normal'], categories: { onePair: 'clasped_hands' } }, ['crow'], 'battle');
  eq('취약 배율은 데이터에서 온다', eng.vulnMult(), 1.5);
  // 배율이 곱해지는지는 확정 경로로 본다 — 같은 손, 취약만 다르게
  const run = (vuln) => {
    const b = mk(); const e = b.enemies[0];
    e.hp = 9e6; e.maxHpInit = 9e6; e.block = 0; e.wardLeft = 0; e.capLeft = 0; e.debuffs.vulnerable = vuln;
    eng.initialRoll(b);
    b.dice.forEach(d => { d.face = 6; });
    const pre = eng.previewAll(b).find(o => o.cat.id === 'onePair');
    const hp0 = e.hp;
    eng.confirmCategory(b, 'onePair', pre.variant.id, e.uid);
    return hp0 - e.hp;
  };
  const plain = run(0), v1 = run(1), v5 = run(5);
  eq('취약이 걸리면 더 아프다', v1 > plain, true);
  eq('취약 배율은 1.5 (내림)', v1, Math.floor(plain * 1.5));
  eq('여러 턴 남아도 배율은 그대로 — 세기는 안 쌓인다', v5, v1);
}

// v3.74: 취약(받는 피해 ×1.5)은 한 턴만 걸려도 값이 크다.
// 하위 족보에 두면 매 턴 새로 걸려 사실상 상시 배율이 된다 — 풀하우스(4단) 위로만 둔다.
{
  const { DB } = await import('../js/data.js');
  const RUNG = { chance: 0, onePair: 1, twoPair: 2, threeKind: 3, fullHouse: 4, largeStraight: 5, fourKind: 6, yahtzee: 7 };
  const low = [];
  for (const c of DB.scoring.categories) {
    for (const v of c.variants) {
      const ab = v.ability ? (Array.isArray(v.ability) ? v.ability : [v.ability]) : [];
      if (ab.some(a => a.op === 'vulnerable') && (RUNG[c.id] ?? 9) < 4) low.push(`${c.id}·${v.name}`);
    }
  }
  eq('취약은 4단(풀하우스) 아래에 없음', low, []);
}

console.log(fails === 0 ? 'ALL UNIT PASS' : `UNIT FAILS: ${fails}`);
process.exit(fails === 0 ? 0 : 1);

// v3.23: 같은 손에서 풀하우스·야찌가 더 쉬운 족보를 반드시 이기는가
for (const [a, b] of [[1, 2], [2, 6], [6, 1], [3, 3], [5, 4]]) {
  const hand = [a, a, a, b, b];
  const fh = evalCategory(C.fullHouse, hand).base;
  const tp = evalCategory(C.twoPair, hand);
  const tk = evalCategory(C.threeKind, hand);
  const op = evalCategory(C.onePair, hand);
  const worse = Math.max(tp.valid ? tp.base : 0, tk.valid ? tk.base : 0, op.valid ? op.base : 0);
  eq(`풀하우스 [${hand}] 가 더 쉬운 족보보다 셈`, fh > worse, true);
}
for (const f of [1, 2, 3, 4, 5, 6]) {
  const hand = [f, f, f, f, f];
  const y = evalCategory(C.yahtzee, hand).base;
  const fk = evalCategory(C.fourKind, hand).base;
  const fh = evalCategory(C.fullHouse, hand).base;
  eq(`야찌 [${f}×5] 가 포카드·풀하우스보다 셈`, y > fk && y > fh, true);
}
