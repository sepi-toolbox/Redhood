# 상태·버프 아트 프롬프트 (v3.10)

상태이상 표시는 **리소스가 두 종류**다. 섞으면 안 된다.

| 종류 | 파일 | 어디에 쓰이나 | 규격 |
|---|---|---|---|
| **① 덮개** | `assets/ui/status_die_*.png` | **주사위 칸 위**에 얹힌다 | 256×256, 알파, 가장자리에 붙고 **가운데는 비운다** |
| **② 아이콘** | `assets/icons/status_*.png` | 버프 칩·배지·설명문 앞 (13~17px) | 96×96, 둥근 메달, 심볼 하나 |

붙이는 건 스크립트 한 줄이다 — 회색 배경으로 뽑아서 주면 된다.

```
python3 tools/make_icon.py <원본.png> status_poison        # ② 아이콘
python3 -c "import sys;sys.path.insert(0,'tools');import make_icon;make_icon.build_die('<원본.png>','lock')"   # ① 덮개
```

---

# 1부 · 주사위 덮개 (①)

## 지금 상태 — 13종 있음, 손볼 것 5종

| 상태 | 현재 | 판정 |
|---|---|---|
| 출혈·독·저주·축복·부패·결속·약탈 | 가장자리 모티프, 눈 잘 보임 | ✅ 그대로 |
| 혼란 | 보라 소용돌이가 칸 전체를 덮음 | ✅ 의도대로 (규칙이 "눈을 가린다") |
| **봉인** | 밀랍이 칸을 전부 덮어 **눈이 안 보임** | ⚠ 규칙은 "굴리기 전엔 값이 없다"지 가리는 게 아님 → **재제작** |
| **포박** | 가는 실 낙서처럼 보임 | ⚠ 가는 선 문제 → **재제작** |
| **기절** | 가는 흰 금 — 잘 안 보임 | ⚠ **재제작** |
| **마비** | 가는 파란 번개 여러 줄 — 어수선함 | ⚠ **재제작** |
| **잠식** | 아래쪽 검은 촉수, 가늘다 | 🔸 여유되면 재제작 |
| **물림(신규)** | **없음** — 지금은 CSS 사슬 기호로 때움 | ❌ **신규 필요** |

## 덮개 규격

- **비율·크기**: Square 1:1, 1024×1024로 뽑으면 256으로 줄여 쓴다
- **배경**: 중간 회색 단색 (내가 키잉해서 투명으로 만든다). "transparent background"라고 쓰면 분홍
  체커보드가 나온다 (ART_PROMPTS 규칙 1)
- **가운데를 비운다**: 주사위 눈이 읽혀야 한다. 모티프는 **위·아래·좌우 가장자리와 모서리**에만.
  가운데 56% 영역은 비워둘 것 (혼란처럼 "가리는 게 규칙"인 것만 예외)
- **선**: 굵은 덩어리로. 가는 선·해칭·잔가닥 금지 (규칙 3 — 성권 피드백)
- **금지**: 주사위 자체를 그리지 말 것(덮개만), 글자·숫자, 사실주의·3D, 프레임

### 덮개 공통 머리 블록

```
Stylized dark fairytale overlay effect for the dice game REDHOOD. Match the EXACT painting style,
angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art.
SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture,
no tiny clutter, no thin hatching lines, no thin scribbled strands. NOT photorealistic, NOT 3D.
Square 1:1 image on one plain flat mid-grey background — solid color, no gradient, no checkerboard.
Do NOT draw a die or any object underneath — draw ONLY the effect itself.
The effect clings to the EDGES and CORNERS of the square frame and the CENTER of the image is
completely EMPTY (nothing in the middle 60 percent). The effect: {묘사}.
No text, no letters, no watermark.
```

## 덮개 프롬프트

