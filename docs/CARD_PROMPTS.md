# REDHOOD 감정 카드 아트 프롬프트 — v2 (v2.07 기준)

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

## ⚠ 주사위 눈(pip) 규칙 — AI가 가장 자주 틀리는 부분

> **v2 방침: 카드 일러스트에서 주사위를 뺐다.** 눈 오류를 보강해도 모델이 주사위 자체를 잘 못 그려서,
> 카드는 **감정 + 어두운 동화**에 집중하고 주사위는 화면의 실제 주사위 아트가 담당한다.
> 아래 규칙은 앞으로 주사위가 꼭 들어가야 하는 다른 아트(유물 등)를 만들 때를 위해 남겨둔다.

이미지 모델은 **개수를 못 센다.** "주사위" 라고만 쓰면 눈이 7개 박히거나, 엉뚱한 배치가 나오거나, 면 바깥에 눈이 떠다니는 그림이 절반쯤 나온다. 그래서 주사위가 들어가는 모든 프롬프트는 아래 규칙을 따른다.

**대책 1 — 진짜 주사위 그림을 참조로 첨부한다 (가장 강력).**
키아트와 함께 **게임의 실제 주사위 시트**(`assets/dice/normal1.png` ~ `normal6.png` 중 그 카드가 쓰는 눈)를 같이 첨부하고, 프롬프트의 "matching the attached reference die exactly" 가 그걸 가리키게 한다.

**대책 2 — 보이는 면을 하나로 고정하고, 눈 배치를 기하로 명시한다.**
"a six" 이 아니라 "EXACTLY six pips in two straight vertical columns of three" 처럼 **개수 + 배열**을 같이 쓴다. 눈이 적을수록 성공률이 높다: **1눈은 거의 안 틀리고, 4눈 이상부터 자주 틀린다.**

**대책 3 — 개수가 중요 없는 카드는 면을 아예 가린다.**
회전 모션 블러, 그림자, 불빛 번짐으로 눈이 안 읽히게 하면 틀릴 것도 없다 (고양이 이 방식).

**공통 부정 태그** — 모든 주사위 프롬프트 끝에 이미 들어 있다:
`Pips must match a real casino die. No stray pips, no pips off the die faces, no seven-pip faces.`

**검수 기준** — 생성본에서 눈이 하나라도 이 표와 다르면 그 장은 버린다:

| 눈 | 배치 |
|---|---|
| 1 | 정중앙 하나 |
| 2 | 대각 모서리 둘 |
| 3 | 대각선 일직선 셋 |
| 4 | 네 모서리 |
| 5 | 네 모서리 + 중앙 |
| 6 | 세로 3 + 3 두 줄 |

## 감정이라는 주제 (v2 — 주사위 없이)

이 카드들은 장비나 마법이 아니라 **빨간 두건의 감정**이다. 그래서 일러스트는 규칙 설명이 아니라
**그 감정을 겪는 순간의 장면**을 그린다 — 용기는 거대한 것 앞에 버티고 선 등, 추적은 어둠에 남은 흔적을 짚는 손,
고양은 치솟는 불티와 나부끼는 망토, 복구는 찢긴 것을 꿰매는 할머니의 손끝.
소녀가 나오는 카드는 **뒷모습이나 실루엣**으로 — 얼굴을 그리면 카드마다 다른 사람이 된다.

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

가장 약한 것이 가장 세지는 카드 — "작은 것이 일어선다".

> 첨부: `keyart_redhood` + `keyart_wolf`

```
Dark fairytale storybook illustration, painterly style matching the attached
key art: a small girl in a bright red hooded cloak, seen FROM BEHIND, tiny
fists clenched, standing her ground on a dark forest path before an enormous
looming wolf-shaped shadow that fills the trees ahead. She is small at the
bottom of the frame; the shadow towers over her. Her red cloak is the only
strong color, glowing like a flame against the near-black forest. Warm ember
light rises around her feet. Single clear focal point, high contrast, simple
composition readable at thumbnail size.
No text, no letters, no numbers, no watermark.
```

## 4) 어둠 속의 추적 — `card_stalk.png` (자원 2 · 주사위 하나를 6으로)

어둠 속에서 원하는 것을 정확히 찾아내는 카드.

> 첨부: `keyart_redhood`

```
Dark fairytale storybook illustration, painterly style matching the attached
key art: a red-hooded figure crouching low in a pitch-black moonlit forest,
seen from the side as a near-silhouette, one hand reaching down to touch a
faintly glowing pawprint on the forest floor. A trail of glowing pawprints
leads away into the darkness between the trees. A thin sliver of crescent
moon above. Cold silver-blue palette, deep blacks, the red hood the only
warm color. One clear focal point, simple composition readable at thumbnail
size. No text, no letters, no numbers, no watermark.
```

## 5) 고양 — `card_elate.png` (자원 1 · 무작위 주사위 +2)

속에서 치솟는 불길 — 값이 싸고 방향은 제멋대로다.

> 첨부: `keyart_redhood`

```
Dark fairytale storybook illustration, painterly style matching the attached
key art: a girl in a red hooded cloak leaping upward through a dark forest
night, seen from below as a dynamic silhouette, her cloak billowing UP like
a rising flame, a spiral of orange-gold embers and sparks swirling around her
in random directions. Strong vertical motion, warm firelight from beneath,
deep black forest behind. The red cloak and embers are the only bright
colors. Single focal point, simple composition readable at thumbnail size.
No text, no letters, no numbers, no watermark.
```

## 6) 복구 — `card_repair.png` (자원 1 · 부서진 주사위 3 수리)

부서진 것을 손으로 꿰매 되살리는 카드 — 할머니의 바느질.

> 첨부: `keyart_stilllife` + `keyart_peddler` (손·정물)

```
Dark fairytale storybook illustration, painterly style matching the attached
key art: a close-up of weathered old hands mending a torn bright-red hooded
cloak with a small sewing needle and vivid red thread, mid-stitch, by warm
lantern light on a dark wooden table. The mended tear glows faintly warm
gold along the stitches. Loose red thread coils below. Tender and quiet
mood, deep shadows around the pool of lantern light, the red cloth the only
strong color. Single subject centered, occupying most of the frame,
readable at thumbnail size.
No text, no letters, no numbers, no watermark.
```

---

## 적용 메모 (생성본이 오면)

- 프레임·뒷면이 오면 `.cb-card`의 CSS 그라데이션·테두리를 border-image로 교체하고, 덱/버림 더미(`.cb-pile`)에 뒷면을 깐다.
- 일러스트는 `.cb-card .cart` 영역(이모지 자리)에 `background: center/cover`로 들어간다.
- 카드 종류가 늘 때마다 이 문서에 프롬프트를 한 절씩 추가한다 — 구도 규칙(단일 소재·중앙·엄지손톱 가독)은 공통.
