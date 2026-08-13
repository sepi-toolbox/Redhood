# 유물 아이콘 — 31/32 완료 (v3.65)

> **들어온 것** `docs/relics_done.png` 참고. 32종 중 31종이 제 그림을 갖고
> `assets/relics/` 에 구워져 `RELIC_ART_READY` 에 올라 있다. 서비스워커 목록에도 등록해서
> 오프라인에서도 뜬다.
>
> **남은 것은 하나 — 곰의 등 `bears_back`.** 그림이 없는 동안은 예전처럼 이모지로 뜬다.
>
> 어두운 편인 셋: 까마귀 깃털 23 · 말라붙은 심장 33 · 붉은 망토 45.
> 앞의 둘은 검은 깃털·검은 심장이라 어쩔 수 없는 값이고 화면에서는 금빛 테두리와 윤곽으로 읽힌다.

# 유물 아이콘 32종 — 프롬프트 (v3.44)

**이 파일 하나로 끝난다.** 아래 프롬프트는 전부 조립이 끝난 것이라 통째로 복사해서 그대로 넣으면 된다.
다른 문서를 찾아볼 필요 없다.

## 시작하기 전에

- 키아트 **`docs/keyart/keyart_stilllife.jpg`** 를 같이 첨부한다. 안 붙이면 화풍이 매번 다르게 나온다.
- 전부 **정사각 1장씩**, **회색 배경**으로 뽑아 주면 된다. 크기는 알아서 — 내가 128px로 맞춘다.
- 받은 뒤 붙이는 건 내가 한다. 대화에 올리고 이름만 말해 주면 된다.

## 예전 문서와 달라진 점 (읽고 넘어가면 좋다)

전에 써 둔 유물 프롬프트는 배경이 **아주 어두운 갈색**이었다. 그때는 유물이 어두운 화면에 그냥 얹힐
줄 알았는데, 지금 유물은 **어두운 동그란 홈 안에** 들어간다 (상점·전리품 줄 왼쪽의 그 원). 그래서

1. 배경을 **회색**으로 바꿨다 — 배경을 걷어내고 알맹이만 남겨야 원 안에 얹힌다. 어두운 갈색이면
   물체의 어두운 부분까지 같이 걷혀 나간다.
2. **밝게** 그리라는 문장을 넣었다. 옛 세대 아이콘 12종이 어두운 심볼이라 작은 크기에서 검은
   동그라미로만 보였던 그 실수를 다시 하지 않기 위해서다.
3. `readable at 48px` → `readable at 40px`. 실제로 그려지는 크기를 재서 맞췄다.

**묘사(The object: …) 문장은 예전 것 그대로다.** 한 글자도 안 바꿨다.

---

# 일반 유물 20종

## 늑대 이빨 — `wolf_fang`

<small>족보를 확정할 때마다 추가 피해 +3.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a single yellowed wolf fang strung on a leather cord. No text, no letters, no watermark.
```

## 빵부스러기 — `breadcrumbs`

<small>전투에서 승리하면 HP 4 회복.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a small pile of torn bread crumbs on a scrap of cloth. No text, no letters, no watermark.
```

## 붉은 실타래 — `spool`

<small>노페어 피해 +4.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a wooden spool wound with deep red thread, one loose end trailing. No text, no letters, no watermark.
```

## 따뜻한 우유 — `warm_milk`

<small>매 턴 시작 시 HP 1 회복.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a chipped ceramic cup of warm milk with a faint wisp of steam. No text, no letters, no watermark.
```

## 마른 장작 — `firewood`

<small>매 턴 시작 시 방어 2.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: two split dry logs bound with twine. No text, no letters, no watermark.
```

## 가죽 장갑 — `leather_gloves`

<small>투페어 피해 +6.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a pair of worn brown leather work gloves. No text, no letters, no watermark.
```

## 까마귀 깃털 — `crow_feather`

<small>스트레이트 피해 +8.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a single glossy black crow feather. No text, no letters, no watermark.
```

## 사냥꾼의 부적 — `hunters_charm`

<small>풀하우스 피해 +15.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a small bone charm carved with a simple eye, hung on a cord. No text, no letters, no watermark.
```

