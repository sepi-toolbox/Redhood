# 연출용 리소스 요청 — 프롬프트 6장 (v3.34)

> **1·2·3번은 v3.34 에 들어갔다.** 남은 건 4·5·6번(대가 자국 3종)뿐이다.

**이 파일 하나로 끝난다.** 아래 프롬프트는 전부 조립이 끝난 것이라 통째로 복사해서 그대로 넣으면 된다.
다른 문서를 찾아볼 필요 없다.

## 공통 사항

- 키아트 **`docs/keyart/keyart_stilllife.jpg`** 를 같이 첨부한다. 안 붙이면 화풍이 매번 다르게 나온다.
- 전부 **정사각 1장씩**, 회색 배경으로 뽑아 주면 된다. 크기는 알아서 — 내가 256px로 맞춘다.
- 받은 뒤 붙이는 건 내가 한다. 대화에 올리고 이름만 말해 주면 된다.

## 왜 필요한가

v3.32에서 상태이상 연출을 **전부 CSS 도형으로만** 넣었다. 지금도 읽히긴 하는데,
걸릴 때 퍼지는 게 그냥 사각 테두리고, 풀릴 때 파편이 빗금 두 줄이고,
대가를 물 때 자국이 독이든 피든 동전이든 똑같은 원이다. 아래 여섯 장이면 그게 다 해결된다.

---

## 1. 찍히는 자국 — `fx_stamp_burst` ✅ 완료 (v3.34)

상태이상이 걸리는 순간 덮개 뒤에서 한 번 퍼진다. **매 전투마다 여러 번 오는 순간이고 지금이 제일 밋밋하다.**
색은 코드에서 상태색으로 물들이므로 **흰색 계열 한 색으로만** 그려야 한다.

```
Stylized dark fairytale overlay effect for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines, no thin scribbled strands. NOT photorealistic, NOT 3D. Square 1:1 image on one plain flat mid-grey background — solid color, no gradient, no checkerboard. Do NOT draw a die or any object underneath — draw ONLY the effect itself. The effect: one ragged ring of thick wax splatter blown outward from the centre, chunky uneven blobs and a few flung droplets, filling most of the square. Pure off-white only — NO colour, NO gradient, one flat tone so it can be tinted later. No text, no letters, no watermark.
```

## 2. 뜯긴 파편 — `fx_break_shards` ✅ 완료 (v3.34)

상태이상이 풀리는 순간 흩어진다. 이것도 **흰색 한 색**.

```
Stylized dark fairytale overlay effect for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines, no thin scribbled strands. NOT photorealistic, NOT 3D. Square 1:1 image on one plain flat mid-grey background — solid color, no gradient, no checkerboard. Do NOT draw a die or any object underneath — draw ONLY the effect itself. The effect: five or six chunky angular shards of a broken wax seal flying apart from the centre, thick blunt edges, one small puff of dust between them. Pure off-white only — NO colour, NO gradient, one flat tone so it can be tinted later. No text, no letters, no watermark.
```

## 3. 무는 순간 — `fx_bite_snap` ✅ 완료 (v3.34)

물기(흡착)가 붙는 순간이 지금 특히 안 보인다. **흰색 한 색**.

```
Stylized dark fairytale overlay effect for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines, no thin scribbled strands. NOT photorealistic, NOT 3D. Square 1:1 image on one plain flat mid-grey background — solid color, no gradient, no checkerboard. Do NOT draw a die or any object underneath — draw ONLY the effect itself. The effect: two blunt jaw arcs snapping shut from the left and right toward the centre, a thick pale sucker rim between them, one short motion streak behind each jaw. Pure off-white only — NO colour, NO gradient, one flat tone so it can be tinted later. No text, no letters, no watermark.
```

---

## 4~6. 대가 자국 3종 — 이건 색을 넣어 그린다

출혈·독·약탈이 대가를 무는 순간 그 칸에 번진다. **같은 흰 원을 세 번 쓰면 뭘 물었는지 구분이 안 되므로
이 셋만 색을 넣어 그린다.**

### 4. 출혈 — `fx_splat_blood`

```
Stylized dark fairytale overlay effect for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines, no thin scribbled strands. NOT photorealistic, NOT 3D. Square 1:1 image on one plain flat mid-grey background — solid color, no gradient, no checkerboard. Do NOT draw a die or any object underneath — draw ONLY the effect itself. The dominant color of the effect must be #e83b2e. The effect: one thick crimson blood splatter thrown across the square, a fat irregular blob at the centre and three heavy drops flung off one side. No text, no letters, no watermark.
```

### 5. 독 — `fx_splat_venom`

```
Stylized dark fairytale overlay effect for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines, no thin scribbled strands. NOT photorealistic, NOT 3D. Square 1:1 image on one plain flat mid-grey background — solid color, no gradient, no checkerboard. Do NOT draw a die or any object underneath — draw ONLY the effect itself. The dominant color of the effect must be #a8d63a. The effect: one thick acid-green venom splatter across the square with two fat round bubbles bursting inside it and a few droplets flung outward. No text, no letters, no watermark.
```

### 6. 약탈 — `fx_splat_coin`

```
Stylized dark fairytale overlay effect for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter, no thin hatching lines, no thin scribbled strands. NOT photorealistic, NOT 3D. Square 1:1 image on one plain flat mid-grey background — solid color, no gradient, no checkerboard. Do NOT draw a die or any object underneath — draw ONLY the effect itself. The dominant color of the effect must be #e08a2a. The effect: three thick gold coins scattering outward from the centre, tumbling at different angles, with one short bright glint between them. No text, no letters, no watermark.
```

---

## 여섯 장을 한 시트로 뽑고 싶다면

색 있는 것과 없는 것이 섞여 있어 **한 시트로는 권하지 않는다.** 굳이 한다면 1·2·3(흰색)만 묶는다.
위 1번 프롬프트에서 `Square 1:1 image on` 을 아래로 바꾸고 `The effect:` 자리에
`IN ORDER — {1의 묘사} / {2의 묘사} / {3의 묘사}` 를 넣으면 된다.

```
Landscape 3:1 image. A 1x3 row of three effects, equal cells, equal spacing, each centered in its own cell, on
```

## 우선순위

1·2·3은 끝났다. **남은 건 4·5번(출혈·독)이 먼저고 6번(약탈)은 나중에 해도 된다.**
