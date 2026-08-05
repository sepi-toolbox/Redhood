# REDHOOD 아트 리소스 프롬프트 팩 (GPT 이미지 생성용)

정본 스타일 가이드. 순서대로 뽑는 걸 권장: **0 스타일 키 → 1 근간 UI → 2 아이콘 → 3 배경 → 4 몬스터/NPC**.

---

## 사용법 (일관성 유지 — 중요)

1. **한 채팅에서 이어서 생성해.** 새 채팅을 열면 스타일이 흔들린다.
2. 맨 처음 **[0] 스타일 키 이미지**를 하나 뽑고, 이후 모든 요청에 그 이미지를 첨부하며 *"match the exact art style of the attached image"* 를 붙여.
3. 모든 프롬프트는 `[STYLE]` 블록 + 개별 프롬프트를 이어붙여 사용.
4. 스프라이트류는 항상 **transparent background** 를 요구하고, 생성 후 배경이 안 빠졌으면 *"remove the background, keep only the subject, output PNG with transparency"* 로 한 번 더.
5. 글자가 들어간 결과물은 폐기하고 *"no text, no letters, no watermark"* 를 강조해 재생성.
6. 한 번에 여러 아이콘을 요청할 땐 **격자 스프라이트 시트**로 (아래 프롬프트에 포함) — 셀 간격이 일정해야 잘라 쓰기 좋다.

### [STYLE] 마스터 블록 — 모든 프롬프트 앞에 붙일 것

```
Dark fairytale storybook illustration for a mobile roguelike dice game.
Hand-painted gouache and ink, visible brush texture, thick confident dark outlines,
muted moody palette: near-black brown (#14100f), deep blood red (#C9302F),
antique gold (#E8B64B), aged cream (#E8DCC8), desaturated forest tones.
Grimm brothers mood — eerie but charming, no gore. Clean bold silhouette,
readable at small size on a phone screen. No text, no letters, no watermark.
```

---

## [0] 스타일 키 (가장 먼저 1장)

```
[STYLE]
A single style-defining illustration: a small red-hooded girl seen from behind,
holding a lantern, standing at the edge of a dark fairytale forest, five ivory
dice scattered on the mossy ground glowing faintly gold. Square composition.
This image defines the art style for an entire game — balanced detail, painterly.
```
→ 저장해두고 이후 모든 생성에 첨부. (타이틀 화면 배경으로도 재사용 가능)

---

## [1] 근간 UI

### 1-1. 기본 주사위 눈 1~6 (스프라이트 시트) — `assets/dice/pips.png`
```
[STYLE]
Sprite sheet, 3x2 grid, six cells, equal spacing, transparent background.
Six faces of a hand-carved ivory bone die showing pips 1,2,3,4,5,6 in order.
Rounded worn cube, aged cream ivory with dark ink-stained pips, subtle gold
edge wear. Front-facing flat view, identical size and angle in every cell.
Mobile game UI asset, crisp at 64px.
```

### 1-2. 특수 주사위 스킨 (13종 — 한 장씩, 같은 각도 유지)
공통 접미: `Same die shape, size and camera angle as the plain ivory die. Single die, centered, transparent background.`

| 파일 | 프롬프트 핵심 |
|---|---|
| `die_gold.png` | A die gilded in beaten gold leaf, glowing warm, tiny sparkles |
| `die_cursed.png` | A die carved from blackened bone, cracks glowing ember-red, faint dark aura |
| `die_fang.png` | A die carved from a wolf fang, ivory-yellow, tiny bite marks, one pip shaped like a droplet of blood |
| `die_straw.png` | A die woven from golden straw like a tiny thatched cube, straw texture |
| `die_ember.png` | A charcoal die with softly glowing warm embers inside its pips |
| `die_moonlit.png` | A translucent pale-blue crystal die glowing with soft moonlight, hazy |
| `die_bramble.png` | A die wrapped in thorny bramble vines, tiny red rose thorns |
| `die_lead.png` | A heavy dull grey lead die, dented, matte metal |
| `die_even.png` | A die painted half cream half slate-blue with only even pips visible |
| `die_odd.png` | A die painted half cream half wine-red with only odd pips visible |
| `die_high.png` | A proud upright die with gold-rimmed pips, slightly larger pips |
| `die_ace.png` | A strange die where five faces show a single huge staring pip like an eye |
| `die_normal.png` | (1-1 시트의 5눈짜리 셀을 그대로 써도 됨) |

### 1-3. 버튼 (9-slice용 — 늘려 쓸 수 있게 테두리 균일)
```
[STYLE]
UI button plate for a mobile game, horizontally elongated rounded rectangle,
transparent background around it. Deep blood-red lacquered wood panel with
carved dark border and faint gold filigree at the corners, subtle inner glow.
Empty center (no text). Uniform border thickness so it can be 9-slice stretched.
```
→ `btn_primary.png`. 같은 프롬프트에서 색만 바꿔 2장 더:
- `btn_dark.png`: *"dark smoked-wood panel, muted, no red"*
- `btn_ghost.png`: *"thin antique gold outline only, hollow center, very subtle"*

