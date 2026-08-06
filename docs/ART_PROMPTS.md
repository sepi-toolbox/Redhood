# REDHOOD 아트 리소스 프롬프트 팩 — v4 (키아트 앵커 체계)

v4 개정: 키아트 3앵커 체계 확립, 저밀도 템플릿 확정(디테일 과다 방지), 1막·NPC 전원 완료 반영.

## 생성 방식 요약

1. 프롬프트 블록을 통째로 복사
2. **해당 계열 키아트를 첨부** (아래 표)
3. 생성 후 Claude 대화에 업로드 + 이름 한 마디 → 키잉·정규화·연동 자동

| 만들 대상 | 첨부할 키아트 |
|---|---|
| 몬스터 | `keyart_wolf` (+ 같은 계열 승인본) |
| 인물 NPC | `keyart_redhood` + `keyart_peddler` |
| 사물·정물 | `keyart_stilllife` |
| 배경 | `keyart_stilllife` |

키아트 원본: `docs/keyart/` (peddler / wolf / stilllife / redhood)

---

## 진행 현황

| 항목 | 상태 |
|---|---|
| 키아트 4종 | ✅ 완료 — 모든 생성의 앵커 |
| 주사위 6면 시트 13종 | ✅ 완료 |
| UI 아이콘 26종 (상태8·의도6·노드6·무기6) | ✅ 완료 |
| 지도 낙서 아이콘 6종 | ✅ 완료 |
| UI 텍스쳐·프레임 11종 | ✅ 완료 |
| 타이틀 로고 | ✅ 완료 |
| **1막 몬스터 16종** | ✅ 완료 (전원 저밀도 리마스터) |
| **NPC·사물 12종** | ✅ 완료 |
| 2막 보스 3종 | ✅ 완료 |
| **2막 일반 6 + 정예 3** | ⬜ 대기 — [2] |
| **3막 15종 + 최종 보스** | ⬜ 대기 — [3] |
| **배경 11종** | ⬜ 대기 — [4] (현재 전부 숲 배경 임시 사용) |
| **족보 종이 18종** | ⬜ 대기 — [5] |
| **유물 26종** | ⬜ 대기 — [6] |
| 앱 아이콘 | ⬜ 대기 — [7] (맨 마지막) |

---

## 검증된 규칙 (실패에서 배운 것)

1. **"transparent background" 금지** — 모델이 분홍 체커보드를 그린다. 대신 `one plain flat very dark brown background — solid color, no gradient, no checkerboard`.
2. **사실주의 방지 필수** — `NOT photorealistic, NOT 3D`.
3. **디테일 과다 방지 (v4 핵심)** — `SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter`. "rich painterly texture" 같은 표현은 잔디테일을 부르므로 **쓰지 말 것**.
4. **아웃라인 강조** — `EXTRA-THICK bold black outlines that clearly separate the creature from the background`. 배경 위에서 실루엣이 살아난다.
5. **비율 오류 방지** — 인간형·동물형에는 `Natural body proportions — do NOT give it an oversized head on a tiny body` 포함. (의도적 기형은 예외로 명시)
6. **주사위 눈 개수** — `Count the pips carefully` 필수.
7. **글자 금지** — `No text, no letters, no watermark`. 예외는 로고뿐.
8. **낙서 계열은 마스터 스타일 금지** — gouache 문구가 완성 일러스트로 끌고 간다. 팔레트·무드만 남기고 `scratchy quill-ink doodle` 사용.
9. **9-슬라이스 판** — `perfectly symmetrical left and right, uniform border thickness` 포함해야 늘려도 안 깨진다.
10. **비율 명시** — 낱장 Square 1:1 / 시트 Landscape 3:2 / 배경 Portrait 2:3.

### 공통 머리 블록 (몬스터)

```
Stylized dark fairytale creature for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, keep it as simple and readable as the attached key art. NOT photorealistic, NOT 3D. Natural body proportions — do NOT give it an oversized head on a tiny body. Square 1:1 image. A single creature, FULL BODY from head to feet, facing slightly left, centered, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. Bold silhouette, readable at 96px. The creature: {묘사}. No text, no letters, no watermark.
```

