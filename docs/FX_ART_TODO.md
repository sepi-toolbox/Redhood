# 연출용 리소스 요청 (v3.32 기준)

v3.32에서 상태이상 연출을 **전부 CSS만으로** 넣었다. 지금도 읽히긴 하는데,
아래 넷은 그림이 있으면 격이 확 달라진다. 없어도 게임은 돌아가니 급하진 않다.

## 지금 어떻게 하고 있나 (그림 없이)

| 순간 | 지금 | 한계 |
|---|---|---|
| 상태이상이 **걸림** | 덮개가 위에서 쿵 찍히고, 상태색 테가 퍼지고, 이름이 떠오름 | 테가 그냥 사각 테두리라 "밀랍이 찍혔다"는 무게가 덜하다 |
| 상태이상이 **풀림** | 상태색 빗금 두 줄이 부풀며 흐려짐 | 빗금이라 "뜯겼다"보다 "지워졌다"에 가깝다 |
| 대가를 **무는 순간** | 칸이 튀고 상태색 원이 번지고 숫자가 튐 | 원 하나라 독·피·동전이 다 같은 모양이다 |
| 칩이 **생김** | 아래에서 튀어 오르며 금빛 테 | 이건 그림 없이도 충분하다 (요청 없음) |

---

## 부탁하고 싶은 것 넷

머리 블록은 **덮개 공통 머리 블록**(`STATUS_ART_PROMPTS.md` 1부)을 그대로 쓴다.
전부 **256×256, 회색 배경**으로 뽑아 주면 내가 키잉해서 넣는다.

### 1. 찍히는 자국 — `fx_stamp_burst.png` (1장)

상태이상이 걸리는 순간 덮개 뒤에서 한 번 퍼지는 자국. 색은 코드에서 상태색으로 물들이니
**흰색~아주 옅은 회색 한 색으로만** 그려 주면 된다.

```
The effect: one ragged ring of thick wax splatter blown outward from the centre, chunky uneven blobs and a few flung droplets, pure off-white on flat mid-grey, no colour, no gradient
```

### 2. 뜯긴 자국 — `fx_break_shards.png` (1장)

풀리는 순간 흩어지는 파편. 마찬가지로 **흰색 한 색**.

```
The effect: five or six chunky angular shards of broken wax seal flying apart from the centre, thick blunt edges, a small puff of dust between them, pure off-white on flat mid-grey, no colour, no gradient
```

### 3. 대가 자국 3종 — `fx_splat_blood.png` / `fx_splat_venom.png` / `fx_splat_coin.png`

출혈·독·약탈이 대가를 무는 순간 칸에 번지는 자국. **이건 색을 넣어 그려 주는 게 낫다** —
같은 흰 원을 세 번 쓰면 뭘 물었는지 구분이 안 된다.

```
The effect (출혈): one thick crimson blood splatter thrown across the square, three heavy drops flung off one side
The effect (독):   one thick acid-green venom splatter with two fat bubbles bursting in it
The effect (약탈): three gold coins scattering outward with one short bright glint
```

### 4. 흡착·물기 붙는 순간 — `fx_bite_snap.png` (1장)

물기(`lockHigh`)는 붙는 순간이 특히 안 보인다. 무는 순간 한 컷.

```
The effect: two blunt jaw arcs snapping shut from left and right toward the centre, thick pale sucker rim between them, one short motion streak behind each jaw, pure off-white on flat mid-grey, no colour
```

---

## 붙이는 법

```
python3 -c "import sys;sys.path.insert(0,'tools');import make_icon;make_icon.build_die('<원본.png>','stamp_burst', keep_center=False)"
```

`fx_stamp_burst`·`fx_break_shards`·`fx_bite_snap`은 **가운데를 덮어도 된다** (한순간만 뜬다).
색이 없는 셋은 코드에서 상태색으로 물들여 13종에 다 돌려 쓴다 — 그래서 한 장씩이면 충분하다.

## 우선순위

1번(찍히는 자국)이 가장 값어치가 크다. 상태이상이 걸리는 순간은 매 전투마다 여러 번 오고,
지금 그 순간이 제일 밋밋하다. 3번은 출혈·독만 있어도 충분하고 약탈은 나중에 해도 된다.
