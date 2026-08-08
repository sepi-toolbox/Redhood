# REDHOOD 상태이상 리소스 — 프롬프트 정리본 (2판)

> 기준 **v1.16** · 2026-08-08. **보류 중 — 나중에 다시 볼 것.**

## ⚠ 다시 시작할 때 먼저 읽을 것

**규칙이 하나로 안 잡혀서 멈췄습니다.** 출혈은 "위쪽에만 얹고 눈은 안 가린다"로 써놓고, 아래 공통 머리말에는 "면의 절반쯤 덮는다"라고 써서 포박·독이 한가운데를 덮는 그림으로 나왔습니다. 같은 문서 안에서 지시가 서로 어긋난 것이고, 그림 문제가 아니라 규격 문제입니다.

다시 할 때는 **이 한 줄부터 정하고 시작합니다.**

> **눈은 절대 가리지 않는다. 효과는 눈을 피해서 얹힌다. 혼란과 봉인만 예외로 전면을 덮는다.**

눈을 피하는 방법은 두 가지뿐입니다 — **위쪽 띠**(출혈처럼 위 40%에만) 또는 **선 그림**(기절처럼 눈 사이를 지나가는 가는 선). 덩어리로 그리면 무조건 눈을 삼킵니다. 실제로 재보니 눈이 하나뿐인 1면에서 포박이 그 눈을 100% 덮었습니다.

아래 본문의 공통 머리말은 이 규칙과 어긋나 있으니 **그대로 쓰지 마세요.**

**지금까지 확보한 것**: 기절 한 장(선 그림이라 규칙에 맞음, 21개 눈 중 완전히 가려지는 것 0개). 포박·독은 규격 미달이라 다시 뽑아야 합니다. 출혈 액자판은 폐기했습니다.

**막혀도 게임은 굴러갑니다.** 13종 전부 코드로 만든 대역이 이미 있습니다 (`allstates.mp4`, `tools/build_states.py`).

---

---

## 0. 무엇이 바뀌었나

**주사위를 두르지 않습니다. 주사위 눈 면 위에 얹습니다.**

1판은 주사위 칸 네 변을 두르는 테두리였는데, 받침(`die_pad.png`)이 이미 나무 테두리 + 안쪽 붉은 면 두 겹이라 거기에 또 두르니 액자가 세 겹이 됐습니다. 그림이 문제가 아니라 **닫힌 사각 링**이 문제였습니다.

2판은 **주사위 눈이 그려진 그 사각 면 위에서 벌어지는 일**입니다. 받침은 손대지 않습니다.

---

## 1. 겹 구조 — 상태이상 하나당 네 겹

전부 같은 구조를 씁니다. **그림은 딱 한 장**이고 나머지 세 겹은 제가 코드로 만듭니다.

| 겹 | 무엇 | 누가 만드나 |
|---|---|---|
| ① 면 효과 | 주사위 눈 면 위에 얹히는 그림 | **뽑아주셔야 하는 것 (13장)** |
| ② 물듦 | 면 전체가 그 색으로 젖는다 | 코드 (색만 지정) |
| ③ 파티클 | 방울·불꽃·재 같은 작은 알갱이 | 코드 (모양·움직임 지정) |
| ④ 이름표 | 주사위 아래 붉은 글씨 "출혈" | 코드 |

**④ 이름표가 붙으면서 그림의 부담이 확 줄었습니다.** 원래는 13종을 62px 실루엣만으로 구분해야 해서 기절과 마비를 어떻게 가를지 같은 걸 고민했는데, 이제 글자가 이름을 말해줍니다. 그림은 **"뭔가 나쁜 게 걸렸다"와 색**만 담당하면 됩니다.

**움직임은 상태마다 다릅니다.** 피는 흘러내리고 전류는 지직거리고 재는 흩날립니다. 흘러내리는 건 그게 피라서 그런 거지 공통 규칙이 아닙니다. 각자 자기 성질대로 움직입니다. 겹 구조만 하나로 통일되어 있으면 됩니다.

---

## 2. 13종 파라미터

`grammar_test.mp4` 에서 출혈(그림 있음)과 마비(그림 없이 코드로만 흉내)를 나란히 확인할 수 있습니다.

