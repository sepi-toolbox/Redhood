# 상태·버프 아이콘 프롬프트 (v3.10)

이모지를 전부 걷어내고 그림으로 바꿨다. 지금 인게임에는 **임시 아이콘**이 들어가 있고,
아래 프롬프트로 뽑은 정식 아트가 오면 같은 파일명으로 덮으면 끝난다(코드 수정 불필요).

## 지금 상태

| 구분 | 파일 | 상태 |
|---|---|---|
| 기존 정식 8종 | `status_{bleed,block,confuse,focus,regen,strength,vulnerable,weak}.png` | ✅ 완성 (기준 아트) |
| 상태이상 11종 | `status_{poison,bind,stun,curse,blessing,seal,rot,chain,numb,plunder,devour}.png` | ⚠ 임시 — 주사위 오버레이 아트를 메달에 얹어 자동 합성. **A절 프롬프트로 교체 필요** |
| 새 효과 10종 | 전용 파일 없음 — 뜻이 가까운 기존 아이콘을 임시로 돌려 씀 | ⚠ **B절 프롬프트로 신규 제작 필요** |

임시로 돌려 쓰는 매핑 (`js/main.js`의 `FX_ICON`): 리롤 세금·홀드 세금→bleed / 굳음→stun / 물기→bind /
어둠→confuse / 족보 봉인→seal / 문턱·상한→block / 격노→strength / 반사→vulnerable / 불사·재생→regen.

---

## 공통 사양 (모든 아이콘)

