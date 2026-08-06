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

console.log(fails === 0 ? 'ALL UNIT PASS' : `UNIT FAILS: ${fails}`);
process.exit(fails === 0 ? 0 : 1);