| 파일명 | 상태 | 효과 묘사 |
|---|---|---|
| `status_die_lock.png` | **물림** (신규) | `one thick pale sucker mouth clamped onto the left edge, a ring of blunt teeth biting in, two heavy tendrils gripping the top and bottom edges` |
| `status_die_seal.png` | **봉인** (재제작) | `a wide dark-red wax seal blob sitting on the bottom edge with two thick parchment ribbons crossing only the lower corners` |
| `status_die_bind.png` | **포박** (재제작) | `one very thick coarse rope wrapped once around the left and right edges, a fat knot bulging at the left, chunky twisted fibers` |
| `status_die_stun.png` | **기절** (재제작) | `heavy grey stone crust creeping in from all four corners, thick blunt fracture wedges, the middle still open` |
| `status_die_numb.png` | **마비** (재제작) | `two fat pale-blue frozen lightning bolts hugging the left and right edges, thick blocky forks, frost crust at the corners` |
| `status_die_devour.png` | 잠식 (선택) | `a solid black void swallowing the bottom and left edges, one row of blunt teeth along its rim` |

---

# 2부 · 배지 아이콘 (②)

## 지금 상태 — 8종 완성, 11종 임시, 11종 신규 필요

| 구분 | 파일 | 상태 |
|---|---|---|
| 기존 정식 8종 | `status_{bleed,block,confuse,focus,regen,strength,vulnerable,weak}.png` | ✅ 완성 (기준 아트) |
| 상태이상 11종 | `status_{poison,bind,stun,curse,blessing,seal,rot,chain,numb,plunder,devour}.png` | ⚠ 임시 — 주사위 오버레이 아트를 메달에 얹어 자동 합성. **A절 프롬프트로 교체 필요** |
| 새 효과 11종 | 전용 파일 없음 — 뜻이 가까운 기존 아이콘을 임시로 돌려 씀 | ⚠ **B절 프롬프트로 신규 제작 필요** |

임시로 돌려 쓰는 매핑 (`js/main.js`의 `FX_ICON`): 리롤 세금·홀드 세금→bleed / 굳음→stun / 물기→bind /
어둠→confuse / 족보 봉인→seal / 문턱·상한→block / 격노→strength / 반사→vulnerable / 불사·재생→regen.

---

## 공통 사양 (모든 아이콘)

> **docs/ART_PROMPTS.md 의 검증된 규칙을 그대로 따른다.** 특히 규칙 3(디테일 과다 방지)·4(굵은 외곽선)·
> 1·11(배경 지정)·7(글자 금지). 아래 머리 블록에 이미 반영돼 있으니 문구를 임의로 바꾸지 말 것.

- **크기·비율**: Square 1:1 (규칙 10). 512×512 권장 — 게임에서 96px·20px로 축소된다
- **배경**: 아이콘 심볼은 어두운 갈색 계열이 많으므로 **중간 회색 배경**을 쓴다 (규칙 11 — 배경과 피사체
  색이 겹치면 배경 제거가 실패한다). 메달 테를 그리는 게 아니라 **심볼만** 받아서 게임의 메달 틀에 얹는다
- **선**: 심볼 하나, 굵은 외곽선, 넓은 색면. **가는 선·해칭·잔디테일 금지** (규칙 3 — 성권 피드백)
- **금지**: 글자·숫자, 사실주의·3D, 매끈한 벡터/플랫, 프레임·테두리 장식, 여러 상징 나열
- **읽기 조건**: 20px에서 실루엣만으로 구분될 것
- **첨부**: `docs/keyart/stilllife` + 기존 `assets/icons/status_bleed.png`, `status_block.png`, `status_strength.png`

### 공통 머리 블록 (모든 항목 앞에 붙인다)

```
Stylized dark fairytale UI icon for the dice game REDHOOD. Match the EXACT painting style, angular
brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold
shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter,
no thin hatching lines, no engraved line work. NOT photorealistic, NOT 3D. Square 1:1 image.
ONE single symbol centered, filling about 78 percent of the frame, on one plain flat mid-grey
background — solid color, no gradient, no checkerboard. No circular frame, no border, no background
decoration. Bold silhouette, readable at 20px. The symbol: {묘사}. No text, no letters, no watermark.
```

**여러 개를 한 번에 뽑을 때** (권장 — 톤이 일정하게 나온다): 위 블록에서 비율만 `Landscape 3:2 image.
A 3x2 grid of six symbols, equal cells, equal spacing` 로 바꾸고 `IN ORDER — {1} / {2} / {3} // {4} / {5} / {6}` 로 나열.

## A. 상태이상 11종 (임시 아이콘 교체용)

각 항목의 `Symbol:` 뒤 문장만 바꿔 넣으면 된다. 파일명은 반드시 그대로.

