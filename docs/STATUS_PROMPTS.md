# REDHOOD 상태이상 리소스 — 프롬프트 정리본

> 기준 **v1.16** · 2026-08-08. 주사위에 얹히는 상태이상 13종 + 곁들이 2종.
> 이 문서만 열어놓고 위에서부터 복사하면 됩니다. 받으면 규격 맞추기·밝기 보정은 제가 합니다.

---

## 0. 먼저 알아야 할 화면 크기

주사위 한 칸은 **62 × 70 px** 입니다. 그 안에 눈 그림이 **46 × 46 px** 로 들어갑니다.
상태이상 그림은 그 62 × 70 위에 통째로 얹힙니다. **엄지손톱보다 작습니다.**

여기서 두 가지가 따라옵니다.

**하나, 대부분은 가운데를 비워야 합니다.** 13종 중 값이 보여야 하는 게 11종입니다. 가운데를 덮어버리면 눈이 안 보여서 게임이 안 됩니다. 그래서 기본형은 **네 변만 두르는 테두리**이고, 가운데는 완전히 비웁니다. 족보 판 등급 만들 때 쓴 그 방식입니다.
값이 안 보여야 하는 건 **혼란**과 **봉인** 둘뿐이고, 이 둘만 타일 전체를 덮는 **가림형**입니다.

**둘, 받침이 어둡습니다.** 주사위 받침 `die_pad.png` 의 평균색이 **#38160F**, 가운데가 **#4F1110** 인 짙은 적갈색입니다. 어두운 색으로 그리면 받침에 먹혀서 안 보입니다. 그래서 모든 프롬프트에 **바깥 윤곽을 밝게 빼는 문구**가 들어가 있습니다. 특히 출혈(붉은색)·잠식(검정)·저주(검보라)가 위험합니다.

---

## 1. 색을 먼저 갈라둡니다

62px에서 13종을 구분하려면 **실루엣이 1순위, 색이 2순위**입니다. 색만으로는 절대 못 갈립니다. 그래서 아래 표는 "이 색으로 그려라"가 아니라 "이 색은 다른 데서 쓰니 피해라"에 가깝습니다.

게임이 이미 쓰고 있는 발광 세 가지가 있습니다. 여기에 겹치면 안 됩니다.

| 이미 쓰는 것 | 색 | 뜻 |
|---|---|---|
| 붉은 발광 | `#FF503E` | 다시 굴릴 주사위로 찍어둔 것 |
| 금 발광 | `#FFDB84` | 지금 고른 족보를 이루는 것 |
| 보라 발광 | `#C68CFF` | 상태이상이 걸린 것 (공통 표시) |

그래서 **축복은 금색으로 그리면 안 되고**(족보 강조와 헷갈립니다) 표백된 뼈흰빛으로, **약탈도 반짝이는 금이 아니라** 때 낀 구릿빛으로 갑니다. 프롬프트에 그 문구를 넣어뒀습니다.

13종 배정입니다.

| # | 상태이상 | 파일명 | 형태 | 색 | 실루엣 한 줄 |
|---|---|---|---|---|---|
| 1 | 출혈 | `status_die_bleed` | 테두리 | 밝은 선홍 | 위에서 흘러내린 핏줄기, 아래에 고임 |
| 2 | 독 | `status_die_poison` | 테두리 | 독성 황록 | 부풀어 맺힌 방울, 아래에 끓는 거품 |
| 3 | 포박 | `status_die_bind` | 테두리 | 젖은 검녹 | 늪 뿌리가 네 변을 조이고 위에 매듭 |
| 4 | 기절 | `status_die_stun` | 테두리 | 은백 | 네 모서리에서 안으로 뻗는 균열 |
| 5 | 저주 | `status_die_curse` | 테두리 | 검보라·재 | 위에서 아래로 뻗은 뒤틀린 뿔 |
| 6 | 축복 | `status_die_blessing` | 테두리 | 표백된 뼈흰빛 | 위쪽의 차가운 광배 반원 |
| 7 | 혼란 | `status_die_confuse` | **가림** | 보라 | 타일을 덮은 소용돌이 안개 |
| 8 | 봉인 | `status_die_seal` | **가림** | 남색·적갈 | 십자로 두른 띠와 밀랍 인장 |
| 9 | 부패 | `status_die_rot` | 테두리 | 병든 자두빛 | 위 변에 곧 터질 듯 부푼 종기 |
| 10 | 결속 | `status_die_chain` | 테두리 | 차가운 무쇠 | 좌우로 고리가 튀어나온 쇠사슬 |
| 11 | 마비 | `status_die_leaden` | 테두리 | 납회색 | 네 귀에 매달린 추, 아래가 처짐 |
| 12 | 약탈 | `status_die_plunder` | 테두리 | 때 낀 구릿빛 | 위에서 뻗어 들어오는 갈고리 손 |
| 13 | 잠식 | `status_die_devour` | 테두리 | 먹빛 + 푸른 림 | 안으로 기어드는 너덜한 검은 구멍 |

