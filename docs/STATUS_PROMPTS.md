# REDHOOD 상태이상 프롬프트 — 완성본 15장

> 기준 **v1.16** · 2026-08-08 · 3판.
> **공통 머리말과 본문을 합쳤습니다. 아래 블록을 통째로 복사해서 그대로 넣으면 됩니다.**
> 앞부분이 겹쳐 보이는 건 의도한 것입니다 — 조립할 필요 없이 한 번에 붙여넣으라고 그렇게 뒀습니다.

## 뽑기 전에 세 가지만

**하나, 정사각 1:1 · 최소 512.** 14번만 가로 2:1, 15번만 가로 3.8:1입니다. 제가 받아서 규격을 맞춥니다.

**둘, 키아트 `keyart_stilllife` 를 반드시 첨부하세요.** 없이 뽑으면 화풍이 따로 놉니다.

**셋, 밝기는 신경 쓰지 마세요.** 받침색 #4F1110 위에서 제가 재서 맞춥니다.

## 규격이 왜 이렇게 생겼나

주사위 눈 그림 여섯 장을 열어 눈의 좌표와 크기를 실제로 쟀습니다. 면은 46×46px이고, 여섯 면을 겹치면 눈이 면적의 30%, 여유 2px을 주면 46%가 금지 구역입니다. 세로로 보면 **위 6px과 아래 7px만 완전히 자유롭고 나머지는 눈이 꽉 차 있습니다.**

그래서 형태가 세 가지뿐입니다. **1형은 덩어리를 위나 아래 가장자리에만 두고 안쪽으로는 가는 줄기만** 뻗습니다. **2형은 전부 가는 선**이라 눈 사이를 지나갑니다. **3형은 아예 다 덮습니다** — 혼란과 봉인은 눈을 가리는 게 규칙이라 예외입니다.

가운데를 지나는 것은 무엇이든 **그림 폭의 1/20 이하**입니다. 512로 뽑으면 25px입니다.

## 받으면 숫자로 검사합니다

여섯 면 21개 눈에 전부 대보고 **75% 넘게 덮이는 눈이 하나라도 있으면 불통**입니다. 어느 면 어느 눈인지 알려드립니다. 기절이 이 검사를 통과한 유일한 장입니다.

## 순서

**1 출혈 → 5 저주 → 3 포박 → 2 독.** 1막 보스가 늑대(출혈)·곰인형(저주)·트롤(기절)이고 기절은 끝났으니, 출혈과 저주만 있으면 1막이 섭니다. 안 온 것은 코드 대역이 계속 버티니 되는 대로 주시면 됩니다.

---

## 1. 출혈 — `status_die_bleed`

**1형 · 위 가장자리**

*늑대. 처음 주신 액자판은 폐기했습니다. 어두운 받침에 먹히기 쉬우니 유독 밝게.*

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
COMPOSITION RULE — this is the most important instruction and overrides everything else. All heavy solid mass must stay pressed against the TOP EDGE of the square, occupying no more than the top ONE QUARTER of the image height. Everything that extends past that quarter into the middle of the square must be THIN STRANDS ONLY, no strand thicker than one twentieth of the image width. The CENTRAL AREA of the square is almost entirely EMPTY BACKGROUND — at least three quarters of the middle must be plain untouched background visible between the strands. NEVER draw a solid shape in the middle. NEVER draw a border, a frame or a ring around the edges.
Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube, do NOT draw a background scene.
The effect: fresh wet blood clinging to the top edge as a thick uneven smear with a lumpy irregular lower rim, and four blood runnels of DIFFERENT lengths trailing down from it — the longest reaching about two thirds of the way down, the shortest barely a quarter — each runnel very thin and each ending in a small round bead. Vivid arterial crimson, NOT brown, NOT dried, bright and saturated, one glossy white highlight down the left side of each runnel.
Bold silhouette, instantly readable at 46px. Give the outer contour a thin continuous pale rim like a sticker cut-line so it stays visible on a dark reddish surface. No text, no letters, no numbers, no watermark.
```

---

## 2. 독 — `status_die_poison`

**1형 · 아래 가장자리**

*파묻힌 자. 2판에서 위쪽에 쏟으라고 쓴 게 실수였습니다 — 위쪽 눈 두 개를 정통으로 덮었습니다.*

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
COMPOSITION RULE — this is the most important instruction and overrides everything else. All heavy solid mass must stay pressed against the BOTTOM EDGE of the square, occupying no more than the bottom ONE QUARTER of the image height. Everything that extends past that quarter into the middle of the square must be THIN STRANDS ONLY, no strand thicker than one twentieth of the image width. The CENTRAL AREA of the square is almost entirely EMPTY BACKGROUND — at least three quarters of the middle must be plain untouched background visible between the strands. NEVER draw a solid shape in the middle. NEVER draw a border, a frame or a ring around the edges.
Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube, do NOT draw a background scene.
The effect: a pool of bubbling toxic slime collected along the bottom edge, its upper surface lumpy with swollen glossy bubbles, and three or four very thin slime threads stretching upward from it into the empty space above, each ending in a small round droplet. Two free bubbles float high above the pool with clear empty space all around them. Acidic bile yellow-green, luminous and unnatural, wet glossy highlights.
Bold silhouette, instantly readable at 46px. Give the outer contour a thin continuous pale rim like a sticker cut-line so it stays visible on a dark reddish surface. No text, no letters, no numbers, no watermark.
```

