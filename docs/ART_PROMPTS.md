# REDHOOD 아트 리소스 프롬프트 팩 (GPT 이미지 생성용) — v3

v3 개정: 주사위 13종·UI 아이콘 26종·UI 텍스쳐 7종 완료 반영, 지도 슬더스식 개편에 따른
낙서 아이콘·다크 양피지 추가, 로고·족보 종이 18종 신설, 배경 12종 프롬프트 확정.

## 진행 현황

| 항목 | 상태 |
|---|---|
| 스타일 키 (빨간 두건 씬) | ✅ 완료 — 모든 생성의 앵커 |
| 주사위 6면 시트 13종 (나무~외눈) | ✅ 완료 — 인게임 적용 (v0.23, 굴림 연출 포함) |
| 금박·저주·송곳니 아이템 낱장 | ✅ 완료 — 보상 카드/가방/상점용 |
| UI 아이콘 4시트 26종 (상태8·의도6·노드6·무기6) | ✅ 완료 — 인게임 적용 (v0.24) |
| UI 텍스쳐 7종 (팻말·버튼2·종이띠·액자·천·탁자) | ✅ 완료 — 인게임 적용 (v0.25~26) |
| 지도 낙서 아이콘 6종 [3-2] | 대기 — 슬더스식 지도용 |
| 지도 다크 양피지 bg_map [4] | 대기 |
| 타이틀 로고 [6] | 대기 |
| 배경 11종 (전투 테마 9 + 최종전 + 타이틀) [4] | 대기 |
| 족보 종이 18종 [7] | 대기 — paper_row 틀 승인됨 |
| 몬스터 44종 + NPC [5] | 대기 |
| 유물 26종 [3-3] | 대기 |
| 앱 아이콘 [8] | 대기 — 마지막에 |

---

## 검증된 규칙 (전부 실패에서 배운 것)

1. **한 채팅에서 이어서 생성.** 새 채팅을 열면 스타일 키 이미지를 다시 첨부.
2. **매 요청에 앵커 이미지 첨부**: 스타일 키 + 같은 계열의 합격본(주사위면 주사위 시트).
   *"Same painting style as the attached image"* 를 프롬프트에 포함.
3. **"transparent background"라고 쓰지 말 것.** 모델이 투명 대신 분홍 체커보드를 그린다(복구 불가).
   대신 **"one plain flat very dark brown background — solid color, no gradient, no checkerboard"**.
   배경 따기는 성권→Claude 전달 후 자동 처리.
4. **사실주의 방지 문구 필수**: "NOT photorealistic, NOT a 3D render, no glossy reflections".
5. **눈 개수를 명시하고 세라고 지시** — "Count the pips carefully" 포함.
6. 글자가 들어가면 폐기 후 "no text, no letters, no watermark" 강조 재생성. **예외: [6] 로고** — 철자를 명시하고 생성 후 철자 검수.
7. 비율 명시: 낱장 Square 1:1, 시트 Landscape 3:2, 배경/텍스쳐 Portrait 2:3.
8. 결과물이 튀면 같은 스레드에서 *"make it look exactly like the attached painted dice, flat gouache painting"* 으로 리터치.
9. **전달 방식**: 뽑은 이미지를 Claude 대화에 올리고 "이름 한 마디" (예: "저주 주사위"). 키잉·정규화·슬라이스·게임 연동은 Claude가 자동 처리.
10. **낙서(손그림) 계열은 마스터 블록을 그대로 쓰지 말 것** — gouache/붓터치 문구가 완성 일러스트로 끌고 간다. 팔레트·무드 지정만 남기고 "scratchy quill-ink doodle, NOT finished painted illustrations" 로 대체 ([3-2] 참고).
11. **9-슬라이스용 판(버튼·프레임)은 "perfectly symmetrical left and right, uniform border thickness"** 를 넣는다 — 늘려 써도 안 깨진다.

