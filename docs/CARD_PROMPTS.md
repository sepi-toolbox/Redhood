# REDHOOD 감정 카드 아트 프롬프트 — v1 (v2.01 기준)

> 카드 전투(v2.0)의 감정 카드 리소스. **공용 2종(프레임·뒷면) + 일러스트 4종** = 6장.
> 생성 방식은 `docs/ART_PROMPTS.md`와 같다: 프롬프트 블록 복사 → **`keyart_stilllife` 첨부** → 생성 → 대화에 업로드.

## ⚠ 그림에는 글자가 단 하나도 들어가지 않습니다

카드 이름·자원 숫자·설명은 전부 **게임이 그림 위에 실시간으로 그리는 텍스트**입니다.
모든 프롬프트 끝에 `No text, no letters, no numbers, no watermark`가 들어 있고,
글자 비슷한 게 조금이라도 생기면 그 장은 버리고 다시 뽑습니다.

## 규격

| 대상 | 파일 | 생성 크기 | 게임 내 취급 |
|---|---|---|---|
| 카드 프레임 | `assets/ui/card_frame.png` | 768×1024 | 9-슬라이스 border-image (가운데 비움) |
| 카드 뒷면 | `assets/ui/card_back.png` | 768×1024 | 덱·버림 더미 표지 |
| 일러스트 4종 | `assets/cards/card_{id}.png` | 1024×1024 | 프레임 창(위쪽 2/3)에 cover 크롭 |

일러스트는 **정사각으로 뽑되 주제를 정중앙에** — 게임이 위아래를 잘라 쓴다.
카드가 화면에서 104×142px로 작게 보이므로, **한 가지 소재가 화면의 절반 이상을 차지하는 단순한 구도**여야 한다. 배경이 복잡하면 엄지손톱 크기에서 죽이 된다.

## 감정이라는 주제

이 카드들은 장비나 마법이 아니라 **빨간 두건의 감정**이다. 물건을 그리더라도
그 물건이 감정을 대신 말하게 한다 — 용기는 정면을 보고, 추적은 어둠 속에서 빛나고,
고양은 위로 타오르고, 복구는 손끝에서 아문다.

---

## 1) 카드 프레임 — `card_frame.png`

```
Dark fairytale trading card frame, portrait orientation, ornate but rustic:
aged parchment inner panel bordered by deep crimson painted wood with faint
carved thorn-vine reliefs, corners slightly worn and chipped. The upper
two-thirds is an EMPTY dark window for artwork, the lower third an EMPTY
parchment band for a title. A small empty circular medallion sits at the
top-left corner for a cost gem. Muted palette: blood red, aged gold accents,
dark walnut. Painterly storybook style matching the attached still-life key
art, crisp silhouette on transparent background.
No text, no letters, no numbers, no watermark.
```

## 2) 카드 뒷면 — `card_back.png`

```
Trading card back design, portrait orientation, dark fairytale storybook style
matching the attached key art: deep crimson field with a symmetrical woodcut
pattern of thorned briar vines framing a central emblem — a small red hood
(hooded cloak) silhouette inside a pale full moon. Aged gold filigree border,
worn edges, subtle canvas texture. Flat enough to read at thumbnail size.
No text, no letters, no numbers, no watermark.
```

## 3) 용기 — `card_courage.png` (자원 2 · 가장 낮은 눈 ×2)

가장 약한 주사위가 가장 세지는 카드 — "작은 것이 일어선다".

```
Dark fairytale storybook illustration, painterly style matching the attached
still-life key art: a single small ivory die standing upright on its corner in
a shaft of warm golden light, casting a LONG shadow shaped like a rearing lion
across dark forest ground. Embers drift upward. The die is small but defiant,
centered, occupying most of the frame. Deep shadows, warm gold against near
black, high contrast, simple composition readable at thumbnail size.
No text, no letters, no numbers, no watermark.
```

## 4) 어둠 속의 추적 — `card_stalk.png` (자원 2 · 주사위 하나를 6으로)

어둠 속에서 원하는 것을 정확히 찾아내는 카드.

```
Dark fairytale storybook illustration, painterly style matching the attached
still-life key art: a moonlit forest floor at night, nearly black, with a
trail of faintly glowing pawprints leading to a single ivory die whose six
pips glow cold silver-blue like eyes in the dark. A crescent moon sliver
above. One clear focal point, centered, deep blacks with icy highlights,
simple composition readable at thumbnail size.
No text, no letters, no numbers, no watermark.
```

## 5) 고양 — `card_elate.png` (자원 1 · 무작위 주사위 +2)

속에서 치솟는 불길 — 값이 싸고 방향은 제멋대로다.

```
Dark fairytale storybook illustration, painterly style matching the attached
still-life key art: a small campfire flame flaring suddenly upward into a
bright column of orange-gold fire, sparks scattering in RANDOM directions,
one ivory die tumbling upward inside the rising flame, glowing hot at its
edges. Dark forest night behind. Strong vertical motion, warm orange against
black, single focal point, readable at thumbnail size.
No text, no letters, no numbers, no watermark.
```

## 6) 복구 — `card_repair.png` (자원 1 · 부서진 주사위 3 수리)

부서진 것을 손으로 꿰매 되살리는 카드 — 할머니의 바느질.

```
Dark fairytale storybook illustration, painterly style matching the attached
still-life key art: a cracked ivory die held together by visible red thread
stitches, a small sewing needle still piercing through mid-stitch, warm
lantern light from the side, loose red thread coiling below on dark wood.
The mended crack glows faintly warm gold. Single object centered, occupying
most of the frame, tender and quiet mood, readable at thumbnail size.
No text, no letters, no numbers, no watermark.
```

---

## 적용 메모 (생성본이 오면)

- 프레임·뒷면이 오면 `.cb-card`의 CSS 그라데이션·테두리를 border-image로 교체하고, 덱/버림 더미(`.cb-pile`)에 뒷면을 깐다.
- 일러스트는 `.cb-card .cart` 영역(이모지 자리)에 `background: center/cover`로 들어간다.
- 카드 종류가 늘 때마다 이 문서에 프롬프트를 한 절씩 추가한다 — 구도 규칙(단일 소재·중앙·엄지손톱 가독)은 공통.
