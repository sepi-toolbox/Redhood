# REDHOOD 아트 리소스 프롬프트 팩 — v7

> **남은 작업만 한 장으로 보려면 `docs/REMAINING.md`를 보세요.** 이 문서는 완료분까지 포함한 전체 기록입니다.

v6 개정: 진행 현황을 v0.97 기준으로 갱신, 족보 판 18종 작업에서 배운 규칙 15~22 추가, 배경·족보 판 절을 전용 문서로 이관 표시.

## 생성 방식 요약

1. 프롬프트 블록을 통째로 복사
2. **해당 계열 키아트를 첨부** (아래 표)
3. 생성 후 Claude 대화에 업로드 + 이름 한 마디 → 키잉·정규화·연동 자동

| 만들 대상 | 첨부할 키아트 |
|---|---|
| 몬스터 | `keyart_wolf` (+ 같은 계열 승인본) |
| 인물 NPC | `keyart_redhood` + `keyart_peddler` |
| 사물·정물·유물 | `keyart_stilllife` |
| 배경 | `keyart_stilllife` |

키아트 원본: `docs/keyart/` (peddler / wolf / stilllife / redhood)

---

## 진행 현황 (v0.97 기준 · 2026-08-08)

| 항목 | 상태 |
|---|---|
| 키아트 4종 | ✅ |
| 주사위 6면 시트 13종 | ✅ |
| UI 아이콘 26종 (상태8·의도6·노드6·무기6) | ✅ |
| 지도 낙서 아이콘 6종 | ✅ |
| UI 텍스쳐·프레임 11종 | ✅ |
| 타이틀 로고 | ✅ |
| NPC·사물 12종 | ✅ |
| 몬스터 44/44종 | ✅ |
| **족보 판 18/18종** | ✅ `docs/COMBO_PLATE_PROMPTS.md` |
| **배경 12/12종** | ✅ `docs/BG_PROMPTS.md` |
| 보물상자 0/3종 | ⬜ `docs/CHEST_PROMPTS.md` |
| 보스 낙서 0/9종 | ⬜ `docs/BOSS_ICON_PROMPTS.md` |
| 유물 0/26종 | ⬜ [7] |
| **감정 카드 0/6종 (프레임·뒷면·일러 4)** | ⬜ `docs/CARD_PROMPTS.md` |
| 앱 아이콘 | ⬜ [8] |
| ~~줄 UI 원형 아이콘 18종~~ | ❌ 폐기 — 족보 판에 통합됨 |
| 배경음 20/21곡 | 🔶 `bgm_title`만 대기 — `docs/BGM_PROMPTS.md` |
| 효과음 0/3종 | ⬜ 재생 코드도 아직 없음 |

**남은 순서**: 보물상자 3종 → 보스 낙서 9종 → 유물 26종 → 앱 아이콘 → 타이틀 곡 → 효과음.

---

## 검증된 규칙 (실패에서 배운 것)

1. **"transparent background" 금지** — 모델이 분홍 체커보드를 그린다. 대신 `one plain flat very dark brown background — solid color, no gradient, no checkerboard`.
2. **사실주의 방지 필수** — `NOT photorealistic, NOT 3D`.
3. **디테일 과다 방지** — `SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter`. "rich painterly texture" 같은 표현은 잔디테일을 부르므로 **쓰지 말 것**.
4. **아웃라인 강조** — `EXTRA-THICK bold black outlines that clearly separate the creature from the background`.
5. **비율 오류 방지** — 인간형·동물형에는 `Natural body proportions — do NOT give it an oversized head on a tiny body` 포함. (의도적 기형은 예외로 명시)
6. **주사위 눈 개수** — `Count the pips carefully` 필수.
7. **글자 금지** — `No text, no letters, no watermark`. 예외는 로고뿐.
8. **낙서 계열은 마스터 스타일 금지** — gouache 문구가 완성 일러스트로 끌고 간다. 팔레트·무드만 남기고 `scratchy quill-ink doodle` 사용.
9. **9-슬라이스 판** — `perfectly symmetrical left and right, uniform border thickness` 포함해야 늘려도 안 깨진다.
10. **비율 명시** — 낱장 Square 1:1 / 시트 Landscape 3:2 / 배경 Portrait 2:3.

### v5에서 추가된 규칙 (최근 사고 기록)

