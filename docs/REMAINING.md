# REDHOOD 남은 리소스 — 한 장 정리

> 기준: **v0.99** · 2026-08-08. 이 문서 하나만 열어놓고 순서대로 복사하면 됩니다.
> 프롬프트를 전부 안에 넣었습니다. 항목별 배경 설명은 각 전용 문서에 있습니다.

## 남은 것 여섯 덩어리

| 순서 | 항목 | 수량 | 저장 위치 | 왜 이 순서인가 |
|---|---|---|---|---|
| 1 | 보물상자 | 3장 | `assets/ui/chest_*.png` | 전투가 끝날 때마다 매번 보인다. 코드는 v0.87에 이미 들어가 있어 플래그 하나만 켜면 된다 |
| 2 | 보스 낙서 | 9개 | `assets/icons/doodle_boss_*.png` | 지도에서 이번 판이 어느 구역인지 알려준다. 한두 개만 올려도 그것만 바뀐다 |
| 3 | 유물 | 26개 | `assets/relics/*.png` | 수가 많지만 48px로 작게 나온다. 6개씩 시트로 묶으면 다섯 장이면 끝난다 |
| 4 | 앱 아이콘 | 1장 | `assets/icon-192.png` `icon-512.png` | 다른 게 다 정해진 뒤에 뽑는 게 맞다 |
| 5 | 타이틀 곡 | 1곡 | `assets/bgm/bgm_title.*` | 지금 로비에서 지도 음악이 대신 나오고 있다 |
| 6 | 효과음 | 3개 | `assets/sfx/sting_*.*` | 승리·패배·유물. 재생 코드는 아직 없다 |

**이미 끝난 것**: 몬스터 44종 · 족보 판 18종 · 배경 12종 · 배경음 20곡 · 주사위 13종 · UI 아이콘 26종 · 지도 낙서 6종 · NPC·사물 12종 · UI 텍스쳐·프레임 11종 · 타이틀 로고.

---

## 뽑기 전에 — 실패에서 확인된 규칙 일곱 가지

**하나, 그림에는 글자를 넣지 않습니다.** 이름·수치는 전부 게임이 실시간으로 얹는 텍스트입니다. 그림에 구워 넣으면 나중에 번역을 못 합니다. 모든 프롬프트 끝에 `No text, no letters, no numbers, no watermark` 가 들어 있습니다.

**둘, 피사체가 어두우면 배경을 회색으로 지정합니다.** 배경 제거는 색 거리로 판정하기 때문에, 어두운 적갈색 피사체를 어두운 갈색 배경 위에 그리면 피사체 일부가 같이 지워집니다. 실제로 높은 주사위의 6번 눈 하나가 통째로 날아간 적이 있습니다. 어두운 물건은 `on one plain flat mid-grey background` 로 바꿔서 뽑으세요. 이번 남은 것 중에서는 **기본 보물상자**와 **까마귀 깃털·오래된 뼈** 같은 어두운 유물이 여기 해당합니다.

**셋, 피사체가 프레임을 꽉 채워야 합니다.** 넓은 소품을 넣으면 본체가 작아 보입니다. 트롤에게 다리 판자를 들려줬더니 판자가 그림 폭의 절반을 먹어 트롤이 다른 몬스터보다 작아 보였습니다. 상자와 유물 템플릿에 같은 문구가 들어가 있습니다.

**넷, 좌우 거울 대칭을 강제하지 않습니다.** 입체가 있는 물체를 거울로 뒤집으면 실재할 수 없는 형태가 나옵니다. 통나무 양 끝에 절단면이 동시에 보이던 사고가 그것이었습니다.

**다섯, 낙서 계열에는 gouache·painting 문구를 쓰지 않습니다.** 그 단어가 들어가면 완성 일러스트로 끌려가서 지도 위에서 혼자 튑니다. 팔레트와 무드만 남기고 `scratchy quill-ink doodle` 을 씁니다. **보스 낙서 9종이 여기 해당합니다.**

**여섯, 밝기는 눈이 아니라 숫자로 봅니다.** 배경 12종을 넣으며 정착시킨 방식입니다. 화면에 보이는 구간의 평균 밝기를 재서 기준값과 비교하고, 벗어나면 감마로 맞춥니다. 안개 낀 숲이 기준의 6배로 들어와 감마 2.85로 내렸습니다. **그러니 밝기는 신경 쓰지 말고 뽑으세요. 받아서 제가 맞춥니다.**