### [STYLE] 마스터 블록 — 완성 일러스트 계열 프롬프트 앞에 붙일 것

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

## [1] 주사위 ✅ (13종 전부 완료)

### 1-1. 스킨별 6면 시트 — 확정 방식 (재생성·추가 스킨 시 사용)

**공통 템플릿** (이 블록 + 아래 재질 한 줄):
```
Flat hand-painted storybook illustration for a dark fairytale dice game. Gouache on paper, visible brush strokes, thick dark outlines, muted palette: near-black brown, deep blood red, antique gold, aged cream. NOT photorealistic, NOT a 3D render. Landscape 3:2 image. A sprite sheet: a 3x2 grid of six dice, equal size, equal spacing, identical framing, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The six dice show pip counts 1, 2, 3, 4, 5, 6 IN ORDER (top row: 1, 2, 3 — bottom row: 4, 5, 6). Count the pips carefully — exactly one pip on the first die, six pips on the last. Same painting style as the attached dice sheet. Every die is:
```

**재질 한 줄** (13종 — 전부 ✅ 생성·적용 완료. 어두운 스킨은 발광 눈으로 가독성 확보):

| 스킨 | 이어붙일 재질 문장 |
|---|---|
| 나무 normal ✅ | `humble hand-carved warm brown wood with visible grain, dark ink pips.` |
| 금박 gold ✅ | `covered in worn matte gold leaf with tiny painted sparkles, dark ink pips with faint gold rims.` |
| 저주 cursed ✅ | `blackened old bone with thin ember-red cracks, pips glowing ember-red like coals.` |
| 송곳니 fang ✅ | `carved from ivory-yellow wolf fang with tiny bite marks, pips shaped like small dark blood droplets.` |
| 밀짚 straw ✅ | `woven from golden straw like a tiny thatched cube, pips are round dark brown straw knots.` |
| 잿불 ember ✅ | `charcoal grey with faint warm ember glow in its cracks, pips glowing warm orange.` |
| 달빛 moonlit ✅ | `pale blue crystal with a soft moonlight glow, pips deep midnight-blue with faint silver rims.` |
| 가시덤불 bramble ✅ | `wrapped in thorny bramble vines with tiny red thorns at the edges, dark green pips like thorn buds.` |
| 납 lead ✅ | `heavy dull grey lead with dents and scratches, black pips with pale chalk rims.` |
| 짝눈 even ✅ | `painted half aged-cream half slate-blue split diagonally, deep slate-blue pips.` |
| 홀눈 odd ✅ | `painted half aged-cream half wine-red split diagonally, deep wine-red pips.` |
| 높은 high ✅ | `covered in deep crimson royal velvet with gold embroidered trim on the edges, pips are round gold embroidered dots.` |
| 외눈 ace ✅ | `pale bone tightly wound with a single thin bright red thread wrapping around it, pips are small red thread knots.` |

### 1-2. 아이템 일러스트 낱장 (보상 카드·가방·상점) — 선택

금박·저주·송곳니 ✅ 확보. 필요 시:
```
[STYLE]
Square 1:1 image. A single hand-painted six-sided die, front-facing flat view,
filling about 70 percent of the frame, isolated on one plain flat very dark
brown background — solid color, no gradient, no checkerboard. Same painting
style and framing as the attached die image. The die: {재질 문장}
```

---

## [2] UI 텍스쳐/버튼 ✅ (7종 완료 — 인게임 적용, 재생성 시 아래 사용)

적용처: node_plate(휴식 화면 등 재활용 대기 — 지도는 슬더스식 개편으로 미사용) /
btn_primary·btn_ghost(모든 버튼, 9-슬라이스) / paper_row(족보 줄·선택지, 9-슬라이스) /
frame_modal(모달 액자, 9-슬라이스) / tex_cloth(앱 전체 바탕) / tex_wood(족보영역 탁자).