- 정예 접미: `More imposing, subtle red accents.`
- 보스 접미: `A grand menacing boss, faint red aura.`
- 부유형(불꽃·유령·눈알)은 `FULL BODY from head to feet` → `FULL BODY, floating`
- 비인간형(덤불·촛불떼 등)은 비율 문구 생략 가능

---

## [1] 1막 몬스터 ✅ (16종 완료 — 재생성 시 참고)

| 이름 | id | 묘사 |
|---|---|---|
| 들개 | stray_dog | `a mangy stray dog, ribs showing, bared yellow teeth, tail low` |
| 굶주린 까마귀 | crow | `a starving ragged black crow with one hungry gold-ringed eye` |
| 도깨비불 | will_o_wisp | `a mischievous pale-blue flame with a faint grinning face` (floating) |
| 숲거미 | forest_spider | `a plump forest spider with a birch-bark patterned belly, thin angular legs` |
| 가시덤불 | thorn_bush | `a living bramble bush with one withered rose for a head, two thorny vine arms` |
| 옹이 골렘 | twig_golem | `a humanoid golem of twisted twigs with one glowing amber knothole eye in its chest` |
| 개울 정령 | brook_sprite | `a small sprite made of a standing splash of creek water with two pebble eyes` |
| 거머리 | leech | `a fat rearing leech with a pale segmented belly and a round sucker mouth` |
| 쥐떼 | rat_swarm | `a writhing mound of black rats forming one shape, a few small red eyes glinting` |
| 살아있는 빗자루 | living_broom | `an old straw broom come alive, bent like a hunched crone, straw bristling like wild hair` |
| 우두머리 들개 (정예) | alpha_dog | `a huge scarred alpha hound with a collar of thorns` |
| 늙은 강꼬치 (정예) | old_pike | `an ancient monstrous pike fish, hook scars around its jaw` (hovering as if underwater) |
| 지하실의 무언가 (정예) | cellar_thing | `a lanky shadow creature with intentionally too-long arms and fingers, two pale glowing eyes, its lower body fading into darkness` |
| 늑대 (보스) | wolf | `a massive black fairytale wolf, blood-red eyes, a torn shawl caught on one claw` |
| 다리 밑 트롤 (보스) | river_hag | `a hulking river troll like a mossy boulder, wet stone-grey skin, a broken wooden bridge plank across its shoulder` |
| 낡은 곰인형 (보스) | old_teddy | `a giant old teddy bear with one button eye dangling by a thread, straw leaking from burst seams, a stitched smile` |

> 파일명은 코드 id와 일치해야 자동 연동됨 (`assets/enemies/{id}.png`)

---

## [2] 2막 몬스터 — 늪·안개숲·무덤 (보스 3종 ✅ / 일반·정예 9종 ⬜)

| 이름 | id | 묘사 | 상태 |
|---|---|---|---|
| 늪두꺼비 | bog_toad | `a bloated bog toad with warty moss-green skin and a long drooping tongue` | ⬜ |
| 모기떼 | mosquito_swarm | `a dense cloud of huge marsh mosquitoes forming a vague face` (floating) | ⬜ |
| 안개 망령 | mist_wraith | `a wraith of pale fog with hollow eyes, its lower half trailing into mist` (floating) | ⬜ |
| 창백한 사슴 | pale_stag | `an unnaturally pale white stag with too many antler points and blank eyes` | ⬜ |
| 해골 병사 | skeleton | `a leaning skeleton soldier in rusted scraps of armor with a notched sword` | ⬜ |
| 무덤 벌레 | grave_worm | `a thick pale grave worm bursting from dark soil, a ringed round mouth` (rearing from soil) | ⬜ |
| 진흙 골렘 (정예) | mud_golem | `a hulking golem of black grave mud with a few bones and roots stuck in its body` | ⬜ |
| 목 없는 기사 (정예) | headless_knight | `a headless knight on foot in tarnished armor holding a lance, pale mist where the head should be` | ⬜ |
| 무덤지기 (정예) | grave_keeper | `a gaunt gravekeeper with a lantern and a long shovel, face hidden under a wide hat` | ⬜ |
| 늪의 왕 (보스) | swamp_king | `an immense crocodile wearing a rotten wooden crown, gold-green eyes` | ✅ |
| 안개의 어머니 (보스) | fog_mother | `a towering motherly silhouette woven of fog, a few faint reaching arms, two soft glowing eyes` | ✅ |
| 파묻힌 자 (보스) | the_buried | `a huge revenant wrapped in roots and burial cloth, a crown of soil` | ✅ |

