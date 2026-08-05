// unit.mjs — yahtzee.js 순수 함수 단위 검증 (node test/unit.mjs)
import { evalCategory, computeDamage } from '../js/yahtzee.js';

let fails = 0;
function eq(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? '✅' : '❌'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ' (기대: ' + JSON.stringify(expected) + ')'}`);
  if (!ok) fails++;
}

const C = {
  ones: { id: 'ones', kind: 'upper', face: 1 },
  threeKind: { id: 'threeKind', kind: 'ofKind', count: 3, score: 'matchedSumX2' },
  fourKind: { id: 'fourKind', kind: 'ofKind', count: 4, score: 'matchedSumX2' },
  fullHouse: { id: 'fullHouse', kind: 'fullHouse', score: 25 },
  small: { id: 'smallStraight', kind: 'straight', length: 4, score: 30 },
  large: { id: 'largeStraight', kind: 'straight', length: 5, score: 40 },
  yahtzee: { id: 'yahtzee', kind: 'ofKind', count: 5, score: 50 },
  chance: { id: 'chance', kind: 'chance', score: 'sumTop3', levelFlat: 2 },
};
const N = { faces: [1, 2, 3, 4, 5, 6] };
const G = { faces: [1, 2, 3, 4, 5, 6], gold: true };
const plain5 = [N, N, N, N, N];

// 판정
eq('야찌 [3,3,3,3,3]', evalCategory(C.yahtzee, [3, 3, 3, 3, 3]).base, 50);
eq('풀하우스 [2,2,3,3,3]', evalCategory(C.fullHouse, [2, 2, 3, 3, 3]).base, 25);
eq('풀하우스 실패 [2,2,3,3,4]', evalCategory(C.fullHouse, [2, 2, 3, 3, 4]).valid, false);
eq('풀하우스=야찌 인정 [4,4,4,4,4]', evalCategory(C.fullHouse, [4, 4, 4, 4, 4]).base, 25);
eq('스몰 [1,2,3,4,6]', evalCategory(C.small, [1, 2, 3, 4, 6]).base, 30);
eq('스몰 실패 [1,2,4,5,6]는 4연속? (2,4,5,6→3연속)', evalCategory(C.small, [1, 2, 4, 5, 6]).valid, false);
eq('라지 [2,3,4,5,6]', evalCategory(C.large, [2, 3, 4, 5, 6]).base, 40);
eq('트리플 [4,4,4,2,1] 매칭합×2', evalCategory(C.threeKind, [4, 4, 4, 2, 1]).base, 24);
eq('포카드 [5,5,5,5,2] 매칭합×2', evalCategory(C.fourKind, [5, 5, 5, 5, 2]).base, 40);
eq('포카드 실패 [4,4,4,2,1]', evalCategory(C.fourKind, [4, 4, 4, 2, 1]).valid, false);
eq('에이스 [1,1,2,3,4]', evalCategory(C.ones, [1, 1, 2, 3, 4]).base, 2);
eq('찬스 [6,6,5,4,1] 상위3합', evalCategory(C.chance, [6, 6, 5, 4, 1]).base, 17);

// 금박·유물 결합: (기본+금박)×배수+가산
const silver = { hook: { type: 'categoryMult', category: 'ones', mult: 5 } };
const fang = { hook: { type: 'flatDamage', amount: 3 } };
const charm = { hook: { type: 'categoryBonus', category: 'fullHouse', bonus: 15 } };

// [1,1,1,1,6], 금박이 0번(눈1) → 기본4 +금박1 =5, ×5 =25, +3 =28
eq('은탄환+금박+이빨 에이스', computeDamage(C.ones, [1, 1, 1, 1, 6], [G, N, N, N, N], [silver, fang]).total, 28);
// 금박이 4번(눈6, 에이스 비기여) → 기여 없음: 기본4 ×5 +3 = 23
eq('금박 비기여 시 미적용', computeDamage(C.ones, [1, 1, 1, 1, 6], [N, N, N, N, G], [silver, fang]).total, 23);
// 풀하우스 25 + 부적15 + 이빨3 = 43
eq('풀하우스+부적+이빨', computeDamage(C.fullHouse, [2, 2, 5, 5, 5], plain5, [charm, fang]).total, 43);
// 0점 버리기: 에이스인데 1 없음 → total 0, isZero (이빨 미적용)
const zero = computeDamage(C.ones, [2, 3, 4, 5, 6], plain5, [fang]);
eq('0점 버리기 total', zero.total, 0);
eq('0점 버리기 isZero', zero.isZero, true);
// 금박이 찬스(상위3)에 기여: 상위3합 17 + 금박(0번 눈6, 상위3 포함) = 23
eq('금박 찬스 기여', computeDamage(C.chance, [6, 6, 5, 4, 1], [G, N, N, N, N], []).total, 23);
// 금박이 상위3 밖이면 미기여: 4번(눈1)에 금박 → 17
eq('금박 상위3 밖 미기여', computeDamage(C.chance, [6, 6, 5, 4, 1], [N, N, N, N, G], []).total, 17);
// 금박이 트리플 매칭 눈에 기여: [4,4,4,2,1] 매칭합×2=24 + 금박(0번 눈4) = 28
eq('금박 트리플 매칭 기여', computeDamage(C.threeKind, [4, 4, 4, 2, 1], [G, N, N, N, N], []).total, 28);

// 족보 레벨: (기본+금박)×레벨×유물배수+가산 — 트리플 Lv2: (24+4)×2 = 56
eq('트리플 Lv2', computeDamage(C.threeKind, [4, 4, 4, 2, 1], [G, N, N, N, N], [], 2).total, 56);
// 찬스 levelFlat: 배수 대신 레벨당 +2 — Lv3: 17 + 4 = 21
eq('찬스 Lv3 (levelFlat)', computeDamage(C.chance, [6, 6, 5, 4, 1], plain5, [], 3).total, 21);
eq('찬스 Lv1 무보정', computeDamage(C.chance, [6, 6, 5, 4, 1], plain5, [], 1).total, 17);
// 에이스 Lv3 + 은탄환 + 금박(눈1): (4+1)×3×5 +3 = 78
eq('에이스 Lv3+은탄환+금박+이빨', computeDamage(C.ones, [1, 1, 1, 1, 6], [G, N, N, N, N], [silver, fang], 3).total, 78);
// 레벨이 있어도 0점은 0점
eq('Lv3이어도 0점 버리기', computeDamage(C.ones, [2, 3, 4, 5, 6], plain5, [], 3).total, 0);

console.log(fails === 0 ? 'ALL UNIT PASS' : `UNIT FAILS: ${fails}`);
process.exit(fails === 0 ? 0 : 1);