11. **배경과 피사체 색이 겹치면 배경 제거가 실패한다.** 높은 주사위(진홍 벨벳)를 어두운 갈색 배경 위에 그리게 했더니, 주사위의 어두운 붉은 면이 배경으로 오인돼 **6번 눈 하나가 통째로 지워지고 옆면 액자가 잘렸다.**
    → 피사체가 **어두운 적갈색·흑갈색 계열**이면 배경 지정을 바꾼다:
    `on one plain flat mid-grey background — solid color, no gradient, no checkerboard`
    (밝은 회색은 게임 팔레트에 안 쓰이므로 안전하게 분리된다. 배경은 어차피 제거되므로 톤이 튀어도 무방)
12. **넓은 부속물을 넣으면 본체가 작아 보인다.** 트롤에게 "어깨에 걸친 다리 판자"를 넣었더니 그림 폭의 절반을 판자가 먹어서, 같은 크기로 렌더해도 트롤 몸통이 다른 몬스터보다 작게 보였다.
    → 몬스터는 **몸통이 화면을 꽉 채우게**: `The creature FILLS the frame edge to edge — no wide props, no large background elements, no empty margin around it.`
    → 소품은 몸에 붙은 작은 것만. 다리·수레·건물 같은 넓은 구조물 금지.
13. **가로로 넓은 그림은 손해였지만 v0.69에서 폭 제한을 풀어 해소됨.** 그래도 세로가 긴 구도(서 있는 자세)가 여전히 유리하다. 부유형·수평형이 아니면 **세로로 서 있는 실루엣**을 권장.
14. **몬스터 렌더 크기는 격에 따라 다르다** — 일반 216px / 정예 234px / 보스 254px. 보스는 더 크게 그려지므로 **디테일을 조금 더 넣어도 되지만**, 규칙 3은 유지.

### v6에서 추가된 규칙 (족보 판 18종을 만들며 확인된 것)

15. **9-슬라이스는 비례로 잘라야 한다.** 그림에 그려진 테두리 두께를 기준으로 자르면 위·중간·아래의 세로 배율이 달라져서, 위아래로 긴 그림(쌍둥이 자매의 소녀)이 몸통만 6분의 1로 찌그러졌다.
    → 원본 높이가 212로 줄어드는 배율을 슬라이스에도 그대로 적용한다. 최소 `T = H×55/212`, 최소 `L = H×92/212`. 변환 스크립트가 자동으로 보장한다.
16. **양 끝 장식의 폭은 판마다 다르므로 테두리 폭도 판마다 달라야 한다.** CSS에 17px로 고정해뒀더니 장식이 넓은 판일수록 눌렸다(할머니의 오두막 62%).
    → `main.js`의 `PLATE_EDGE`에 판별 값을 넣는다. 값은 `45 × 장식폭 ÷ 원본높이`이고 변환 스크립트가 출력해준다. 기본값 20px.
17. **장식은 원본 폭의 15% 안쪽에 붙인다.** 그보다 넓으면 화면에서 눌리고, 그보다 훨씬 넓으면 아예 잘려 나간다(달빛 오솔길의 발자국이 그렇게 사라질 뻔했다).
18. **등급은 굵기가 아니라 색으로 구분한다.** 얇은 쇠 테두리로 언커먼을 표시했더니 45px에서 커먼과 구분이 안 됐다. 굵기 차이도 부족했다.
    → **금속 없음 → 은 → 금 → 백금+루비 상감선**. 띠 굵기는 세 등급 모두 판 높이의 1/5로 동일하게 두고 색만 바꾼다.
19. **판 자체의 재질이 금속이면 등급이 안 보인다.** 두 개의 달이 은빛 재질이라 은띠가 먹혀서 통짜 쇳덩이가 됐다.
    → 언커먼 이상은 `The plate's OWN material must not be metal` 을 명시한다.
20. **좌우 거울 대칭을 강제하면 실재할 수 없는 물체가 나온다.** 통나무 양 끝에 절단면이 동시에 그려졌다.
    → "양 끝 장식의 크기와 무게만 맞추되 물리적으로 말이 되게, 원근 없는 정면 뷰, 빛은 전체가 왼쪽 위에서"로 바꾼다.
21. **글자가 얹히는 그림은 대비를 숫자로 잰다.** 눈으로는 괜찮아 보여도 안 읽히는 경우가 있다. 바탕과 글자색의 명암비가 4:1 아래면 바탕만 골라 밝힌다.
22. **작은 글씨는 색을 한 단계 더 내린다.** 종류 꼬리표가 모든 명판에서 2.4:1이었다. `#7a6850` → `#5f5140` 으로 3.7:1이 됐고, 짙은 글자 아래에 밝은 1px 양각을 깔면 중간 톤 판에서도 획이 뜬다.