| 파일명 | 이름 | Symbol 프롬프트 |
|---|---|---|
| `status_poison.png` | 독 | `two fat sickly-green venom droplets falling from one thick curved fang` |
| `status_bind.png` | 포박 | `one thick rope loop pulled into a tight knot, chunky twisted strands` |
| `status_stun.png` | 기절 | `a grey stone die split by one heavy jagged crack` |
| `status_curse.png` | 저주 | `a black downward crescent with one weeping eye at its center` |
| `status_blessing.png` | 축복 | `a small solid pale-gold crown with one broad halo of warm light behind it` |
| `status_seal.png` | 봉인 | `one deep-red wax seal blob stamped over a folded parchment corner` |
| `status_rot.png` | 부패 | `a swollen dark pustule with one short lit fuse and a bright ember tip` |
| `status_chain.png` | 결속 | `two thick iron chain links interlocked, heavy blocky shapes` |
| `status_numb.png` | 마비 | `one thick pale-blue lightning bolt over a stiff open palm` |
| `status_plunder.png` | 약탈 | `a tipped-over leather pouch with two big dull gold coins spilling out` |
| `status_devour.png` | 잠식 | `a solid black void blob eating into the frame, one row of blunt teeth at its edge` |

## B. 새 효과 10종 (신규 제작)

| 파일명 | 이름 | 뜻 | Symbol 프롬프트 |
|---|---|---|---|
| `fx_rolltax.png` | 이빨 자국 | 다시 굴릴 때마다 피해 | `two round fang puncture holes on pale skin with one thick red drop below` |
| `fx_holdtax.png` | 가시 | 지킨 주사위마다 피해 | `a closed fist gripping one thick thorned stem, three big thorns` |
| `fx_petrify.png` | 굳음 | 그 눈이 돌이 된다 | `a wooden die half turned to solid grey stone, split down the middle` |
| `fx_lockhigh.png` | 물기 | 가장 높은 눈이 물린다 | `a round sucker mouth clamped onto a wooden die, one ring of blunt teeth` |
| `fx_blind.png` | 어둠 | 위력이 보이지 않는다 | `one thick curl of smoke covering a dim closed eye` |
| `fx_seal_cat.png` | 족보 봉인 | 그 족보를 못 쓴다 | `a heavy blocky iron padlock over a folded parchment, big keyhole` |
| `fx_ward.png` | 문턱 | 얕은 타격은 안 통함 | `a squat mossy boundary stone with one blade glancing off its face` |
| `fx_cap.png` | 상한 | 한 번에 이 이상 못 줌 | `a thick iron shackle clamped around a raised fist, one taut chain link` |
| `fx_enrage.png` | 격노 | 맞을수록 사나워짐 | `one snarling beast eye with a hot red glow rising under it` |
| `fx_reflect.png` | 반사 | 때리면 되받음 | `a hide shield with three big outward thorns, one thorn tipped red` |
| `fx_undying.png` | 불사 | 한 번 다시 일어남 | `a cracked skull with one green soul-flame burning in an eye socket` |

## C. 선택 — 남은 이모지 (급하지 않음)

전투 화면에 아직 이모지로 남은 것: 🪙 코인 · ❤ 체력 · 🎲 굴림 단추 · ⚡ 일격 표식.
상태이상이 아니라 UI 장식이라 급하진 않지만, 같은 메달 화풍으로 뽑아두면 화면이 완전히 통일된다.

| 파일명 | Symbol 프롬프트 |
|---|---|
| `ui_coin.png` | `one worn gold coin face-on with a simple wolf head shape on it` |
| `ui_heart.png` | `a solid deep-crimson heart with one thick thorn wrapped across it` |
| `ui_roll.png` | `a wooden die tilted mid-tumble, warm light on its top face` |
| `ui_burst.png` | `one sharp bright wedge of light, a struck spark` |

---

## 받은 뒤 절차

1. 생성한 이미지를 대화에 올리고 어떤 항목인지 한 마디 (예: "독·포박·기절")
2. 내가 512→96px 정규화·이름 지정·연동·검수까지 처리 (A절은 파일 덮어쓰기만으로 즉시 반영,
   B절은 `FX_ICON` 매핑을 전용 파일로 교체)
