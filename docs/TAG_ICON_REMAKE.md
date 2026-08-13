# 태그 아이콘 다시 뽑기 — 6종 (+1)

**이 파일 하나로 끝난다.** 아래 프롬프트는 전부 조립이 끝난 것이라 통째로 복사해서 그대로 넣으면 된다.
다른 문서를 찾아볼 필요 없다.

## 시작하기 전에

- 키아트 **`docs/keyart/keyart_stilllife.jpg`** 를 같이 첨부한다. 안 붙이면 화풍이 매번 다르게 나온다.
- 전부 **정사각 1장씩**, **회색 배경**으로. 크기는 알아서 — 내가 96px로 맞춘다.
- 받은 뒤 붙이는 건 내가 한다. 대화에 올리고 이름만 말해 주면 된다.

## 왜 다시 뽑나

족보 태그(시안 A)는 **26px 원 안**에 들어간다. 지금 아이콘 밝기를 재보면 딱 갈린다.

| 잘 읽힘 | 벼름 84 · 일격 103 · 출혈 58 |
|---|---|
| **안 읽힘** | 집중 33 · 취약 30 · 방어 29 · 약화 27 · 힘 23 · 재생 22 |

아래 6종은 전부 v0.24 옛 세대라 **어두운 심볼**이다. 어두운 원 안에 넣으면 검은 점으로만 보인다.
그래서 프롬프트에 두 가지를 새로 박았다 —

1. **밝게** 그릴 것 (배경 회색보다 확실히 밝게)
2. **26px에서 하나의 실루엣으로 읽힐 것** — 내부 잔디테일 금지

> 그림 자체는 알파만 남은 심볼이라(메달이 안 구워져 있다) 파일만 갈아 끼우면
> 족보 태그·버프 칩·적 배지에 한꺼번에 반영된다. 따로 손댈 곳 없다.

---

## 힘 — `status_strength`

<small>쓰이는 곳: 족보 태그 · 내 버프 칩 · 색 #f0b429</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single symbol centered, filling about 78 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No circular frame, no border, no background decoration. The symbol must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It will be shown as a small bright mark inside a dark round socket, so it must read as one clear silhouette at 26px. The dominant color of the whole icon must be #f0b429. The symbol: a clenched bare fist punching forward, thick blunt knuckles, one bright gold flare behind it. No text, no letters, no watermark.
```

## 집중 — `status_focus`

<small>쓰이는 곳: 족보 태그 · 내 버프 칩 · 색 #4fc3f7</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single symbol centered, filling about 78 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No circular frame, no border, no background decoration. The symbol must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It will be shown as a small bright mark inside a dark round socket, so it must read as one clear silhouette at 26px. The dominant color of the whole icon must be #4fc3f7. The symbol: one wide open eye with a bright pale-blue iris and a sharp highlight. No text, no letters, no watermark.
```

## 재생 — `status_regen`

<small>쓰이는 곳: 족보 태그 · 내 버프 칩 · 적 재생 배지 · 색 #e5468f</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single symbol centered, filling about 78 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No circular frame, no border, no background decoration. The symbol must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It will be shown as a small bright mark inside a dark round socket, so it must read as one clear silhouette at 26px. The dominant color of the whole icon must be #e5468f. The symbol: a plump bright pink heart with one small new leaf sprouting from its top. No text, no letters, no watermark.
```

## 방어 — `status_block`

<small>쓰이는 곳: 족보 태그 · 방어도 표시 · 적 의도(방어) · 색 #b9c6d6</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single symbol centered, filling about 78 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No circular frame, no border, no background decoration. The symbol must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It will be shown as a small bright mark inside a dark round socket, so it must read as one clear silhouette at 26px. The dominant color of the whole icon must be #b9c6d6. The symbol: a broad pale steel shield seen straight on, one thick rivet band across it. No text, no letters, no watermark.
```

## 약화 — `status_weak`

