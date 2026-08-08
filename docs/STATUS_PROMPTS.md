# REDHOOD 상태이상 리소스 — 프롬프트 3판

> 기준 **v1.16** · 2026-08-08. 1판(테두리형)과 2판(면 절반 덮기)은 폐기했습니다.
> 이번엔 **주사위 눈 위치를 실제로 재고** 규격을 잡았습니다.

---

## 0. 왜 두 번 엎었나

1판은 주사위 칸 네 변을 두르는 테두리였습니다. 받침이 이미 액자라 액자가 세 겹이 됐습니다.

2판은 "눈 면 위에 얹는다"로 바꿨는데, 공통 머리말에 **"면의 절반쯤 덮는다"**라고 써버렸습니다. 그래서 포박과 독이 한가운데를 덮는 덩어리로 나왔고, 눈 하나뿐인 1면에서 그 눈이 100% 사라졌습니다. 출혈에는 "위쪽에만 얹는다"라고 써놓고 공통 머리말은 반대로 쓴, 제 잘못입니다.

3판은 **딱 한 줄에서 출발합니다.**

> **주사위 눈은 절대 가리지 않는다. 혼란과 봉인만 예외다.**

---

## 1. 눈이 어디 있는지 — 짐작이 아니라 측정값

주사위 눈 그림 여섯 장을 전부 열어 눈의 좌표와 크기를 쟀습니다. 면은 **46 × 46 px**입니다.

| 면 | 눈 위치 (x, y) |
|---|---|
| 1면 | 가운데 (23,23) 반지름 5.7 |
| 2면 | (12,13) (33,30) |
| 3면 | (12,14) (22,23) (33,30) |
| 4면 | (12,13) (34,13) (13,32) (35,32) |
| 5면 | (11,13) (34,13) (23,23) (12,31) (34,31) |
| 6면 | (11,12) (33,12) (12,23) (33,23) (12,33) (33,33) |

여섯 면을 다 겹치면 눈이 면적의 **30%**를 먹고, 여유 2px을 주면 **46%**가 금지 구역입니다. 남는 안전지대는 절반뿐이고, 그마저 대부분 **가장자리**입니다.

세로 위치별로 안전한 비율을 재면 이렇습니다.

```
  y  0- 5   ██████████████████████████████  100%   ← 위 가장자리, 완전 자유
  y  6- 8   ████████████████████             69%
  y  9-11   ████████████                     42%
  y 12-35   ██████                        22~35%   ← 눈이 꽉 찬 구간
  y 36-38   ████████████████                 54%
  y 39-45   ██████████████████████████████  100%   ← 아래 가장자리, 완전 자유
```

**결론은 명확합니다.** 굵은 덩어리를 놓을 수 있는 곳은 **위 6px과 아래 7px뿐**입니다. 가운데를 지나가려면 **가는 선**이어야 합니다. 이게 2판이 실패한 이유고, **기절이 우연히 성공한 이유**입니다 — 선 그림이라 눈 사이로 지나갔습니다.

---

## 2. 그래서 형태는 세 가지뿐입니다

| 형 | 규칙 | 해당 상태 |
|---|---|---|
| **1형 · 가장자리 뭉침** | 덩어리는 위 또는 아래 가장자리에만. 안쪽으로는 **가는 줄기만** 뻗는다 | 출혈 독 저주 축복 부패 약탈 잠식 |
| **2형 · 가는 선** | 전체를 가로질러도 좋지만 **전부 선**. 채워진 덩어리 금지 | 기절 ✅ 포박 결속 마비 |
| **3형 · 전면 덮기** | 눈을 완전히 가린다 (그게 규칙이므로) | 혼란 봉인 |

**굵기 기준**: 가운데를 지나는 것은 무엇이든 **그림 폭의 1/20 이하**입니다. 512로 뽑으면 25px, 화면에서는 2.3px입니다.

---

## 3. 규격

**정사각 1:1 · 배경 제거용 단색 배경.** 출력 최소 512. 제가 256×256으로 줄입니다.
**키아트 `keyart_stilllife` 첨부.** 없이 뽑으면 화풍이 따로 놉니다.
**한 장에 하나씩.** 시트 금지.

---

## 4. 1형 · 가장자리 뭉침 (7종)

### 공통 머리말 — 1형

