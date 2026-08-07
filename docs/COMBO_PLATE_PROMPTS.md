# REDHOOD 족보 판 18종 (복사용) — v3

양피지 띠와 원형 아이콘을 **하나의 판**으로 합친 변형별 전용 그림입니다. 판 자체가 그 족보의 컨셉과 등급을 말합니다.

> ## ⚠ 그림에는 글자가 단 하나도 들어가지 않습니다
>
> 족보 이름·종류·피해 숫자는 **게임이 그림 위에 실시간으로 그리는 텍스트**입니다. 그림에 구워 넣는 게 아닙니다.
> 그래서 나중에 영어판·일본어판을 만들어도 **그림은 그대로 두고 글자만 바꾸면 됩니다.**
>
> 모든 프롬프트 끝에 `No text, no letters, no numbers, no watermark` 가 들어 있고,
> 가운데를 비우라고 못박은 것도 **글자가 올라갈 자리를 남기기 위해서**입니다.
> 생성 결과에 글자 비슷한 게 조금이라도 있으면 그 장은 버리고 다시 뽑으세요.

예를 들어 **나무꾼의 호흡**은 양피지 대신 통나무가 판이 됩니다. 양 끝에 나이테가 보이는 절단면이 있고 가운데는 매끈한 나무껍질입니다.

**v2 변경**: 글자색으로 등급을 구분하던 걸 없앴습니다. 이제 **판 자체가 등급을 말합니다.** 게임이 얹는 글자는 어떤 판 위에서도 같은 짙은 갈색 하나입니다.

**v3 변경 — 등급 차이를 굵기로 바꿨습니다.** v2에서 언커먼을 "얇은 쇠 테두리"로 잡았는데, 실제 화면에서 줄 하나는 **362×45픽셀**입니다. 이 크기에서 얇은 선은 1픽셀도 안 되게 뭉개져서 커먼과 구분이 안 됩니다. 작은 크기에서 살아남는 건 세 가지뿐입니다 — **띠의 굵기, 양 끝의 실루엣, 발광.** 그래서 등급 사다리를 이렇게 다시 잡았습니다.

| 등급 | 위아래 띠 | 양 끝 | 발광 |
|---|---|---|---|
| 커먼 | **없음** (재질이 그냥 끝남) | 재질 그대로 | 없음 |
| 언커먼 | 검은 쇠, 판 높이의 **1/5** | 쇠로 감싸고 굵은 리벳 3개 | 없음 |
| 레어 | 금, 판 높이의 **1/5** + 각인 홈 | 금 세공 장식, 쇠보다 크고 화려 | 양 끝에서 은은하게 |
| 전설 | 금, 판 높이의 **1/4** + 세공 + 붉은 보석 상감 | 금 세공이 터져나오듯, 띠 안쪽까지 번짐 | 양 끝에서 강하게, 금 전체에 옅게 |

굵기 상한이 있습니다. 9-슬라이스가 위아래 **26%**를 안 늘어나는 구역으로 잡고 있어서, 띠가 그보다 두꺼우면 늘어날 때 무늬가 뭉개집니다. 전설의 1/4(25%)이 딱 한계선이고 그 이상은 안 됩니다.

**키아트 `keyart_stilllife`를 첨부**하세요.

---

## 규격 — 이것만은 반드시

게임이 이 그림을 **9-슬라이스로 늘려서** 씁니다. 기기 폭에 따라 줄 길이가 달라지는데, 양 끝은 그대로 두고 **가운데만 좌우로 늘어납니다.** 위아래 테두리는 길이 방향으로 이어집니다. 그래서 네 가지가 필수입니다.

**하나, 비율은 800:212 (약 3.8:1)입니다.** 기존 종이 띠와 같은 규격이라 그림만 갈아끼우면 바로 붙습니다.

**둘, 판이 화면을 가장자리까지 꽉 채워야 합니다.** 주변 여백이나 그림자, 액자가 있으면 안 됩니다.

**셋, 가운데는 완전히 비어 있어야 합니다.** 게임이 그 자리에 글자를 그리기 때문입니다. 무늬를 가운데 넣으면 이름과 겹쳐서 못 읽습니다.

**넷, 가운데는 반드시 밝거나 중간 톤이어야 합니다.** 게임이 얹는 글자색이 짙은 갈색으로 통일됐기 때문에 어두운 판 위에서는 안 보입니다. 그래서 밤하늘·검은 대리석·먹구름처럼 어두울 뻔한 컨셉은 전부 창백한 쪽으로 다시 잡았습니다. 폭풍 질주는 번개에 하얗게 바랜 하늘, 심판의 밤은 옅은 회색 대리석입니다.