<small>쓰이는 곳: 족보 태그 · 적에게 걸린 배지 · 색 #a98cd8</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single symbol centered, filling about 78 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No circular frame, no border, no background decoration. The symbol must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It will be shown as a small bright mark inside a dark round socket, so it must read as one clear silhouette at 26px. The dominant color of the whole icon must be #a98cd8. The symbol: a sword snapped in half, the two bright violet-steel pieces falling apart. No text, no letters, no watermark.
```

## 취약 — `status_vulnerable`

<small>쓰이는 곳: 족보 태그 · 적에게 걸린 배지 · 색 #ff8a3d</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single symbol centered, filling about 78 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No circular frame, no border, no background decoration. The symbol must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It will be shown as a small bright mark inside a dark round socket, so it must read as one clear silhouette at 26px. The dominant color of the whole icon must be #ff8a3d. The symbol: a chest plate with one wide jagged crack splitting it, hot orange light through the crack. No text, no letters, no watermark.
```

---

# 하나 더 필요하다 — 전체 공격

시안 A의 태그 줄에는 **「전체」**(스트레이트 5종이 가진 전체 공격 표시)도 들어가는데 **전용 그림이 없다.**
시안에서는 임시로 붉은 발톱(공격 아이콘)을 썼는데 뜻이 안 맞는다.

## 전체 — `ui_aoe`

<small>쓰이는 곳: 족보 태그 (스트레이트 5종) · 색 #7fd4c8 (기존 여덟 색과 안 겹치게 골랐다)</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single symbol centered, filling about 78 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No circular frame, no border, no background decoration. The symbol must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It will be shown as a small bright mark inside a dark round socket, so it must read as one clear silhouette at 26px. The dominant color of the whole icon must be #7fd4c8. The symbol: one wide sweeping crescent arc travelling across the frame with two shorter arcs trailing behind it, as if a single swing reached everything at once. No text, no letters, no watermark.
```

---

# 한 시트로 몰아 뽑고 싶다면

여섯을 3×2로 묶는다. 아래를 그대로 쓰고 `IN ORDER —` 뒤에 묘사 여섯 개를 ` / ` 로 이어 붙인다
(`//` 자리가 줄바꿈). 시트로 뽑을 땐 색코드 문장을 못 쓰니, 묘사 안의 색 낱말
(bright gold / pale-blue / bright pink / pale steel / violet-steel / hot orange)에 맡긴다.

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Landscape 3:2 image. A 3x2 grid of six symbols, equal cells, equal spacing, identical framing, each centered in its own cell, all on one plain flat mid-grey background — solid color, no gradient, no checkerboard. No circular frame, no border, no background decoration. Every symbol must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It will be shown as a small bright mark inside a dark round socket, so each must read as one clear silhouette at 26px. IN ORDER — a clenched bare fist punching forward, thick blunt knuckles, one bright gold flare behind it / one wide open eye with a bright pale-blue iris and a sharp highlight / a plump bright pink heart with one small new leaf sprouting from its top // a broad pale steel shield seen straight on, one thick rivet band across it / a sword snapped in half, the two bright violet-steel pieces falling apart / a chest plate with one wide jagged crack splitting it, hot orange light through the crack. No text, no letters, no watermark.
```

---

# 받은 뒤 (내가 하는 일 · 기록용)

```
python3 -c "
import importlib.util
s=importlib.util.spec_from_file_location('mk','tools/make_icon.py'); m=importlib.util.module_from_spec(s); s.loader.exec_module(m)
m.build_ui('<원본.png>', '<이름>', out_dir='assets/icons', prefix='')
"
```

배경을 걷어내고 알파만 남겨 96px로 굽는다. 굽고 나서 밝기를 다시 재서 **45 아래면 다시 뽑는다.**

`status_block` 은 적 의도(방어) 아이콘 `intent_defend` 와 **같은 그림**이다 — 한 장으로 두 파일에 넣는다.
