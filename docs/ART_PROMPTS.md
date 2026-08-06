# REDHOOD 아트 리소스 프롬프트 팩 (GPT 이미지 생성용) — v2

v2 개정: 실제 생성을 돌려보며 확정된 규칙 반영.
순서: **0 스타일 키 ✅ → 1 주사위 → 2 UI 프레임 → 3 아이콘 → 4 배경 → 5 몬스터/NPC**.

## 진행 현황

| 항목 | 상태 |
|---|---|
| 스타일 키 (빨간 두건 씬) | ✅ 완료 — 모든 생성의 앵커 |
| 주사위 눈 1~6 시트 | ✅ 완료 — 인게임 적용됨 (v0.20, 굴림 연출 포함) |
| 금박·저주·송곳니 (눈 6 박힌 낱장) | ✅ 완료 — **아이템 일러스트용** (보상 카드/가방/상점) |
| 스킨별 6면 시트 12종 | 진행 중 — 아래 [1-2] |
| UI 프레임·아이콘·배경·적 | 대기 |

---

## 검증된 규칙 (v2 — 전부 실패에서 배운 것)

1. **한 채팅에서 이어서 생성.** 새 채팅을 열면 스타일 키 이미지를 다시 첨부.
2. **매 요청에 앵커 이미지 첨부**: 스타일 키 + (주사위 작업이면) 합격한 눈 1~6 시트. *"match the exact art style of the attached image"* 를 프롬프트에 포함.
3. **"transparent background"라고 쓰지 말 것.** 모델이 투명 대신 분홍 체커보드 무늬를 그려버린다(복구 불가). 대신 **"one plain flat very dark brown background — solid color, no gradient, no checkerboard"** 로 요구하고, 배경 따기는 성권→Claude 전달 후 자동 처리.
4. **사실주의 방지 문구 필수**: "NOT photorealistic, NOT a 3D render, no glossy reflections". 재질 단어(금박, 불씨 등)가 사진체로 끌고 가는 걸 막는다.
5. **눈 개수를 명시하고 세라고 지시** — AI가 주사위 눈 8개 같은 불가능한 면을 그린다. "Count the pips carefully" 포함.
6. 글자가 들어가면 폐기 후 "no text, no letters, no watermark" 강조 재생성.
7. 비율 명시: 낱장 Square 1:1, 시트 Landscape 3:2, 배경 Portrait 2:3.
8. 결과물이 튀면 같은 스레드에서 *"make it look exactly like the attached painted dice, flat gouache painting"* 으로 리터치.
9. **전달 방식**: 뽑은 이미지를 Claude 대화에 올리고 "이름 한 마디" (예: "저주 주사위"). 배경 키잉·크기 정규화·슬라이스·게임 연동은 Claude가 자동 처리.

### [STYLE] 마스터 블록 (v2) — 모든 프롬프트 앞에 붙일 것

```
Flat hand-painted storybook illustration for a dark fairytale mobile dice game.
Gouache on paper, visible brush strokes, thick confident dark outlines,
muted moody palette: near-black brown (#14100f), deep blood red (#C9302F),
antique gold (#E8B64B), aged cream (#E8DCC8), desaturated forest tones.
Grimm brothers mood — eerie but charming, no gore.
NOT photorealistic, NOT a 3D render, no glossy reflections, no photo textures.
Clean bold silhouette, readable at small size on a phone screen.
No text, no letters, no watermark.
```

---

## [0] 스타일 키 ✅ (완료 — 재생성 불필요)

```
[STYLE]
A single style-defining illustration: a small red-hooded girl seen from behind,
holding a lantern, standing at the edge of a dark fairytale forest, five ivory
dice scattered on the mossy ground glowing faintly gold. Square composition.
This image defines the art style for an entire game.
```

---

## [1] 주사위

### 1-1. 눈 1~6 기본 시트 ✅ (완료 — 인게임 적용됨)

