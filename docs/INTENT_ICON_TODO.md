# 적 예고 아이콘 — 11종 · **v3.61에서 전부 적용 완료**

> 아래 프롬프트로 뽑은 그림 11장을 v3.61에 전부 넣었다. 낱개 6종·조합 5종 모두 제 그림을 갖고,
> 방패 한 장은 `status_block.png` 로도 복사해 족보 태그·방어도 표시까지 같이 바뀌었다.
> **화면에 남아 있던 마지막 이모지(`💤`)도 사라졌다** — `node test/emojicheck.mjs` 가 0 을 뱉는다.
> 옛 `intent_heal.png` 는 지웠다. 아래 프롬프트는 다시 뽑을 때를 위한 기록으로 남긴다.

**이 파일 하나로 끝난다.** 아래 프롬프트는 전부 조립이 끝난 것이라 통째로 복사해서 그대로 넣으면 된다.
다른 문서를 찾아볼 필요 없다.

**v3.60: 이미 그림이 있는 공격·방해·의문까지 포함해 처음부터 다시 뽑는다.** 낱개 여섯이 한 붓에서
나와야 조합 다섯도 결이 맞는다. 지금 파일은 세 세대가 섞여 있어서 조합만 새로 얹으면 표가 난다.

## 시작하기 전에

- 키아트 **`docs/keyart/keyart_stilllife.jpg`** 를 같이 첨부한다. 안 붙이면 화풍이 매번 다르게 나온다.
- 전부 **정사각 1장씩**, **회색 배경**으로. 크기는 알아서 — 내가 96px로 맞춘다.
- 받은 뒤 붙이는 건 내가 한다. 대화에 올리고 이름만 말해 주면 된다.
- **1부(낱개 6종)를 먼저 끝내고 2부(조합 5종)로 간다.** 조합 다섯이 전부 낱개의 그림을 품고 있어서,
  낱개가 확정되기 전에 조합을 뽑으면 두 번 일한다. 낱개가 마음에 들면 그 그림을 조합 프롬프트에
  **참고 이미지로 같이 붙여** 주면 결이 훨씬 잘 맞는다.

## 뭘 뽑나

| 표식 | 파일 | 굽고 난 평균 밝기 |
|---|---|---|
| 공격 | `intent_attack` | 42 |
| 방어 | `intent_defend` = `status_block` | 89 |
| 강화 | `intent_empower` | 88 |
| 방해 | `intent_confuse` | 60 |
| 의문 | `intent_unknown` | 112 |
| 휴식 | `intent_rest` | 111 |
| 공격+방해 | `intent_attack_confuse` (42회) | 47 |
| 방어+방해 | `intent_defend_confuse` (13회) | 85 |
| 공격+강화 | `intent_attack_empower` (7회) | 54 |
| 공격+방어 | `intent_attack_defend` (3회) | 75 |
| 방어+강화 | `intent_defend_empower` (0회, 예비) | 97 |

「공격」만 45 아래로 나오는데, 밝기 식이 붉은색을 0.299로 낮게 치기 때문이지 실제로는 안 어둡다.
19px로 줄여 확인했고 다른 표식들 사이에서 제일 먼저 눈에 들어온다.

**예고 줄에 뜨는 건 이 열하나가 전부다.** v3.60부터 치유·문턱·상한·재생·격노·반사는 예고에서
완전히 빠졌다 — 저건 「이번에 뭘 하겠다」가 아니라 「앞으로 이런 몸이 되겠다」라서 예고로
말할 수 있는 게 아니고, 걸리고 나면 어차피 배지로 보인다. 그런 걸 거는 행동 8개는 자해 행동과
똑같이 통째로 `❓` 로 가린다. 그래서 예고용 그림은 더 늘지 않는다.

## 상태이상 표식과 뭐가 다른가

상태이상·족보 태그는 **어두운 동그라미에 갇혀 있다.** 지금 걸려 있는 것, 세어야 하는 것이라서
칸에 담긴 물건처럼 보이는 게 맞다.

