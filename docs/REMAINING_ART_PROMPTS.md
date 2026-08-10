# 남은 리소스 프롬프트 (복사용 · v3.15 기준)

상태이상 계열은 전부 끝났다. 남은 건 아래 넷이다.

| # | 대상 | 수량 | 첨부할 키아트 |
|---|---|---|---|
| 1 | **유물** | 32 | `keyart_stilllife` |
| 2 | **보물상자** | 3 | `keyart_stilllife` |
| 3 | **앱 아이콘** | 1 | `keyart_stilllife` |
| 4 | 감정 카드 (카드판 · 잠자는 중) | 6 | `keyart_redhood` |

키아트 원본은 `docs/keyart/`에 있다. **프롬프트를 복사할 때 그 계열 키아트를 반드시 같이 첨부한다** —
안 붙이면 화풍이 매번 다르게 나온다.

> 아래 1~3번 프롬프트는 예전에 확정해 둔 문구 그대로다. 새로 추가된 유물 6종만 내가 묘사를 써서 끼워 넣었고,
> 머리 블록과 기존 26종 묘사는 한 글자도 건드리지 않았다.

---

# 1. 유물 32종

**공통 머리 블록** (일반 20종용):

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image. A single small relic item, centered, filling most of the frame, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. Subtle glow, readable at 48px. The item: {묘사}. No text, no letters, no watermark.
```

**정예 12종은 위 블록에서 `Subtle glow` 한 마디만 바꾼다:**

```
A faint warm golden glow, slightly more ornate
```

## 일반 유물 20종

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
| **숫돌** ＋추가 | whetstone | `a flat grey whetstone worn into a shallow groove, a few orange sparks flicking off its edge` |
| **사냥꾼의 눈** ＋추가 | hunters_eye | `a brass monocle on a short chain, one amber lens catching a spark of light` |
| **길표** ＋추가 | waymark | `a weathered wooden signpost arrow nailed to a short stake, one painted red mark across it` |

## 정예 유물 12종

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
| **곰의 등** ＋추가 | bears_back | `a thick shaggy bear-hide mantle with the shoulder fur raised, closed by two iron clasps` |
| **말라붙은 심장** ＋추가 | dried_heart | `a shriveled blackened heart pierced by one iron nail, dry and cracked` |
| **거머리 반지** ＋추가 | leech_ring | `a dark silver ring shaped like a coiled leech biting its own tail, one red bead for its mouth` |

**시트로 뽑을 때**는 위 머리 블록에서 `Square 1:1 image. A single small relic item, centered, filling most of the frame,`
부분을 아래로 바꾸고 `IN ORDER — {묘사1} / {묘사2} / {묘사3} // {묘사4} / {묘사5} / {묘사6}` 를 이어 붙인다.
(`//` 는 줄바꿈 자리다.)

```
Landscape 3:2 image. A 3x2 grid of six relic items, equal size, equal spacing, identical framing, each centered in its own cell,
```

일반 20종 = 6+6+6+2, 정예 12종 = 6+6. 총 6장이면 끝난다.

파일: `assets/relics/{id}.png`

> **지금 유물은 아직 이모지로 뜬다.** (`🦷`, `🍞` …) 유물 아트가 들어오면 상태이상 때처럼
> `RELIC_ART_READY` 를 두고 자동 교체하도록 붙이겠다 — 올려만 주면 된다.

---

# 2. 보물상자 3종

전투에서 이기면 몬스터가 있던 **바로 그 자리에 같은 크기로** 상자가 떨어진다. 일반 216px · 정예 234px ·
보스 254px. 그래서 상자는 소품이 아니라 **화면 중앙을 차지하는 주인공**으로 그려져야 한다.
연동 코드는 v0.87에 이미 들어가 있어서 세 장 올리면 플래그 하나로 켜진다.

## 2-1. 기본 상자 — `chest_normal`

```
Stylized dark fairytale object for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Square 1:1 image. A single closed treasure chest seen from the front at a slight angle, centered, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The chest FILLS the frame edge to edge — no ground, no shadow pool, no background elements, no empty margin around it. Bold silhouette, readable at 96px. The chest: a humble old wooden crate-chest with a rounded lid, worn grey-brown planks, two plain dark iron bands and a simple iron latch, one plank slightly split. Nothing shiny, no gold, no glow. No text, no letters, no watermark.
```

## 2-2. 좋은 상자 — `chest_rare`

```
Stylized dark fairytale object for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Square 1:1 image. A single closed treasure chest seen from the front at a slight angle, centered, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The chest FILLS the frame edge to edge — no ground, no shadow pool, no background elements, no empty margin around it. Bold silhouette, readable at 96px. The chest: a finer dark-wood chest with a domed lid, antique gold corner fittings and a heavy gold clasp shaped like a small wolf head, a deep blood-red velvet strip across the lid, thin warm light leaking out from the seam of the closed lid. Richer than an ordinary crate but still worn and old. No text, no letters, no watermark.
```

## 2-3. 열린 빈 상자 — `chest_open`

*두 등급 공용으로 하나만 쓴다. 전리품을 다 가져가면 이걸로 바뀐다.*

```
Stylized dark fairytale object for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Square 1:1 image. A single open and empty treasure chest seen from the front at a slight angle, centered, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The chest FILLS the frame edge to edge — no ground, no shadow pool, no background elements, no empty margin around it. Bold silhouette, readable at 96px. The chest: an old wooden chest with its lid swung fully open and tilted back, the inside hollow and dark with a worn dull-red cloth lining, nothing inside it, the latch hanging loose. Emptied and quiet. No text, no letters, no watermark.
```

파일: `assets/ui/chest_normal.png` / `chest_rare.png` / `chest_open.png`

---

# 3. 앱 아이콘 1종

```
Stylized dark fairytale app icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LOW detail density. NOT photorealistic, NOT 3D. Square 1:1 image, bold and readable at 48px. A red hood silhouette merged with a single ivory die showing five pips, on a near-black forest background, thin antique gold ring border. No text, no letters, no watermark.
```

파일: `assets/icon-192.png` · `assets/icon-512.png` (한 장 주면 두 크기로 내가 굽는다)

---

# 4. 감정 카드 6종 (카드판 · 급하지 않음)

카드판은 지금 잠자는 중이라 마지막이다. 프롬프트는 `docs/CARD_PROMPTS.md`에 그대로 있다.
족보판을 마무리한 다음에 손대면 된다.

---

# 붙이는 법

전부 **한 장씩 대화에 올리고 이름 한 마디**만 붙여주면 내가 키잉·크기 맞춤·연동까지 한다.
시트로 뽑았으면 시트째 올려도 된다 — 칸 나누는 건 내가 한다.

배경은 **평평한 단색**이기만 하면 어두운 갈색이든 회색이든 상관없다. 다만 **그림이 네 귀퉁이를
물고 있으면** 귀퉁이를 배경으로 오해해서 키잉이 통째로 실패하니, 유물·상자처럼 가운데에 놓이는
것들은 지금 문구대로 **여백 있는 단색 배경**으로 뽑는 게 안전하다.