### v7에서 추가된 규칙 (상태 아이콘 작업 중 재확인)

23. **문서를 새로 쓸 때 이 규칙표를 먼저 읽는다.** 상태 아이콘 프롬프트를 백지에서 쓰다가 규칙 3의
    금지 표현(`hand-painted texture with visible brush grain`)을 그대로 넣었다 — 잔디테일·가는 선을
    부르는 바로 그 문구다. 새 프롬프트 문서는 **공통 머리 블록을 복사해서 심볼 묘사만 갈아 끼운다.**
24. **아이콘 심볼 묘사에 "선"을 부르는 단어를 쓰지 않는다.** faint / thin / tendrils / hatching /
    engraved / intricate / wisps 는 전부 가는 선을 만든다. 대신 **덩어리 말**(thick, fat, solid,
    blocky, one big, chunky)로 쓰고 개수를 못 박는다(three big thorns, one thick drop).
25. **아이콘은 프레임 없이 심볼만 받는다.** 메달 테는 게임이 CSS·합성으로 씌운다. 프롬프트에
    `No circular frame, no border` 를 넣지 않으면 테가 이중으로 겹친다.

### 공통 머리 블록 (몬스터)

```
Stylized dark fairytale creature for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, keep it as simple and readable as the attached key art. NOT photorealistic, NOT 3D. Natural body proportions — do NOT give it an oversized head on a tiny body. Square 1:1 image. A single creature, FULL BODY from head to feet, facing slightly left, centered, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The creature FILLS the frame edge to edge — no wide props, no large background elements, no empty margin around it. Bold silhouette, readable at 96px. The creature: {묘사}. No text, no letters, no watermark.
```

- 정예 접미: `More imposing, subtle red accents.`
- 보스 접미: `A grand menacing boss, faint red aura.`
- 부유형(불꽃·유령·눈알)은 `FULL BODY from head to feet` → `FULL BODY, floating`
- 비인간형(덤불·촛불떼 등)은 비율 문구 생략 가능
- **피사체가 어두운 적갈색 계열이면** `very dark brown background` → `mid-grey background` (규칙 11)

---

## [2] 2막 몬스터 — 늪·안개숲·무덤 ✅ 완료 (재생성 시 참고)

12종 전량 완료. 아래는 재생성용 기록입니다.

| 이름 | id | 묘사 | 비고 |
|---|---|---|---|
| 늪두꺼비 | bog_toad | `a bloated bog toad with warty moss-green skin and a long drooping tongue` | |
| 모기떼 | mosquito_swarm | `a dense cloud of huge marsh mosquitoes forming a vague face` | floating |
| 안개 망령 | mist_wraith | `a wraith of pale fog with hollow eyes, its lower half trailing into mist` | floating |
| 창백한 사슴 | pale_stag | `an unnaturally pale white stag with too many antler points and blank eyes` | 뿔이 넓게 퍼지지 않게 — 위로 뻗게 |
| 해골 병사 | skeleton | `a leaning skeleton soldier in rusted scraps of armor with a notched sword` | |
| 무덤 벌레 | grave_worm | `a thick pale grave worm rearing up, a ringed round mouth, a little dark soil at its base` | 흙더미를 넓게 그리지 말 것 |
| 진흙 골렘 (정예) | mud_golem | `a hulking golem of black grave mud with a few bones and roots stuck in its body` | 규칙 11 적용 (mid-grey 배경) |
| 목 없는 기사 (정예) | headless_knight | `a headless knight on foot in tarnished armor holding a lance, pale mist where the head should be` | 창은 몸에 붙여 세로로 |
| 무덤지기 (정예) | grave_keeper | `a gaunt gravekeeper with a lantern and a long shovel, face hidden under a wide hat` | |

## [3] 3막 몬스터 — 꿈·언덕·교회 ✅ 완료 (재생성 시 참고)