---

## [3] 3막 몬스터 — 꿈·언덕·교회 (15종 + 최종 보스) ⬜

| 이름 | id | 묘사 |
|---|---|---|
| 악몽 토끼 | nightmare_hare | `a wrong-looking dream hare with spiral eyes and a stitched grin` |
| 떠도는 눈 | floating_eye | `a single large floating eyeball with a keyhole-shaped iris and a tail of dream smoke` (floating) |
| 꿈나방 | dream_moth | `a huge dusty moth with two sleeping human faces patterned on its wings` (wings spread) |
| 속삭이는 폴립 | whisper_polyp | `a fleshy polyp cluster with a few small whispering mouths, faint eerie glow` |
| 얼굴 없는 광신도 | faceless_cultist | `a kneeling cultist in dark robes whose hood holds only smooth blankness, holding a candle` |
| 비명 지르는 돌 | screaming_stone | `a jagged standing stone with a screaming face split across it, a few cracks glowing faintly` |
| 속 빈 사제 | hollow_priest | `a priest's robes standing upright with nothing inside, holding a staff` |
| 성가대 유령 | choir_ghost | `three translucent choir ghosts sharing one flowing robe, mouths open in silent song` (floating) |
| 촛불 떼 | candle_swarm | `a cluster of small living candle flames with faint faces, gathered into one shape` |
| 모래 사나이 (정예) | sandman | `the Sandman — a tall figure of flowing sand in a nightcap, hourglass in hand, hollow eyes` |
| 언덕의 촉수 (정예) | hill_tentacle | `a colossal tentacle with a few barnacles bursting from a torn hillside` (bursting upward) |
| 종지기 (정예) | bell_ringer | `a hunched bell-ringer with a cracked bronze bell for a head, rope in hand` |
| 자각몽의 왕 (보스) | lucid_king | `the king of lucid dreams — a regal figure whose crown and robes slowly melt and reform, a crescent-moon face` |
| 벌어진 아가리 (보스) | the_maw | `a vast toothed pit — two concentric rings of teeth around a black throat, a few roots dangling in, seen from the front` |
| 거짓 성인 (보스) | false_saint | `a false saint with a tilted golden halo, a serene mask slightly ajar showing darkness, four hands folded in prayer` |
| 이름 없는 공포 (최종) | nameless_dread | `a sea of black tentacles beneath one colossal pale lidless eye, a tiny red hood reflected in the pupil. Grander than any boss, mostly darkness` |

---

## [4] 배경 11종 ⬜ (현재 전부 `bg_forest` 임시 사용 중)

**공통 블록** (이 블록 + 아래 씬 한 줄). 세로 2:3, 풀블리드라 키잉 불필요.

```
Stylized dark fairytale background for a mobile dice game, gothic caricature style: chunky angular shapes, thick dark outlines, flat gouache color planes, minimal detail, NOT photorealistic, NOT 3D. Muted palette: near-black brown, deep blood red, antique gold, aged cream. Vertical mobile game background, portrait 2:3. Distant scenery only, no creatures, no characters, no text, no watermark. Dark vignette at the top, and the lower half fades smoothly into near-black so game UI can sit on it. The scene: {씬}
```