| # | 상태 | 면 위에 무엇이 | 물듦 색 | 파티클 | 움직임 |
|---|---|---|---|---|---|
| 1 | 출혈 | 위에서 흘러내린 피 | 진홍 | 핏방울 | 아래로 뚝뚝 |
| 2 | 독 | 면을 덮은 점액과 거품 | 황록 | 기포 | 떠올라 터짐 |
| 3 | 포박 | 면을 가로지르는 젖은 뿌리 | 검녹 | — | 서서히 조임 |
| 4 | 기절 | 면에 간 균열 | 은회 | 파편 | 가끔 튐 |
| 5 | 저주 | 면을 삼켜오는 검은 그을음 | 검보라 | 재 | 위로 흩날림 |
| 6 | 축복 | 면 위에 뜬 창백한 광배 | 뼈흰빛 | 빛가루 | 천천히 떠오름 |
| 7 | 혼란 | 면 전체를 덮은 소용돌이 안개 | 보라 | — | 느리게 회전 |
| 8 | 봉인 | 면을 덮은 밀랍 인장 | 남색 | — | 아주 느린 숨 |
| 9 | 부패 | 면에 부푼 종기 | 병든 자두 | 포자 | 부풀었다 꺼짐 |
| 10 | 결속 | 면을 가로지르는 쇠사슬 | 청회 | — | 팽팽히 당김 |
| 11 | 마비 | 면 위를 달리는 전류 | 창백한 청백 | 스파크 | 지직거림 |
| 12 | 약탈 | 면을 움켜쥔 갈고리 손 | 구릿빛 | 동전 | 떨어져 나감 |
| 13 | 잠식 | 면을 먹어들어가는 검정 | 먹빛 | 검은 조각 | 안으로 빨림 |

**덮는 정도가 두 가지입니다.** 7 혼란과 8 봉인만 **면을 완전히 덮습니다** — 눈금이 안 보이는 게 규칙이니까요. 나머지 11종은 **면의 절반쯤만 차지하고 눈금이 비쳐야** 합니다.

**색이 겹치지 않게 갈라뒀습니다.** 게임이 이미 붉은 발광을 "다시 굴릴 주사위", 금 발광을 "지금 고른 족보"로 쓰고 있어서, 축복은 금색이 아니라 표백된 뼈흰빛으로, 약탈은 반짝이는 금이 아니라 때 낀 구릿빛으로 갑니다.

---

## 3. 규격

**정사각 1:1 · 배경 제거용 단색 배경.** 출력 최소 512, 클수록 좋습니다. 제가 256×256으로 줄여 넣습니다.
**키아트 `keyart_stilllife` 첨부하세요.** 없이 뽑으면 화풍이 따로 놉니다.
**한 장에 하나씩.** 시트로 묶지 마세요.

화면에서는 **46 × 46 px** 로 들어갑니다. 주사위 눈 면 크기 그대로입니다.

---

## 4. 부분형 11종

