# REDHOOD · 데이터 구조 설계

문서 버전 v0.4 (2026-08-05) · 대응 컨셉 문서: 01-concept.md v0.4 (부가 능력 시스템)

**v0.4 변경 요약**: 쿨다운 제거. 카테고리별 `ability`(op 배열)·`abilityText` 추가 —
op 7종: `block`(amount 또는 scoreMult), `heal`, `rerollNext`, `buffNext`, `cleanse`, `stun`, `dodge`.
0점 확정 시 부가 능력 미발동. startOwned = 찬스·듀스·트리플. 플레이어에 `block` 스탯
(확정 직후 적 행동에만 유효). 세이브 `_v: 4`, sw 캐시 v4.

```
data/
├── dice.json       # 주사위 종류 — 면 구성, 특수 태그
├── relics.json     # 유물 — 효과 훅
├── scoring.json    # 족보 테이블 — 판정·점수·부가 능력
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
  "rerollsPerTurn": 2,
  "levelCap": 3,
  "upperBonus": { "threshold": 63, "damage": 35 },
  "categories": [
    { "id": "twos", "name": "듀스", "kind": "upper", "face": 2, "startOwned": true, "tier": "common",
      "ability": [{ "op": "block", "scoreMult": 2 }], "abilityText": "방어도 +점수×2" },
    { "id": "threeKind", "name": "트리플", "kind": "ofKind", "count": 3, "score": "sumAll",
      "startOwned": true, "tier": "common",
      "ability": [{ "op": "cleanse" }], "abilityText": "봉인 해제" },
    { "id": "yahtzee", "name": "야찌", "kind": "ofKind", "count": 5, "score": 50,
      "startOwned": false, "tier": "rare",
      "ability": [{ "op": "stun" }, { "op": "block", "amount": 20 }], "abilityText": "적 행동 취소 + 방어도 20" }
  ]
}
```

부가 능력 op (전투 엔진 구현, 0점 확정 시 미발동):

| op | 파라미터 | 효과 |
|---|---|---|
| block | amount 또는 scoreMult | 방어도. 확정 직후 적 행동에만 유효 |
| heal | amount | HP 회복 |
| rerollNext | amount | 다음 턴 리롤 + |
| buffNext | amount | 다음 족보 확정 피해 + (0점이면 이월) |
| cleanse | — | 봉인 전부 해제 |
| stun | — | 확정 직후 적 행동 전체 취소 |
| dodge | — | 확정 직후 적 행동의 피해만 무효 (봉인 등은 적용됨) |

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

패턴 엔진(sequence / weighted+noRepeat / phases) 유지.
적 효과 op 3종: `damage`, `charge`(예고만), `seal`(마지막 사용 족보 N턴 봉인 — 의도 🔒).

```json
{ "id": "wolf", "name": "늑대", "tier": "boss", "hp": [115, 115],
  "moves": {
    "bite":   { "name": "물어뜯기", "effects": [{ "op": "damage", "amount": 12 }] },
    "howl":   { "name": "울부짖음", "effects": [{ "op": "seal", "turns": 2 }] },
    "lurk":   { "name": "웅크리기", "effects": [{ "op": "charge" }] },
    "pounce": { "name": "덮치기", "effects": [{ "op": "damage", "amount": 22 }] }
  },
  "phases": [
    { "untilHpRatio": 0.5, "pattern": { "mode": "sequence", "order": ["bite", "howl", "lurk", "pounce"], "loop": true } },
    { "untilHpRatio": 0.0, "pattern": { "mode": "weighted", "weights": { "bite": 2, "rend": 3, "pounce": 1, "howl": 1 }, "noRepeat": 2 } }
  ] }
```

**튜닝 기준**: 기본 HP는 1층 기준값이고 층수당 +10% 스케일 (act1.json `hpScalePerFloor`).
일반 30~55, 엘리트 70, 보스 115(11층 실효 ≈ 230). ⚑ 시작 3족보 체제 기준 재조정 대상 (오픈 이슈 #7).

## 5. act1.json

맵·휴식 구조 유지. 보상은 족보/주사위/유물 3풀 혼합:

```json
"rewards": {
  "battle": { "choices": 3, "pool": { "category": 40, "dice": 35, "relic": 25 }, "tierWeights": { "common": 60, "uncommon": 33, "rare": 7 } },
  "elite":  { "choices": 3, "pool": { "category": 40, "dice": 30, "relic": 30 }, "tierWeights": { "common": 20, "uncommon": 50, "rare": 30 } }
}
```

족보 보상: 미보유 = 신규 획득, 보유 = 레벨업(캡 도달 시 풀에서 제외).
주사위 획득 시 보유 5개 중 하나와 **교체** (취소 가능). 같은 유물은 중복 획득 불가.

## 6. 세이브 (localStorage)

```json
{ "_v": 4, "hp": 55, "maxHp": 70, "dice": ["normal","normal","gold","lead","normal"],
  "relics": ["silver_bullet"], "categories": { "chance": 1, "twos": 2, "threeKind": 1, "yahtzee": 1 },
  "floor": 4, "map": [...] }
```

`_v` 불일치 시 런 폐기. 주사위/유물은 id만 저장 — **id는 한번 정하면 불변**.