각 프롬프트는 `[STYLE 앞부분] + 형태 지정` 완성 블록으로 이 순서 요소를 포함:
- 공통 머리: `Flat hand-painted storybook illustration for a dark fairytale dice game. Gouache on paper, visible brush strokes, thick dark outlines, muted palette: near-black brown, deep blood red, antique gold, aged cream. NOT photorealistic, NOT a 3D render.`
- **node_plate** (Square 1:1): `A single horizontal oval wooden sign plaque, centered, front-facing flat view, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. Aged warm light-brown carved wood with worn rounded edges, a shallow darker circular recess in the upper center where a round bronze medallion will sit, and a smooth empty band below the recess for a short label. Perfectly symmetrical left and right. No text, no letters, no watermark.`
- **btn_primary** (Landscape 3:2): `A single wide rounded-rectangle button plaque, centered, front-facing flat view, on one plain flat very dark brown background. Deep blood-red lacquered wood with subtle grain, worn edges, a thin antique gold trim line following the border, the center left smooth and empty for text. Uniform border thickness, perfectly symmetrical left and right. No text.`
- **btn_ghost** (Landscape 3:2): `...Very dark near-black aged wood, almost blending into shadow, with only a thin antique gold outline following the border and faintly worn gold corners, the center left smooth and empty for text...`
- **paper_row** (Landscape 3:2): `A single wide horizontal strip of aged parchment paper, centered, on one plain flat very dark brown background. Slightly rough torn edges, faint sepia stains and creases, a little darker at the far right end, the surface left empty for text. Perfectly horizontal, symmetrical top and bottom. No text, no drawings.`
- **frame_modal** (Square 1:1, 풀캔버스): `Filling the whole canvas edge to edge. An ornate rectangular frame of carved dark wood with small antique gold inlay details at the four corners, uniform border thickness on all four sides, front-facing flat view. The inside of the frame is plain very dark aged paper, empty. No text.`
- **tex_cloth** (Square 1:1, 풀블리드): `A very dark aged linen fabric texture filling the entire image edge to edge: near-black brown woven cloth, extremely low contrast, subtle brush texture, slightly darker at the corners. No objects, no text.`
- **tex_wood** (Square 1:1, 풀블리드): `A dark old wooden table surface texture filling the entire image edge to edge: vertical planks of near-black brown wood, very low contrast, subtle grain and a few tiny scratches. No objects, no text.`

### 백로그 (추후)
- 보상 카드 프레임 (Portrait 3:4): 등급 변형 common/uncommon(청)/rare(보라 발광)/epic(금 발광)/relic_normal(가죽)/relic_elite(흑금)
- 상자 3종: 두루마리 묶음 / 가죽 주사위 주머니 / 이끼 낀 숲 상자
- hpbar_frame(체력바 틀) / coin(늑대 금화) / marker_hood(빨간 두건 말)

---

## [3] 아이콘

### 3-1. 메달 아이콘 4시트 26종 ✅ (완료 — 인게임 적용)

공통: `Sprite sheet, {N}x{M} grid, equal cells, equal spacing, identical framing, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. Each icon sits on a small round dark bronze medallion. Bold simple shapes, readable at 32px. IN ORDER — ...` + 마스터 머리.

- **상태 8종** status_* (4x2) ✅: upward red sword(힘)/golden die+plus(집중)/budding red heart(재생)/wooden shield(방어) // cracked grey sword down(약화)/three blood drops(출혈)/gold target reticle(취약)/purple dizzy spiral(혼란)
- **적 의도 6종** intent_* (3x2) ✅: crossed red claws(공격)/iron kite shield(방어)/purple spiral(혼란) // dark arm red veins(강화)/green mending heart(치료)/cream question mark in fog(의문)
- **지도 노드 6종** node_* (3x2) ✅: crossed swords/horned skull/campfire // eye speech bubble/merchant basket/wolf head — *현재는 전투 상단바 표시용. 지도는 [3-2] 낙서 아이콘으로 대체 예정*
- **무기 6종** weapon_* (3x2) ✅: flintlock rifle(gun)/scythe/red lantern // shovel/crossbow/red-handled knife(dagger)