- **크기**: 정사각 512×512 PNG, 배경 투명 없이 꽉 찬 원형 메달 (게임에서 96px·20px로 축소됨)
- **형식**: 어두운 황동 테를 두른 **둥근 메달** 안에 상징 하나. 기존 8종과 테·두께·명도가 같아야 한다
- **화풍**: 손으로 칠한 다크 판타지 동화. 거친 붓결, 낮은 채도, 따뜻한 갈색 바탕(#241a13~#3a2a1c)
- **금지**: 텍스트·숫자·글자, 사진 실사, 매끈한 벡터/플랫 디자인, 3D 렌더, 흰 배경, 여러 상징 나열
- **읽기 조건**: 20px로 줄여도 실루엣만으로 구분돼야 한다 → 상징 하나, 굵은 형태, 배경과 명도 대비 확보
- **첨부**: 기존 `assets/icons/status_bleed.png`, `status_block.png`, `status_strength.png` 3장을 스타일 기준으로 함께 첨부

공통 접두 프롬프트(모든 항목 앞에 붙인다):

```
A single dark-fantasy storybook status icon, painted in the style of the attached reference medallions:
a round aged-brass medallion with a beveled rim, dark warm brown leather center, one bold symbol
centered inside, hand-painted texture with visible brush grain, muted desaturated palette, soft top
light, heavy shadow at the bottom, readable as a silhouette at very small size, square 1:1 composition,
no text, no numbers, no photorealism, no flat vector look, no 3D render.
Symbol:
```

---

## A. 상태이상 11종 (임시 아이콘 교체용)

각 항목의 `Symbol:` 뒤 문장만 바꿔 넣으면 된다. 파일명은 반드시 그대로.

| 파일명 | 이름 | Symbol 프롬프트 |
|---|---|---|
| `status_poison.png` | 독 | `three thick sickly-green venom droplets dripping from a curved fang, faint bubbling froth` |
| `status_bind.png` | 포박 | `a coil of frayed rope knotted tight around an invisible wrist, one loose fiber end` |
| `status_stun.png` | 기절 | `a cracked grey stone die with a jagged fracture across its face, small chips flying off` |
| `status_curse.png` | 저주 | `a downward-pointing black crescent with a single weeping eye, dark tendrils bleeding down` |
| `status_blessing.png` | 축복 | `a small pale-gold crown haloed by soft warm light, three faint sparks above it` |
| `status_seal.png` | 봉인 | `a deep-red wax seal stamped over crossed parchment ribbons, edges of the wax cracked` |
| `status_rot.png` | 부패 | `a swollen blistering pustule with a lit fuse coiling out of the top, ember at the tip` |
| `status_chain.png` | 결속 | `two heavy iron chain links locked together, cold steel highlight on the upper link` |
| `status_numb.png` | 마비 | `a pale-blue lightning fork frozen mid-crackle over a stiff open hand, frost at the edges` |
| `status_plunder.png` | 약탈 | `a torn leather coin pouch tipped over with two dull gold coins spilling out` |
| `status_devour.png` | 잠식 | `a creeping black void spreading from the corner like ink swallowing the medallion, small hungry teeth at its edge` |

## B. 새 효과 10종 (신규 제작)

| 파일명 | 이름 | 뜻 | Symbol 프롬프트 |
|---|---|---|---|
| `fx_rolltax.png` | 이빨 자국 | 다시 굴릴 때마다 피해 | `a bleeding bite mark of two fang punctures on pale skin, fresh red drops welling up` |
| `fx_holdtax.png` | 가시 | 지킨 주사위마다 피해 | `a closed fist gripping a thorny bramble stem, thorns piercing through, blood beading` |
| `fx_petrify.png` | 굳음 | 그 눈이 돌이 된다 | `a die face turning to rough grey stone, the pips fading into the rock as it hardens` |
| `fx_lockhigh.png` | 물기 | 가장 높은 눈이 물린다 | `a lamprey-like round sucker mouth clamped onto a wooden die, ring of tiny teeth` |
| `fx_blind.png` | 어둠 | 위력이 보이지 않는다 | `a snuffed candle wick with a thick curl of smoke veiling a dim eye behind it` |
| `fx_seal_cat.png` | 족보 봉인 | 그 족보를 못 쓴다 | `a heavy iron padlock hanging over a folded scroll of parchment, keyhole facing forward` |
| `fx_ward.png` | 문턱 | 얕은 타격은 안 통함 | `a squat mossy boundary stone half-buried in earth, a shallow blade chipping off its face` |
| `fx_cap.png` | 상한 | 한 번에 이 이상 못 줌 | `a thick iron shackle clamped around a raised sword arm, chain pulled taut` |
| `fx_enrage.png` | 격노 | 맞을수록 사나워짐 | `a snarling beast eye with a bulging vein, hot red glow rising from below the eye` |
| `fx_reflect.png` | 반사 | 때리면 되받음 | `a hide shield bristling with outward-facing thorns, one thorn wet with blood` |
| `fx_undying.png` | 불사 | 한 번 다시 일어남 | `a cracked skull reassembling itself, a faint green soul-flame flickering in one eye socket` |

## C. 선택 — 남은 이모지 (급하지 않음)

전투 화면에 아직 이모지로 남은 것: 🪙 코인 · ❤ 체력 · 🎲 굴림 단추 · ⚡ 일격 표식.
상태이상이 아니라 UI 장식이라 급하진 않지만, 같은 메달 화풍으로 뽑아두면 화면이 완전히 통일된다.

| 파일명 | Symbol 프롬프트 |
|---|---|
| `ui_coin.png` | `a single worn gold coin seen face-on, edge nicked, faint engraved wolf profile` |
| `ui_heart.png` | `a small deep-crimson anatomical heart with a thin thorn wrapped once around it` |
| `ui_roll.png` | `a wooden die mid-tumble with motion arcs, warm lamplight on its top face` |
| `ui_burst.png` | `a struck flint throwing a single hot spark, sharp bright wedge of light` |

---

## 받은 뒤 절차

1. 생성한 이미지를 대화에 올리고 어떤 항목인지 한 마디 (예: "독·포박·기절")
2. 내가 512→96px 정규화·이름 지정·연동·검수까지 처리 (A절은 파일 덮어쓰기만으로 즉시 반영,
   B절은 `FX_ICON` 매핑을 전용 파일로 교체)