**일곱, 한 번에 다 안 주셔도 됩니다.** 모든 자산이 "없으면 기존 것으로 대체"되게 짜여 있습니다. 상자 한 장, 보스 낙서 하나만 올려도 그것만 바뀌고 나머지는 그대로 굴러갑니다.

---

# 1. 보물상자 3장

**규격**: 정사각 1:1, 배경 제거용 단색 배경. **키아트 `keyart_stilllife` 첨부.**

몬스터가 쓰러진 **바로 그 자리에 같은 크기로** 떨어집니다. 일반 216px · 정예 234px · 보스 254px로 격에 맞춰 커집니다. 작고 귀여운 소품이 아니라 화면 중앙을 차지하는 주인공으로 그려야 합니다.

일반 전투는 기본 상자, 정예와 보스는 좋은 상자가 나옵니다. 전리품을 다 가져가면 열린 상자로 바뀝니다.

### 기본 상자 — `chest_normal`

*평범한 전리품. 소박하고 낡은 나무 궤짝. 화려하면 안 된다. — 어두운 물건이라 규칙 둘을 적용해 `mid-grey background`로 뽑는 편이 안전하다.*

```
Stylized dark fairytale object for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Square 1:1 image. A single closed treasure chest seen from the front at a slight angle, centered, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The chest FILLS the frame edge to edge — no ground, no shadow pool, no background elements, no empty margin around it. Bold silhouette, readable at 96px. The chest: a humble old wooden crate-chest with a rounded lid, worn grey-brown planks, two plain dark iron bands and a simple iron latch, one plank slightly split. Nothing shiny, no gold, no glow. No text, no letters, no watermark.
```

### 좋은 상자 — `chest_rare`

*한눈에 다르다고 읽히되, 몬스터보다 튀면 안 되니 발광은 은은하게.*

```
Stylized dark fairytale object for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Square 1:1 image. A single closed treasure chest seen from the front at a slight angle, centered, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The chest FILLS the frame edge to edge — no ground, no shadow pool, no background elements, no empty margin around it. Bold silhouette, readable at 96px. The chest: a finer dark-wood chest with a domed lid, antique gold corner fittings and a heavy gold clasp shaped like a small wolf head, a deep blood-red velvet strip across the lid, thin warm light leaking out from the seam of the closed lid. Richer than an ordinary crate but still worn and old. No text, no letters, no watermark.
```

### 열린 빈 상자 — `chest_open`

*전리품을 다 가져간 뒤. 두 등급 공용으로 하나만 쓴다.*

```
Stylized dark fairytale object for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Square 1:1 image. A single open and empty treasure chest seen from the front at a slight angle, centered, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The chest FILLS the frame edge to edge — no ground, no shadow pool, no background elements, no empty margin around it. Bold silhouette, readable at 96px. The chest: an old wooden chest with its lid swung fully open and tilted back, the inside hollow and dark with a worn dull-red cloth lining, nothing inside it, the latch hanging loose. Emptied and quiet. No text, no letters, no watermark.
```

---

# 2. 보스 낙서 아이콘 9개

기존 `doodle_boss.png`(늑대 머리)를 **참조로 첨부**하면 선 굵기와 붉은 강조 양이 맞습니다. 완성 일러스트가 아니라 빨간망토가 자기 여정을 적은 낡은 수첩의 잉크 낙서입니다.

### 시트 1 — 1막·2막 보스 6종 (3×2)

```
Rough hand-drawn map doodle icons for REDHOOD. Muted palette: dark sepia brown ink on parchment, deep blood red accents. NOT photorealistic, NOT 3D, NOT finished painted illustrations, no gouache shading. Landscape 3:2. A 3x2 grid of six doodle icons on one plain flat very dark brown background. Each icon is a scratchy quill-ink doodle, as if a little girl sketched her own journey in a worn journal — wobbly uneven lines, childlike shapes, no circular frames, each with exactly one tiny accent of deep blood red ink. Each doodle is a simple head or silhouette, bold and readable at 42px, filling its cell. IN ORDER — a snarling wolf head with pricked ears / a lumpy troll head under a broken bridge plank / a teddy bear head with one button eye dangling // a crowned crocodile head with a rotten wooden crown / a faceless motherly head made of swirling fog with two dot eyes / a wrapped revenant head crowned with soil and roots. No text, no letters, no watermark.
```

순서: `doodle_boss_wolf` → `river_hag` → `old_teddy` → `swamp_king` → `fog_mother` → `the_buried`

### 시트 2 — 3막 보스 3종 (1×3)