### 3-2. 지도 낙서 아이콘 6종 (대기) — 빨간망토가 직접 그린 지도 컨셉

규칙 10 적용: 마스터 블록 대신 팔레트·무드만. 앵커는 양피지 지도 스크린샷 권장.

```
Rough hand-drawn map doodle icons for a dark fairytale dice game called REDHOOD. Muted storybook palette: dark sepia brown ink on parchment, with deep blood red accents — Grimm brothers mood, eerie but charming. NOT photorealistic, NOT a 3D render, NOT finished painted illustrations, no gouache shading. Landscape 3:2 image. A sprite sheet: a 3x2 grid of six doodle icons, equal size, equal spacing, identical framing, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. Each icon is a scratchy quill-ink doodle, as if a little girl sketched her own journey in a worn journal — wobbly uneven lines, simple childlike shapes, minimal detail, no circular frames or medallions, each icon with exactly one tiny accent of deep blood red ink. Bold silhouettes, readable at 32px. IN ORDER — top row left to right: 1) two small crossed swords (battle), 2) a horned beast skull (elite battle), 3) a little campfire with wobbly flames (rest). Bottom row left to right: 4) a big bold question mark (encounter), 5) a small drawstring coin pouch (shop), 6) a snarling wolf head with red eyes, slightly bigger and messier (boss). No text, no letters, no watermark.
```

파일: `assets/icons/doodle_{battle|elite|rest|event|shop|boss}.png` — 지도 노드 전용.

### 3-3. 유물 26종 (대기)

낱장 권장: `[STYLE] A single small relic item, centered, on one plain flat very dark brown background — solid color, no gradient, no checkerboard, subtle glow, readable at 48px.` + 오브젝트 묘사 (relics.json desc 참고 — 이빨/빵부스러기/실타래/우유/장작/장갑/깃털/부적/가계부/나침반/저울/양초/뼈/유리병 반딧불/늑대 가죽/독사과/꿀단지/붉은 망토/도토리/빗장/클로버/은식칼/은탄환/골무/보름달 목걸이/동화책)

---

## [4] 배경 (Portrait 2:3, 1024×1536 — 풀블리드, 키잉 불필요)

**공통 블록** (씬 배경 10종용 — 이 블록 + 아래 씬 한 줄):
```
Flat hand-painted storybook illustration for a dark fairytale dice game. Gouache on paper, visible brush strokes, thick dark outlines, muted palette: near-black brown, deep blood red, antique gold, aged cream. NOT photorealistic, NOT a 3D render. Vertical mobile game background, portrait 2:3. Distant painterly scenery only, no characters, no text, no watermark. Dark vignette at the top, and the lower third fades to near-black so game UI can sit on it.
```

| 파일 | 이어붙일 씬 문장 |
|---|---|
| bg_forest | `An ancient dark pine forest, thin shafts of pale light between the trunks, small red mushrooms on mossy roots.` |
| bg_stream | `A cold moonlit stream winding through mossy stones in a dark forest, thin mist floating over the water.` |
| bg_cabin | `The dim interior of an abandoned woodcutter's cabin, a cold stone hearth, cobwebs, one shuttered window leaking grey light.` |
| bg_swamp | `A sinking bog with dead leafless trees, faint green will-o-wisp lights hovering over black still water.` |
| bg_mist | `A forest drowned in thick pale fog, bare black silhouette trees fading into white, unsettling stillness.` |
| bg_grave | `A nameless overgrown graveyard at dusk, leaning weathered gravestones, dry grass, crows on a dead branch.` |
| bg_dream | `A melting dreamlike forest where the trees bend wrong, floating doors and clock faces drifting between them, colors slightly wrong and feverish.` |
| bg_hill | `A bare black hill under a slowly spiraling night sky, cosmic wrongness, one thin ancient monolith on the summit, faint red glow behind the clouds.` |
| bg_church | `The inside of an empty candle-lit church, dusty wooden pews, a broken stained glass window glowing faint red and gold.` |
| bg_final | `An endless black void, one colossal looming shadow made of slow tentacles with a single enormous pale eye, far above; the darkness feels alive.` (이 장만 no characters 제외) |

