# REDHOOD 보스 낙서 아이콘 9종 (복사용 · 재생성판)

> **1차분은 폐기.** 프롬프트는 기존 노드 6종과 같은 걸 썼는데, 결과가 **가는 해칭 선화**로 나와서
> 지도의 다른 아이콘(굵은 획·넓은 색면)과 전혀 다른 물건이 됐다. 붙이는 쪽에서 손볼 수 있는
> 문제가 아니었다 — **다시 뽑는 게 맞다.**

## 반드시 첨부할 것

**`node_ref.png`** (기존 노드 낙서 6종을 한 장에 모은 것 — 이 문서와 함께 보냈다).
말로 설명하는 것보다 이 한 장이 정확하다. 여기 6개와 **같은 물건으로 보여야** 한다.

## 1차분이 어긋난 지점 (프롬프트에 반영됨)

| | 기존 6종 (맞음) | 1차 보스 9종 (틀림) |
|---|---|---|
| 획 | 굵고 뭉툭하다 | 가늘고 잘다 |
| 채움 | **넓은 크림색 색면**으로 꽉 찬다 | 속이 비고 해칭으로 명암을 낸다 |
| 외곽선 | **굵은 검은 테**가 있다 | 없다 |
| 밀도 | 낮다 — 42px에서 읽힌다 | 높다 — 42px에서 뭉갠다 |
| 잉크 색 | 밝은 크림 `#f2b862` | 칙칙한 회갈 `(143,118,86)` |

마지막 줄이 특히 컸다. 잉크가 지도 양피지와 명도가 같아서 얹으면 사라졌다.

---

## 시트 1 — 1막·2막 보스 6종

```
Rough hand-drawn map doodle icons for REDHOOD, in the EXACT same style as the attached reference sheet — match its stroke weight, its fill treatment and its palette. Landscape 3:2. A 3x2 grid of six doodle icons on one plain flat very dark brown background. Each icon is a quill-ink doodle as if a little girl sketched it in a worn journal: THICK BLUNT wobbly strokes, LARGE FLAT PALE-CREAM filled shapes, a HEAVY BLACK OUTLINE around the whole silhouette, and exactly one tiny accent of deep blood red. LOW detail density — NO fine hatching, NO cross-hatching, NO engraving lines, NO pencil shading, NO grey midtones. The cream fill must be BRIGHT, much lighter than parchment. Simple childlike shapes, bold silhouette, must stay readable at 42px. Each icon is a head or a simple object filling its own cell, no circular frames, no borders. IN ORDER — a snarling wolf head with pricked ears / a lumpy troll head under a broken bridge plank / a teddy bear head with one button eye dangling // a crowned crocodile head with a rotten wooden crown / a faceless motherly head made of swirling fog with two dot eyes / a wrapped revenant head crowned with soil and roots. NOT photorealistic, NOT 3D, NOT a finished painted illustration, no gouache shading. No text, no letters, no watermark.
```

| 순서 | 파일명 | 보스 | 구역 |
|---|---|---|---|
| 1 | `doodle_boss_wolf` | 늑대 | 1막 · 깊은 숲 |
| 2 | `doodle_boss_river_hag` | 다리 밑 트롤 | 1막 · 차가운 개울 |
| 3 | `doodle_boss_old_teddy` | 낡은 곰인형 | 1막 · 빈 오두막 |
| 4 | `doodle_boss_swamp_king` | 늪의 왕 | 2막 · 가라앉는 늪지 |
| 5 | `doodle_boss_fog_mother` | 안개의 어머니 | 2막 · 안개 낀 숲 |
| 6 | `doodle_boss_the_buried` | 파묻힌 자 | 2막 · 이름 없는 무덤가 |

---

## 시트 2 — 3막 보스 3종

```
Rough hand-drawn map doodle icons for REDHOOD, in the EXACT same style as the attached reference sheet — match its stroke weight, its fill treatment and its palette. Landscape 3:2. A 1x3 row of three doodle icons on one plain flat very dark brown background, equal cells, equal spacing. Each icon is a quill-ink doodle as if a little girl sketched it in a worn journal: THICK BLUNT wobbly strokes, LARGE FLAT PALE-CREAM filled shapes, a HEAVY BLACK OUTLINE around the whole silhouette, and exactly one tiny accent of deep blood red. LOW detail density — NO fine hatching, NO cross-hatching, NO engraving lines, NO pencil shading, NO grey midtones. The cream fill must be BRIGHT, much lighter than parchment. Simple childlike shapes, bold silhouette, must stay readable at 42px. Each icon fills its own cell, no circular frames, no borders. IN ORDER — a melting crowned head with a crescent moon for a face / a round pit ringed with jagged teeth seen head-on / a serene masked head with a tilted halo above it. NOT photorealistic, NOT 3D, NOT a finished painted illustration, no gouache shading. No text, no letters, no watermark.
```

| 순서 | 파일명 | 보스 | 구역 |
|---|---|---|---|
| 1 | `doodle_boss_lucid_king` | 자각몽의 왕 | 3막 · 꿈속 |
| 2 | `doodle_boss_the_maw` | 벌어진 아가리 | 3막 · 비명 지르는 언덕 |
| 3 | `doodle_boss_false_saint` | 거짓 성인 | 3막 · 사람 없는 교회 |

---

## 단품 템플릿 (하나씩 다시 뽑을 때)

```
A rough hand-drawn map doodle icon for REDHOOD, in the EXACT same style as the attached reference sheet — match its stroke weight, its fill treatment and its palette. Square 1:1 image. A single quill-ink doodle centered on one plain flat very dark brown background: THICK BLUNT wobbly strokes, LARGE FLAT PALE-CREAM filled shapes, a HEAVY BLACK OUTLINE around the whole silhouette, and exactly one tiny accent of deep blood red. LOW detail density — NO fine hatching, NO cross-hatching, NO engraving lines, NO pencil shading, NO grey midtones. The cream fill must be BRIGHT, much lighter than parchment. Simple childlike shape, bold silhouette, readable at 42px, filling most of the frame, no circular frame, no border. The doodle: {묘사}. NOT photorealistic, NOT 3D, NOT a finished painted illustration, no gouache shading. No text, no letters, no watermark.
```

| 보스 | 묘사 |
|---|---|
| 늑대 | `a snarling wolf head with pricked ears` |
| 다리 밑 트롤 | `a lumpy troll head under a broken bridge plank` |
| 낡은 곰인형 | `a teddy bear head with one button eye dangling by a thread` |
| 늪의 왕 | `a crowned crocodile head wearing a rotten wooden crown` |
| 안개의 어머니 | `a faceless motherly head made of swirling fog with two dot eyes` |
| 파묻힌 자 | `a wrapped revenant head crowned with soil and roots` |
| 자각몽의 왕 | `a melting crowned head with a crescent moon for a face` |
| 벌어진 아가리 | `a round pit ringed with jagged teeth seen head-on` |
| 거짓 성인 | `a serene masked head with a tilted halo above it` |

---

## 받은 뒤

시트째 올려주면 칸 나누고 배경 빼서 `assets/icons/doodle_boss_{id}.png` 로 넣는다.
**색은 절대 안 건드린다** — 뽑힌 그대로 쓴다. 이번처럼 색이 안 맞으면 붙이는 쪽이 아니라
프롬프트로 다시 잡는다.