```
Rough hand-drawn map doodle icons for REDHOOD. Muted palette: dark sepia brown ink on parchment, deep blood red accents. NOT photorealistic, NOT 3D, NOT finished painted illustrations, no gouache shading. Landscape 3:2. A 1x3 row of three doodle icons on one plain flat very dark brown background, equal cells, equal spacing. Each icon is a scratchy quill-ink doodle, as if a little girl sketched her own journey in a worn journal — wobbly uneven lines, childlike shapes, no circular frames, each with exactly one tiny accent of deep blood red ink. Each doodle is a simple head or silhouette, bold and readable at 42px, filling its cell. IN ORDER — a melting crowned head with a crescent moon for a face / a round pit ringed with jagged teeth seen head-on / a serene masked head with a tilted halo above it. No text, no letters, no watermark.
```

순서: `doodle_boss_lucid_king` → `the_maw` → `false_saint`

### 하나씩 다시 뽑을 때

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

---

# 3. 유물 26개

가방과 보상 목록에서 **48px**로 작게 나옵니다. 디테일보다 실루엣과 색 하나가 전부입니다.

6종씩 3×2 시트로 묶으면 다섯 장이면 끝납니다. 시트로 뽑으려면 아래 템플릿의 `Square 1:1 image. A single small relic item, centered` 부분을 `Landscape 3:2 image. A 3x2 grid of six relic items, equal size, equal spacing, identical framing` 으로 바꾸고 `The items IN ORDER — {1} / {2} / {3} // {4} / {5} / {6}` 로 이어 붙이세요.

**공통 템플릿**

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image. A single small relic item, centered, filling most of the frame, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. Subtle glow, readable at 48px. The item: {묘사}. No text, no letters, no watermark.
```

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

# 4. 앱 아이콘

홈 화면에 설치했을 때 쓰입니다. 아주 작게 보이므로 요소는 두 개까지만.

```
Stylized dark fairytale app icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, bold and readable at 48px. A red hood silhouette merged with a single ivory die showing five pips, on a near-black forest background, thin antique gold ring border. No text, no letters, no watermark.
```

한 장만 주시면 192·512 두 크기로 잘라 `manifest.json`에 연결합니다.

---

# 5. 타이틀 곡 — `bgm_title`

*로비. 게임을 켜자마자 나오는 첫인상. 최종전에서 이 선율이 부서진 형태로 다시 나옵니다.*

지금은 파일이 없어서 로비에서 지도 음악이 대신 나오고 있습니다.

```
Dark fairytale music box lullaby, instrumental, no vocals. Sparse and haunting: a slightly out-of-tune music box carrying a simple minor melody, answered by a lone cello and a distant creaking wooden sound. Slow, around 62 BPM, minor key, lots of silence between phrases. Old and lonely, like a nursery rhyme remembered wrong. Low fidelity, close and intimate, no big orchestra, no percussion. Seamless loop, no fade in, no fade out. 75 seconds.
```

---

# 6. 효과음 3개

루프가 아닙니다. 짧게, 잔향 없이. 재생 코드는 아직 없고 파일이 오면 함께 붙이겠습니다.

### 승리 — `sting_victory`

```
Short dark fairytale victory sting, instrumental, no vocals. Three rising notes on a music box answered by a single warm cello note and a soft bell. Minor key resolving to major. Relieved rather than triumphant. Dry, close, no reverb tail beyond one second. 3 seconds, no loop.
```

### 패배 — `sting_defeat`

```
Short dark fairytale defeat sting, instrumental, no vocals. A music box winding down and stopping mid-phrase, one low detuned cello note fading, a single distant bell. Minor key, unresolved. Quiet and final, not dramatic. 4 seconds, no loop.
```

### 유물 획득 — `sting_relic`

```
Short dark fairytale treasure sting, instrumental, no vocals. A soft golden shimmer of small bells and a plucked harp arpeggio rising, one warm sustained string note underneath. Bright but muted, old gold rather than sparkle. 2 seconds, no loop.
```

---

## 올려주시면 제가 하는 일

그림은 배경을 파내고, 크기를 맞추고, 색을 256으로 줄이고, 밝기를 재서 다른 자산과 맞추고, 서비스 워커 캐시 목록에 넣고, 코드의 등록 표에 id를 추가합니다.

음악은 뒤쪽 페이드를 잘라내고 앞뒤를 2.5초 등파워로 겹쳐 이음매 없는 루프로 만든 뒤 OGG와 MP3 두 벌로 인코딩합니다. 효과음은 루프가 아니므로 그대로 씁니다.

그 다음 판 번호를 올리고, 시험을 돌리고, 배포하고, 빌드까지 확인합니다.