**bg_map — 지도 다크 양피지** (독립 완성 블록, 공통 블록 안 씀):
```
Dark fairytale storybook texture for a mobile dice game. Hand-painted gouache and ink feel, visible brush texture, muted moody palette: near-black brown, deep umber, aged ochre, faint blood-red stains. Grimm brothers mood — eerie but charming. NOT photorealistic, NOT a 3D render. Vertical image, portrait 2:3, filling the entire canvas edge to edge. An old darkened parchment map sheet, much darker than ordinary parchment — deep umber and smoky ochre tones, heavily aged and worn: frayed and torn edges that fade into near-black shadow at the borders, burnt corners, deep creases and fold marks, water stains, faint ink smudges and fingerprints, a tiny faded compass rose sketched in one corner. The center is slightly lighter and left empty so hand-drawn paths and icons can sit on it. No text, no letters, no drawings of objects, no watermark.
```
적용 메모: 양피지가 어두워지므로 잉크길·라벨은 밝은 잿빛 크림으로 반전 (Claude 처리).

**bg_title — 타이틀** (독립 완성 블록, 캐릭터 허용):
```
Flat hand-painted storybook illustration for a dark fairytale dice game. Gouache on paper, visible brush strokes, thick dark outlines, muted palette: near-black brown, deep blood red, antique gold, aged cream. NOT photorealistic, NOT a 3D render. Vertical mobile game background, portrait 2:3. No text, no watermark. A tiny girl in a bright red hooded cloak seen from behind, standing at the entrance of a huge dark pine forest, a narrow path disappearing into the black trees, the upper third of the image left as dim empty sky for a game logo.
```

파일: `assets/bg/bg_{id}.png` — 전투/지도/타이틀 화면에 테마별 자동 연동 (Claude 처리).

---

## [5] 몬스터 / NPC (대기)

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

## [6] 타이틀 로고 (대기) — 텍스트 허용 예외

생성 후 **철자 R-E-D-H-O-O-D 검수 필수** (AI가 글자를 자주 틀림). 부제 "빨간망토의 모험"은 게임 내 텍스트로 유지.

```
Dark fairytale storybook game logo. Hand-painted gouache and ink, visible brush texture, thick confident dark outlines, muted moody palette: near-black brown, deep blood red, antique gold, aged cream. Grimm brothers mood — eerie but charming. NOT photorealistic, NOT a 3D render. Landscape 3:2 image, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The word "REDHOOD" in bold hand-painted storybook lettering, aged cream letters with worn gold edges, spelled exactly R-E-D-H-O-O-D. A small red hooded cloak is draped over the first letter, and the silhouette of a snarling wolf hides in the shadows behind the letters. A few tiny red mushrooms and pine sprigs grow from the bottom of the letters. No other text, no watermark.
```

파일: `assets/ui/logo.png` — 타이틀 화면 h1 대체.

---

## [7] 족보 종이 18종 (대기) — 컨셉 문양 종이 띠

승인된 paper_row 틀에 변형별 문양을 은은하게 얹는다. **가독성 규칙: 문양은 오른쪽 끝에 작고 흐릿하게** — 글자가 그 위에 얹힌다. 등급 구분(이름색)은 CSS가 담당하므로 종이는 중립 톤 유지.