**예고는 다른 개념이다.** 적 이름 위에 떠서 "다음에 이걸 하겠다"를 말하는 것이고, 아직 일어나지
않은 일이다. 그래서 **동그라미로 가두지 않는다** — 허공에 그어진 표시처럼 맨몸으로 뜬다.
프롬프트마다 그 문장을 못 박아 뒀다.

> draw ONLY the bare mark itself: no circle, no ring, no disc, no badge, no frame, no border,
> nothing enclosing it and nothing behind it.

화면에 뜨는 크기는 **19px** 로, 족보 태그(26px)보다 작다. 그래서 더 단순해야 한다.

**「방어」만 예외로 상태이상 표식과 같은 그림이다.** 방어도가 곧 방어고 방어 행동이 그 방어도를
올리는 것이라 같은 개념이다 — 뜻이 같으면 그림도 같아야 한다. 그래서 방패 한 장을 뽑아
`status_block.png` 와 `intent_defend.png` 두 파일에 넣는다.

그래서 이 방패만 **두 자리를 동시에 견뎌야 한다.** 족보 태그로는 26px 어두운 동그라미 안에
들어가고, 예고로는 19px 맨몸으로 뜬다. 프롬프트에 그 문장을 따로 박아 뒀다.
둥근 판때기로 그리면 예고에서 테두리처럼 읽히니 **아래가 뾰족한 히터 실드**로 간다.

## 조합은 왜 따로 만드나

두 갈래가 한꺼번에 오면 지금은 표식이 둘 나란히 선다. 적 이름 위 좁은 줄에서
**19px 짜리 둘 + 숫자**는 한 덩어리로 안 읽힌다. 그래서 묶인 표식 하나로 대신한다.

261개 행동 전수조사에서 실제로 나오는 조합은 넷뿐이고, **세 갈래가 한꺼번에 오는 행동은 하나도 없다.**
그래서 조합은 다섯(하나는 예비)으로 끝이다.

조합 그림은 **개념적으로 녹인 새 심볼이 아니다.** 낱개 둘을 그대로 두고 크기만 달리해 붙인다 —
공격(발톱)이나 방어(방패)가 축으로 제 크기 그대로 서고, 나머지가 절반 크기로 왼쪽 위에 걸친다.
프롬프트마다 `Do NOT blend them into a new invented symbol` 을 박아 뒀다.

## 여섯 낱개의 그림과 색 (조합이 이걸 섞는다)

| 갈래 | 그림 | 색 |
|---|---|---|
| 공격 | 붉은 발톱 자국 셋 | `#ff4f4f` |
| 방어 | 창백한 강철 방패 (아래가 뾰족한) | `#b9c6d6` |
| 강화 | 금색 위쪽 꺾쇠 | `#ffd257` |
| 방해 | 보라 소용돌이 | `#b07cff` |
| 의문 | 창백한 물음표 | `#d9d2c4` |
| 휴식 | 푸른 잿빛 zzZ | `#8fa8c4` |

---

# 1부 — 낱개 6종

## 공격 — `intent_attack`

<small>색 #ff4f4f</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single mark centered, filling about 82 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare mark itself: no circle, no ring, no disc, no badge, no shield plate, no frame, no border, no plaque, nothing enclosing it and nothing behind it. The mark must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It floats free on the background and must read as one clear silhouette at 19px. The dominant color of the whole icon must be #ff4f4f. The mark: three thick bright red claw slashes crossing, torn straight through the air. No text, no letters, no watermark.
```

## 방어 — `intent_defend` = `status_block`

<small>한 장을 두 파일에 넣는다. 예고로는 19px 맨몸, 족보 태그로는 26px 동그라미 안. 색 #b9c6d6</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single mark centered, filling about 82 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare mark itself: no circle, no ring, no disc, no badge, no shield plate, no frame, no border, no plaque, nothing enclosing it and nothing behind it. The mark must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It floats free on the background and must read as one clear silhouette at 19px. The dominant color of the whole icon must be #b9c6d6. This same mark is also shown inside a small dark round socket elsewhere in the game, so keep the silhouette compact, centered and free of thin protrusions — but do NOT draw that socket here. The mark: a broad pale steel shield seen straight on with a pointed bottom tip, one thick rivet band across it. No text, no letters, no watermark.
```