| 파일 | 씬 문장 | 상태 |
|---|---|---|
| bg_forest | `an ancient dark pine forest, jagged angular tree trunks, thin shafts of pale light, a few tiny red mushrooms.` | ✅ |
| bg_stream | `a cold moonlit stream winding through angular mossy stones in a dark forest, thin mist over the water.` | ⬜ |
| bg_cabin | `the dim inside of an abandoned woodcutter's cabin, a cold stone hearth, cobwebs, one shuttered window leaking grey light.` | ⬜ |
| bg_swamp | `a sinking bog with dead leafless trees, faint green will-o-wisp lights hovering over black still water.` | ⬜ |
| bg_mist | `a forest drowned in thick pale fog, bare black silhouette trees fading into white.` | ⬜ |
| bg_grave | `a nameless overgrown graveyard at dusk, leaning weathered gravestones, dry grass, crows on a dead branch.` | ⬜ |
| bg_dream | `a melting dreamlike forest where the trees bend wrong, floating doors and clock faces drifting between them, colors slightly wrong.` | ⬜ |
| bg_hill | `a bare black hill under a slowly spiraling night sky, one thin ancient monolith on the summit, faint red glow behind the clouds.` | ⬜ |
| bg_church | `the inside of an empty candle-lit church, dusty wooden pews, a broken stained glass window glowing faint red and gold.` | ⬜ |
| bg_final | `an endless black void, one colossal looming shadow made of slow tentacles with a single enormous pale eye, far above.` (no characters 제외) | ⬜ |
| bg_title | 별도 블록 — 아래 | ⬜ |

**bg_title** (캐릭터 허용):
```
Stylized dark fairytale background for a mobile dice game, gothic caricature style: chunky angular shapes, thick dark outlines, flat gouache color planes, minimal detail, NOT photorealistic, NOT 3D. Muted palette: near-black brown, deep blood red, antique gold, aged cream. Vertical mobile game background, portrait 2:3. No text, no watermark. A tiny girl in a bright red hooded cloak seen from behind, standing at the entrance of a huge dark pine forest, a narrow path disappearing into the black trees, the upper third left as dim empty sky for a game logo.
```

**bg_map** ✅ (다크 양피지, 지도 전용 — 재생성 시):
```
Dark fairytale storybook texture for a mobile dice game. Hand-painted gouache and ink feel, muted moody palette: near-black brown, deep umber, aged ochre, faint blood-red stains. NOT photorealistic, NOT 3D. Vertical image, portrait 2:3, filling the entire canvas edge to edge. An old darkened parchment map sheet, much darker than ordinary parchment: frayed and torn edges fading into near-black at the borders, burnt corners, deep creases, water stains, a tiny faded compass rose in one corner. The center is slightly lighter and left empty. No text, no letters, no drawings of objects, no watermark.
```

파일: `assets/bg/bg_{id}.jpg` — 등록하면 해당 테마만 자동 교체, 나머지는 계속 숲 사용.

---

## [5] 족보 종이 18종 ⬜

승인된 `paper_row` 틀에 변형별 문양을 얹는다. **가독성 규칙: 문양은 오른쪽 끝에 작고 흐릿하게** (글자가 그 위에 얹힘). 등급 구분은 CSS 담당이므로 종이는 중립 톤.

**공통 템플릿** (한 장에 3종씩, 총 6장):
```
Stylized dark fairytale UI element for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LOW detail density. NOT photorealistic, NOT 3D. Landscape 3:2 image. Three wide horizontal strips of aged parchment paper, stacked vertically with equal spacing, identical size and framing, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. Each strip has slightly rough torn edges and faint sepia stains, and its surface is left empty for text EXCEPT a small faded ink drawing near the right end, drawn subtle and light so text stays readable. IN ORDER — top strip: {1}. middle strip: {2}. bottom strip: {3}. No text, no letters, no watermark.
```

