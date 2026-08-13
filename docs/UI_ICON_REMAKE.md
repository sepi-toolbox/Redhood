# 어두워서 안 보이는 아이콘 12종 다시 뽑기 (v3.24)

> **v3.50 — 이 중 족보 태그로 쓸 6종(힘·집중·재생·방어·약화·취약)은
> `docs/TAG_ICON_REMAKE.md` 로 옮겼다.** 조립이 끝난 프롬프트가 그 파일 하나에 다 들어 있고,
> 26px 원 안에서 읽히도록 문구도 손봤다. 아래는 나머지(적 의도 6종)를 위한 옛 기록.

## 왜 이것들만인가

아이콘 37종의 평균 밝기를 재봤다. 딱 갈린다.

| 세대 | 아이콘 | 평균 밝기 |
|---|---|---|
| **v0.24 옛 세대 (다시 뽑을 것)** | 재생·강화·힘·공격·의문·약화·치료·방어·취약·혼란·집중·방어(의도) | **22 ~ 33** |
| v3.13~ 새 세대 (그대로 둘 것) | 어둠·가시·상한·봉인·잠식·출혈·포박 … 축복 | 47 ~ 102 |

옛 세대는 전부 **어두운 청동 메달에 어두운 심볼**이라 13px 배지에서 검은 동그라미로만 보인다.
벼름·출혈·격노처럼 색이 확실한 새 세대와 나란히 놓으면 있는지도 모른다. 그래서 이 12종만 다시 뽑는다.

## 머리 블록 (기존 「아이콘 공통 머리 블록」 그대로)

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular
brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold
shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter,
no thin hatching lines, no engraved line work. NOT photorealistic, NOT 3D. Square 1:1 image.
ONE single symbol centered, filling about 78 percent of the frame, on one plain flat mid-grey
background — solid color, no gradient, no checkerboard. No circular frame, no border, no background
decoration. Bold silhouette, readable at 20px. The dominant color of the whole icon must be {색코드}.
The symbol: {묘사}. No text, no letters, no watermark.
```

**한 줄만 덧붙인다** — 이번 건의 핵심이 밝기라서.

```
The symbol must be BRIGHT and vivid against the grey background, clearly lighter than mid-grey. Do NOT make it dark or muddy.
```

## 표 (파일명 그대로 덮어쓰면 된다)

### 시트 1 — 내 버프·적 배지 6종

| 파일명 | 이름 | 색코드 | `The symbol:` |
|---|---|---|---|
| `status_strength.png` | 힘 | `#f0b429` | `a clenched bare fist punching forward, thick blunt knuckles, one bright gold flare behind it` |
| `status_focus.png` | 집중 | `#4fc3f7` | `one wide open eye with a bright pale-blue iris and a sharp highlight` |
| `status_regen.png` | 재생 | `#e5468f` | `a plump bright pink heart with one small new leaf sprouting from its top` |
| `status_block.png` | 방어 | `#b9c6d6` | `a broad pale steel shield seen straight on, one thick rivet band across it` |
| `status_weak.png` | 약화 | `#a98cd8` | `a sword snapped in half, the two bright violet-steel pieces falling apart` |
| `status_vulnerable.png` | 취약 | `#ff8a3d` | `a chest plate with one wide jagged crack splitting it, hot orange light through the crack` |

### 시트 2 — 적 예고(의도) 6종

| 파일명 | 이름 | 색코드 | `The symbol:` |
|---|---|---|---|
| `intent_attack.png` | 공격 | `#ff4f4f` | `three thick bright red claw slashes crossing` |
| `intent_defend.png` | 방어 | `#b9c6d6` | `a broad pale steel shield seen straight on, one thick rivet band across it` |
| `intent_confuse.png` | 혼란 | `#b07cff` | `one thick bright violet spiral swirl` |
| `intent_empower.png` | 강화 | `#ffd257` | `a bare arm flexed hard, one bright gold chevron arrow pointing up beside it` |
| `intent_heal.png` | 치료 | `#37d67a` | `a plump bright green heart with a thick cross cut into it` |
| `intent_unknown.png` | 의문 | `#d9d2c4` | `one thick pale question mark scrawled in wobbly ink` |

> `status_block`과 `intent_defend`는 **같은 그림·같은 색**이다. 뜻이 같으니 하나만 뽑아 두 파일로 넣어도 된다.
> 마찬가지로 `status_regen`은 적의 재생 배지에도 쓰이므로 색을 `fxColors.regen`(`#e5468f`)에서 물려받았다.

## 색을 이렇게 고른 이유

같은 줄에 안 뜨는 것끼리는 색을 아껴 쓴다는 기존 원칙 그대로다. 확인한 결과는 이렇다.

- **내 버프 스트립**(힘·집중·재생 + 벼름·출혈·이빨자국·가시·굳음·물기·어둠) 안에서 힘은 금(#f0b429), 집중은 하늘(#4fc3f7), 재생은 분홍(#e5468f)으로 서로 ΔE 30 이상 벌어진다.
- **적 배지**(방어·약화·취약 + 문턱·상한·격노·반사·불사) 안에서 방어는 은빛, 약화는 보라, 취약은 주황이다. 취약과 격노(#e0521a)가 ΔE 20.8로 가장 가깝지만 형태가 갑옷과 불꽃으로 완전히 다르다.
- **적 의도 줄** 여섯은 붉은 발톱·은 방패·보라 나선·금 화살·초록 심장·회백 물음표로 색이 다 갈린다.

## 시트로 뽑을 때

머리 블록의 비율 문구만 바꾸고 여섯을 이어 붙인다.

```
Landscape 3:2 image. A 3x2 grid of six symbols, equal cells, equal spacing
```

그리고 `The symbol:` 자리를 `IN ORDER — {1} / {2} / {3} // {4} / {5} / {6}` 로. 색코드는 시트 단위로는
못 넣으니, 시트로 뽑을 땐 `The dominant color of the whole icon must be {색코드}.` 줄을 빼고
각 묘사 안의 색 낱말(bright gold / pale-blue / bright pink …)에 맡기면 된다.

## 받은 뒤

```
python3 tools/make_icon.py <원본.png> status_strength      # 메달·색 자동
```
`status_*`는 `statuses.json` 색을 자동으로 물들이는데 힘·집중은 그 목록에 없으니 내가 색을 직접 넣어 굽는다.
시트로 주면 칸 나누는 것도 내가 한다.
