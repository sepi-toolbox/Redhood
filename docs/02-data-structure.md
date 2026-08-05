# REDHOOD · 데이터 구조 설계

문서 버전 v0.2 (2026-08-05) · 대응 컨셉 문서: 01-concept.md v0.2 (주사위 전환)

정본 원칙은 유지한다: **엔진은 해석만, 수치·구성은 전부 JSON.**
밸런싱 = data/ 수정으로 끝난다. 카드 시대 파일(cards/weapons/frenzy/statuses)은 삭제
(태그 `card-proto`에 보존).

```
data/
├── dice.json       # 주사위 종류 — 면 구성, 특수 태그
├── relics.json     # 유물 — 효과 훅
├── scoring.json    # 족보 테이블 — 판정·점수·전투당 1회 플래그
├── enemies.json    # 적 — HP, 행동 패턴 (v0.1 패턴 엔진 재사용)
└── act1.json       # 1막 — 맵, 조우, 보상 풀, 휴식, 플레이어 기본치
```

## 1. dice.json

| 필드 | 타입 | 설명 |
|---|---|---|
| id | string | 고유 키 |
| name | string | 표시 이름 |
| faces | number[6] | 면 구성. 굴림 = faces에서 균등 추출 |
| gold | bool? | true면 족보 기여 시 자기 눈만큼 추가 피해 |
| desc | string | 보상 화면 설명 |
| tier | enum | `common` \| `uncommon` \| `rare` — 보상 풀 가중치용 |

```json
[
  { "id": "normal", "name": "나무 주사위", "faces": [1,2,3,4,5,6], "desc": "평범한 주사위.", "tier": "common" },
  { "id": "gold",   "name": "금박 주사위", "faces": [1,2,3,4,5,6], "gold": true, "desc": "족보에 기여하면 눈만큼 추가 피해.", "tier": "rare" },
  { "id": "lead",   "name": "납 주사위",   "faces": [1,2,3,4,6,6], "desc": "6이 두 면.", "tier": "uncommon" }
]
```

## 2. relics.json

유물은 `hook` 하나로 효과를 기술한다. 엔진이 지원하는 훅 타입:

| hook.type | 파라미터 | 설명 |
|---|---|---|
| categoryMult | category, mult | 해당 족보 최종 점수 배수 (은탄환) |
| categoryBonus | category, bonus | 해당 족보 점수 가산 |
| extraReroll | amount | 매 턴 리롤 횟수 + |
| flatDamage | amount | 족보 확정 시마다 피해 가산 |
| healOnZero | amount | 0점 확정 시 HP 회복 |
| upperBonusThreshold | value | 상단 보너스 발동 기준 변경 |

```json
[
  { "id": "silver_bullet", "name": "은탄환", "desc": "에이스 점수 5배.", "tier": "rare",
    "hook": { "type": "categoryMult", "category": "ones", "mult": 5 } },
  { "id": "red_cloak", "name": "붉은 망토", "desc": "매 턴 리롤 +1.", "tier": "uncommon",
    "hook": { "type": "extraReroll", "amount": 1 } }
]
```

**중첩 규칙**: `최종 = (기본 점수 + 금박 기여 합) × Π(categoryMult) + Σ(categoryBonus) + Σ(flatDamage)`

## 3. scoring.json

```json
{
  "oncePerBattle": true,
  "sheetExhausted": "refill",
  "upperBonus": { "threshold": 63, "damage": 35 },
  "categories": [
    { "id": "ones",   "name": "에이스", "kind": "upper", "face": 1 },
    { "id": "sixes",  "name": "식스",   "kind": "upper", "face": 6 },
    { "id": "threeKind", "name": "트리플", "kind": "ofKind", "count": 3, "score": "sumAll" },
    { "id": "fourKind",  "name": "포카드", "kind": "ofKind", "count": 4, "score": "sumAll" },
    { "id": "fullHouse", "name": "풀하우스", "kind": "fullHouse", "score": 25 },
    { "id": "smallStraight", "name": "스몰 스트레이트", "kind": "straight", "length": 4, "score": 30 },
    { "id": "largeStraight", "name": "라지 스트레이트", "kind": "straight", "length": 5, "score": 40 },
    { "id": "yahtzee", "name": "야찌", "kind": "ofKind", "count": 5, "score": 50 },
    { "id": "chance", "name": "찬스", "kind": "chance", "score": "sumAll" }
  ]
}
```

kind 판정 규칙 (엔진 구현):

| kind | 판정 | 점수 | 금박 기여 대상 |
|---|---|---|---|
| upper | 항상 가능 | 해당 눈 합 | 해당 눈인 주사위 |
| ofKind | 같은 눈 count개 이상 | sumAll=전체 합 / 고정값 | 전체 |
| fullHouse | 3+2 (야찌 포함 인정) | 고정 25 | 전체 |
| straight | length 연속 | 고정 | 전체 |
| chance | 항상 가능 | 전체 합 | 전체 |

판정 실패 시 점수 0 — 그래도 확정(칸 버리기)은 가능하다.

## 4. enemies.json

v0.1의 패턴 엔진(sequence / weighted+noRepeat / phases)을 그대로 쓴다.
효과 op는 `damage`와 `charge`(모으기: 행동 없음, 의도만 예고) 2종으로 축소.

```json
{ "id": "wolf", "name": "늑대", "tier": "boss", "hp": [160, 160],
  "moves": {
    "bite":   { "name": "물어뜯기", "effects": [{ "op": "damage", "amount": 14 }] },
    "lurk":   { "name": "웅크리기", "effects": [{ "op": "charge" }] },
    "pounce": { "name": "덮치기", "effects": [{ "op": "damage", "amount": 26 }] }
  },
  "phases": [
    { "untilHpRatio": 0.5, "pattern": { "mode": "sequence", "order": ["bite", "lurk", "pounce"], "loop": true } },
    { "untilHpRatio": 0.0, "pattern": { "mode": "weighted", "weights": { "bite": 3, "pounce": 2 }, "noRepeat": 2 } }
  ] }
```

**튜닝 기준**: 플레이어 기대 피해 ≈ 턴당 18~22.
일반 적 HP 45~60 (2~3턴), 엘리트 ~100, 보스 160. 적 공격은 5~9 / 엘리트 ~12.

## 5. act1.json

v0.1 구조 유지. 바뀌는 것은 보상뿐:

```json
"rewards": {
  "battle": { "choices": 3, "pool": { "dice": 60, "relic": 40 }, "tierWeights": { "common": 60, "uncommon": 33, "rare": 7 } },
  "elite":  { "choices": 3, "pool": { "dice": 50, "relic": 50 }, "tierWeights": { "common": 25, "uncommon": 50, "rare": 25 } }
}
```

주사위 획득 시 보유 5개 중 하나와 **교체** (교체 취소 = 스킵 가능).
같은 유물은 중복 획득 불가 (보상 후보에서 제외).

## 6. 세이브 (localStorage)

```json
{ "_v": 2, "hp": 55, "maxHp": 70, "dice": ["normal","normal","gold","lead","normal"],
  "relics": ["silver_bullet"], "floor": 4, "map": [...] }
```

`_v` 불일치 시 런 폐기. 주사위/유물은 id만 저장 — **id는 한번 정하면 불변**.