---

## 3. 포박 — `status_die_bind`

**2형 · 가는 선**

*늪의 왕. 2판에서 받은 건 굵은 덩어리라 1면의 유일한 눈을 100% 덮었습니다. 같은 소재를 가늘게.*

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
COMPOSITION RULE — this is the most important instruction and overrides everything else. The entire effect is drawn as THIN LINES ONLY. There are NO filled shapes, NO solid masses, NO blobs anywhere in the image. No line is thicker than one twentieth of the image width. At least three quarters of the square is plain untouched background visible between the lines, including large open areas near the four corners and the exact center. NEVER draw a border, a frame or a ring around the edges.
Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube, do NOT draw a background scene.
The effect: two thin wet swamp roots entering from the lower left corner and the right edge, winding across the square in long thin curves and deliberately AVOIDING the exact center — they bend around the middle rather than crossing it — with a few short hair-thin rootlets branching off. Waterlogged dark green-brown with a pale grey-green highlight running along the top of each root. NO thorns, NO spikes, NO thick trunks, NO knots, NO leaves.
Bold silhouette, instantly readable at 46px. Give every line a thin continuous pale rim like a sticker cut-line so it stays visible on a dark reddish surface. No text, no letters, no numbers, no watermark.
```

---

## 4. 기절 — `status_die_stun`

**2형 · 가는 선  ✅ 통과 — 다시 안 뽑아도 됨**

*받은 그림을 여섯 면 21개 눈에 전부 대보니 75% 이상 가려지는 눈이 0개였습니다. 아래는 참고용 완성본입니다.*

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
COMPOSITION RULE — this is the most important instruction and overrides everything else. The entire effect is drawn as THIN LINES ONLY. There are NO filled shapes, NO solid masses, NO blobs anywhere in the image. No line is thicker than one twentieth of the image width. At least three quarters of the square is plain untouched background visible between the lines, including large open areas near the four corners and the exact center. NEVER draw a border, a frame or a ring around the edges.
Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube, do NOT draw a background scene.
The effect: a hard impact crack shattering across the square — one deep jagged fracture running from the upper left corner to the lower right, with five or six thinner splits branching off it, and two small chipped shards broken loose and floating just off the surface. Thin bright pale white-silver crack lines with cold blue-white edges, weightless and sharp. NO stars, NO birds, NO spirals.
Bold silhouette, instantly readable at 46px. Give every line a thin continuous pale rim like a sticker cut-line so it stays visible on a dark reddish surface. No text, no letters, no numbers, no watermark.
```

---

## 5. 저주 — `status_die_curse`

**1형 · 아래 가장자리**