## 강화 — `intent_empower`

<small>색 #ffd257</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single mark centered, filling about 82 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare mark itself: no circle, no ring, no disc, no badge, no shield plate, no frame, no border, no plaque, nothing enclosing it and nothing behind it. The mark must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It floats free on the background and must read as one clear silhouette at 19px. The dominant color of the whole icon must be #ffd257. The mark: one bold upward chevron arrow with a short second chevron stacked under it, bright gold. No text, no letters, no watermark.
```

## 방해 — `intent_confuse`

<small>색 #b07cff</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single mark centered, filling about 82 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare mark itself: no circle, no ring, no disc, no badge, no shield plate, no frame, no border, no plaque, nothing enclosing it and nothing behind it. The mark must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It floats free on the background and must read as one clear silhouette at 19px. The dominant color of the whole icon must be #b07cff. The mark: one thick bright violet spiral swirl winding inward. No text, no letters, no watermark.
```

## 의문 — `intent_unknown`

<small>적이 뭘 할지 못 읽는 자리. 261개 행동 중 20개가 여기로 온다. 색 #d9d2c4</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single mark centered, filling about 82 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare mark itself: no circle, no ring, no disc, no badge, no shield plate, no frame, no border, no plaque, nothing enclosing it and nothing behind it. The mark must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It floats free on the background and must read as one clear silhouette at 19px. The dominant color of the whole icon must be #d9d2c4. The mark: one thick pale question mark scrawled in wobbly ink. Apart from the mark described above, no other text, no signature, no watermark.
```

> 물음표와 zzZ 는 글자라서 `No text, no letters` 와 부딪힌다. 그래서 이 둘만 마지막 문장을
> `Apart from the mark described above, no other text, no signature, no watermark.` 로 바꿔 뒀다.

## 휴식 — `intent_rest`

<small>적이 한 턴을 그냥 흘려보내는 예고. 지금 이 자리에만 이모지 `💤` 가 남아 있어서 그림들 사이에서 혼자 튄다. **손으로 그린 zzZ** 로 간다 — 연기 모양은 무슨 뜻인지 안 읽힌다. 색 #8fa8c4</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image. ONE single mark centered, filling about 82 percent of the frame, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare mark itself: no circle, no ring, no disc, no badge, no shield plate, no frame, no border, no plaque, nothing enclosing it and nothing behind it. The mark must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It floats free on the background and must read as one clear silhouette at 19px. The dominant color of the whole icon must be #8fa8c4. The mark: the classic sleep sign spelled zzZ — three bold hand-painted letter Z shapes rising diagonally to the upper right, a small z then a bigger z then a large Z, in pale blue-grey. The letters must be painted like a rough ink mark, thick and blunt, not a clean typeface. Apart from the mark described above, no other text, no signature, no watermark.
```

---

# 2부 — 조합 5종

**개념적으로 녹이지 않는다.** 낱개 둘을 그냥 붙여 놓는 것이다 —
**공격(발톱)이나 방어(방패)가 축**으로 제 크기 그대로 가운데에 서고, 나머지 하나가
**65% 크기**로 왼쪽 위 모서리에 살짝 걸쳐 붙는다. 둘 다 낱개일 때 모습 그대로여야 한다.

**공격+방어만 예외다.** 그 둘은 위계가 같아서 크기를 안 줄인다 — 방패 위에 발톱이 그대로 얹힌다.

작은 쪽을 **왼쪽 위**에 두는 건 예고 줄에서 수치가 표식 오른쪽에 붙기 때문이다 — 반대편이 비어 있다.

배치가 19px에서 읽히는지 지금 그림들로 미리 겹쳐 봤다 — `docs/mock_intent_combo.png`.
윗줄이 96px, 아랫줄이 실제 크기인 19px를 5배로 늘린 것이다. 왼쪽부터
공격+방해 · 방어+방해 · 공격+강화 · **공격+방어** · 방어+강화.

