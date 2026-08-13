# 유물 효과표 — 32종 (v3.74)

> `data/relics.json` 에서 그대로 뽑았다. 등급은 어디서 나오는지를 뜻한다.
> 오른쪽 `엔진 값` 은 코드가 실제로 읽는 것이라, 설명글과 어긋나면 그게 버그다.

## 일반 — 전투 보상

| 유물 | 효과 | 엔진 값 |
|---|---|---|
| **늑대 이빨** | 족보를 확정할 때마다 추가 피해 +3. | `flatDamage` amount=3 |
| **빵부스러기** | 전투에서 승리하면 HP 4 회복. | `healOnVictory` amount=4 |
| **붉은 실타래** | 노페어 피해 +4. | `categoryBonus` category="chance" bonus=4 |
| **따뜻한 우유** | 매 턴 시작 시 HP 1 회복. | `turnHeal` amount=1 |
| **마른 장작** | 매 턴 시작 시 방어 2. | `turnBlock` amount=2 |
| **가죽 장갑** | 투페어 피해 +6. | `categoryBonus` category="twoPair" bonus=6 |
| **까마귀 깃털** | 스트레이트 피해 +8. | `categoryBonus` category="largeStraight" bonus=8 |
| **사냥꾼의 부적** | 풀하우스 피해 +15. | `categoryBonus` category="fullHouse" bonus=15 |
| **가계부** | 상점 가격 -20%. | `shopDiscount` mult=0.8 |
| **이끼 나침반** | 전체 공격 족보 피해 +6. | `aoeBonus` bonus=6 |
| **은저울** | 전투에서 얻는 🪙 +25%. | `coinBonus` mult=1.25 |
| **수지 양초** | 혼란(🌀)에 면역 — 주사위가 뒤틀리지 않는다. | `confuseImmune` |
| **오래된 뼈** | 같은 눈 족보(원페어·트리플·포카드·야찌) 피해 +6. | `kindBonus` kind="ofKind" bonus=6 |
| **유리병 속 반딧불** | 얻는 즉시 최대 HP +10. | `maxHp` amount=10 |
| **늑대 가죽** | 적을 처치할 때마다 HP 3 회복. | `healOnKill` amount=3 |
| **독사과 조각** | HP가 절반 이하일 때 모든 족보 피해 +5. | `lowHpDamage` ratio=0.5 amount=5 |
| **꿀단지** | 전투에서 승리하면 HP 8 회복. | `healOnVictory` amount=8 |
| **숫돌** | 매 턴 시작 시 🔥벼름 +1. | `turnWhet` amount=1 |
| **사냥꾼의 눈** | 같은 눈이 3개 이상 나온 판을 확정하면 🔥벼름 +1. | `whetOnKind` count=3 amount=1 |
| **길표** | 스트레이트 족보를 확정하면 다음 턴 리롤 +2 · 🔥벼름 +1. | `rerollOnCategory` kind="straight" amount=2 whet=1 |

## 엘리트 — 강한 전투 보상

| 유물 | 효과 | 엔진 값 |
|---|---|---|
| **붉은 망토** | 매 턴 리롤 +1. | `extraReroll` amount=1 |
| **도토리 부적** | 풀하우스 피해 2배. | `categoryMult` category="fullHouse" mult=2 |
| **문지기의 빗장** | 턴이 지나도 방어도의 절반이 남는다. | `blockKeep` ratio=0.5 |
| **네잎클로버** | 보상에서 레어·에픽이 나올 확률 2배. | `luck` mult=2 |
| **은식칼** | 스트레이트 족보 피해 +10. | `kindBonus` kind="straight" bonus=10 |
| **은탄환** | 포카드 피해 2배. | `categoryMult` category="fourKind" mult=2 |
| **운명의 골무** | 매 턴 리롤 +2. | `extraReroll` amount=2 |
| **늑대달 목걸이** | 족보를 확정할 때마다 추가 피해 +6. | `flatDamage` amount=6 |
| **할머니의 동화책** | 야찌 피해 2배. | `categoryMult` category="yahtzee" mult=2 |
| **곰의 등** | 두르고 있는 방어도 10마다 모든 족보 피해 +3. | `blockScaleDamage` per=10 amount=3 |
| **말라붙은 심장** | HP가 3분의 1 이하면 모든 족보 피해 1.5배. | `lowHpMult` ratio=0.34 mult=1.5 |
| **거머리 반지** | 주사위 때문에 자해할 때마다 🔥벼름 +2. | `whetOnSelfDamage` amount=2 |