## 가계부 — `ledger`

<small>상점 가격 -20%.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a thin worn ledger book with a frayed ribbon bookmark. No text, no letters, no watermark.
```

## 이끼 나침반 — `moss_compass`

<small>전체 공격 족보 피해 +6.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a battered brass compass overgrown with green moss. No text, no letters, no watermark.
```

## 은저울 — `silver_scale`

<small>전투에서 얻는 🪙 +25%.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a small tarnished silver balance scale. No text, no letters, no watermark.
```

## 수지 양초 — `tallow_candle`

<small>혼란(🌀)에 면역 — 주사위가 뒤틀리지 않는다.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a stubby yellow tallow candle with a steady small flame. No text, no letters, no watermark.
```

## 오래된 뼈 — `old_bone`

<small>같은 눈 족보(원페어·트리플·포카드·야찌) 피해 +6.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a short weathered animal bone with hairline cracks. No text, no letters, no watermark.
```

## 유리병 속 반딧불 — `glass_jar`

<small>얻는 즉시 최대 HP +10.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a corked glass jar holding three glowing fireflies. No text, no letters, no watermark.
```

## 늑대 가죽 — `wolf_pelt`

<small>적을 처치할 때마다 HP 3 회복.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a folded grey wolf pelt with the head still attached. No text, no letters, no watermark.
```

## 독사과 조각 — `poison_apple`

<small>HP가 절반 이하일 때 모든 족보 피해 +5.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a dark red apple with one bite taken, the flesh faintly green. No text, no letters, no watermark.
```

## 꿀단지 — `honey_pot`

<small>전투에서 승리하면 HP 8 회복.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a small clay honey pot with honey dripping down one side. No text, no letters, no watermark.
```

## 숫돌 — `whetstone`

<small>매 턴 시작 시 🔥벼름 +1.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a flat grey whetstone worn into a shallow groove, a few orange sparks flicking off its edge. No text, no letters, no watermark.
```

## 사냥꾼의 눈 — `hunters_eye`

<small>같은 눈이 3개 이상 나온 판을 확정하면 🔥벼름 +1.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a brass monocle on a short chain, one amber lens catching a spark of light. No text, no letters, no watermark.
```

## 길표 — `waymark`

<small>스트레이트 족보를 확정하면 다음 턴 리롤 +2 · 🔥벼름 +1.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a weathered wooden signpost arrow nailed to a short stake, one painted red mark across it. No text, no letters, no watermark.
```

---

# 정예 유물 12종

정예는 마지막에 한 문장이 더 붙는다 — 조금 더 공들인 물건이고 가장자리에 옅은 금빛이 돈다.

## 붉은 망토 — `red_cloak`

<small>매 턴 리롤 +1.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a small folded bright red hooded cloak. The object is a little more ornate than an everyday thing and carries a faint warm golden rim-light along one edge. No text, no letters, no watermark.
```

## 도토리 부적 — `acorn_charm`

<small>풀하우스 피해 2배.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a golden acorn charm on a thin chain. The object is a little more ornate than an everyday thing and carries a faint warm golden rim-light along one edge. No text, no letters, no watermark.
```

## 문지기의 빗장 — `gate_bar`

<small>턴이 지나도 방어도의 절반이 남는다.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a heavy iron gate bar with a worn bronze bracket. The object is a little more ornate than an everyday thing and carries a faint warm golden rim-light along one edge. No text, no letters, no watermark.
```

## 네잎클로버 — `clover`

<small>보상에서 레어·에픽이 나올 확률 2배.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a four-leaf clover pressed under a thin glass disc. The object is a little more ornate than an everyday thing and carries a faint warm golden rim-light along one edge. No text, no letters, no watermark.
```

## 은식칼 — `silver_knife`

<small>스트레이트 족보 피해 +10.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: an ornate silver table knife with a bone handle. The object is a little more ornate than an everyday thing and carries a faint warm golden rim-light along one edge. No text, no letters, no watermark.
```

## 은탄환 — `silver_bullet`

<small>포카드 피해 2배.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a single polished silver bullet standing upright. The object is a little more ornate than an everyday thing and carries a faint warm golden rim-light along one edge. No text, no letters, no watermark.
```