### 공통 머리말

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
An effect lying ON TOP of a flat square surface, as if something has happened to the face of a tile. It must NOT be a border, NOT a frame, NOT a ring, NOT a decorative edge — do NOT draw anything running around all four edges. It covers roughly HALF the square and leaves clear open gaps where the surface underneath would still show through.
Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube, do NOT draw a background scene.
The effect: <<<모티프>>>
Bold silhouette, instantly readable at 46px. It must stay bright enough to read against a dark reddish surface underneath, so give its outer contour a thin continuous pale rim like a sticker cut-line. No text, no letters, no numbers, no watermark.
```

### 1. 출혈 — `status_die_bleed`

*늑대. **처음 주신 액자 그림은 폐기했습니다** — 네 변을 두르는 형태라 이 규격에 안 맞습니다. 아래 프롬프트로 다시 뽑아주세요. 어두운 받침에 먹히기 쉬우니 유독 밝게.*

```
<<<fresh wet blood spilled across the top of the square — a thick uneven smear clinging to the upper edge with a lumpy irregular lower rim, and four blood runnels of DIFFERENT lengths hanging down from it, each swelling into a heavy round bead at its tip, the longest reaching about two thirds of the way down and the shortest barely a quarter. The bottom third of the square is left completely empty. Vivid arterial crimson, NOT brown, NOT dried, kept bright and saturated so it separates from a dark red-brown surface, with one glossy white highlight running down the left side of each runnel.>>>
```

### 2. 독 — `status_die_poison`

*파묻힌 자. 출혈과 나란히 놓아도 안 헷갈리게 색을 확실히 띄운다.*

```
<<<a spill of bubbling toxic slime poured across the upper half of the square and sagging downward in two thick runnels, with a cluster of fat glossy bubbles swelling along its lower edge and three small bubbles floating free above it. The lower third of the square is left empty. Acidic bile yellow-green, luminous and unnatural, wet glossy highlights, one small bubble caught mid-burst.>>>
```

### 3. 포박 — `status_die_bind`

*늪의 왕. 젖은 뿌리다. 가시는 넣지 않는다 — 가시덤불 몬스터와 겹친다.*

```
<<<two thick wet swamp roots running diagonally across the square from the upper left to the lower right, crossing over each other near the middle and knotted there into one gnarled knot, their frayed tips trailing off past two opposite corners. Wide open gaps between the roots. Dark waterlogged green-brown, slick with pond scum, pale grey-green highlights along the top of each root. NO thorns, NO spikes, NO flowers, NO full circle around the edge.>>>
```

### 4. 기절 — `status_die_stun`

*트롤. 값은 나오는데 세지지 않는다 = 금이 가서 못 쓰는 면. 별이나 새는 넣지 않는다 — 만화적이라 화풍에 안 맞는다.*

```
<<<a hard impact crack shattering across the square — one deep jagged fracture running from the upper left corner to the lower right, with five or six thinner splits branching off it, and two small chipped shards broken loose and floating just off the surface. Most of the square is untouched between the cracks. Thin bright pale white-silver crack lines with cold blue-white edges, weightless and sharp. NO stars, NO birds, NO spirals.>>>
```

### 5. 저주 — `status_die_curse`

*검은색이라 어두운 받침에 먹히기 쉽다. 보랏빛 림라이트가 필수.*

```
<<<a creeping black-violet soot bleeding in from the lower left corner and the upper right corner of the square, spreading in ragged uneven tongues toward the middle but leaving the center partly clear, with a pair of small twisted blackened horns curling downward out of the upper mass, and fine grey ash flecks drifting off the edges of the stain. Deep black-purple with cold violet rim light on every contour so it stays visible on a dark surface.>>>
```

### 6. 축복 — `status_die_blessing`

*거짓 성인. 진짜 축복이 아니라 축복인 척하는 것. 따뜻하면 안 되고 금색이면 안 된다 — 족보 강조 금빛과 헷갈린다.*

```
<<<a cold false halo hovering over the square — one thin bleached bone-white ring tilted in perspective across the upper half like a crown floating above a surface, with seven short straight rays pointing outward from it and four small pale beads scattered below. Most of the square stays open and clear. Bleached bone-white and the faintest cold pale silver, deliberately drained and lifeless — NOT warm, NOT golden, NOT saturated yellow, NOT glowing orange. Sterile and a little wrong.>>>
```

### 9. 부패 — `status_die_rot`

*다음 턴에 터진다. 터지기 직전이라는 게 한눈에 보여야 한다.*

```
<<<one large taut diseased boil swelling up out of the middle-upper area of the square, stretched to bursting with hairline splits across its skin and a dull sick amber light leaking out from inside the cracks, with three smaller lumpy pustules clustered around its base and dark mottled bruising seeping outward from them. The corners of the square stay clear. Bruised plum-purple and greenish rot brown, hot dull amber glow escaping the splits.>>>
```

### 10. 결속 — `status_die_chain`

*옆 주사위와 묶인다. 좌우로 사슬 끝이 삐져나와야 이어질 자리가 생긴다 — 이게 이 그림의 핵심이다.*

```
<<<a single heavy cast-iron chain stretched taut straight across the middle of the square from the left edge to the right edge, exactly five thick oval links, cut off flat at both edges as if continuing beyond them, with one broken open link hanging loose below the line. The top and bottom thirds of the square are completely empty. Cold blue-grey wrought iron, chipped and pitted, bright steel highlights along the top of every link. NO rust stains, NO rope, NO vines, NO frame.>>>
```

### 11. 마비 — `status_die_numb`

*감전된 것처럼. 기절(얇은 균열)과는 실루엣이 정반대라 헷갈릴 일이 없다.*

```
<<<a violent electric arc crawling across the square — two or three jagged lightning bolts of pale blue-white energy zigzagging from the top edge down to the bottom edge in sharp angular steps, branching into thin forks, with four or five tiny bright sparks flying off the bends. Wide empty space between the bolts. Searing pale blue-white core with an electric cyan halo, hot and unstable. NO clouds, NO storm, NO frame, NO circle.>>>
```

### 12. 약탈 — `status_die_plunder`

*돈을 뺏어간다. 반짝이는 금이면 족보 강조와 겹친다 — 때 낀 동전이어야 한다.*

```
<<<a crooked grasping hand with hooked claws reaching in from the lower right corner and clutching across the square, its fingers curled over the surface, with four tarnished copper coins caught in its grip and two more spilling loose toward the opposite corner. The upper left of the square stays open. Dirty tarnished copper and dark brass, oxidised green-black in the crevices, the hand itself a dark leathery grey-brown. Deliberately dull — NOT bright gold, NOT shiny treasure, NOT glowing.>>>
```

### 13. 잠식 — `status_die_devour`

*최종보스 계열. 순수한 검정은 어두운 받침에서 사라지므로 푸른 림라이트가 필수다.*

```
<<<a spreading void eating a hole through the middle of the square — the surface looks burnt away into pure lightless black, its torn opening ragged like burnt paper with uneven tongues creeping outward, and two thin black tendrils curling out of the hole toward opposite corners. The corners of the square remain untouched. The torn edge of every black shape carries a cold pale blue rim light so the blackness stays clearly visible against a dark background. Absolute void black inside, cold blue-white at every torn edge.>>>
```

---

## 5. 전면형 2종

이 둘만 눈금을 완전히 가립니다.

### 공통 머리말

```
Stylized dark fairytale game effect overlay for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background.
A single OPAQUE effect that COMPLETELY FILLS the square frame edge to edge and hides whatever is underneath — nothing shows through, no gaps, no empty middle. It is a surface, not a border. Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube.
The effect: <<<모티프>>>
Slightly rounded square silhouette with soft corners. Bold and instantly readable at 46px. No text, no letters, no numbers, no watermark.
```

### 7. 혼란 — `status_die_confuse`

*안개의 어머니. 게임이 이미 보라색을 상태이상 색으로 쓰고 있으니 그대로 간다.*

```
<<<a thick swirling fog that has settled over the surface and hidden whatever is under it — a slow violet-purple vortex spiralling clockwise from a point slightly above the center, layered in three or four flat overlapping bands of mist from deep indigo at the corners to pale lilac at the eye of the spiral, dense and completely opaque with soft torn wisps curling at the four edges. NOT transparent, NOT wispy enough to see through.>>>
```

### 8. 봉인 — `status_die_seal`

*자각몽의 왕. 값 자체가 없다. 한 번 굴려야 열린다. 뜯긴 적 없는 새것처럼 보여야 한다.*

```
<<<a document seal clamped over the surface — two broad dark indigo-navy cloth bands crossing over each other diagonally corner to corner and fully covering everything beneath, pinned at their crossing point by one thick round blob of dark red wax stamped with a plain simple sunken circle impression, the wax edges squeezed out unevenly. Deep navy-indigo cloth with a dull matte weave, oxblood red wax with one soft highlight. Unbroken and intact — NOT cracked, NOT torn open.>>>
```

---

## 6. 곁들여 필요한 것 2장

### A. 결속 사슬 이음 — `chain_link`

**가로 2:1, 512×256.** 결속은 주사위 두 개를 묶는 상태라 사이를 잇는 사슬이 따로 필요합니다.

```
Stylized dark fairytale game icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Wide 2:1 landscape image, on one plain flat mid-grey background — solid color, no gradient.
A short horizontal length of heavy cast-iron chain running straight across the full width of the frame from the left edge to the right edge, exactly three thick oval links, drawn taut and level with a slight sag in the middle. The chain fills the height of the frame and is cut off flat at both the left and right edges as if continuing beyond them. Cold blue-grey wrought iron, chipped and pitted, bright steel highlights along the top of each link. NOTHING else in the frame — no hands, no posts, no rings, no background objects. No text, no letters, no numbers, no watermark.
```

### B. 공허의 부름 족보 판 — `paper_void_call`

**가로 800 × 세로 212.** 기존 족보 판 18종과 같은 규격이고 `COMBO_PLATE_PROMPTS.md` 규칙이 그대로 적용됩니다 — 가운데는 글자가 얹히니 민무늬로 비우고 장식은 좌우 끝과 위아래 테두리에만.

잠식이 주사위 5개를 다 먹으면 족보가 이것 하나만 남습니다. **게임에서 가장 나쁜 순간에 뜨는 판**이라 다른 18종보다 확실히 불길해야 합니다.

```
Stylized dark fairytale UI banner plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Wide horizontal banner, aspect ratio about 3.8:1, on one plain flat mid-grey background.
A single horizontal name plate. The CENTER of the plate is a large COMPLETELY FLAT UNDECORATED panel — smooth, plain, no pattern, no carving, no objects — because game text will be printed over it. All ornament is confined to the far LEFT end, the far RIGHT end, and a thin band along the TOP and BOTTOM edges.
The plate: a slab of blackened wood being swallowed by the void — its flat center panel is a dead lightless charcoal grey-black. Along the top and bottom edges the material is torn and ragged like burnt paper, dissolving into nothing. At the left end and the right end, matching but NOT mirrored, the plate frays into pure black tongues of emptiness with thin curling tendrils reaching inward, each torn edge lit by a cold pale blue-white rim so the darkness stays visible. Two small dim blue-white points sit in the void at the outer ends like distant eyes.
Ominous, silent, final. The plate fills the frame edge to edge with no margin. No text, no letters, no numbers, no watermark.
```

---

## 7. 안 뽑아도 되는 것

**물듦·파티클·이름표는 전부 코드입니다.** 핏방울, 스파크, 재, 기포 같은 알갱이는 그림이 아니라 CSS로 만듭니다.

**임시 그림이 이미 13종 다 들어가 있습니다.** `allstates.mp4` 가 그것으로, 코드로만 그린 대역입니다. 진짜 그림이 오는 대로 ① 자리만 갈아끼우면 되고, 안 온 것은 대역이 계속 버팁니다. **그러니 순서·개수 신경 쓰지 말고 되는 대로 주세요.** 하나 오면 하나만 바뀝니다.

**저주·축복 전용 눈 그림은 필요 없습니다.** 저주는 1/2/3만, 축복은 4/5/6만 나오는 규칙이라 기존 주사위 눈 그림을 그대로 씁니다.

**봉인의 "값 없음" 그림도 필요 없습니다.** `.pip-art.empty` 가 코드에 이미 있습니다.

**폭발·해제 연출도 그림이 필요 없습니다.** CSS 애니메이션으로 처리합니다.

**적 행동 예고 아이콘 13종은 나중에 따로.** 지금은 전부 소용돌이 하나(🌀)로 뭉뚱그려 예고되는데, 13종이 되면 예고를 보고 대비를 못 합니다. 다만 위 그림들을 받으면 제가 축소해서 임시 예고 아이콘으로 자동 생성할 수 있으니, 붙여서 굴려보고 안 읽히는 것만 나중에 다시 뽑는 게 낫습니다.

---

## 8. 받은 뒤 제가 하는 일

1. 배경 단색을 키로 파내고 알파를 만듭니다.
2. 256×256으로 줄이고 팔레트 256색으로 눌러 용량을 깎습니다.
3. 눈 면(46×46) 위에 얹고, 물듦 색·파티클·이름표 세 겹을 붙입니다.
4. **13종을 나란히 놓은 영상을 찍어서 드립니다.** 한 화면에서 봐야 구분이 되는지 알 수 있습니다.
5. 밝기는 받침색 #4F1110 위에서 재서 안 읽히는 것만 올립니다. **뽑을 때 밝기는 신경 쓰지 마세요.**

## 9. 순서

한 번에 다 안 주셔도 됩니다. 안 온 것은 코드 대역이 그대로 버팁니다.

급한 순서는 **출혈 → 저주 → 기절 → 포박** 입니다. 1막 보스 셋(늑대 출혈 · 곰인형 저주 · 트롤 기절)과 2막 늪의 왕이 이걸 씁니다. 이 넷이면 1막이 완성됩니다. 잠식과 공허의 부름 판은 최종보스용이라 맨 뒤로 미뤄도 됩니다.

**뽑을 때 밝기는 신경 쓰지 마세요.** 받침색 #4F1110 위에서 제가 재서 맞춥니다.