*검정이라 어두운 받침에 먹히기 쉽습니다. 보랏빛 림라이트가 필수입니다.*

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
COMPOSITION RULE — this is the most important instruction and overrides everything else. All heavy solid mass must stay pressed against the BOTTOM EDGE of the square, occupying no more than the bottom ONE QUARTER of the image height. Everything that extends past that quarter into the middle of the square must be THIN STRANDS ONLY, no strand thicker than one twentieth of the image width. The CENTRAL AREA of the square is almost entirely EMPTY BACKGROUND — at least three quarters of the middle must be plain untouched background visible between the strands. NEVER draw a solid shape in the middle. NEVER draw a border, a frame or a ring around the edges.
Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube, do NOT draw a background scene.
The effect: a bank of black-violet soot banked up along the bottom edge with a ragged torn upper rim, and five or six very thin wisps of smoke curling up out of it into the empty space above, thinning to nothing. A pair of small twisted blackened horns rises out of the soot near the bottom left. Deep black-purple with cold violet rim light on every contour so it stays visible on a dark surface, fine grey ash flecks drifting off the wisps.
Bold silhouette, instantly readable at 46px. Give the outer contour a thin continuous pale rim like a sticker cut-line so it stays visible on a dark reddish surface. No text, no letters, no numbers, no watermark.
```

---

## 6. 축복 — `status_die_blessing`

**1형 · 위 가장자리**

*거짓 성인. 금색이면 안 됩니다 — 족보 강조 금빛과 헷갈립니다.*

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
COMPOSITION RULE — this is the most important instruction and overrides everything else. All heavy solid mass must stay pressed against the TOP EDGE of the square, occupying no more than the top ONE QUARTER of the image height. Everything that extends past that quarter into the middle of the square must be THIN STRANDS ONLY, no strand thicker than one twentieth of the image width. The CENTRAL AREA of the square is almost entirely EMPTY BACKGROUND — at least three quarters of the middle must be plain untouched background visible between the strands. NEVER draw a solid shape in the middle. NEVER draw a border, a frame or a ring around the edges.
Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube, do NOT draw a background scene.
The effect: a cold false halo pressed against the top edge — one flattened bleached bone-white ellipse seen almost edge-on, with seven short straight rays pointing up and outward from it, and four very thin vertical light threads hanging down from the ring into the empty space below, each ending in a tiny pale bead. Bleached bone-white and the faintest cold pale silver, deliberately drained and lifeless — NOT warm, NOT golden, NOT saturated yellow. Sterile and a little wrong.
Bold silhouette, instantly readable at 46px. Give the outer contour a thin continuous pale rim like a sticker cut-line so it stays visible on a dark reddish surface. No text, no letters, no numbers, no watermark.
```

---

## 7. 혼란 — `status_die_confuse`

**3형 · 전면 덮기**

*안개의 어머니. 눈을 가리는 게 규칙인 둘 중 하나입니다.*

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient.
A single OPAQUE effect that COMPLETELY FILLS the square edge to edge and hides whatever is underneath — nothing shows through, no gaps, no empty middle. It is a surface, not a border. Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube.
The effect: a thick swirling fog settled over the surface, hiding whatever is under it — a slow violet-purple vortex spiralling clockwise from a point slightly above the center, layered in three or four flat overlapping bands of mist from deep indigo at the corners to pale lilac at the eye of the spiral, dense and completely opaque with soft torn wisps curling at the four edges. NOT transparent, NOT wispy enough to see through.
Slightly rounded square silhouette with soft corners. Bold and instantly readable at 46px. No text, no letters, no numbers, no watermark.
```

---

## 8. 봉인 — `status_die_seal`

**3형 · 전면 덮기**

*자각몽의 왕. 한 번 굴려야 열립니다. 뜯긴 적 없는 새것처럼.*

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient.
A single OPAQUE effect that COMPLETELY FILLS the square edge to edge and hides whatever is underneath — nothing shows through, no gaps, no empty middle. It is a surface, not a border. Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube.
The effect: a document seal clamped over the surface — two broad dark indigo-navy cloth bands crossing over each other diagonally corner to corner and fully covering everything beneath, pinned at their crossing point by one thick round blob of dark red wax stamped with a plain sunken circle impression, the wax edges squeezed out unevenly. Deep navy-indigo cloth with a dull matte weave, oxblood red wax with one soft highlight. Unbroken and intact — NOT cracked, NOT torn open.
Slightly rounded square silhouette with soft corners. Bold and instantly readable at 46px. No text, no letters, no numbers, no watermark.
```

---

## 9. 부패 — `status_die_rot`

**1형 · 아래 가장자리**