시안의 네 번째 칸(공격+방어)은 제대로 안 보인다 — 지금 「공격」 그림에 **어두운 둥근 판이 깔려 있어서**
뒤의 방패를 통째로 덮어 버린다. 그 판이 옛 세대의 흔적이고, 낱개까지 다시 뽑는 이유가 그거다.
새로 뽑으면 판이 없으니 발톱 사이로 방패가 그대로 보인다.

## 공격 + 방해 — `intent_attack_confuse`

<small>가장 많이 나온다(42회). 숲거미 「독니」 · 까마귀 「눈알 노리기」. 축 = 발톱 · 곁 = 소용돌이(절반)</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare marks themselves: no circle, no ring, no disc, no badge, no frame, no border, no plaque, nothing enclosing them and nothing behind them. Everything drawn must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It must read clearly at 19px. This icon is simply TWO existing marks put together — one big, one small. Do NOT blend them into a new invented symbol, do NOT stylize them into each other; both must stay instantly recognizable as their own separate shapes, exactly as they look on their own. The MAIN mark is three thick bright red claw slashes crossing, torn straight through the air — drawn at FULL size, centered, filling about 82 percent of the frame. The SECOND mark is one thick bright violet spiral swirl winding inward — drawn at about 65 percent of the size of the main mark — clearly smaller but still big and legible, not a tiny dot — sitting in the UPPER-LEFT corner and only slightly overlapping the main mark, like a badge stuck onto it. The dominant color is #ff4f4f with #b07cff as the secondary accent. No text, no letters, no watermark.
```

## 방어 + 방해 — `intent_defend_confuse`

<small>13회. 개울 정령 「물수제비」 · 진흙 골렘 「굳히기」. 축 = 방패 · 곁 = 소용돌이(절반)</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare marks themselves: no circle, no ring, no disc, no badge, no frame, no border, no plaque, nothing enclosing them and nothing behind them. Everything drawn must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It must read clearly at 19px. This icon is simply TWO existing marks put together — one big, one small. Do NOT blend them into a new invented symbol, do NOT stylize them into each other; both must stay instantly recognizable as their own separate shapes, exactly as they look on their own. The MAIN mark is a broad pale steel shield seen straight on with a pointed bottom tip, one thick rivet band across it — drawn at FULL size, centered, filling about 82 percent of the frame. The SECOND mark is one thick bright violet spiral swirl winding inward — drawn at about 65 percent of the size of the main mark — clearly smaller but still big and legible, not a tiny dot — sitting in the UPPER-LEFT corner and only slightly overlapping the main mark, like a badge stuck onto it. The dominant color is #b9c6d6 with #b07cff as the secondary accent. No text, no letters, no watermark.
```

## 공격 + 강화 — `intent_attack_empower`