| 변형 (족보) | id | 문양 문장 |
|---|---|---|
| 떠돌이의 직감 (노페어) | instinct | `a worn walking stick and a tiny compass` |
| 숲의 속삭임 (노페어) | whisper | `a few drifting leaves with faint whisper lines` |
| 맞잡은 손 (원페어) | clasped_hands | `two small clasped hands` |
| 한 켤레 붉은 구두 (원페어) | red_shoes | `a pair of little red dancing shoes` |
| 쌍둥이 자매 (투페어) | twin_sisters | `two identical little girl silhouettes holding hands` |
| 두 개의 달 (투페어) | two_moons | `two crescent moons side by side` |
| 세 번 찍는 도끼 (트리플) | triple_axe | `a woodcutter's axe beside three notch marks` |
| 나무꾼의 호흡 (트리플) | woodsman_breath | `an axe resting on a tree stump with a small puff of breath` |
| 네 개의 송곳니 (포카드) | four_fangs | `four sharp wolf fangs in a row` |
| 묵직한 일격 (포카드) | heavy_blow | `a heavy iron mallet with small crack lines beneath it` |
| 할머니의 오두막 (풀하우스) | cottage | `a tiny cottage with a smoking chimney` |
| 따뜻한 화덕 (풀하우스) | hearth | `a stone hearth with a warm little fire` |
| 바람길 (스몰) | windpath | `swirling wind lines sweeping through grass` |
| 몰이사냥 (스몰) | hunt_drive | `a small hunting horn with three arrows pointing one way` |
| 달빛 오솔길 (라지) | moonpath | `a winding path lit by a crescent moon` |
| 폭풍 질주 (라지) | storm_run | `storm clouds with a red lightning bolt and speed lines` |
| 심판의 밤 (야찌) | judgment_night | `a hanging balance scale under a dark moon` |
| 핏빛 만월 (야찌) | blood_moon | `a full moon dripping red at its lower edge` |

파일: `assets/ui/paper_{variantId}.png` — 없는 변형은 기본 paper_row로 폴백.

---

## [6] 유물 26종 ⬜

**공통 템플릿**:
```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image. A single small relic item, centered, filling most of the frame, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. Subtle glow, readable at 48px. The item: {묘사}. No text, no letters, no watermark.
```

묘사는 `data/relics.json`의 name·desc 참고 (이빨 / 빵부스러기 / 실타래 / 우유 / 장작 / 장갑 / 깃털 / 부적 / 가계부 / 나침반 / 저울 / 양초 / 뼈 / 유리병 반딧불 / 늑대 가죽 / 독사과 / 꿀단지 / 붉은 망토 / 도토리 / 빗장 / 클로버 / 은식칼 / 은탄환 / 골무 / 보름달 목걸이 / 동화책).

파일: `assets/relics/{id}.png`

---

## [7] 앱 아이콘 ⬜ (맨 마지막)

```
Stylized dark fairytale app icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, bold and readable at 48px. A red hood silhouette merged with a single ivory die showing five pips, on a near-black forest background, thin antique gold ring border. No text, no letters, no watermark.
```

---

## 완료된 리소스 (재생성용 참고)

### 주사위 6면 시트 ✅ (13종)
공통 템플릿 + 재질 한 줄:
```
Flat hand-painted storybook illustration for a dark fairytale dice game. Gouache on paper, visible brush strokes, thick dark outlines, muted palette: near-black brown, deep blood red, antique gold, aged cream. NOT photorealistic, NOT a 3D render. Landscape 3:2 image. A sprite sheet: a 3x2 grid of six dice, equal size, equal spacing, identical framing, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The six dice show pip counts 1, 2, 3, 4, 5, 6 IN ORDER (top row: 1, 2, 3 — bottom row: 4, 5, 6). Count the pips carefully. Same painting style as the attached dice sheet. Every die is: {재질}
```
나무 `humble hand-carved warm brown wood with visible grain, dark ink pips.` / 금박 `covered in worn matte gold leaf with tiny painted sparkles.` / 저주 `blackened old bone with thin ember-red cracks, pips glowing ember-red.` / 송곳니 `carved from ivory-yellow wolf fang, pips shaped like small dark blood droplets.` / 밀짚 `woven from golden straw, pips are round dark brown straw knots.` / 잿불 `charcoal grey with faint warm ember glow in its cracks, pips glowing warm orange.` / 달빛 `pale blue crystal with a soft moonlight glow, pips deep midnight-blue.` / 가시덤불 `wrapped in thorny bramble vines with tiny red thorns, dark green pips.` / 납 `heavy dull grey lead with dents and scratches, black pips with pale chalk rims.` / 짝눈 `painted half aged-cream half slate-blue split diagonally.` / 홀눈 `painted half aged-cream half wine-red split diagonally.` / 높은 `covered in deep crimson royal velvet with gold embroidered trim, pips are round gold embroidered dots.` / 외눈 `pale bone tightly wound with a single thin bright red thread, pips are small red thread knots.`