| 이름 | id | 묘사 | 비고 |
|---|---|---|---|
| 악몽 토끼 | nightmare_hare | `a wrong-looking dream hare with spiral eyes and a stitched grin` | |
| 떠도는 눈 | floating_eye | `a single large floating eyeball with a keyhole-shaped iris and a tail of dream smoke` | floating |
| 꿈나방 | dream_moth | `a huge dusty moth with two sleeping human faces patterned on its wings` | 날개를 위로 세워 세로 구도로 |
| 속삭이는 폴립 | whisper_polyp | `a fleshy polyp cluster with a few small whispering mouths, faint eerie glow` | 규칙 11 적용 |
| 얼굴 없는 광신도 | faceless_cultist | `a standing cultist in dark robes whose hood holds only smooth blankness, holding a candle` | |
| 비명 지르는 돌 | screaming_stone | `a jagged standing stone with a screaming face split across it, a few cracks glowing faintly` | |
| 속 빈 사제 | hollow_priest | `a priest's robes standing upright with nothing inside, holding a staff` | |
| 성가대 유령 | choir_ghost | `three translucent choir ghosts sharing one flowing robe, mouths open in silent song` | floating |
| 촛불 떼 | candle_swarm | `a cluster of small living candle flames with faint faces, gathered into one tall shape` | |
| 모래 사나이 (정예) | sandman | `the Sandman — a tall figure of flowing sand in a nightcap, hourglass in hand, hollow eyes` | |
| 언덕의 촉수 (정예) | hill_tentacle | `a colossal tentacle with a few barnacles, rising straight upward, torn earth only at its base` | 언덕을 넓게 그리지 말 것 (규칙 12) |
| 종지기 (정예) | bell_ringer | `a hunched bell-ringer with a cracked bronze bell for a head, rope in hand` | |
| 자각몽의 왕 (보스) | lucid_king | `the king of lucid dreams — a regal figure whose crown and robes slowly melt and reform, a crescent-moon face` | |
| 벌어진 아가리 (보스) | the_maw | `a vast toothed maw — two concentric rings of teeth around a black throat, a few roots dangling in, seen from the front` | 규칙 11 적용 |
| 거짓 성인 (보스) | false_saint | `a false saint with a tilted golden halo, a serene mask slightly ajar showing darkness, four hands folded in prayer` | |
| 이름 없는 공포 (최종) | nameless_dread | `a sea of black tentacles beneath one colossal pale lidless eye, a tiny red hood reflected in the pupil. Grander than any boss, mostly darkness` | 규칙 11 적용 (거의 검정이라 필수) |

> 파일명은 코드 id와 일치해야 자동 연동됨 (`assets/enemies/{id}.png`)

---

## [4] 배경 — ⚠ 이 절은 낡았습니다

> 배경 프롬프트는 `docs/BG_PROMPTS.md`(12종, 톤 통일판)로 옮겼습니다. 아래는 초기 기록입니다.

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
| bg_final | `an endless black void, one colossal looming shadow made of slow tentacles with a single enormous pale eye, far above.` | ⬜ |
| bg_title | 별도 블록 — 아래 | ⬜ |

**중요**: 배경은 몬스터보다 도드라지면 안 됩니다. 씬 문장에 사람·생물을 넣지 말고, 아래쪽 절반은 반드시 어둠으로 떨어뜨립니다. 게임에서 위에 어두운 오버레이를 한 겹 더 얹습니다.

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

## [5] 족보 종이 — ✅ 완료, 이 절은 낡았습니다

> 종이와 아이콘을 하나로 합친 `docs/COMBO_PLATE_PROMPTS.md`(18종, v6)로 대체됐고 전량 적용됐습니다. 아래는 초기 기록입니다.

승인된 `paper_row` 틀에 변형별 문양을 얹습니다. **가독성 규칙: 문양은 오른쪽 끝에 작고 흐릿하게** (글자가 그 위에 얹힙니다). 등급 구분은 CSS 담당이므로 종이는 중립 톤으로.

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

**묶음 예시** (6장):
1. instinct / whisper / clasped_hands
2. red_shoes / twin_sisters / two_moons
3. triple_axe / woodsman_breath / four_fangs
4. heavy_blow / cottage / hearth
5. windpath / hunt_drive / moonpath
6. storm_run / judgment_night / blood_moon

---

## [6] 줄 UI 원형 아이콘 — ❌ 폐기

> 족보 판에 아이콘이 녹아들어가면서 필요가 없어졌습니다. 아래는 기록용입니다.

전투 족보 줄의 **왼쪽 원형 메달 아이콘**. 현재는 능력 아이콘으로 임시 대체 중이며, 리소스가 오면 자동 교체됩니다.

**규격 (필수)**
- **정사각 1:1**, 배경은 키잉용 단색
- 심볼이 **원 안에 들어가야 함** — 화면에서 지름 36px 원형으로 잘려 표시되므로 모서리에 중요한 요소 금지 (안전 영역 = 중앙 78%)
- **48px에서 읽히는 단일 심볼**, 배경 장식·테두리·원형 프레임 금지 (프레임은 게임이 그림)
- 채색은 **밝은 쪽으로** — 어두운 원형 바탕 위에 올라갑니다