<small>7회, 전부 각성기다. 늑대 「붉은 달의 사냥」 · 무덤지기 「마지막 의식」. 축 = 발톱 · 곁 = 꺾쇠(절반)</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare marks themselves: no circle, no ring, no disc, no badge, no frame, no border, no plaque, nothing enclosing them and nothing behind them. Everything drawn must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It must read clearly at 19px. This icon is simply TWO existing marks put together — one big, one small. Do NOT blend them into a new invented symbol, do NOT stylize them into each other; both must stay instantly recognizable as their own separate shapes, exactly as they look on their own. The MAIN mark is three thick bright red claw slashes crossing, torn straight through the air — drawn at FULL size, centered, filling about 82 percent of the frame. The SECOND mark is one bold upward chevron arrow with a short second chevron stacked under it, bright gold — drawn at about 65 percent of the size of the main mark — clearly smaller but still big and legible, not a tiny dot — sitting in the UPPER-LEFT corner and only slightly overlapping the main mark, like a badge stuck onto it. The dominant color is #ff4f4f with #ffd257 as the secondary accent. No text, no letters, no watermark.
```

## 공격 + 방어 — `intent_attack_defend`

<small>3회, 전부 각성기다. 가시덤불 「가시 폭발」 · 해골 병사 「뼈 무너뜨리기」. **여기만 크기 차이가 없다** — 공격과 방어는 위계가 같아서 둘 다 제 크기로, 방패 위에 발톱이 얹힌다</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare marks themselves: no circle, no ring, no disc, no badge, no frame, no border, no plaque, nothing enclosing them and nothing behind them. Everything drawn must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It must read clearly at 19px. This icon is simply TWO existing marks put together, one laid over the other. Do NOT blend them into a new invented symbol, do NOT stylize them into each other; both must stay instantly recognizable as their own separate shapes, exactly as they look on their own. BOTH marks are drawn at FULL size and equal weight — neither is shrunk down. Behind: a broad pale steel shield seen straight on with a pointed bottom tip, one thick rivet band across it, centered and filling about 82 percent of the frame. In front: three thick bright red claw slashes crossing, torn straight through the air, raked straight across the face of the shield and overhanging its edges. The two colors #ff4f4f and #b9c6d6 carry equal weight. No text, no letters, no watermark.
```

## 방어 + 강화 — `intent_defend_empower`

<small>아직 쓰는 행동이 없다. 자리만 잡아 두는 것. 축 = 방패 · 곁 = 꺾쇠(절반)</small>

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Square 1:1 image, on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare marks themselves: no circle, no ring, no disc, no badge, no frame, no border, no plaque, nothing enclosing them and nothing behind them. Everything drawn must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. It must read clearly at 19px. This icon is simply TWO existing marks put together — one big, one small. Do NOT blend them into a new invented symbol, do NOT stylize them into each other; both must stay instantly recognizable as their own separate shapes, exactly as they look on their own. The MAIN mark is a broad pale steel shield seen straight on with a pointed bottom tip, one thick rivet band across it — drawn at FULL size, centered, filling about 82 percent of the frame. The SECOND mark is one bold upward chevron arrow with a short second chevron stacked under it, bright gold — drawn at about 65 percent of the size of the main mark — clearly smaller but still big and legible, not a tiny dot — sitting in the UPPER-LEFT corner and only slightly overlapping the main mark, like a badge stuck onto it. The dominant color is #b9c6d6 with #ffd257 as the secondary accent. No text, no letters, no watermark.
```

---

# 한 시트로 몰아 뽑고 싶다면

한 시트로 뽑으면 여섯이 같은 붓에서 나와 결이 제일 잘 맞는다. 대신 **낱개와 조합은 반드시 따로** 뽑는다.
섞으면 낱개까지 두 개씩 붙은 그림으로 나온다.

시트로 뽑을 땐 색코드 문장을 못 쓰니, 묘사 안의 색 낱말
(bright red / pale steel / bright gold / bright violet / pale ivory / pale blue-grey)에 맡긴다.

## 시트 1 — 낱개 6종 (3×2)

```
Stylized dark fairytale UI icon set for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Landscape 3:2 image. A 3x2 grid of six marks, equal cells, equal spacing, identical framing, each centered in its own cell, all on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare marks themselves: no circle, no ring, no disc, no badge, no shield plate, no frame, no border, no plaque, nothing enclosing them and nothing behind them. Every mark must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. Each floats free and must read as one clear silhouette at 19px. Each cell holds ONE simple mark, never two things combined. Two of the marks are lettering (a question mark, and the letters zzZ) — those are the marks themselves and must be drawn. IN ORDER — three thick bright red claw slashes crossing, torn straight through the air / a broad pale steel shield seen straight on with a pointed bottom tip, one thick rivet band across it / one bold upward chevron arrow with a short second chevron stacked under it, bright gold // one thick bright violet spiral swirl winding inward / one thick pale ivory question mark scrawled in wobbly ink / the classic sleep sign spelled zzZ — three bold hand-painted letter Z shapes rising diagonally to the upper right, a small z then a bigger z then a large Z, in pale blue-grey, painted like a rough ink mark, thick and blunt, not a clean typeface. Apart from the marks described above, no other text, no signature, no watermark.
```

## 시트 2 — 조합 5종 (3×2, 마지막 칸은 비움)

```
Stylized dark fairytale UI icon set for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, VERY LOW detail density — no dense texture, no tiny clutter, no thin hatching, no engraved line work, no small internal details. NOT photorealistic, NOT 3D. Landscape 3:2 image. A 3x2 grid of cells, equal cells, equal spacing, identical framing; the first five cells each hold one icon centered in its own cell and the sixth cell is left completely empty. All on one plain flat mid-grey background — solid color, no gradient, no checkerboard. IMPORTANT — draw ONLY the bare marks themselves: no circle, no ring, no disc, no badge, no frame, no border, no plaque, nothing enclosing them and nothing behind them. Everything drawn must be BRIGHT and vivid, clearly LIGHTER than the mid-grey background — do NOT make it dark or muddy. Each cell must read clearly at 19px. Each cell is simply TWO existing marks put together — one big, one small. Do NOT blend them into a new invented symbol, do NOT stylize them into each other; both must stay instantly recognizable as their own separate shapes. In four of the five cells the small one is about 65 percent of the size of the big one — clearly smaller but still big and legible — sitting in the UPPER-LEFT corner and only slightly overlapping it. The FOURTH cell is the exception: there both marks are drawn at FULL size and equal weight, the claw slashes raked straight across the face of the shield. IN ORDER — a MAIN full-size three thick bright red claw slashes crossing, torn straight through the air, with a 65-PERCENT-SIZE one thick bright violet spiral swirl winding inward in its upper-left corner / a MAIN full-size a broad pale steel shield seen straight on with a pointed bottom tip, one thick rivet band across it, with a 65-PERCENT-SIZE one thick bright violet spiral swirl winding inward in its upper-left corner / a MAIN full-size three thick bright red claw slashes crossing, torn straight through the air, with a 65-PERCENT-SIZE one bold upward chevron arrow with a short second chevron stacked under it, bright gold in its upper-left corner // a broad pale steel shield seen straight on with a pointed bottom tip, one thick rivet band across it with three thick bright red claw slashes crossing, torn straight through the air raked across its face, both at FULL size / a MAIN full-size a broad pale steel shield seen straight on with a pointed bottom tip, one thick rivet band across it, with a 65-PERCENT-SIZE one bold upward chevron arrow with a short second chevron stacked under it, bright gold in its upper-left corner / empty cell, nothing drawn. No text, no letters, no watermark.
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