### 1-4. 패널/프레임
```
[STYLE]
UI frame for a mobile game, rounded rectangle, transparent background,
uniform border for 9-slice stretching, empty center.
An aged dark-wood frame with carved fairytale vine corners.
```
→ `frame_row.png` (족보 줄). 등급 색상판 4종을 이어서:
- `frame_row_uncommon.png`: *"the same frame with a cold steel-blue enamel inlay"*
- `frame_row_rare.png`: *"the same frame with a deep violet enamel inlay and faint purple glow"*
- `frame_row_epic.png`: *"the same frame with molten gold inlay and warm glow"*
- `frame_modal.png`: *"a larger ornate version with a parchment-textured center"* (모달 배경 — 중앙은 비우지 말 것)

### 1-5. 보상 카드 프레임 (세로 카드)
```
[STYLE]
Vertical trading-card frame, portrait ratio 3:4, transparent background outside.
An ornate dark fairytale card: aged parchment center, carved wood-and-brass
border, small empty circular crest at the top center. Empty — no art, no text.
```
→ `card_common.png` + 등급 변형: uncommon(청 인레이) / rare(보라+은은한 발광) / epic(금+강한 발광, 모서리 불꽃 장식) / relic_normal(가죽 질감) / relic_elite(흑금 질감).

### 1-6. 보상 상자 3종
공통: `Single object, centered, transparent background, slight 3/4 view, treasure glow from within when open is requested.`
- `chest_scroll.png`: *"an old rolled parchment scroll bundle tied with red thread, wax seal"* (📜 족보)
- `chest_pouch.png`: *"a worn leather dice pouch with drawstring, a few pips embroidered"* (🎲 주사위)
- `chest_forest.png`: *"a small mossy forest chest with iron bands and a tiny red mushroom growing on the lid"* (🎁 유물)

### 1-7. 게이지/기타
- `hpbar_frame.png`: `[STYLE] A horizontal health-bar frame like a carved wooden trough with brass ends, empty center, transparent background, 9-slice friendly.`
- `shield_texture.png`: `[STYLE] A seamless small texture tile of pale silver-white diagonal hatching on grey, for a shield gauge overlay.`
- `coin.png`: `[STYLE] A single old fairytale gold coin with a wolf head embossed, slightly worn, transparent background.`
- `marker_hood.png`: `[STYLE] A tiny map marker: the red-hooded girl seen from above as a simple game piece, transparent background.` (지도 🧣)

---

## [2] 아이콘 세트

### 2-1. 버프/디버프 8종 — `assets/icons/status.png` (스프라이트 시트)
```
[STYLE]
Sprite sheet, 4x2 grid, eight cells, equal spacing, transparent background.
Eight small round status icons on dark coin-like medallions, consistent size:
1) an upward red sword (strength), 2) a golden die with a plus (focus),
3) a budding red heart with leaves (regeneration), 4) a wooden shield (block),
5) a cracked downward grey sword (weak), 6) three falling blood drops (bleed),
7) a gold target reticle (vulnerable), 8) a purple dizzy spiral (confusion).
Bold, readable at 32px.
```

### 2-2. 적 의도 6종 — `assets/icons/intent.png`
```
[STYLE]
Sprite sheet, 3x2 grid, six cells, equal spacing, transparent background.
Six small intent icons, consistent size: 1) crossed red claws (attack),
2) an iron kite shield (defend), 3) a purple spiral (confuse),
4) a flexing dark arm with red veins (empower), 5) a green mending heart (heal),
6) an ominous cream question mark in black fog (unknown). Readable at 28px.
```

### 2-3. 지도 노드 6종 — `assets/icons/nodes.png`
```
[STYLE]
Sprite sheet, 3x2 grid, six cells, equal spacing, transparent background.
Six hand-drawn ink map icons as if drawn on parchment with sepia ink and a
drop of red: 1) crossed swords (battle), 2) a horned skull (elite),
3) a campfire (rest), 4) a speech bubble with an eye inside (encounter),
5) a merchant's basket (shop), 6) a wolf head (boss). Storybook map style.
```

### 2-4. 무기 6종 — `assets/icons/weapons.png`
```
[STYLE]
Sprite sheet, 3x2 grid, six cells, equal spacing, transparent background.
Six weapon icons, consistent scale: 1) a long hunter's flintlock rifle,
2) a rusty farm scythe, 3) a red paper lantern glowing warm, 4) a gravedigger's
iron shovel, 5) an ash-wood crossbow, 6) a small bread knife with a red handle.
```