**기절과 마비**가 둘 다 회색 계열이라 걱정될 텐데, 실루엣이 정반대입니다. 기절은 **얇은 선**(균열), 마비는 **매달린 덩어리**(추). 62px에서도 갈립니다.
**포박과 결속**도 둘 다 감는 형태지만 재질이 다릅니다. 포박은 **젖은 식물**, 결속은 **마른 쇠**이고, 결속만 좌우로 고리가 삐져나옵니다.

---

## 2. 규격

**전부 정사각 1:1 · 배경 제거용 단색 배경.** 출력은 클수록 좋고 최소 512입니다. 제가 받아서 256×256으로 줄여 넣습니다.
**키아트 `keyart_stilllife` 첨부하세요.** 첨부 없이 뽑으면 화풍이 따로 놉니다.

**시트로 묶지 마세요.** 유물 26개는 6개씩 묶어도 됐지만 이건 안 됩니다. 가운데가 비어 있어야 하는데 시트로 뽑으면 옆 칸 그림이 그 자리를 침범합니다. **한 장에 하나씩** 뽑아주세요.

---

## 3. 테두리형 11종

아래 열한 개는 전부 같은 머리말을 씁니다. `<<< >>>` 안쪽만 갈아끼우면 됩니다.

### 공통 머리말 (테두리형)

```
Stylized dark fairytale game icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
A RING-SHAPED ornament that wraps only around the four outer edges of the square frame. The ENTIRE MIDDLE of the image — a large square area covering the central 60% — is COMPLETELY EMPTY and shows nothing but the same plain flat mid-grey background. Do NOT draw anything in the middle. Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube.
The ornament: <<<모티프>>>
The ornament touches all four edges of the frame and its heaviest visual weight sits along the TOP edge. It must stay bright enough to read against a very dark reddish-brown surface underneath — give its outer contour a light rim so it never sinks into the background. Bold silhouette, instantly readable at 62px. No text, no letters, no numbers, no watermark.
```

### 1. 출혈 — `status_die_bleed`

*방금 벤 상처. 아직 마르지 않았다. 어두운 받침에 먹히기 쉬우니 유독 밝게.*

```
<<<fresh wet blood clinging to the four edges — thick bright crimson beads gathered along the top edge with three uneven streaks running down the left and right edges and stopping partway, and a shallow dark pool collected along the bottom edge with one drop about to fall. Vivid arterial red, NOT brown, NOT dried, kept bright and saturated so it separates from a dark red-brown surface. Wet glossy highlights on the upper rim.>>>
```

### 2. 독 — `status_die_poison`

*끓어오르는 독액. 출혈과 나란히 놓아도 안 헷갈리게 색을 확실히 띄운다.*

```
<<<bubbling toxic slime creeping along the four edges — swollen glossy droplets of sickly yellow-green venom hanging from the top edge, thin runnels down the sides, and a band of fat boiling bubbles along the bottom edge with two small bubbles floating free. Acidic bile yellow-green, luminous and unnatural. Wet glossy highlights.>>>
```

### 3. 포박 — `status_die_bind`

*늪의 왕. 물에 젖은 뿌리다. 가시는 넣지 않는다 — 가시덤불 몬스터와 겹친다.*

