# REDHOOD · 데이터 구조 설계

문서 버전 v0.1 (2026-08-05) · 대응 컨셉 문서: 01-concept.md v0.1

모든 게임 데이터는 `data/` 아래 JSON 파일로 분리한다. 엔진(js)은 데이터를 해석만 하고,
수치·구성은 전부 테이블에서 나온다. 밸런싱 작업 = JSON 수정으로 끝나는 것이 목표.

```
data/
├── weapons.json    # 무기(클래스) 정의 — 자원 규칙, 시작 덱
├── cards.json      # 카드 테이블
├── enemies.json    # 적 테이블 — HP, 행동 패턴
├── statuses.json   # 상태효과 정의
├── frenzy.json     # 열광 단계 테이블
└── act1.json       # 1막 구성 — 맵 생성 규칙, 적 등장 풀, 보상 규칙
```

---

## 1. weapons.json

```json
{
  "gun": {
    "name": "총",
    "title": "사냥꾼",
    "resource": {
      "type": "ammo",
      "name": "탄환",
      "max": 6,
      "battleStart": 6,
      "turnStartGain": 0,
      "carryOver": true
    },
    "startingDeck": ["gun_shot", "gun_shot", "gun_shot", "gun_reload", "gun_reload", "neutral_guard", "neutral_guard", "neutral_guard"]
  },
  "lantern": {
    "name": "랜턴",
    "title": "등불지기",
    "resource": {
      "type": "oil",
      "name": "기름",
      "max": 9,
      "battleStart": 3,
      "turnStartGain": 3,
      "carryOver": true
    },
    "startingDeck": ["lantern_flame", "lantern_flame", "lantern_flame", "lantern_veil", "lantern_veil", "neutral_guard", "neutral_guard", "neutral_guard"]
  },
  "scythe": {
    "name": "낫",
    "title": "수확자",
    "resource": {
      "type": "frenzy",
      "name": "열광",
      "max": 10,
      "battleStart": 0,
      "turnStartGain": 0,
      "carryOver": false
    },
    "startingDeck": ["scythe_slash", "scythe_slash", "scythe_slash", "scythe_breath", "scythe_breath", "neutral_guard", "neutral_guard", "neutral_guard"]
  }
}
```

`resource.type`이 `frenzy`인 무기는 지불형이 아니라 **누적형**으로 해석된다 (아래 §2 cost 규칙).

## 2. cards.json — 카드 테이블

### 2.1 필드 정의

| 필드 | 타입 | 설명 |
|---|---|---|
| id | string | 고유 키. `무기_이름` 규칙 (예: `gun_shot`, `neutral_guard`) |
| name | string | 표시 이름 |
| weapon | enum | `gun` \| `lantern` \| `scythe` \| `neutral` |
| type | enum | `attack` \| `skill` \| `power` |
| rarity | enum | `basic` \| `common` \| `uncommon` \| `rare` |
| cost | number | 코스트 숫자 하나. 해석은 장착 무기가 결정 (§2.2) |
| frenzy | number | 낫/중립 전용. 사용 시 열광 변화량 (음수 = 절제). 생략 시 0 |
| target | enum | `enemy` \| `allEnemies` \| `self` \| `none` |
| effects | array | 효과 오퍼레이션 목록. 위에서부터 순차 실행 (§2.3) |
| keywords | array | `exhaust`(소멸), `retain`(보존), `innate`(개전) 등 |
| upgrade | object | 강화 시 덮어쓸 필드만 부분 기술 (프로토 미사용, 예약) |
| flavor | string | 플레이버 텍스트 (선택) |

### 2.2 cost 해석 규칙 (컨셉 문서 §3.4 확정안)

| 장착 무기 | cost N의 의미 |
|---|---|
| 총 | 탄환 N 소모. 부족하면 사용 불가 |
| 랜턴 | 기름 N 소모. 부족하면 사용 불가 |
| 낫 | 지불 없음. 대신 **열광 +N** (카드의 `frenzy` 필드와 합산) |

낫 전용 카드는 관례상 `cost: 0`으로 두고 열광 변화를 전부 `frenzy` 필드에 적는다.
중립 카드는 `cost`만 적으면 위 표대로 자동 환산된다.

### 2.3 효과 DSL — effects 오퍼레이션

