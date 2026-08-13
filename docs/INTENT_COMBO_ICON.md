# 조합 예고 아이콘 — 5종

**이 파일 하나로 끝난다.** 아래 프롬프트는 전부 조립이 끝난 것이라 통째로 복사해서 그대로 넣으면 된다.
다른 문서를 찾아볼 필요 없다.

## 시작하기 전에

- 키아트 **`docs/keyart/keyart_stilllife.jpg`** 를 같이 첨부한다. 안 붙이면 화풍이 매번 다르게 나온다.
- 전부 **정사각 1장씩**, **회색 배경**으로. 크기는 알아서 — 내가 96px로 맞춘다.
- 받은 뒤 붙이는 건 내가 한다. 대화에 올리고 이름만 말해 주면 된다.

## 왜 만드나

예고는 지금 갈래마다 표식을 하나씩 세운다. 두 갈래가 한꺼번에 오면 표식이 둘 나란히 서는데,
적 이름 위 좁은 줄에서 **19px 짜리 둘 + 숫자**는 한 덩어리로 안 읽힌다.
그래서 자주 나오는 조합은 **묶인 표식 하나**로 대신한다.

전수조사 결과 261개 행동에서 실제로 나오는 두 갈래 조합은 넷뿐이다.

| 조합 | 횟수 | 파일 이름 | 예시 |
|---|---|---|---|
| 공격 + 방해 | 42 | `intent_attack_confuse` | 숲거미 「독니」 · 까마귀 「눈알 노리기」 |
| 방어 + 방해 | 13 | `intent_defend_confuse` | 개울 정령 「물수제비」 · 진흙 골렘 「굳히기」 |
| 공격 + 강화 | 7 | `intent_attack_empower` | 늑대 「붉은 달의 사냥」 · 무덤지기 「마지막 의식」 |
| 공격 + 방어 | 3 | `intent_attack_defend` | 가시덤불 「가시 폭발」 · 해골 병사 「뼈 무너뜨리기」 |
| **방어 + 강화** | **0** | `intent_defend_empower` | 아직 없다 — 자리만 미리 잡아 둔다 |

세 갈래가 한꺼번에 오는 행동은 하나도 없다. 그래서 조합은 이 다섯으로 끝이다.

**문턱(🪨)·상한(⛓)·재생(💗)·격노(💢)·반사(🌵)는 안 묶는다.** 저건 이번 턴 행동이 아니라
몸에 얹혀서 여러 턴 남는 장치라, 조합으로 뭉개면 「문턱 6을 한 방에 넘어야 한다」 같은
결정적인 정보가 사라진다. 제 표식을 그대로 지킨다.

**치유는 이제 예고에 안 그린다.** 적이 제 몸을 아무는 건 이번 턴 내 선택을 바꾸지 않는다.
그래서 「공격+치유」(거머리 흡혈 13회)는 그냥 공격으로, 「치유+방해」는 방해로 읽힌다.

## 그림이 지켜야 할 것

낱개 예고 표식과 **같은 규칙**이다 — 동그라미에 가두지 않는다.

> draw ONLY the bare mark itself: no circle, no ring, no disc, no badge, no frame, no border.

조합 표식은 **두 낱개를 나란히 놓은 게 아니라 하나로 얽힌 그림**이어야 한다.
19px에서 둘로 갈라져 보이면 묶은 뜻이 없다. 그래서 프롬프트마다
`fused into ONE single interlocked mark, NOT two separate marks side by side` 를 박아 뒀다.

낱개 표식이 쓰는 그림과 색은 이렇다. 조합은 이 둘을 섞는다.

| 갈래 | 그림 | 색 |
|---|---|---|
| 공격 | 붉은 발톱 자국 셋 | `#ff4f4f` |
| 방어 | 창백한 강철 빗장 X | `#b9c6d6` |
| 강화 | 금색 위쪽 꺾쇠 둘 | `#ffd257` |
| 방해 | 보라 소용돌이 | `#b07cff` |

---

## 공격 + 방해 — `intent_attack_confuse`

<small>가장 많이 나온다(42회). 주색 #ff4f4f · 곁색 #b07cff</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single mark centered, filling about 82 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare mark itself: no circle, no ring, no disc, no badge, no shield plate, no frame, no border, no plaque, nothing enclosing it and nothing behind it. The mark must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It floats free on the background and must read as one clear silhouette at 19px. The two ideas below must be fused into ONE single interlocked mark, NOT two separate marks side by side. The dominant color is #ff4f4f with #b07cff as the secondary accent. The mark: three thick bright red claw slashes torn through the air, and the longest slash curls at its tail into a tight violet spiral. No text, no letters, no watermark.
```

## 방어 + 방해 — `intent_defend_confuse`

<small>13회. 주색 #b9c6d6 · 곁색 #b07cff</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single mark centered, filling about 82 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare mark itself: no circle, no ring, no disc, no badge, no shield plate, no frame, no border, no plaque, nothing enclosing it and nothing behind it. The mark must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It floats free on the background and must read as one clear silhouette at 19px. The two ideas below must be fused into ONE single interlocked mark, NOT two separate marks side by side. The dominant color is #b9c6d6 with #b07cff as the secondary accent. The mark: two thick pale steel bars crossed into an X like a barred door, with one bright violet spiral coiled tight around the point where they cross. No text, no letters, no watermark.
```