```
<<<wet swamp roots and creeping vines coiling tightly around the four edges and squeezing inward, knotted into one thick gnarled knot at the middle of the top edge, with two frayed root tips trailing off the bottom corners. Dark waterlogged green-brown, slick with pond scum, pale grey-green highlights on the upper coils. NO thorns, NO spikes, NO flowers.>>>
```

### 4. 기절 — `status_die_stun`

*값은 나오는데 세지지 않는다 = 금이 가서 못 쓰는 주사위. 별이나 새는 넣지 않는다 — 만화적이라 화풍에 안 맞는다.*

```
<<<sharp glass-like fractures splitting inward from the four corners — jagged pale white-silver crack lines that radiate toward the middle but STOP well before reaching it, leaving the center untouched, with three small chipped shards breaking off and floating just outside the top corners. Thin bright crack lines with cold blue-white edges, almost weightless. NO stars, NO birds, NO spirals, NO swirls.>>>
```

### 5. 저주 — `status_die_curse`

*곰인형에게 줄지 거짓 성인에게 줄지는 아직 정하는 중이지만, 그림은 어느 쪽이든 맞게 뽑습니다.*

```
<<<creeping black-violet soot bleeding inward from the four edges — a pair of twisted blackened horns curling DOWNWARD from the middle of the top edge like a crown gone wrong, ragged ash smearing along the sides, and fine grey ash flecks drifting off the bottom edge. Deep black-purple with cold violet rim light on every contour so it stays visible on a dark surface. Ashen grey accents.>>>
```

### 6. 축복 — `status_die_blessing`

*진짜 축복이 아니라 축복인 척하는 것. 따뜻하면 안 되고, 금색이면 안 된다 — 족보 강조 금빛과 헷갈린다.*

```
<<<a cold false halo framing the four edges — a thin bleached bone-white ring, thickening into a smooth semicircular halo arc across the top edge with seven short straight rays pointing outward, and four small pale beads at the corners. Bleached bone-white and the faintest cold pale silver, deliberately drained and lifeless — NOT warm, NOT golden, NOT saturated yellow, NOT glowing orange. Sterile and a little wrong.>>>
```

### 9. 부패 — `status_die_rot`

*다음 턴에 터진다. 터지기 직전이라는 게 한눈에 보여야 한다.*

```
<<<swollen diseased blisters bulging along the four edges — one large taut boil dominating the middle of the top edge, stretched to bursting with hairline splits across its skin and a dull sick light leaking out from inside the cracks, smaller lumpy pustules crowding the sides, and dark mottled bruising along the bottom edge. Bruised plum-purple and greenish rot brown, with a hot dull amber glow escaping the splits.>>>
```

### 10. 결속 — `status_die_chain`

*옆 주사위와 묶인다. 좌우로 고리가 삐져나와야 사슬이 이어질 자리가 생긴다 — 이게 이 그림의 핵심이다.*

```
<<<a heavy cast-iron chain wrapped once around the four edges — thick oval links, and at the exact middle of the LEFT edge and the middle of the RIGHT edge one open link juts OUTWARD past the frame as if reaching to connect to something beside it. Cold blue-grey wrought iron, chipped and pitted, bright steel highlights on the top of every link. Dry hard metal, NO rust stains, NO rope, NO vines.>>>
```

### 11. 마비 — `status_die_leaden`

*무거워서 굴리기 힘들다. 기절(얇은 균열)과 정반대로 두껍고 매달린 덩어리여야 한다.*

```
<<<four heavy lead weights dragging the frame down — a squat blunt lead ingot hanging from each of the four corners on a short thick loop, the bottom edge visibly sagging and bowing downward under their weight while the top edge is thin and stretched taut. Dull dark blue-grey lead, matte and soft-edged, no shine except one dull grey highlight on each weight. NO cracks, NO chains stretching outward.>>>
```

### 12. 약탈 — `status_die_plunder`

*돈을 뺏어간다. 반짝이는 금이면 족보 강조와 겹친다 — 때 낀 동전이어야 한다.*

