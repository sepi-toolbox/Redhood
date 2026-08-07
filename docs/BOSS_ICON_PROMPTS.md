# REDHOOD 보스 낙서 아이콘 9종 (복사용)

지도의 보스 노드를 테마별로 다르게 표시하기 위한 아이콘입니다. **보스만 보고도 이번 판이 어느 구역인지 알 수 있게** 하는 게 목적입니다.

**규칙 8 적용** — 이건 완성 일러스트가 아니라 빨간망토가 자기 여정을 적은 낡은 수첩의 **잉크 낙서**입니다. gouache·painting 계열 문구를 쓰면 지도 위에서 혼자 튀어 다른 노드 아이콘과 안 맞습니다. 기존 노드 낙서 6종(전투·정예·휴식·만남·상점·보스)과 같은 결이어야 합니다.

**한 장에 6칸씩 뽑는 게 편합니다.** 아래 두 블록이 1막+2막 / 3막+예비입니다. 낱장으로 뽑고 싶으면 맨 아래 단품 템플릿을 쓰세요.

**참고 이미지로 기존 `doodle_boss.png`(늑대 머리)를 첨부**하면 선 굵기와 붉은 강조 양이 맞습니다.

---

## 시트 1 — 1막·2막 보스 6종

```
Rough hand-drawn map doodle icons for REDHOOD. Muted palette: dark sepia brown ink on parchment, deep blood red accents. NOT photorealistic, NOT 3D, NOT finished painted illustrations, no gouache shading. Landscape 3:2. A 3x2 grid of six doodle icons on one plain flat very dark brown background. Each icon is a scratchy quill-ink doodle, as if a little girl sketched her own journey in a worn journal — wobbly uneven lines, childlike shapes, no circular frames, each with exactly one tiny accent of deep blood red ink. Each doodle is a simple head or silhouette, bold and readable at 42px, filling its cell. IN ORDER — a snarling wolf head with pricked ears / a lumpy troll head under a broken bridge plank / a teddy bear head with one button eye dangling // a crowned crocodile head with a rotten wooden crown / a faceless motherly head made of swirling fog with two dot eyes / a wrapped revenant head crowned with soil and roots. No text, no letters, no watermark.
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

## 시트 2 — 3막 보스 3종 (3칸만 채우고 나머지는 비워도 됨)

```
Rough hand-drawn map doodle icons for REDHOOD. Muted palette: dark sepia brown ink on parchment, deep blood red accents. NOT photorealistic, NOT 3D, NOT finished painted illustrations, no gouache shading. Landscape 3:2. A 1x3 row of three doodle icons on one plain flat very dark brown background, equal cells, equal spacing. Each icon is a scratchy quill-ink doodle, as if a little girl sketched her own journey in a worn journal — wobbly uneven lines, childlike shapes, no circular frames, each with exactly one tiny accent of deep blood red ink. Each doodle is a simple head or silhouette, bold and readable at 42px, filling its cell. IN ORDER — a melting crowned head with a crescent moon for a face / a round pit ringed with jagged teeth seen head-on / a serene masked head with a tilted halo above it. No text, no letters, no watermark.
```

| 순서 | 파일명 | 보스 | 구역 |
|---|---|---|---|
| 1 | `doodle_boss_lucid_king` | 자각몽의 왕 | 3막 · 꿈속 |
| 2 | `doodle_boss_the_maw` | 벌어진 아가리 | 3막 · 비명 지르는 언덕 |
| 3 | `doodle_boss_false_saint` | 거짓 성인 | 3막 · 사람 없는 교회 |

---

## 단품 템플릿 (하나씩 다시 뽑을 때)

```
A rough hand-drawn map doodle icon for REDHOOD. Muted palette: dark sepia brown ink on parchment, one tiny accent of deep blood red ink. NOT photorealistic, NOT 3D, NOT a finished painted illustration, no gouache shading. Square 1:1 image. A single scratchy quill-ink doodle centered on one plain flat very dark brown background — wobbly uneven lines, childlike shapes, no circular frame, no border. Bold and readable at 42px, filling most of the frame. The doodle: {묘사}. No text, no letters, no watermark.
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
| 벌어진 아가리 | `a round pit ringed with jagged teeth, seen head-on` |
| 거짓 성인 | `a serene masked head with a tilted halo floating above it` |

---

## 연동

파일: `assets/icons/doodle_boss_{bossId}.png`

올려주시면 `main.js`의 `BOSS_ICON_READY`에 id를 추가합니다. 등록 안 된 보스는 기존 공용 보스 낙서(늑대 머리)로 표시되므로 **한두 개만 먼저 올려도 됩니다.**

기존 `doodle_boss.png`는 1막 늑대와 그림이 겹치니, `doodle_boss_wolf`가 준비되면 공용 폴백은 그대로 두고 늑대만 전용으로 교체하면 됩니다.