**공통 템플릿** (한 장에 6종씩, 총 3장 권장):
```
Stylized dark fairytale icons for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Landscape 3:2 image. A 3x2 grid of six icons, equal cells, equal spacing, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. Each icon is a single symbol centered in its cell, filling about 75 percent of the cell, bright enough to read against a dark circular background, readable at 48px. No circular frame, no border, no background decoration. IN ORDER — {1} / {2} / {3} // {4} / {5} / {6}. No text, no letters, no watermark.
```

**문양은 [5] 족보 종이와 동일하게 사용합니다.** 한쪽을 뽑으면 다른 쪽으로 재활용 가능합니다.

파일: `assets/icons/combo_{variantId}.png`
연동: 파일을 올리면 `main.js`의 `COMBO_ICON_READY`에 id를 추가 → 임시 아이콘에서 자동 교체.

---

## [7] 유물 26종

**공통 템플릿**:
```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image. A single small relic item, centered, filling most of the frame, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. Subtle glow, readable at 48px. The item: {묘사}. No text, no letters, no watermark.
```

시트로 뽑으려면 6종씩 3x2 그리드([6] 템플릿의 그리드 문구 차용)로 5장 + 1장.

### 일반 유물 17종

| 이름 | id | 묘사 |
|---|---|---|
| 늑대 이빨 | wolf_fang | `a single yellowed wolf fang strung on a leather cord` |
| 빵부스러기 | breadcrumbs | `a small pile of torn bread crumbs on a scrap of cloth` |
| 붉은 실타래 | spool | `a wooden spool wound with deep red thread, one loose end trailing` |
| 따뜻한 우유 | warm_milk | `a chipped ceramic cup of warm milk with a faint wisp of steam` |
| 마른 장작 | firewood | `two split dry logs bound with twine` |
| 가죽 장갑 | leather_gloves | `a pair of worn brown leather work gloves` |
| 까마귀 깃털 | crow_feather | `a single glossy black crow feather` |
| 사냥꾼의 부적 | hunters_charm | `a small bone charm carved with a simple eye, hung on a cord` |
| 가계부 | ledger | `a thin worn ledger book with a frayed ribbon bookmark` |
| 이끼 나침반 | moss_compass | `a battered brass compass overgrown with green moss` |
| 은저울 | silver_scale | `a small tarnished silver balance scale` |
| 수지 양초 | tallow_candle | `a stubby yellow tallow candle with a steady small flame` |
| 오래된 뼈 | old_bone | `a short weathered animal bone with hairline cracks` |
| 유리병 속 반딧불 | glass_jar | `a corked glass jar holding three glowing fireflies` |
| 늑대 가죽 | wolf_pelt | `a folded grey wolf pelt with the head still attached` |
| 독사과 조각 | poison_apple | `a dark red apple with one bite taken, the flesh faintly green` |
| 꿀단지 | honey_pot | `a small clay honey pot with honey dripping down one side` |

### 정예 유물 9종 (`Subtle glow` → `A faint warm golden glow, slightly more ornate` 로 교체)

| 이름 | id | 묘사 |
|---|---|---|
| 붉은 망토 | red_cloak | `a small folded bright red hooded cloak` |
| 도토리 부적 | acorn_charm | `a golden acorn charm on a thin chain` |
| 문지기의 빗장 | gate_bar | `a heavy iron gate bar with a worn bronze bracket` |
| 네잎클로버 | clover | `a four-leaf clover pressed under a thin glass disc` |
| 은식칼 | silver_knife | `an ornate silver table knife with a bone handle` |
| 은탄환 | silver_bullet | `a single polished silver bullet standing upright` |
| 운명의 골무 | fate_thimble | `a silver thimble engraved with tiny stars` |
| 늑대달 목걸이 | wolfmoon_pendant | `a pendant of a full moon with a small wolf silhouette across it` |
| 할머니의 동화책 | grandma_book | `a small thick storybook with a cracked red leather cover and a brass clasp` |

파일: `assets/relics/{id}.png`

---

## [8] 앱 아이콘 (맨 마지막)

```
Stylized dark fairytale app icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, bold and readable at 48px. A red hood silhouette merged with a single ivory die showing five pips, on a near-black forest background, thin antique gold ring border. No text, no letters, no watermark.
```

---

