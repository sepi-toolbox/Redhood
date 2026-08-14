# 지금 그려야 하는 리소스

`node tools/arttodo.mjs` 로 코드·데이터에서 다시 뽑는다. 손으로 고치지 말 것.
규격은 같은 갈래의 기존 그림을 따른다 — 배경 투명, 여백 최소, 단색 심볼.

| 갈래 | 이름 | 넣을 곳 | 지금은 | 프롬프트 |
|---|---|---|---|---|
| 표식 | 철갑 | `assets/icons/status_ironclad.png` | status_block.png 를 빌림 | `a layered iron plate pauldron, riveted bands, seen head-on` |
| 표식 | 가시 | `assets/icons/status_thorns.png` | fx_reflect.png 를 빌림 | `a ring of sharp bramble thorns curving outward` |
| 표식 | 행운 | `assets/icons/status_fortune.png` | status_blessing.png 를 빌림 | `a four-leaf clover with a faint spark at its centre` |
| 주사위 판 | 굳음 | `assets/ui/status_die_petrify.png` | status_die_stun.png 를 빌림 | `a die face crusted over with grey stone, cracks spreading from the centre` |
| 족보 판 | 독버섯 | `assets/ui/paper_deathcap.png` | 네 송곳니 그림 그대로 | `four speckled death-cap mushrooms in a row, caps tilted` |
| 족보 판 | 역병의 달 | `assets/ui/paper_plague_moon.png` | 핏빛 만월 그림 그대로 | `a full moon veined with sickly green rot, faint vapour rising` |

## 넣는 법

- 표식(`assets/icons/`) — 파일을 넣고 `js/main.js` 의 `BUFF_ART_READY` 에 이름을 적는다.
- 주사위 판(`assets/ui/status_die_*.png`) — 파일을 넣고 `DIE_ART_ALIAS` 에서 그 줄을 지운다.
- 족보 판(`assets/ui/paper_*.png`) — 같은 이름으로 덮어쓰면 끝. READY 는 이미 올라 있다.
- 유물(`assets/relics/`) — 파일을 넣고 `RELIC_ART_READY` 에 id 를 적는다.

넣은 뒤 `node test/icocheck.mjs` 로 확인한다.

## 급하지 않은 것

- 판 없는 족보 변형 7종 — 기본 종이(paper_row)로 나간다: 숨 고르기(catch_breath), 부싯돌(clash), 도끼날 벼리기(chopping), 쐐기풀(nettle), 벌어진 틈(wedge), 올가미(snare), 굶주림(hunger)
- 껍데기 없는 주사위 6종 — 기본 눈 그림을 쓴다: 못 주사위(nail), 길잡이 주사위(guide), 되비침 주사위(mirror), 불티 주사위(spark), 쌍눈 주사위(twin), 이음 주사위(chainlink)