당시 사용 프롬프트(참고 보존):
```
[STYLE]
Sprite sheet, 3x2 grid, six cells, equal spacing, on one plain flat very dark
brown background — solid color, no gradient, no checkerboard.
Six faces of a hand-carved ivory bone die showing pips 1,2,3,4,5,6 in order
(top row 1,2,3 — bottom row 4,5,6). Count the pips carefully.
Rounded worn cube, aged cream ivory with dark ink-stained pips, subtle gold
edge wear. Front-facing flat view, identical size and angle in every cell.
```

### 1-2. 스킨별 6면 시트 (12종 — 확정 방식)

한 스킨 = 한 장(6면 시트). 굴린 값 표시를 위해 **모든 스킨이 1~6면을 가져야 한다.**
슬라이스·키잉·정규화·연동은 Claude가 처리. 눈 개수가 틀린 칸은 알려주면 보정 가능.

**공통 템플릿** (이 블록 + 아래 재질 한 줄):
```
Flat hand-painted storybook illustration for a dark fairytale dice game. Gouache on paper, visible brush strokes, thick dark outlines, muted palette: near-black brown, deep blood red, antique gold, aged cream. NOT photorealistic, NOT a 3D render. Landscape 3:2 image. A sprite sheet: a 3x2 grid of six dice, equal size, equal spacing, identical framing, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The six dice show pip counts 1, 2, 3, 4, 5, 6 IN ORDER (top row: 1, 2, 3 — bottom row: 4, 5, 6). Count the pips carefully — exactly one pip on the first die, six pips on the last. Same painting style as the attached dice sheet. Every die is:
```

**재질 한 줄** (스킨별 — 어두운 스킨은 발광 눈으로 가독성 확보):

| 스킨 | 이어붙일 재질 문장 |
|---|---|
| 나무 die_normal | `humble hand-carved warm brown wood with visible grain, dark ink pips.` |
| 금박 die_gold | `covered in worn matte gold leaf with tiny painted sparkles, dark ink pips with faint gold rims.` |
| 저주 die_cursed | `blackened old bone with thin ember-red cracks, pips glowing ember-red like coals.` |
| 송곳니 die_fang | `carved from ivory-yellow wolf fang with tiny bite marks, pips shaped like small dark blood droplets.` |
| 밀짚 die_straw | `woven from golden straw like a tiny thatched cube, pips are round dark brown straw knots.` |
| 잿불 die_ember | `charcoal grey with faint warm ember glow in its cracks, pips glowing warm orange.` |
| 달빛 die_moonlit | `pale blue crystal with a soft moonlight glow, pips deep midnight-blue with faint silver rims.` |
| 가시덤불 die_bramble | `wrapped in thorny bramble vines with tiny red thorns at the edges, dark green pips like thorn buds.` |
| 납 die_lead | `heavy dull grey lead with dents and scratches, black pips with pale chalk rims.` |
| 짝눈 die_even | `painted half aged-cream half slate-blue split diagonally, deep slate-blue pips.` |
| 홀눈 die_odd | `painted half aged-cream half wine-red split diagonally, deep wine-red pips.` |
| 높은 die_high | `covered in deep crimson royal velvet with gold embroidered trim on the edges, pips are round gold embroidered dots.` |
| 외눈 die_ace | `pale bone tightly wound with a single thin bright red thread wrapping around it, pips are small red thread knots.` |

### 1-3. 아이템 일러스트 (보상 카드·가방·상점용 낱장) — 선택

전투용이 아니라 "아이템 그림"이라 눈 고정이어도 됨. 금박·저주·송곳니는 ✅ 이미 확보.
필요 시 남은 스킨도 낱장 템플릿:
```
[STYLE]
Square 1:1 image. A single hand-painted six-sided die, front-facing flat view,
filling about 70 percent of the frame, isolated on one plain flat very dark
brown background — solid color, no gradient, no checkerboard. Same painting
style and framing as the attached die image. The die: {재질 문장}
```

---

## [2] UI 프레임/버튼 (배경 규칙 v2 적용)

공통: `on one plain flat very dark brown background — solid color, no gradient, no checkerboard. Uniform border thickness so it can be 9-slice stretched. Empty center, no text.`