*다음 턴에 터집니다. 터지기 직전이 한눈에 보여야 합니다.*

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
COMPOSITION RULE — this is the most important instruction and overrides everything else. All heavy solid mass must stay pressed against the BOTTOM EDGE of the square, occupying no more than the bottom ONE QUARTER of the image height. Everything that extends past that quarter into the middle of the square must be THIN STRANDS ONLY, no strand thicker than one twentieth of the image width. The CENTRAL AREA of the square is almost entirely EMPTY BACKGROUND — at least three quarters of the middle must be plain untouched background visible between the strands. NEVER draw a solid shape in the middle. NEVER draw a border, a frame or a ring around the edges.
Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube, do NOT draw a background scene.
The effect: one large taut diseased boil swelling up from the bottom edge, stretched to bursting with hairline splits across its skin and a dull sick amber light leaking out from inside the cracks, with two smaller pustules beside it and four very thin cracked veins creeping upward from the boil into the empty space above, thinning to hairlines. Bruised plum-purple and greenish rot brown, hot dull amber glow escaping the splits.
Bold silhouette, instantly readable at 46px. Give the outer contour a thin continuous pale rim like a sticker cut-line so it stays visible on a dark reddish surface. No text, no letters, no numbers, no watermark.
```

---

## 10. 결속 — `status_die_chain`

**2형 · 가는 선**

*옆 주사위와 묶입니다. 좌우 끝이 잘려 나가야 이어질 자리가 생깁니다.*

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
COMPOSITION RULE — this is the most important instruction and overrides everything else. The entire effect is drawn as THIN LINES ONLY. There are NO filled shapes, NO solid masses, NO blobs anywhere in the image. No line is thicker than one twentieth of the image width. At least three quarters of the square is plain untouched background visible between the lines, including large open areas near the four corners and the exact center. NEVER draw a border, a frame or a ring around the edges.
Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube, do NOT draw a background scene.
The effect: a single thin iron chain of five narrow open oval links running straight across the square from the left edge to the right edge at about one third of the height, drawn taut and level, cut off flat at both edges as if continuing beyond them. The links are OPEN OUTLINES with hollow centers, not solid. Everything above and below the chain is empty. Cold blue-grey wrought iron, chipped and pitted, a bright steel highlight along the top of each link. NO rope, NO vines, NO padlock.
Bold silhouette, instantly readable at 46px. Give every line a thin continuous pale rim like a sticker cut-line so it stays visible on a dark reddish surface. No text, no letters, no numbers, no watermark.
```

---

## 11. 마비 — `status_die_numb`

**2형 · 가는 선**

*감전된 것처럼. 기절(가는 균열)과 실루엣이 정반대라 헷갈릴 일이 없습니다.*

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
COMPOSITION RULE — this is the most important instruction and overrides everything else. The entire effect is drawn as THIN LINES ONLY. There are NO filled shapes, NO solid masses, NO blobs anywhere in the image. No line is thicker than one twentieth of the image width. At least three quarters of the square is plain untouched background visible between the lines, including large open areas near the four corners and the exact center. NEVER draw a border, a frame or a ring around the edges.
Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube, do NOT draw a background scene.
The effect: three thin electric arcs of pale blue-white energy, each zigzagging in sharp angular steps from the top edge down to the bottom edge along a different path, spread wide apart with large empty gaps between them, branching into a few hair-thin forks, with five tiny bright sparks flying off the bends. Searing pale blue-white core with an electric cyan halo, hot and unstable. NO clouds, NO storm, NO ball of energy, NO glow filling the square.
Bold silhouette, instantly readable at 46px. Give every line a thin continuous pale rim like a sticker cut-line so it stays visible on a dark reddish surface. No text, no letters, no numbers, no watermark.
```

---

## 12. 약탈 — `status_die_plunder`

**1형 · 아래 가장자리**

*반짝이는 금이면 족보 강조와 겹칩니다. 때 낀 동전이어야 합니다.*

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
COMPOSITION RULE — this is the most important instruction and overrides everything else. All heavy solid mass must stay pressed against the BOTTOM EDGE of the square, occupying no more than the bottom ONE QUARTER of the image height. Everything that extends past that quarter into the middle of the square must be THIN STRANDS ONLY, no strand thicker than one twentieth of the image width. The CENTRAL AREA of the square is almost entirely EMPTY BACKGROUND — at least three quarters of the middle must be plain untouched background visible between the strands. NEVER draw a solid shape in the middle. NEVER draw a border, a frame or a ring around the edges.
Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube, do NOT draw a background scene.
The effect: a crooked hand reaching up from the bottom edge — only the wrist and palm are solid, resting on the bottom edge, while four long VERY THIN hooked claws stretch up into the empty space above, spread wide apart with large gaps between them. Two tarnished copper coins sit in the palm and one more slips off the bottom edge. Dirty tarnished copper and dark brass, oxidised green-black in the crevices, the hand a dark leathery grey-brown. Deliberately dull — NOT bright gold, NOT shiny treasure.
Bold silhouette, instantly readable at 46px. Give the outer contour a thin continuous pale rim like a sticker cut-line so it stays visible on a dark reddish surface. No text, no letters, no numbers, no watermark.
```