## 운명의 골무 — `fate_thimble`

<small>매 턴 리롤 +2.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a silver thimble engraved with tiny stars. The object is a little more ornate than an everyday thing and carries a faint warm golden rim-light along one edge. No text, no letters, no watermark.
```

## 늑대달 목걸이 — `wolfmoon_pendant`

<small>족보를 확정할 때마다 추가 피해 +6.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a pendant of a full moon with a small wolf silhouette across it. The object is a little more ornate than an everyday thing and carries a faint warm golden rim-light along one edge. No text, no letters, no watermark.
```

## 할머니의 동화책 — `grandma_book`

<small>야찌 피해 2배.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a small thick storybook with a cracked red leather cover and a brass clasp. The object is a little more ornate than an everyday thing and carries a faint warm golden rim-light along one edge. No text, no letters, no watermark.
```

## 곰의 등 — `bears_back`

<small>두르고 있는 방어도 10마다 모든 족보 피해 +3.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a thick shaggy bear-hide mantle with the shoulder fur raised, closed by two iron clasps. The object is a little more ornate than an everyday thing and carries a faint warm golden rim-light along one edge. No text, no letters, no watermark.
```

## 말라붙은 심장 — `dried_heart`

<small>HP가 3분의 1 이하면 모든 족보 피해 1.5배.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a shriveled blackened heart pierced by one iron nail, dry and cracked. The object is a little more ornate than an everyday thing and carries a faint warm golden rim-light along one edge. No text, no letters, no watermark.
```

## 거머리 반지 — `leech_ring`

<small>주사위 때문에 자해할 때마다 🔥벼름 +2.</small>

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single object centered, filling about 80 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. The object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. The object: a dark silver ring shaped like a coiled leech biting its own tail, one red bead for its mouth. The object is a little more ornate than an everyday thing and carries a faint warm golden rim-light along one edge. No text, no letters, no watermark.
```

---

# 한 시트로 몰아 뽑고 싶다면

여섯 개를 3×2 로 묶는다. 아래 문구를 그대로 쓰고 `IN ORDER —` 뒤에 묘사 여섯 개를
` / ` 로 이어 붙이면 된다 (`//` 자리가 줄바꿈).

```
Stylized dark fairytale item illustration for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines. NOT photorealistic, NOT 3D. Landscape 3:2 image. A 3x2 grid of six objects, equal size, equal spacing, identical framing, each centered in its own cell, all on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No frame, no border, no ground plane, no cast shadow, no background decoration. Every object must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey — do NOT make it dark or muddy. Bold silhouette, readable at 40px. IN ORDER — {묘사1} / {묘사2} / {묘사3} // {묘사4} / {묘사5} / {묘사6}. No text, no letters, no watermark.
```

정예를 시트로 뽑을 땐 `No text, no letters, no watermark.` 앞에 아래 한 문장을 끼운다.

```
Every object is a little more ornate than an everyday thing and carries a faint warm golden rim-light along one edge.
```

일반 20종 = 6+6+6+2, 정예 12종 = 6+6. 총 여섯 장이면 끝난다.

---

# 받은 뒤 (내가 하는 일 · 기록용)

```
python3 -c "
import importlib.util, sys
s=importlib.util.spec_from_file_location('mk','tools/make_icon.py'); m=importlib.util.module_from_spec(s); s.loader.exec_module(m)
m.build_relic('<원본.png>', '<유물 id>')
"
```

배경을 걷어내고 `assets/relics/{id}.png` 로 굽는다. 평균 밝기를 같이 찍어 주는데, **40 아래면**
어두운 원 위에서 안 보인다는 뜻이라 다시 뽑는 편이 낫다.

그다음 `js/main.js` 의 `RELIC_ART_READY` 에 그 id 를 넣으면 그 줄만 그림으로 바뀐다.
지금은 비어 있어서 32종 전부 이모지로 뜬다. **한 개씩 들어와도 그것만 먼저 켜진다** — 32종을
다 모을 때까지 기다릴 필요 없다.