### UI 아이콘 시트 ✅ (26종)
`Sprite sheet, {N}x{M} grid, equal cells, on one plain flat very dark brown background. Each icon sits on a small round dark bronze medallion. Bold simple shapes, readable at 32px. IN ORDER — ...`
- 상태 8종 (4x2): 붉은 검↑(힘) / 금 주사위+(집중) / 붉은 새싹 심장(재생) / 나무 방패(방어) / 갈라진 회색 검↓(약화) / 핏방울 3개(출혈) / 금 조준경(취약) / 보라 소용돌이(혼란)
- 의도 6종 (3x2): 붉은 발톱 교차(공격) / 철 방패(방어) / 보라 나선(혼란) / 붉은 핏줄 팔(강화) / 초록 심장(치료) / 안개 속 물음표(의문)
- 노드 6종 (3x2) / 무기 6종 (3x2)

### 지도 낙서 아이콘 ✅ (6종)
규칙 8 적용 — 마스터 스타일 대신:
```
Rough hand-drawn map doodle icons for REDHOOD. Muted palette: dark sepia brown ink on parchment, deep blood red accents. NOT photorealistic, NOT 3D, NOT finished painted illustrations, no gouache shading. Landscape 3:2. A 3x2 grid of six doodle icons on one plain flat very dark brown background. Each icon is a scratchy quill-ink doodle, as if a little girl sketched her own journey in a worn journal — wobbly uneven lines, childlike shapes, no circular frames, each with exactly one tiny accent of deep blood red ink. IN ORDER — 교차 검(전투) / 뿔 해골(엘리트) / 모닥불(휴식) // 큰 물음표(만남) / 동전 주머니(상점) / 늑대 머리(보스). No text.
```

### UI 텍스쳐·프레임 ✅ (11종)
9-슬라이스 판은 `perfectly symmetrical left and right, uniform border thickness` 필수. 평면 UI는 `A flat 2D mobile game UI element ... NO perspective, NO depth — perfectly front-facing orthographic flat view` 로 시작.
- node_plate(나무 팻말) / btn_primary(붉은 옻칠판) / btn_ghost(어두운 나무판) / paper_row(종이 띠) / frame_modal(조각 나무 액자) / tex_cloth(낡은 천) / tex_wood(나무 탁자) / nameplate(리본 명패) / die_pad(주사위 받침) / hpbar 4종(플레이어·일반·정예·보스) / gauge_red(핏빛 물감 채움)

### 타이틀 로고 ✅
텍스트 허용 예외 — 생성 후 **철자 R-E-D-H-O-O-D 검수 필수**.

---

## 통합 규칙 (Claude 처리)

- 전달: 대화에 이미지 업로드 + 이름 한 마디 → 키잉·정규화·슬라이스·커밋·연동 자동
- 경로: 적 `assets/enemies/{id}.png` / NPC·사물 `assets/npc/{name}.png` / 주사위 `assets/dice/{skin}{face}.png` / 아이콘 `assets/icons/` / UI `assets/ui/` / 배경 `assets/bg/`
- 이미지 없는 항목은 이모지·기존 표시로 폴백 — 부분 적용 가능
- 붉은 보스 배광은 키잉 시 "붉은 기운만 오른 픽셀"을 배경으로 판정해 제거
- 자산은 팔레트 PNG로 최적화해 커밋 (배포 용량 관리)

## 배포 규칙 (사고 이후 확정)

- **작업마다 배포하지 않는다.** 여러 건을 묶어 한 번만 배포 (GitHub Pages 빌드 부담)
- 배포본은 게임 실행 파일만 (`index.html manifest.json sw.js css js data assets .nojekyll`) — docs·test 제외
- 커밋 서명 금지 (`commit.gpgsign false`)
- 배포 후 검증: Pages API로 `status: built` 확인 → 라이브 CSS/JS 내용 확인