`<<<위/아래>>>` 와 `<<<모티프>>>` 두 군데만 바꿉니다.

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
COMPOSITION RULE — this is the most important instruction and overrides everything else. All heavy solid mass must stay pressed against the <<<위/아래>>> EDGE of the square, occupying no more than the <<<위/아래>>> ONE QUARTER of the image height. Everything that extends past that quarter into the middle of the square must be THIN STRANDS ONLY, no strand thicker than one twentieth of the image width. The CENTRAL AREA of the square is almost entirely EMPTY BACKGROUND — at least three quarters of the middle must be plain untouched background visible between the strands. NEVER draw a solid shape in the middle. NEVER draw a border, a frame or a ring around the edges.
Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube, do NOT draw a background scene.
The effect: <<<모티프>>>
Bold silhouette, instantly readable at 46px. Give the outer contour a thin continuous pale rim like a sticker cut-line so it stays visible on a dark reddish surface. No text, no letters, no numbers, no watermark.
```

### 1. 출혈 — `status_die_bleed` · 위

*늑대. 처음 주신 액자판은 폐기했습니다.*

```
<<<위 → TOP>>>
<<<fresh wet blood clinging to the top edge as a thick uneven smear with a lumpy irregular lower rim, and four blood runnels of DIFFERENT lengths trailing down from it — the longest reaching about two thirds of the way down, the shortest barely a quarter — each runnel very thin and each ending in a small round bead. Vivid arterial crimson, NOT brown, NOT dried, bright and saturated, one glossy white highlight down the left side of each runnel.>>>
```

### 2. 독 — `status_die_poison` · 아래

*파묻힌 자. 2판에서 위쪽에 쏟으라고 쓴 게 실수였습니다 — 위쪽 눈 두 개를 정통으로 덮었습니다.*

```
<<<아래 → BOTTOM>>>
<<<a pool of bubbling toxic slime collected along the bottom edge, its upper surface lumpy with swollen glossy bubbles, and three or four very thin slime threads stretching upward from it into the empty space above, each ending in a small round droplet. Two free bubbles float high above the pool with clear empty space all around them. Acidic bile yellow-green, luminous and unnatural, wet glossy highlights.>>>
```

### 5. 저주 — `status_die_curse` · 아래

*검정이라 어두운 받침에 먹히기 쉽습니다. 보랏빛 림라이트가 필수입니다.*

```
<<<아래 → BOTTOM>>>
<<<a bank of black-violet soot banked up along the bottom edge with a ragged torn upper rim, and five or six very thin wisps of smoke curling up out of it into the empty space above, thinning to nothing. A pair of small twisted blackened horns rises out of the soot near the bottom left. Deep black-purple with cold violet rim light on every contour so it stays visible on a dark surface, fine grey ash flecks drifting off the wisps.>>>
```

### 6. 축복 — `status_die_blessing` · 위

*거짓 성인. 금색이면 안 됩니다 — 족보 강조 금빛과 헷갈립니다.*

```
<<<위 → TOP>>>
<<<a cold false halo pressed against the top edge — one flattened bleached bone-white ellipse seen almost edge-on, with seven short straight rays pointing up and outward from it, and four very thin vertical light threads hanging down from the ring into the empty space below, each ending in a tiny pale bead. Bleached bone-white and the faintest cold pale silver, deliberately drained and lifeless — NOT warm, NOT golden, NOT saturated yellow. Sterile and a little wrong.>>>
```

### 9. 부패 — `status_die_rot` · 아래

*다음 턴에 터집니다. 터지기 직전이 한눈에 보여야 합니다.*

```
<<<아래 → BOTTOM>>>
<<<one large taut diseased boil swelling up from the bottom edge, stretched to bursting with hairline splits across its skin and a dull sick amber light leaking out from inside the cracks, with two smaller pustules beside it and four very thin cracked veins creeping upward from the boil into the empty space above, thinning to hairlines. Bruised plum-purple and greenish rot brown, hot dull amber glow escaping the splits.>>>
```

### 12. 약탈 — `status_die_plunder` · 아래

*반짝이는 금이면 족보 강조와 겹칩니다. 때 낀 동전이어야 합니다.*

```
<<<아래 → BOTTOM>>>
<<<a crooked hand reaching up from the bottom edge — only the wrist and palm are solid, resting on the bottom edge, while four long VERY THIN hooked claws stretch up into the empty space above, spread wide apart with large gaps between them. Two tarnished copper coins sit in the palm and one more slips off the bottom edge. Dirty tarnished copper and dark brass, oxidised green-black in the crevices, the hand a dark leathery grey-brown. Deliberately dull — NOT bright gold, NOT shiny treasure.>>>
```

### 13. 잠식 — `status_die_devour` · 아래

*최종보스 계열. 순수한 검정은 받침에서 사라지므로 푸른 림라이트가 필수입니다.*

```
<<<아래 → BOTTOM>>>
<<<pure lightless void welling up from the bottom edge with a torn ragged upper rim like burnt paper, and five VERY THIN black tendrils reaching up out of it into the empty space above, curling and tapering to needle points, with three small black fragments floating free between them. Absolute void black inside, and every torn edge and every tendril carries a cold pale blue-white rim light so the blackness stays clearly visible against a dark background.>>>
```

---

## 5. 2형 · 가는 선 (4종)

### 공통 머리말 — 2형

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
COMPOSITION RULE — this is the most important instruction and overrides everything else. The entire effect is drawn as THIN LINES ONLY. There are NO filled shapes, NO solid masses, NO blobs anywhere in the image. No line is thicker than one twentieth of the image width. At least three quarters of the square is plain untouched background visible between the lines, including large open areas near the four corners and the exact center. NEVER draw a border, a frame or a ring around the edges.
Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube, do NOT draw a background scene.
The effect: <<<모티프>>>
Bold silhouette, instantly readable at 46px. Give every line a thin continuous pale rim like a sticker cut-line so it stays visible on a dark reddish surface. No text, no letters, no numbers, no watermark.
```