---

## 13. 잠식 — `status_die_devour`

**1형 · 아래 가장자리**

*최종보스 계열. 순수한 검정은 받침에서 사라지므로 푸른 림라이트가 필수입니다.*

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
COMPOSITION RULE — this is the most important instruction and overrides everything else. All heavy solid mass must stay pressed against the BOTTOM EDGE of the square, occupying no more than the bottom ONE QUARTER of the image height. Everything that extends past that quarter into the middle of the square must be THIN STRANDS ONLY, no strand thicker than one twentieth of the image width. The CENTRAL AREA of the square is almost entirely EMPTY BACKGROUND — at least three quarters of the middle must be plain untouched background visible between the strands. NEVER draw a solid shape in the middle. NEVER draw a border, a frame or a ring around the edges.
Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube, do NOT draw a background scene.
The effect: pure lightless void welling up from the bottom edge with a torn ragged upper rim like burnt paper, and five VERY THIN black tendrils reaching up out of it into the empty space above, curling and tapering to needle points, with three small black fragments floating free between them. Absolute void black inside, and every torn edge and every tendril carries a cold pale blue-white rim light so the blackness stays clearly visible against a dark background.
Bold silhouette, instantly readable at 46px. Give the outer contour a thin continuous pale rim like a sticker cut-line so it stays visible on a dark reddish surface. No text, no letters, no numbers, no watermark.
```

---

## 14. 결속 사슬 이음 — `chain_link`

**가로 2:1 · 512×256**

*결속은 주사위 두 개를 묶는 상태라 사이를 잇는 사슬이 따로 필요합니다.*

```
Stylized dark fairytale game icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LOW detail density. NOT photorealistic, NOT 3D. Wide 2:1 landscape image, on one plain flat mid-grey background — solid color, no gradient.
A short horizontal length of thin iron chain running straight across the full width of the frame from the left edge to the right edge, exactly three narrow open oval links with hollow centers, drawn taut and level with a slight sag in the middle, cut off flat at both edges as if continuing beyond them. Cold blue-grey wrought iron, chipped and pitted, a bright steel highlight along the top of each link. NOTHING else in the frame — no hands, no posts, no rings. No text, no letters, no numbers, no watermark.
```

---

## 15. 공허의 부름 족보 판 — `paper_void_call`

**가로 800 × 세로 212 (약 3.8:1)**

*잠식이 주사위 5개를 다 먹으면 족보가 이것 하나만 남습니다. 게임에서 가장 나쁜 순간에 뜨는 판입니다. 가운데는 글자가 얹히니 민무늬로 비웁니다.*

```
Stylized dark fairytale UI banner plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Wide horizontal banner, aspect ratio about 3.8:1, on one plain flat mid-grey background.
A single horizontal name plate. The CENTER of the plate is a large COMPLETELY FLAT UNDECORATED panel — smooth, plain, no pattern, no carving, no objects — because game text will be printed over it. All ornament is confined to the far LEFT end, the far RIGHT end, and a thin band along the TOP and BOTTOM edges.
The plate: a slab of blackened wood being swallowed by the void — its flat center panel is a dead lightless charcoal grey-black. Along the top and bottom edges the material is torn and ragged like burnt paper, dissolving into nothing. At the left end and the right end, matching but NOT mirrored, the plate frays into pure black tongues of emptiness with thin curling tendrils reaching inward, each torn edge lit by a cold pale blue-white rim so the darkness stays visible. Two small dim blue-white points sit in the void at the outer ends like distant eyes.
Ominous, silent, final. The plate fills the frame edge to edge with no margin. No text, no letters, no numbers, no watermark.
```