```
<<<tarnished coins studded around the four edges — overlapping dull copper discs pressed into the left, right and bottom edges, several sliding loose and spilling off the bottom corner, and from the middle of the top edge a crooked grasping hook-clawed hand reaching INWARD and stopping short of the center. Dirty tarnished copper and dark brass, oxidised green-black in the crevices, deliberately dull — NOT bright gold, NOT shiny treasure, NOT glowing.>>>
```

### 13. 잠식 — `status_die_devour`

*최종보스 계열. 순수한 검정은 어두운 받침에서 사라지므로 푸른 림라이트가 필수다.*

```
<<<a spreading void eating in from the four edges — the border looks like the tile is being dissolved away, its rim torn and ragged like burnt paper, with pure lightless black creeping inward in uneven tongues, and two thin black tendrils curling in from the top edge and stopping short of the center. The torn edge of every black shape carries a cold pale blue rim light so the blackness stays clearly visible against a dark background. Absolute void black inside, cold blue-white at every torn edge.>>>
```

---

## 4. 가림형 2종

이 둘만 타일 전체를 덮습니다. 아래를 완전히 가려야 하니 불투명하게 그립니다.

### 공통 머리말 (가림형)

```
Stylized dark fairytale game icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background.
A single OPAQUE object that COMPLETELY FILLS the square frame edge to edge, like a lid laid flat over a tile — nothing shows through it, there is no empty middle and no visible background inside the shape. Do NOT draw a die, do NOT draw dice pips, do NOT draw a cube.
The object: <<<모티프>>>
Slightly rounded square silhouette with soft corners. Bold and instantly readable at 62px. No text, no letters, no numbers, no watermark.
```

### 7. 혼란 — `status_die_confuse`

*안개의 어머니. 게임이 이미 보라색을 상태이상 색으로 쓰고 있으니 그대로 간다.*

```
<<<a thick swirling fog that has settled over the tile and hidden whatever is under it — a slow violet-purple vortex spiralling clockwise from a point slightly above the center, layered in three or four flat overlapping bands of mist from deep indigo at the corners to pale lilac at the eye of the spiral, dense and completely opaque with soft torn wisps curling at the four edges. NOT transparent, NOT wispy enough to see through.>>>
```

### 8. 봉인 — `status_die_seal`

*값 자체가 없다. 한 번 굴려야 열린다. 밀랍이 뜯긴 적 없는 새것처럼 보여야 한다.*

```
<<<a document seal clamped over the tile — two broad dark indigo-navy cloth bands crossing over each other diagonally corner to corner and fully covering the surface beneath, pinned at their crossing point by one thick round blob of dark red wax stamped with a plain simple sunken circle impression, the wax edges squeezed out unevenly. Deep navy-indigo cloth with a dull matte weave, oxblood red wax with one soft highlight. Unbroken and intact — NOT cracked, NOT torn open.>>>
```

---

## 5. 곁들여 필요한 것 2장

### A. 결속 사슬 이음 — `chain_link`

**규격만 다릅니다: 가로로 긴 2:1, 512×256.** 배경 제거용 단색 배경.

결속은 주사위 두 개를 묶는 상태라 **사이를 잇는 사슬**이 따로 필요합니다. 주사위 사이 간격이 8px라 화면에서는 아주 짧게 나옵니다.

```
Stylized dark fairytale game icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Wide 2:1 landscape image, on one plain flat mid-grey background — solid color, no gradient.
A short horizontal length of heavy cast-iron chain running straight across the full width of the frame from the left edge to the right edge, exactly three thick oval links, drawn taut and level with a slight sag in the middle. The chain fills the height of the frame and is cut off flat at both the left and right edges as if continuing beyond them. Cold blue-grey wrought iron, chipped and pitted, bright steel highlights along the top of each link. NOTHING else in the frame — no hands, no posts, no rings, no background objects. No text, no letters, no numbers, no watermark.
```

### B. 공허의 부름 족보 판 — `paper_void_call`

**규격: 가로 800 × 세로 212 (약 3.8:1) 가로 띠.** 기존 족보 판 18종과 **똑같은 규격**입니다. `COMBO_PLATE_PROMPTS.md` 의 규칙이 그대로 적용됩니다 — 가운데는 글자가 얹히므로 **민무늬로 비우고**, 장식은 좌우 끝과 위아래 테두리에만 둡니다.