| op | 파라미터 | 설명 |
|---|---|---|
| damage | amount, times? | 피해. times 생략 시 1회 |
| block | amount | 방어도 획득 |
| draw | amount | 카드 뽑기 |
| gainResource | amount | 장착 무기 자원 획득 (탄환/기름). 낫이면 무시 |
| applyStatus | status, stacks, target | 상태효과 부여 |
| heal | amount | HP 회복 |
| setFrenzy | value | 열광을 특정 값으로 (수확류 카드용) |
| damagePerFrenzy | perStack | 현재 열광 × perStack 피해 (수확류 카드용) |
| discardHand | — | 손패 전부 버림 |
| selfDamage | amount | 자해 피해 (방어도 무시 여부는 엔진 옵션) |

프로토는 이 10개로 시작한다. 새 카드가 요구할 때만 op를 추가한다 (엔진 수정 필요).

### 2.4 샘플 카드

```json
[
  {
    "id": "gun_shot", "name": "사격", "weapon": "gun", "type": "attack",
    "rarity": "basic", "cost": 1, "target": "enemy",
    "effects": [{ "op": "damage", "amount": 6 }]
  },
  {
    "id": "gun_reload", "name": "장전", "weapon": "gun", "type": "skill",
    "rarity": "basic", "cost": 0, "target": "self",
    "effects": [{ "op": "gainResource", "amount": 3 }]
  },
  {
    "id": "gun_fan_fire", "name": "탄막", "weapon": "gun", "type": "attack",
    "rarity": "uncommon", "cost": 3, "target": "allEnemies",
    "effects": [{ "op": "damage", "amount": 4 }]
  },
  {
    "id": "lantern_flame", "name": "불꽃 던지기", "weapon": "lantern", "type": "attack",
    "rarity": "basic", "cost": 2, "target": "enemy",
    "effects": [
      { "op": "damage", "amount": 5 },
      { "op": "applyStatus", "status": "burn", "stacks": 1, "target": "enemy" }
    ]
  },
  {
    "id": "lantern_flare", "name": "홍염 방출", "weapon": "lantern", "type": "attack",
    "rarity": "rare", "cost": 6, "target": "enemy",
    "effects": [{ "op": "damage", "amount": 18 }]
  },
  {
    "id": "scythe_slash", "name": "베기", "weapon": "scythe", "type": "attack",
    "rarity": "basic", "cost": 0, "frenzy": 2, "target": "enemy",
    "effects": [{ "op": "damage", "amount": 7 }]
  },
  {
    "id": "scythe_breath", "name": "심호흡", "weapon": "scythe", "type": "skill",
    "rarity": "basic", "cost": 0, "frenzy": -3, "target": "self",
    "effects": [{ "op": "draw", "amount": 1 }]
  },
  {
    "id": "scythe_harvest", "name": "수확", "weapon": "scythe", "type": "attack",
    "rarity": "rare", "cost": 0, "target": "enemy",
    "effects": [
      { "op": "damagePerFrenzy", "perStack": 3 },
      { "op": "setFrenzy", "value": 0 }
    ]
  },
  {
    "id": "neutral_guard", "name": "웅크리기", "weapon": "neutral", "type": "skill",
    "rarity": "basic", "cost": 1, "target": "self",
    "effects": [{ "op": "block", "amount": 5 }]
  }
]
```

## 3. enemies.json — 적 테이블

### 3.1 필드 정의

| 필드 | 타입 | 설명 |
|---|---|---|
| id | string | 고유 키 |
| name | string | 표시 이름 |
| tier | enum | `normal` \| `elite` \| `boss` |
| hp | [min, max] | 등장 시 범위 내 랜덤 |
| moves | object | 행동 정의. 키 = 행동 id |
| pattern | object | 행동 선택 규칙 (§3.2) |
| phases | array? | 보스 전용. HP 비율 기준 페이즈 전환 |

행동(move)의 effects는 카드와 **같은 DSL**을 쓴다 (target만 반대 방향).
의도(intent) 아이콘은 effects를 보고 엔진이 자동 결정한다 (damage 포함 → 공격 의도 등).

### 3.2 pattern 규칙

| mode | 설명 |
|---|---|
| sequence | 배열 순서대로 반복 (`loop: true`) |
| weighted | 가중치 랜덤. `noRepeat: 2` = 같은 행동 2연속 금지 |

### 3.3 샘플