**공통 템플릿** (한 장에 3종씩, 총 6장 생성):
```
Flat hand-painted storybook illustration for a dark fairytale dice game. Gouache on paper, visible brush strokes, thick dark outlines, muted palette: near-black brown, deep blood red, antique gold, aged cream. NOT photorealistic, NOT a 3D render. Landscape 3:2 image. Three wide horizontal strips of aged parchment paper, stacked vertically with equal spacing, identical size and framing, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. Each strip has slightly rough torn edges and faint sepia stains, and its surface is left empty for text EXCEPT a small faded ink drawing near the right end of the strip, drawn subtle and light so text stays readable. Same paper style as the attached strip. IN ORDER — top strip: {1}. middle strip: {2}. bottom strip: {3}. No text, no letters, no watermark.
```

**문양 문장** ({N} 자리에 넣기 — 시트 구성 자유):

| 변형 (족보) | 문양 문장 |
|---|---|
| instinct 떠돌이의 직감 (노페어) | `a worn walking stick and a tiny compass` |
| whisper 숲의 속삭임 (노페어) | `a few drifting leaves with faint whisper lines` |
| clasped_hands 맞잡은 손 (원페어) | `two small clasped hands` |
| red_shoes 한 켤레 붉은 구두 (원페어) | `a pair of little red dancing shoes` |
| twin_sisters 쌍둥이 자매 (투페어) | `two identical little girl silhouettes holding hands` |
| two_moons 두 개의 달 (투페어) | `two crescent moons side by side` |
| triple_axe 세 번 찍는 도끼 (트리플) | `a woodcutter's axe beside three notch marks` |
| woodsman_breath 나무꾼의 호흡 (트리플) | `an axe resting on a tree stump with a small puff of breath` |
| four_fangs 네 개의 송곳니 (포카드) | `four sharp wolf fangs in a row` |
| heavy_blow 묵직한 일격 (포카드) | `a heavy iron mallet with small crack lines beneath it` |
| cottage 할머니의 오두막 (풀하우스) | `a tiny cottage with a smoking chimney` |
| hearth 따뜻한 화덕 (풀하우스) | `a stone hearth with a warm little fire` |
| windpath 바람길 (스몰 스트레이트) | `swirling wind lines sweeping through grass` |
| hunt_drive 몰이사냥 (스몰 스트레이트) | `a small hunting horn with three arrows pointing one way` |
| moonpath 달빛 오솔길 (라지 스트레이트) | `a winding path lit by a crescent moon` |
| storm_run 폭풍 질주 (라지 스트레이트) | `storm clouds with a red lightning bolt and speed lines` |
| judgment_night 심판의 밤 (야찌) | `a hanging balance scale under a dark moon` |
| blood_moon 핏빛 만월 (야찌) | `a full moon dripping red at its lower edge` |

파일: `assets/ui/paper_{variantId}.png` — 없는 변형은 기본 paper_row로 폴백 (부분 적용 가능).

---

## [8] 앱 아이콘 (대기 — 스타일 모두 모인 마지막에)
```
[STYLE]
App icon, square, bold and readable at 48px.
A red hood silhouette merged with a single ivory die showing five pips,
on a near-black forest background, thin gold ring border.
```

---

## 통합 규칙 (Claude 처리)

- 전달: 이 대화에 이미지 업로드 + 이름 한 마디 → 키잉·정규화·슬라이스·커밋·연동 자동
- 경로: 적 `assets/enemies/{id}.png` / 주사위 `assets/dice/{skin}{face}.png` / 메달 아이콘 `assets/icons/…` / 낙서 아이콘 `assets/icons/doodle_….png` / UI·텍스쳐·로고·족보 종이 `assets/ui/…` / 배경 `assets/bg/…`
- 이미지 없는 항목은 이모지/기존 표시로 폴백 — 부분 적용 가능
- 9-슬라이스 판(버튼·액자·종이 띠)은 CSS border-image로 연동 — 크기 자유