## 완료된 리소스 (재생성용 참고)

### 몬스터 19종 ✅
1막 16종(들개·까마귀·도깨비불·숲거미·가시덤불·옹이 골렘·개울 정령·거머리·쥐떼·살아있는 빗자루·우두머리 들개·늙은 강꼬치·지하실의 무언가·늑대·다리 밑 트롤·낡은 곰인형) + 2막 보스 3종(늪의 왕·안개의 어머니·파묻힌 자).

주의: **다리 밑 트롤**은 어깨의 다리 판자가 화면을 먹어 본체가 작아 보였습니다(v0.69에서 크롭으로 보정). 재생성한다면 규칙 12를 적용해 판자를 작게 하거나 빼세요.

### 주사위 6면 시트 ✅ (13종)
공통 템플릿 + 재질 한 줄:
```
Flat hand-painted storybook illustration for a dark fairytale dice game. Gouache on paper, visible brush strokes, thick dark outlines, muted palette: near-black brown, deep blood red, antique gold, aged cream. NOT photorealistic, NOT a 3D render. Landscape 3:2 image. A sprite sheet: a 3x2 grid of six dice, equal size, equal spacing, identical framing, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The six dice show pip counts 1, 2, 3, 4, 5, 6 IN ORDER (top row: 1, 2, 3 — bottom row: 4, 5, 6). Count the pips carefully. Same painting style as the attached dice sheet. Every die is: {재질}
```
나무 `humble hand-carved warm brown wood with visible grain, dark ink pips.` / 금박 `covered in worn matte gold leaf with tiny painted sparkles.` / 저주 `blackened old bone with thin ember-red cracks, pips glowing ember-red.` / 송곳니 `carved from ivory-yellow wolf fang, pips shaped like small dark blood droplets.` / 밀짚 `woven from golden straw, pips are round dark brown straw knots.` / 잿불 `charcoal grey with faint warm ember glow in its cracks, pips glowing warm orange.` / 달빛 `pale blue crystal with a soft moonlight glow, pips deep midnight-blue.` / 가시덤불 `wrapped in thorny bramble vines with tiny red thorns, dark green pips.` / 납 `heavy dull grey lead with dents and scratches, black pips with pale chalk rims.` / 짝눈 `painted half aged-cream half slate-blue split diagonally.` / 홀눈 `painted half aged-cream half wine-red split diagonally.` / 높은 `covered in deep crimson royal velvet with gold embroidered trim, pips are round gold embroidered dots.` / 외눈 `pale bone tightly wound with a single thin bright red thread, pips are small red thread knots.`

> **높은 주사위 재생성 시 반드시 규칙 11 적용** — 진홍 벨벳이 어두운 배경과 겹쳐 눈 하나가 지워졌던 건이 있습니다. `mid-grey background`로 뽑으세요.

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
- 경로: 적 `assets/enemies/{id}.png` / NPC·사물 `assets/npc/{name}.png` / 주사위 `assets/dice/{skin}{face}.png` / 아이콘 `assets/icons/` / UI `assets/ui/` / 배경 `assets/bg/` / 유물 `assets/relics/{id}.png`
- 이미지 없는 항목은 이모지·기존 표시로 폴백 — 부분 적용 가능
- **키잉 방식 (v0.77 확정)**: 느슨하게 딴 뒤 구멍 메우기 + 최대 연결 성분 추출. 피사체 내부가 배경색과 비슷해도 형태로 복원됩니다. 붉은 보스 배광은 "붉은 기운만 오른 픽셀"을 배경으로 판정해 제거합니다.
- **여백 정규화**: 주사위는 가로 채움 87%, 몬스터는 알파 바운딩박스에 딱 맞게 크롭. 다른 자산과 크기가 어긋나지 않도록 자동 보정합니다.
- 자산은 팔레트 PNG로 최적화해 커밋 (배포 용량 관리)

## 배포 규칙

- **작업마다 배포하지 않는다.** 여러 건을 묶어 한 번만 배포
- 배포는 `gh-pages` 브랜치가 소스 — main에만 푸시하면 빌드가 아예 돌지 않습니다
- 배포본은 게임 실행 파일만 (`index.html manifest.json sw.js css js data assets .nojekyll`) — docs·test 제외
- 커밋 서명 금지 (`commit.gpgsign false`), 판마다 `sw.js` CACHE·`VERSION`·`index.html ?v=` 3곳 동시 증가
- 배포 후 검증: Pages API로 `status: built` 확인 → 라이브 파일 내용 확인