등급의 화려함은 **위아래 테두리와 양 끝**에만 실립니다. 그 자리가 늘어나도 안 깨지는 구역이라 그렇습니다.

> 아이콘이 판에 녹아들어가므로, 이 판을 쓰는 족보는 **왼쪽 원형 메달이 사라집니다.** 따로 준비하던 줄 아이콘 18종은 이 작업으로 대체됩니다.

---

## 커먼 — 장식 없음

### 떠돌이의 직감 — `paper_instinct` (노페어)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: COMMON — the humblest kind. There is NO band and NO trim along the top and bottom edges at all: the edges are simply where the material itself ends, worn and slightly irregular. No metal fittings, no gold, no glow anywhere. Placed beside a decorated plate this one must look plainly, obviously bare. The plate: a worn brown leather strap, its two ends finished with small dull buckles, the middle plain smooth pale leather. No text, no letters, no numbers, no watermark.
```

### 맞잡은 손 — `paper_clasped_hands` (원페어)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: COMMON — the humblest kind. There is NO band and NO trim along the top and bottom edges at all: the edges are simply where the material itself ends, worn and slightly irregular. No metal fittings, no gold, no glow anywhere. Placed beside a decorated plate this one must look plainly, obviously bare. The plate: a faded red cloth band, each end tied into a small knot shaped like two clasped hands, the middle plain light woven cloth. No text, no letters, no numbers, no watermark.
```

### 쌍둥이 자매 — `paper_twin_sisters` (투페어)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: COMMON — the humblest kind. There is NO band and NO trim along the top and bottom edges at all: the edges are simply where the material itself ends, worn and slightly irregular. No metal fittings, no gold, no glow anywhere. Placed beside a decorated plate this one must look plainly, obviously bare. The plate: two identical pale parchment strips laid one slightly over the other, each end torn into the silhouette of a small girl, the middle plain parchment. No text, no letters, no numbers, no watermark.
```

### 세 번 찍는 도끼 — `paper_triple_axe` (트리플)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: COMMON — the humblest kind. There is NO band and NO trim along the top and bottom edges at all: the edges are simply where the material itself ends, worn and slightly irregular. No metal fittings, no gold, no glow anywhere. Placed beside a decorated plate this one must look plainly, obviously bare. The plate: a pale planed wooden board with three deep axe notches cut into each end, the middle plain light wood. No text, no letters, no numbers, no watermark.
```

### 몰이사냥 — `paper_hunt_drive` (스몰 스트레이트)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: COMMON — the humblest kind. There is NO band and NO trim along the top and bottom edges at all: the edges are simply where the material itself ends, worn and slightly irregular. No metal fittings, no gold, no glow anywhere. Placed beside a decorated plate this one must look plainly, obviously bare. The plate: a tan hunting leather belt, a small horn at one end and three arrowheads at the other, the middle plain pale oiled leather. No text, no letters, no numbers, no watermark.
```

## 언커먼 — 굵은 쇠 띠 + 쇠 마감 양 끝

### 숲의 속삭임 — `paper_whisper` (노페어)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: UNCOMMON — one step up, and it has to be obvious at a glance. A SOLID DARK IRON BAND runs the full length of the top edge and the full length of the bottom edge, THICK — roughly one fifth of the plate's height each, a real band of metal and not a thin outline. Both ENDS are capped and wrapped in the same hammered dark iron, each cap carrying three chunky raised rivets, so the ends read as hard metal against the softer middle. Dark iron only: no gold, no gems, no glow. The plate: a pale weathered paper band, a few dry pressed leaves clinging to each end, the middle plain pale paper. No text, no letters, no numbers, no watermark.
```

### 한 켤레 붉은 구두 — `paper_red_shoes` (원페어)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: UNCOMMON — one step up, and it has to be obvious at a glance. A SOLID DARK IRON BAND runs the full length of the top edge and the full length of the bottom edge, THICK — roughly one fifth of the plate's height each, a real band of metal and not a thin outline. Both ENDS are capped and wrapped in the same hammered dark iron, each cap carrying three chunky raised rivets, so the ends read as hard metal against the softer middle. Dark iron only: no gold, no gems, no glow. The plate: a dusty rose velvet ribbon band, one tiny red dancing shoe stitched at each end, the middle plain light velvet. No text, no letters, no numbers, no watermark.
```

### 두 개의 달 — `paper_two_moons` (투페어)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: UNCOMMON — one step up, and it has to be obvious at a glance. A SOLID DARK IRON BAND runs the full length of the top edge and the full length of the bottom edge, THICK — roughly one fifth of the plate's height each, a real band of metal and not a thin outline. Both ENDS are capped and wrapped in the same hammered dark iron, each cap carrying three chunky raised rivets, so the ends read as hard metal against the softer middle. Dark iron only: no gold, no gems, no glow. The plate: a pale silver moon-washed band, one crescent moon at each end facing inward, the middle plain soft silver-grey. No text, no letters, no numbers, no watermark.
```