### 4. 기절 — `status_die_stun` ✅ 통과

**다시 뽑을 필요 없습니다.** 받은 그림을 여섯 면 21개 눈에 전부 대보니 **75% 이상 가려지는 눈이 0개**였습니다. 선 그림이 왜 정답인지 이 한 장이 증명했습니다. 나머지 세 장을 여기에 맞추면 됩니다.

### 3. 포박 — `status_die_bind` · 다시

*늪의 왕. 2판에서 받은 건 굵은 덩어리라 1면의 유일한 눈을 100% 덮었습니다. 같은 소재를 가늘게.*

```
<<<two thin wet swamp roots entering from the lower left corner and the right edge, winding across the square in long thin curves and deliberately AVOIDING the exact center — they bend around the middle rather than crossing it — with a few short hair-thin rootlets branching off. Waterlogged dark green-brown with a pale grey-green highlight running along the top of each root. NO thorns, NO spikes, NO thick trunks, NO knots, NO leaves.>>>
```

### 10. 결속 — `status_die_chain` · 좌우로 이어짐

*옆 주사위와 묶입니다. 좌우 끝이 잘려 나가야 이어질 자리가 생깁니다.*

```
<<<a single thin iron chain of five narrow open oval links running straight across the square from the left edge to the right edge at about one third of the height, drawn taut and level, cut off flat at both edges as if continuing beyond them. The links are OPEN OUTLINES with hollow centers, not solid. Everything above and below the chain is empty. Cold blue-grey wrought iron, chipped and pitted, a bright steel highlight along the top of each link. NO rope, NO vines, NO padlock.>>>
```

### 11. 마비 — `status_die_numb` · 감전

*기절(가는 균열)과 실루엣이 정반대라 헷갈릴 일이 없습니다.*

```
<<<three thin electric arcs of pale blue-white energy, each zigzagging in sharp angular steps from the top edge down to the bottom edge along a different path, spread wide apart with large empty gaps between them, branching into a few hair-thin forks, with five tiny bright sparks flying off the bends. Searing pale blue-white core with an electric cyan halo, hot and unstable. NO clouds, NO storm, NO ball of energy, NO glow filling the square.>>>
```

---

## 6. 3형 · 전면 덮기 (2종)

이 둘만 눈을 완전히 가립니다. 그게 규칙이기 때문입니다.