### 2-5. 유물 26종 (한 장씩 뽑는 걸 권장 — 시트는 잘못 나오면 전부 재생성해야 함)
공통: `[STYLE] A single small relic item, centered, transparent background, subtle glow, readable at 48px.`

| 파일 | 오브젝트 |
|---|---|
| relic_wolf_fang | a large wolf fang on a leather cord |
| relic_breadcrumbs | a trail of golden bread crumbs |
| relic_spool | a spool of blood-red thread |
| relic_warm_milk | a small clay cup of steaming milk |
| relic_firewood | a neat bundle of dry firewood |
| relic_leather_gloves | a pair of worn leather gloves |
| relic_crow_feather | a glossy black crow feather |
| relic_hunters_charm | a bone-and-bead hunter's talisman |
| relic_ledger | a dusty leather ledger book with a brass clasp |
| relic_moss_compass | a brass compass overgrown with moss |
| relic_silver_scale | a small silver balance scale |
| relic_tallow_candle | a stubby tallow candle with steady flame |
| relic_old_bone | an old carved animal bone |
| relic_glass_jar | a corked glass jar with fireflies glowing inside |
| relic_wolf_pelt | a folded grey wolf pelt |
| relic_poison_apple | a shiny red apple slice, faint green shimmer |
| relic_honey_pot | a small honey pot with dripping honey |
| relic_red_cloak | a folded red hooded cloak |
| relic_acorn_charm | a golden acorn on a string |
| relic_gate_bar | a heavy iron gate bolt |
| relic_clover | a pressed four-leaf clover in glass |
| relic_silver_knife | a polished silver kitchen knife |
| relic_silver_bullet | a single gleaming silver bullet |
| relic_fate_thimble | a golden sewing thimble with star engravings |
| relic_wolfmoon_pendant | a full-moon pendant with a wolf silhouette |
| relic_grandma_book | a red fairytale book with gold clasp, slightly open |

---

## [3] 배경 (세로 1024×1536 권장)

공통 접미: `Vertical mobile game background, portrait 2:3, dark vignette at top,
lower third fades to near-black (#14100f) so UI can sit on it. Distant painterly
scenery, no characters, no text.`

| 파일 | 프롬프트 핵심 |
|---|---|
| bg_forest | ancient dark pine forest, shafts of pale light, red mushrooms |
| bg_stream | a cold moonlit stream cutting through mossy stones, mist on water |
| bg_cabin | the interior of an abandoned woodcutter's cabin, cold hearth, cobwebs |
| bg_swamp | a sinking bog with dead trees, green will-o-wisp lights, black water |
| bg_mist | a forest drowned in thick white fog, bare trees as silhouettes |
| bg_grave | a nameless overgrown graveyard at dusk, leaning stones, crows |
| bg_dream | a melting dreamscape forest, floating doors and clocks, wrong colors |
| bg_hill | a bare screaming hill under a spiral sky, cosmic wrongness, thin monolith |
| bg_church | an empty candle-lit church, dusty pews, broken stained glass |
| bg_final | an endless black void with one colossal shadow suggesting tentacles and a single pale eye, tiny red figure spotlit below |
| bg_map | (지도용) blank aged parchment texture with burnt edges, faint compass rose, sepia stains — top-down, no scenery |
| bg_title | reuse the style key image or: the red-hooded girl from behind at the forest edge, title space left empty in the upper third |

---

## [4] 몬스터 / NPC

### 템플릿
```
[STYLE]
A single enemy creature for a dark fairytale dice game, centered, full body,
facing slightly left toward the viewer, transparent background, clean silhouette.
Readable at 96px. {DESCRIPTION}
```
- 정예는 접미: `More imposing than a common enemy, subtle red accents, slightly larger.`
- 보스는 접미: `A boss — grand, menacing, intricate details, faint colored aura. Facing forward.`
- 파일명 = `assets/enemies/{id}.png` (코드의 적 id와 일치 — 그대로 연동 가능)

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
| 파일 | 프롬프트 핵심 |
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
App icon, square with rounded corners feel, bold and readable at 48px.
A red hood silhouette merged with a single ivory die showing five pips,
on a near-black forest background, thin gold ring border.
```
→ 1024로 뽑아 192/512 리사이즈 (`assets/icon-192.png`, `assets/icon-512.png`).

---

## 통합 규칙 (내가 코드에 연동할 때)

- 적: `assets/enemies/{id}.png` — id만 맞으면 `art` 필드를 이미지로 자동 전환 가능
- UI: `assets/ui/…`, 아이콘: `assets/icons/…`, 배경: `assets/bg/{theme}.png`
- 스프라이트는 PNG 투명배경, 여백 ~8% (잘림 방지)
- 완성본을 저장소에 올려주면 (또는 나한테 zip으로 주면) 내가 이미지 연동 빌드를 붙일게