### 나무꾼의 호흡 — `paper_woodsman_breath` (트리플)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: UNCOMMON — one step up, and it has to be obvious at a glance. A SOLID DARK IRON BAND runs the full length of the top edge and the full length of the bottom edge, THICK — roughly one fifth of the plate's height each, a real band of metal and not a thin outline. Both ENDS are capped and wrapped in the same hammered dark iron, each cap carrying three chunky raised rivets, so the ends read as hard metal against the softer middle. Dark iron only: no gold, no gems, no glow. The plate: a long felled log lying on its side, both ends showing the sawn cut face with tree rings, the middle plain pale stripped bark. No text, no letters, no numbers, no watermark.
```

### 묵직한 일격 — `paper_heavy_blow` (포카드)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: UNCOMMON — one step up, and it has to be obvious at a glance. A SOLID DARK IRON BAND runs the full length of the top edge and the full length of the bottom edge, THICK — roughly one fifth of the plate's height each, a real band of metal and not a thin outline. Both ENDS are capped and wrapped in the same hammered dark iron, each cap carrying three chunky raised rivets, so the ends read as hard metal against the softer middle. Dark iron only: no gold, no gems, no glow. The plate: a thick dented pale steel bar, heavy rivets and a hammer dent at each end, the middle plain light grey steel. No text, no letters, no numbers, no watermark.
```

### 할머니의 오두막 — `paper_cottage` (풀하우스)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: UNCOMMON — one step up, and it has to be obvious at a glance. A SOLID DARK IRON BAND runs the full length of the top edge and the full length of the bottom edge, THICK — roughly one fifth of the plate's height each, a real band of metal and not a thin outline. Both ENDS are capped and wrapped in the same hammered dark iron, each cap carrying three chunky raised rivets, so the ends read as hard metal against the softer middle. Dark iron only: no gold, no gems, no glow. The plate: a sun-bleached cottage wall board, a tiny shuttered window at one end and a small brick chimney at the other, the middle plain pale planking. No text, no letters, no numbers, no watermark.
```

### 바람길 — `paper_windpath` (스몰 스트레이트)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: UNCOMMON — one step up, and it has to be obvious at a glance. A SOLID DARK IRON BAND runs the full length of the top edge and the full length of the bottom edge, THICK — roughly one fifth of the plate's height each, a real band of metal and not a thin outline. Both ENDS are capped and wrapped in the same hammered dark iron, each cap carrying three chunky raised rivets, so the ends read as hard metal against the softer middle. Dark iron only: no gold, no gems, no glow. The plate: a long strip of pale thin cloth caught in the wind, each end frayed into curling wind swirls, the middle plain taut light cloth. No text, no letters, no numbers, no watermark.
```

## 레어 — 굵은 금 띠 + 금 세공 양 끝 + 발광

### 네 개의 송곳니 — `paper_four_fangs` (포카드)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: RARE — clearly precious, a full step above plain ironwork. A SOLID ANTIQUE GOLD BAND runs the full length of the top edge and the full length of the bottom edge, roughly one fifth of the plate's height each, with a fine engraved groove chased along it. Both ENDS are mounted in ornate scrolled gold fittings, distinctly larger and more elaborate than any ironwork would be. A soft warm golden glow bleeds off both end fittings. The middle stays plain and undecorated. The plate: a long ivory bone, four sharp wolf fangs set into each end, the middle plain smooth pale bone. No text, no letters, no numbers, no watermark.
```

### 따뜻한 화덕 — `paper_hearth` (풀하우스)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: RARE — clearly precious, a full step above plain ironwork. A SOLID ANTIQUE GOLD BAND runs the full length of the top edge and the full length of the bottom edge, roughly one fifth of the plate's height each, with a fine engraved groove chased along it. Both ENDS are mounted in ornate scrolled gold fittings, distinctly larger and more elaborate than any ironwork would be. A soft warm golden glow bleeds off both end fittings. The middle stays plain and undecorated. The plate: a pale warm hearth stone slab, a small live ember glow at each end, the middle plain light cream stone. No text, no letters, no numbers, no watermark.
```