잠식이 주사위 5개를 다 먹으면 족보가 이것 하나만 남습니다. **게임에서 가장 나쁜 순간에 뜨는 판**이라 다른 18종보다 확실히 불길해야 합니다.

```
Stylized dark fairytale UI banner plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Wide horizontal banner, aspect ratio about 3.8:1, on one plain flat mid-grey background.
A single horizontal name plate. The CENTER of the plate is a large COMPLETELY FLAT UNDECORATED panel — smooth, plain, no pattern, no carving, no objects — because game text will be printed over it. All ornament is confined to the far LEFT end, the far RIGHT end, and a thin band along the TOP and BOTTOM edges.
The plate: a slab of blackened wood being swallowed by the void — its flat center panel is a dead lightless charcoal grey-black. Along the top and bottom edges the material is torn and ragged like burnt paper, dissolving into nothing. At the left end and the right end, matching but NOT mirrored, the plate frays into pure black tongues of emptiness with thin curling tendrils reaching inward, each torn edge lit by a cold pale blue-white rim so the darkness stays visible. Two small dim blue-white points sit in the void at the outer ends like distant eyes.
Ominous, silent, final. The plate fills the frame edge to edge with no margin. No text, no letters, no numbers, no watermark.
```

---

## 6. 안 뽑아도 되는 것 (헛수고 방지)

**저주·축복 전용 눈 그림은 필요 없습니다.** 저주는 1/2/3만, 축복은 4/5/6만 나오는 규칙이라 **기존 주사위 눈 그림을 그대로** 씁니다. 13종 × 6면이 이미 다 있습니다.

**봉인 상태의 "값 없음" 그림도 필요 없습니다.** `.pip-art.empty` — 눈 없이 받침만 보이는 상태가 코드에 이미 있습니다. 그 위에 봉인 가림형을 얹으면 끝입니다.

**폭발·해제 연출도 그림이 필요 없습니다.** 부패가 터지는 순간과 상태이상이 풀리는 순간은 CSS 애니메이션으로 처리합니다.

**적 행동 예고 아이콘 13종은 나중에 따로 받겠습니다.** 지금은 상태이상이 전부 소용돌이 하나(🌀)로 뭉뚱그려 예고되고 있는데, 13종이 되면 예고를 보고 대비를 못 합니다. 다만 위 13장을 받으면 제가 **각 그림의 위쪽 모티프만 잘라 임시 예고 아이콘으로 자동 생성**해 넣을 수 있습니다. 그걸로 붙여서 굴려보고, 정말 안 읽히는 것만 골라서 나중에 다시 뽑는 게 낫습니다.

---

## 7. 받은 뒤 제가 하는 일

1. 배경 단색을 키로 파내고 알파를 만듭니다 (`key_background`).
2. 256×256으로 줄이고 팔레트 256색으로 눌러 용량을 깎습니다.
3. 62×70 주사위 칸 비율에 맞춰 세로로 살짝 늘려 얹습니다. 테두리형은 위아래가 잘리지 않게 안쪽으로 2px 여유를 둡니다.
4. **실제 화면에 얹은 스크린샷을 62px 그대로와 3배 확대 두 벌로 찍어서 드립니다.** 13종을 나란히 놓고 봐야 구분이 되는지 알 수 있습니다. 안 갈리는 게 있으면 그것만 다시 뽑으면 됩니다.
5. 밝기는 받침색 #4F1110 위에서 재서 안 읽히는 것만 감마로 올립니다. **뽑을 때 밝기는 신경 쓰지 마세요.**

## 8. 순서

한 번에 다 안 주셔도 됩니다. 없으면 지금처럼 보라 발광만 뜨고 굴러갑니다.

급한 순서는 **결속 → 포박 → 출혈 → 독 → 저주** 입니다. 1막 보스 셋(곰인형·늑대)과 첫 테마들이 이걸 쓰기 때문에 이 다섯 장만 있어도 1막이 완성됩니다. 잠식과 공허의 부름 판은 최종보스용이라 맨 뒤로 미뤄도 됩니다.