- `btn_primary.png`: `[STYLE] UI button plate, horizontally elongated rounded rectangle. Deep blood-red lacquered wood panel with carved dark border and faint gold filigree at the corners, subtle inner glow. {공통}`
- `btn_dark.png`: 위에서 *"dark smoked-wood panel, muted, no red"*
- `btn_ghost.png`: 위에서 *"thin antique gold outline only, hollow center, very subtle"*
- `frame_row.png` (족보 줄): `[STYLE] UI frame, rounded rectangle. An aged dark-wood frame with carved fairytale vine corners. {공통}`
  - `frame_row_uncommon.png`: *"+ cold steel-blue enamel inlay"*
  - `frame_row_rare.png`: *"+ deep violet enamel inlay and faint purple glow"*
  - `frame_row_epic.png`: *"+ molten gold inlay and warm glow"*
- `card_common.png` (보상 카드, Portrait 3:4): `[STYLE] Vertical trading-card frame, portrait 3:4. An ornate dark fairytale card: aged parchment center, carved wood-and-brass border, small empty circular crest at the top center. {공통}` → 등급 변형: uncommon(청 인레이)/rare(보라+발광)/epic(금+강한 발광)/relic_normal(가죽 질감)/relic_elite(흑금 질감)
- 상자 3종 (`chest_scroll/pouch/forest.png`): `[STYLE] A single object, centered, slight 3/4 view, {공통 배경}.` + 각각 *rolled parchment scroll bundle tied with red thread* / *worn leather dice pouch with drawstring* / *small mossy forest chest with iron bands and a tiny red mushroom on the lid*
- `hpbar_frame.png`: 가로 체력바 틀 (carved wooden trough with brass ends)
- `coin.png`: 늑대 머리 각인된 낡은 금화
- `marker_hood.png`: 지도용 빨간 두건 말 (위에서 본 게임 말)

---

## [3] 아이콘 (스프라이트 시트 — 배경 규칙 v2)

공통: `Sprite sheet, {N}x{M} grid, equal cells, equal spacing, consistent icon size, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. Bold, readable at 32px.`

- **버프/디버프 8종** `status.png` (4x2): 1) upward red sword (힘) 2) golden die with a plus (집중) 3) budding red heart with leaves (재생) 4) wooden shield (방어) 5) cracked downward grey sword (약화) 6) three falling blood drops (출혈) 7) gold target reticle (취약) 8) purple dizzy spiral (혼란) — *round dark medallion 바탕*
- **적 의도 6종** `intent.png` (3x2): crossed red claws (공격) / iron kite shield (방어) / purple spiral (혼란) / flexing dark arm with red veins (강화) / green mending heart (치료) / ominous cream question mark in black fog (의문)
- **지도 노드 6종** `nodes.png` (3x2, 양피지 잉크풍): crossed swords (전투) / horned skull (엘리트) / campfire (휴식) / speech bubble with an eye (만남) / merchant's basket (상점) / wolf head (보스)
- **무기 6종** `weapons.png` (3x2): hunter's flintlock rifle / rusty farm scythe / red paper lantern / gravedigger's iron shovel / ash-wood crossbow / small bread knife with red handle
- **유물 26종**: 낱장 권장. `[STYLE] A single small relic item, centered, {공통 배경}, subtle glow, readable at 48px.` + 오브젝트 묘사 (목록은 relics.json desc 참고 — 이빨/빵부스러기/실타래/우유/장작/장갑/깃털/부적/가계부/나침반/저울/양초/뼈/유리병 반딧불/늑대 가죽/독사과/꿀단지/붉은 망토/도토리/빗장/클로버/은식칼/은탄환/골무/보름달 목걸이/동화책)

---

## [4] 배경 (Portrait 2:3, 1024×1536)

공통 접미: `Vertical mobile game background, portrait 2:3, dark vignette at top, lower third fades to near-black (#14100f) so UI can sit on it. Distant painterly scenery, no characters, no text.` (풀블리드라 배경 키잉 불필요)