배경을 걷어내고 알파만 남겨 96px로 굽는다. `build_tag` 가 게임 톤(HSV 명도 46 · 채도 70)으로 눌러 준다.
굽고 나서 밝기를 다시 재서 **45 아래면 다시 뽑는다.**

**낱개 6종**은 파일만 갈아 끼우면 그대로 반영된다. 방패만 한 장을 `status_block.png` 와
`intent_defend.png` 두 파일로 복사해 넣는다 — 족보 태그·방어도 표시·적 예고가 한꺼번에 바뀐다. 휴식만 코드가 한 줄씩 더 필요하다 —
`engine.js` 의 `'💤'` 와 `main.js` 의 `iconifyIntent` 를 이으면 화면에서 이모지가 완전히 사라지고,
그 뒤 `node test/emojicheck.mjs` 가 0 을 뱉는다.

**조합 5종**은 파일을 넣고 `js/main.js` 의 `INTENT_COMBO_READY` 에 이름을 적으면 끝난다.

```js
const INTENT_COMBO_READY = new Set(['intent_attack_confuse']);
```

**적기 전까지는 예전처럼 표식 둘이 나란히 뜬다.** 그림이 없어도 화면은 안 깨지고,
한 종씩 받는 대로 하나씩 바꿔 끼울 수 있다.

옛 `intent_heal` 은 v3.60부터 아무 데서도 안 쓴다. 낱개를 다 갈아 끼우고 나서 지운다.
