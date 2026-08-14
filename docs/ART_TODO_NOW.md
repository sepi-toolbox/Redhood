# 지금 그려야 하는 리소스

`node tools/arttodo.mjs` 로 코드·데이터에서 다시 뽑는다. 손으로 고치지 말 것.
머리 블록은 `docs/STATUS_ART_PROMPTS.md` 에서 그대로 읽어 온다 — 규격을 바꾸려면 그쪽을 고친다.

| 종류 | 파일 | 규격 |
|---|---|---|
| **덮개** | `assets/ui/status_die_*.png` | 256×256, 알파, 가장자리에 붙고 **가운데는 비운다** |
| **아이콘** | `assets/icons/status_*.png` | 96×96, 심볼 하나, 메달 테는 게임이 씌운다 |

**첨부**: `docs/keyart/keyart_stilllife.jpg` — 머리 블록의 `the attached key art` 가 이걸 가리킨다.
**배경**: 중간 회색으로 뽑는다. 받은 뒤 아래 한 줄로 붙인다.

```
python3 tools/make_icon.py <원본.png> status_ironclad          # 아이콘
python3 -c "import sys;sys.path.insert(0,'tools');import make_icon;make_icon.build_die('<원본.png>','petrify')"   # 덮개
```

- 없음

## 넣는 법

- 아이콘 — 파일을 넣고 `js/main.js` 의 `BUFF_ART_READY` 에 이름을 적는다.
- 덮개 — 파일을 넣고 `DIE_ART_ALIAS` 에서 그 줄을 지운다.
- 넣은 뒤 `node test/icocheck.mjs` 로 확인한다.

## 급하지 않은 것

- **개명분 족보 판 2장** — 파일 이름은 맞는데 그림이 옛것이다. 같은 이름으로 덮어쓰면 끝.
  - `assets/ui/paper_deathcap.png` (독버섯) — 지금 네 송곳니 그림
  - `assets/ui/paper_plague_moon.png` (역병의 달) — 지금 핏빛 만월 그림
- 판 없는 족보 변형 7종 — 기본 종이로 나간다: 숨 고르기, 부싯돌, 도끼날 벼리기, 쐐기풀, 벌어진 틈, 올가미, 굶주림
- 껍데기 없는 주사위 6종 — 기본 눈 그림을 쓴다: 못 주사위, 길잡이 주사위, 되비침 주사위, 불티 주사위, 쌍눈 주사위, 이음 주사위
- 그림 없는 유물 0종