| 파일 | 핵심 |
|---|---|
| bg_forest | ancient dark pine forest, shafts of pale light, red mushrooms |
| bg_stream | cold moonlit stream through mossy stones, mist on water |
| bg_cabin | abandoned woodcutter's cabin interior, cold hearth, cobwebs |
| bg_swamp | sinking bog, dead trees, green will-o-wisp lights, black water |
| bg_mist | forest drowned in thick white fog, bare silhouette trees |
| bg_grave | nameless overgrown graveyard at dusk, leaning stones, crows |
| bg_dream | melting dreamscape forest, floating doors and clocks, wrong colors |
| bg_hill | bare screaming hill under a spiral sky, cosmic wrongness, thin monolith |
| bg_church | empty candle-lit church, dusty pews, broken stained glass |
| bg_final | endless black void, one colossal shadow of tentacles and a single pale eye, tiny red figure spotlit below |
| bg_map | blank aged parchment texture, burnt edges, faint compass rose, sepia stains |
| bg_title | 스타일 키 재사용 (또는 상단 1/3 비운 변형) |

---

## [5] 몬스터 / NPC (배경 규칙 v2)

### 템플릿
```
[STYLE]
A single enemy creature for a dark fairytale dice game, centered, full body,
facing slightly left toward the viewer, on one plain flat very dark brown
background — solid color, no gradient, no checkerboard. Clean silhouette,
readable at 96px. {DESCRIPTION}
```
- 정예 접미: `More imposing than a common enemy, subtle red accents, slightly larger.`
- 보스 접미: `A boss — grand, menacing, intricate details, faint colored aura. Facing forward.`
- 파일명 = `assets/enemies/{id}.png` (코드 적 id와 일치 — 자동 연동)

### 1막
| id | DESCRIPTION |
|---|---|
| crow | a starving black crow with ragged feathers and one gold-ringed hungry eye |
| stray_dog | a mangy stray dog with matted fur, ribs showing, bared teeth |
| forest_spider | a plump forest spider with a birch-bark patterned abdomen, dewy web strands |
| thorn_bush | a living bramble bush with a single withered rose for a head, thorny arms |
| twig_golem | a knotted golem of twisted twigs and bark, one knothole eye glowing amber |
| brook_sprite | a small water sprite made of a standing splash of creek water, pebble eyes |
| leech | a fat glistening leech rearing up, pale segmented belly |
| rat_swarm | a writhing pile of black rats forming one shape, many red eyes |
| living_broom | an old straw broom come alive, bent like a crone, straw bristling |
| alpha_dog (정예) | a huge scarred alpha hound with a spiked collar of thorns |
| old_pike (정예) | an ancient monstrous pike fish hovering as if water surrounds it, hook scars |
| cellar_thing (정예) | a barely-seen lanky shadow creature with long fingers, two pale eyes, emerging from darkness |
| wolf (보스) | THE wolf of the fairytale — massive black wolf with blood-red eyes, grandmother's shawl caught on one claw |
| river_hag (보스) | a river hag — an old woman shape made of dark water and river weeds, long dripping hair |
| old_teddy (보스) | a giant old teddy bear with one button eye hanging by a thread, burst seams leaking straw, stitched smile |

### 2막
| id | DESCRIPTION |
|---|---|
| bog_toad | a bloated bog toad with warty moss-green skin, long dripping tongue |
| mosquito_swarm | a dense cloud of huge marsh mosquitoes forming a face |
| mist_wraith | a wraith of pale fog with hollow eyes, trailing into mist |
| pale_stag | an unnaturally pale white stag with too many antler points, blank eyes |
| skeleton | a leaning skeleton soldier in rusted scraps of armor with a notched sword |
| grave_worm | a thick pale grave worm bursting from soil, ringed mouth |
| mud_golem (정예) | a hulking golem of black grave mud, bones and roots stuck in its body |
| headless_knight (정예) | a headless knight on foot in tarnished armor, holding a lance, mist where the head should be |
| grave_keeper (정예) | a gaunt gravekeeper with a lantern and a long shovel, face hidden under a wide hat |
| swamp_king (보스) | an immense crowned crocodile half-sunk in the bog, a rotten wooden crown, gold-green eyes |
| fog_mother (보스) | a towering motherly silhouette woven entirely of fog, many faint reaching arms, two soft glowing eyes |
| the_buried (보스) | a huge revenant dragging itself from a grave, wrapped in roots and burial cloth, soil crown |