### 달빛 오솔길 — `paper_moonpath` (라지 스트레이트)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: RARE — clearly precious, a full step above plain ironwork. A SOLID ANTIQUE GOLD BAND runs the full length of the top edge and the full length of the bottom edge, roughly one fifth of the plate's height each, with a fine engraved groove chased along it. Both ENDS are mounted in ornate scrolled gold fittings, distinctly larger and more elaborate than any ironwork would be. A soft warm golden glow bleeds off both end fittings. The middle stays plain and undecorated. The plate: a pale moonlit flagstone path seen from above, a crescent moon carved at one end and small footprints at the other, the middle plain pale stone. No text, no letters, no numbers, no watermark.
```

## 전설 — 금 세공 + 붉은 상감 + 발광

### 폭풍 질주 — `paper_storm_run` (라지 스트레이트)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: LEGENDARY — the grandest kind, unmistakable from across the screen. A THICK ornate gold band runs the full length of the top edge and the full length of the bottom edge, roughly one quarter of the plate's height each, chased with fine filigree scrollwork and set with deep blood-red gemstone inlay along its whole length. Both ENDS erupt into heavy sculpted gold filigree, the metalwork spilling a little way inward along the bands. A strong warm glow radiates from both ends and lingers faintly along the gold. The middle is still one plain readable surface. The plate: a band of storm-lit sky bleached almost white by lightning, a deep red lightning bolt breaking out of each end, the middle plain pale luminous cloud. No text, no letters, no numbers, no watermark.
```

### 심판의 밤 — `paper_judgment_night` (야찌)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: LEGENDARY — the grandest kind, unmistakable from across the screen. A THICK ornate gold band runs the full length of the top edge and the full length of the bottom edge, roughly one quarter of the plate's height each, chased with fine filigree scrollwork and set with deep blood-red gemstone inlay along its whole length. Both ENDS erupt into heavy sculpted gold filigree, the metalwork spilling a little way inward along the bands. A strong warm glow radiates from both ends and lingers faintly along the gold. The middle is still one plain readable surface. The plate: a pale grey marble slab, a small hanging balance scale at one end and a dark moon at the other, the middle plain polished light marble. No text, no letters, no numbers, no watermark.
```

### 핏빛 만월 — `paper_blood_moon` (야찌)

```
Stylized dark fairytale UI plate for the dice game REDHOOD. Match the EXACT painting style, angular brushwork and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Landscape image, aspect ratio 800:212 (about 3.8 to 1). ONE single long horizontal plate filling the ENTIRE canvas edge to edge — no background visible around it, no drop shadow, no frame. The LEFT and RIGHT ends (about the outer eighth of the width each) carry the ornament, and the TOP and BOTTOM edges carry a rim treatment that runs the whole length. The whole MIDDLE is one plain uniform surface, empty and uncluttered, because the game draws its own live text on top of it — keep the middle free of any drawing, symbol or lettering. Do NOT write anything on the plate. The middle surface must be a LIGHT to MEDIUM tone — pale, weathered, sun-bleached — never dark or black, because dark ink text is printed on it. The plate is horizontally symmetrical: the left and right ends mirror each other. Rarity: LEGENDARY — the grandest kind, unmistakable from across the screen. A THICK ornate gold band runs the full length of the top edge and the full length of the bottom edge, roughly one quarter of the plate's height each, chased with fine filigree scrollwork and set with deep blood-red gemstone inlay along its whole length. Both ENDS erupt into heavy sculpted gold filigree, the metalwork spilling a little way inward along the bands. A strong warm glow radiates from both ends and lingers faintly along the gold. The middle is still one plain readable surface. The plate: a pale bone slab, a full moon dripping red at each end with the red seeping a little inward, the middle plain bone with only the faintest red wash. No text, no letters, no numbers, no watermark.
```

---

## 연동

파일: `assets/ui/paper_{변형id}.png` (예: `paper_woodsman_breath.png`)

연동 코드는 v0.88에 들어가 있습니다. 올려주시면 `main.js`의 `COMBO_PLATE_READY`에 id를 추가하는 것으로 그 줄만 전용 판으로 바뀝니다. **한두 개만 먼저 올려도 됩니다.** 등록 안 된 족보는 기존 종이 띠 + 능력 아이콘 그대로 남습니다.

게임이 얹는 글자는 v0.89부터 등급과 무관하게 짙은 갈색 하나로 통일됐습니다. 판만 신경 쓰시면 됩니다.

**등급이 눈에 띄게 갈리는지 확인하려면 커먼 하나와 전설 하나를 먼저 뽑아 나란히 놓아보세요.** 그 둘의 격차가 충분하면 나머지는 그 사이를 채우면 됩니다. 떠돌이의 직감(커먼)과 핏빛 만월(전설)이 양 끝 기준으로 좋습니다.