### 공통 머리말 — 3형

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background.
A single OPAQUE effect that COMPLETELY FILLS the square edge to edge and hides whatever is underneath — nothing shows through, no gaps, no empty middle. It is a surface, not a border. Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube.
The effect: <<<모티프>>>
Slightly rounded square silhouette with soft corners. Bold and instantly readable at 46px. No text, no letters, no numbers, no watermark.
```

### 7. 혼란 — `status_die_confuse`

```
<<<a thick swirling fog settled over the surface, hiding whatever is under it — a slow violet-purple vortex spiralling clockwise from a point slightly above the center, layered in three or four flat overlapping bands of mist from deep indigo at the corners to pale lilac at the eye of the spiral, dense and completely opaque with soft torn wisps curling at the four edges. NOT transparent, NOT wispy enough to see through.>>>
```

### 8. 봉인 — `status_die_seal`

```
<<<a document seal clamped over the surface — two broad dark indigo-navy cloth bands crossing over each other diagonally corner to corner and fully covering everything beneath, pinned at their crossing point by one thick round blob of dark red wax stamped with a plain sunken circle impression, the wax edges squeezed out unevenly. Deep navy-indigo cloth with a dull matte weave, oxblood red wax with one soft highlight. Unbroken and intact — NOT cracked, NOT torn open.>>>
```

---

## 7. 곁들여 필요한 것 2장

### A. 결속 사슬 이음 — `chain_link` · 가로 2:1

```
Stylized dark fairytale game icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LOW detail density. NOT photorealistic, NOT 3D. Wide 2:1 landscape image, on one plain flat mid-grey background — solid color, no gradient.
A short horizontal length of thin iron chain running straight across the full width of the frame from the left edge to the right edge, exactly three narrow open oval links with hollow centers, drawn taut and level with a slight sag in the middle, cut off flat at both edges as if continuing beyond them. Cold blue-grey wrought iron, chipped and pitted, a bright steel highlight along the top of each link. NOTHING else in the frame — no hands, no posts, no rings. No text, no letters, no numbers, no watermark.
```

### B. 공허의 부름 족보 판 — `paper_void_call` · 가로 800×212

기존 족보 판 18종과 같은 규격입니다. 가운데는 글자가 얹히니 민무늬로 비우고, 장식은 좌우 끝과 위아래 테두리에만.

```
Stylized dark fairytale UI banner plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Wide horizontal banner, aspect ratio about 3.8:1, on one plain flat mid-grey background.
A single horizontal name plate. The CENTER of the plate is a large COMPLETELY FLAT UNDECORATED panel — smooth, plain, no pattern, no carving, no objects — because game text will be printed over it. All ornament is confined to the far LEFT end, the far RIGHT end, and a thin band along the TOP and BOTTOM edges.
The plate: a slab of blackened wood being swallowed by the void — its flat center panel is a dead lightless charcoal grey-black. Along the top and bottom edges the material is torn and ragged like burnt paper, dissolving into nothing. At the left end and the right end, matching but NOT mirrored, the plate frays into pure black tongues of emptiness with thin curling tendrils reaching inward, each torn edge lit by a cold pale blue-white rim so the darkness stays visible. Two small dim blue-white points sit in the void at the outer ends like distant eyes.
Ominous, silent, final. The plate fills the frame edge to edge with no margin. No text, no letters, no numbers, no watermark.
```

---

## 8. 받으면 제가 하는 검사

이번엔 눈으로 보지 않고 **숫자로 봅니다.** 받은 그림을 여섯 면 21개 눈에 전부 대보고 이렇게 판정합니다.

- **75% 이상 덮이는 눈이 0개** → 통과
- **하나라도 있으면** → 어느 면 어느 눈인지 알려드리고 다시 뽑습니다

기절이 이 검사를 통과한 유일한 장입니다. 통과 여부를 그림과 함께 바로 돌려드리겠습니다.

배경 제거와 밝기 보정도 제가 합니다. **뽑을 때 밝기는 신경 쓰지 마세요.**

---

## 9. 안 뽑아도 되는 것

**물듦·파티클·이름표는 전부 코드입니다.** 핏방울, 스파크, 재, 기포 같은 알갱이와 주사위 아래 이름 글자는 그림이 아닙니다.

**13종 전부 코드 대역이 이미 들어가 있습니다** (`allstates.mp4`). 진짜 그림이 오는 대로 그 자리만 갈아끼우면 되고, 안 온 것은 대역이 계속 버팁니다. **순서·개수 신경 쓰지 말고 되는 대로 주세요.**

**저주·축복 전용 눈 그림은 필요 없습니다.** 기존 주사위 눈을 그대로 씁니다.

---

## 10. 순서

**출혈 → 저주 → 포박 → 독**. 1막 보스 셋(늑대 출혈 · 곰인형 저주 · 트롤 기절)과 2막 늪의 왕(포박)이 이걸 씁니다. 기절은 이미 끝났으니 출혈·저주만 있으면 1막이 섭니다.