## 공격 + 강화 — `intent_attack_empower`

<small>7회, 전부 각성기다. 주색 #ff4f4f · 곁색 #ffd257</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single mark centered, filling about 82 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare mark itself: no circle, no ring, no disc, no badge, no shield plate, no frame, no border, no plaque, nothing enclosing it and nothing behind it. The mark must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It floats free on the background and must read as one clear silhouette at 19px. The two ideas below must be fused into ONE single interlocked mark, NOT two separate marks side by side. The dominant color is #ff4f4f with #ffd257 as the secondary accent. The mark: three thick bright red claw slashes torn through the air, all three sweeping steeply upward so their tips form one bold gold chevron pointing up. No text, no letters, no watermark.
```

## 공격 + 방어 — `intent_attack_defend`

<small>3회, 전부 각성기다. 주색 #ff4f4f · 곁색 #b9c6d6</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single mark centered, filling about 82 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare mark itself: no circle, no ring, no disc, no badge, no shield plate, no frame, no border, no plaque, nothing enclosing it and nothing behind it. The mark must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It floats free on the background and must read as one clear silhouette at 19px. The two ideas below must be fused into ONE single interlocked mark, NOT two separate marks side by side. The dominant color is #ff4f4f with #b9c6d6 as the secondary accent. The mark: two thick pale steel bars crossed into an X, and one bright red claw slash tearing diagonally straight through the crossing, splitting it. No text, no letters, no watermark.
```

## 방어 + 강화 — `intent_defend_empower`

<small>아직 쓰는 행동이 없다. 자리만 잡아 두는 것. 주색 #b9c6d6 · 곁색 #ffd257</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single mark centered, filling about 82 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare mark itself: no circle, no ring, no disc, no badge, no shield plate, no frame, no border, no plaque, nothing enclosing it and nothing behind it. The mark must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It floats free on the background and must read as one clear silhouette at 19px. The two ideas below must be fused into ONE single interlocked mark, NOT two separate marks side by side. The dominant color is #b9c6d6 with #ffd257 as the secondary accent. The mark: two thick pale steel bars crossed into an X, with one bold gold chevron rising up out of the crossing like the bars are being driven higher. No text, no letters, no watermark.
```

---

# 한 시트로 몰아 뽑고 싶다면

다섯이라 3×2 한 칸이 빈다. 다섯만 채우고 마지막 칸은 비워 달라고 적어 뒀다.

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no small internal details. NOT photorealistic, NOT 3D. Landscape 3:2 image. A 3x2 grid of cells, equal cells, equal spacing, identical framing; the first five cells each hold one mark centered in its own cell and the sixth cell is left completely empty. All on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare marks themselves: no circle, no ring, no disc, no badge, no frame, no border, nothing enclosing them and nothing behind them. Every mark must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. Each floats free and must read as one clear silhouette at 19px. Each cell holds ONE single interlocked mark that fuses its two ideas together, NOT two separate marks side by side. IN ORDER — three thick bright red claw slashes torn through the air, the longest slash curling at its tail into a tight violet spiral / two thick pale steel bars crossed into an X, one bright violet spiral coiled tight around the crossing point / three thick bright red claw slashes sweeping steeply upward so their tips form one bold gold chevron pointing up // two thick pale steel bars crossed into an X with one bright red claw slash tearing diagonally straight through the crossing / two thick pale steel bars crossed into an X with one bold gold chevron rising up out of the crossing / empty cell, nothing drawn. No text, no letters, no watermark.
```

---

# 받은 뒤 (내가 하는 일 · 기록용)

```
python3 -c "
import importlib.util
s=importlib.util.spec_from_file_location('mk','tools/make_icon.py'); m=importlib.util.module_from_spec(s); s.loader.exec_module(m)
m.build_tag('<원본.png>', '<이름>')
"
```

그 다음 `js/main.js` 의 `INTENT_COMBO_READY` 에 이름을 적으면 끝난다.

```js
const INTENT_COMBO_READY = new Set(['intent_attack_confuse']);
```

**적기 전까지는 예전처럼 표식 둘이 나란히 뜬다.** 그림이 없어도 화면은 안 깨지고,
한 종씩 받는 대로 하나씩 바꿔 끼울 수 있다.