### 3막
| id | DESCRIPTION |
|---|---|
| nightmare_hare | a wrong-looking dream hare with spiral eyes and a stitched grin |
| floating_eye | a single large floating eyeball with a tail of dream-smoke, iris like a keyhole |
| dream_moth | a huge dusty moth with sleeping human faces patterned on its wings |
| whisper_polyp | a fleshy polyp cluster with tiny mouths that whisper, faint cosmic colors |
| faceless_cultist | a kneeling cultist in dark robes whose hood contains only smooth blankness, holding a candle |
| screaming_stone | a jagged standing stone with a screaming face split across it, cracks glowing |
| hollow_priest | a hollow priest whose robes stand upright with nothing inside, holding a staff |
| choir_ghost | a cluster of translucent choir ghosts sharing one flowing robe, mouths open in song |
| candle_swarm | a swarm of small living candle flames with faint faces, drifting together |
| sandman (정예) | the Sandman as a tall figure of flowing sand in a nightcap, hourglass in hand, hollow eyes |
| hill_tentacle (정예) | a colossal barnacled tentacle bursting from a hillside, too big for its hole |
| bell_ringer (정예) | a hunched bell-ringer with a cracked bronze bell for a head, rope in hand |
| lucid_king (보스) | the king of lucid dreams — a regal figure whose crown and robes constantly melt and reform, crescent moon face |
| the_maw (보스) | a vast toothed pit in the earth — concentric rings of teeth around a black throat, roots dangling in |
| false_saint (보스) | a false saint with a tilted golden halo, serene mask slightly ajar showing darkness, too many hands in prayer |

### 최종 보스
| id | DESCRIPTION |
|---|---|
| nameless_dread | THE NAMELESS DREAD — a cosmic horror filling the frame: an ocean of black tentacles beneath one colossal pale lidless eye, tiny red hood reflected in the pupil. `Grander than any boss, cosmic scale, mostly darkness.` |

### NPC / 이벤트
| 파일 | 핵심 |
|---|---|
| npc_peddler | the grey peddler — a hunched old merchant woman in ash-grey rags with an enormous pack of trinkets, knowing smile, one gold tooth (인트로·상점 공용) |
| npc_ash_crone | an ash-grey crone stirring a black cauldron in front of a hut |
| npc_signpost | a broken wooden signpost at a crossroads, scratched-out letters, soft soil below |
| npc_stream_chest | a moss-covered chest half-sunk under clear stream water |
| npc_swamp_light | a single beckoning yellow light hovering over black bog water |
| npc_voice_mist | a wall of fog with the faint suggestion of a familiar figure inside |
| npc_open_grave | an opened coffin in a dug grave, lid ajar, darkness inside |
| npc_sweet_dream | an impossibly soft canopy bed glowing warmly in a dark dream forest |
| npc_whisper_stone | a black monolith on a bare hilltop, faint spiral carvings, humming |
| npc_confession | an empty church confessional booth, lattice window, darkness behind it |
| npc_altar | a mossy forest altar with warm lit candles |

---

## 앱 아이콘
```
[STYLE]
App icon, square, bold and readable at 48px.
A red hood silhouette merged with a single ivory die showing five pips,
on a near-black forest background, thin gold ring border.
```

---

## 통합 규칙 (Claude 처리)

- 전달: 이 대화에 이미지 업로드 + 이름 한 마디 → 키잉·정규화·슬라이스·커밋·연동 자동
- 적: `assets/enemies/{id}.png` / 주사위: `assets/dice/…` / UI: `assets/ui/…` / 아이콘: `assets/icons/…` / 배경: `assets/bg/…`
- 스킨 6면 시트는 슬라이스 후 `assets/dice/{skin}{face}.png` (예: cursed3.png)로 자동 전개
- 이미지 없는 항목은 이모지/기존 표시로 폴백 — 부분 적용 가능