```json
[
  {
    "id": "thorn_bush", "name": "가시덤불", "tier": "normal", "hp": [22, 26],
    "moves": {
      "scratch": { "name": "할퀴기", "effects": [{ "op": "damage", "amount": 7 }] },
      "harden":  { "name": "웅크림", "effects": [{ "op": "block", "amount": 6 }] }
    },
    "pattern": { "mode": "sequence", "order": ["scratch", "scratch", "harden"], "loop": true }
  },
  {
    "id": "wolf", "name": "늑대", "tier": "boss", "hp": [90, 90],
    "moves": {
      "bite":  { "name": "물어뜯기", "effects": [{ "op": "damage", "amount": 12 }] },
      "howl":  { "name": "울부짖음", "effects": [{ "op": "applyStatus", "status": "weak", "stacks": 2, "target": "player" }] },
      "pounce": { "name": "덮치기", "effects": [{ "op": "damage", "amount": 5, "times": 3 }] }
    },
    "phases": [
      { "untilHpRatio": 0.5, "pattern": { "mode": "sequence", "order": ["bite", "howl", "bite"], "loop": true } },
      { "untilHpRatio": 0.0, "pattern": { "mode": "weighted", "weights": { "bite": 2, "pounce": 3 }, "noRepeat": 2 } }
    ]
  }
]
```

## 4. statuses.json — 상태효과

| id | 이름 | 스택 의미 | 규칙 (프로토) |
|---|---|---|---|
| strength | 힘 | 공격당 피해 +N | 지속 |
| weak | 약화 | 주는 피해 25% 감소 | 턴 종료 시 스택 -1 |
| vulnerable | 취약 | 받는 피해 50% 증가 | 턴 종료 시 스택 -1 |
| burn | 화상 | 턴 종료 시 N 피해 | 지속 (랜턴 정체성) |
| bleed | 출혈 | 카드/행동 사용 시마다 1 피해 × N턴 | 턴 종료 시 스택 -1 (낫 정체성) |

```json
{
  "burn": { "name": "화상", "timing": "turnEnd", "op": "damage", "perStack": 1, "decay": 0 },
  "weak": { "name": "약화", "modifier": "dealtDamage", "multiplier": 0.75, "decay": 1 }
}
```

(정확한 스키마는 구현 시 확정. 위 테이블의 규칙 서술이 정본.)

## 5. frenzy.json — 열광 단계

```json
{
  "max": 10,
  "stages": [
    { "id": "calm",    "name": "평정", "range": [0, 3],  "effects": {} },
    { "id": "excited", "name": "흥분", "range": [4, 6],  "effects": { "damageTakenMult": 1.25 } },
    { "id": "rampage", "name": "폭주", "range": [7, 9],  "effects": { "damageTakenMult": 1.5, "turnEndSelfDamage": 2 } },
    { "id": "limit",   "name": "한계", "range": [10, 10], "trigger": { "discardHand": true, "endTurn": true, "setFrenzy": 7 } }
  ]
}
```

## 6. act1.json — 1막 구성

```json
{
  "map": {
    "floors": 11,
    "columns": 3,
    "nodeWeights": { "battle": 6, "elite": 1.5, "rest": 1.5 },
    "fixed": { "1": "battle", "10": "rest", "11": "boss" }
  },
  "encounters": {
    "battle": { "easy": [["crow", "crow"], ["thorn_bush"]], "hard": [["stray_dog", "stray_dog", "crow"]], "easyFloors": [1, 3] },
    "elite": [["alpha_dog"]],
    "boss": [["wolf"]]
  },
  "rewards": {
    "battle": { "cardChoices": 3, "rarityWeights": { "common": 70, "uncommon": 25, "rare": 5 } },
    "elite":  { "cardChoices": 3, "rarityWeights": { "common": 45, "uncommon": 40, "rare": 15 } }
  },
  "rest": { "healRatio": 0.3 }
}
```

## 7. 명명·버전 규칙

카드 id는 `무기_영문이름`, 적 id는 영문 스네이크케이스. 표시 이름은 전부 데이터의
`name` 필드에서만 나온다 (코드에 한글 하드코딩 금지). 데이터 파일 최상단에
`"_version"` 필드를 두고, 스키마가 바뀌면 이 문서와 함께 올린다.
세이브 데이터(localStorage)에는 카드 id만 저장하므로, id 변경은 세이브 호환을 깬다 — id는 한번 정하면 유지.
