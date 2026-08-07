# REDHOOD 보물상자 3종 (복사용)

전투에서 이기면 몬스터가 있던 자리에 상자가 나타나고, 전리품을 다 가져가면 열린 상태로 바뀝니다.

**키아트 `keyart_stilllife`를 첨부**하세요. 몬스터와 같은 자리에 놓이므로 아웃라인 굵기와 팔레트가 몬스터 아트와 맞아야 합니다.

**규격**: 정사각 1:1, 배경 제거용 단색 배경. 몬스터와 같은 방식으로 따서 씁니다. 상자가 프레임을 꽉 채워야 합니다(규칙 12).

---

## 1. 기본 상자 — `chest_normal`

*평범한 전리품. 소박하고 낡은 나무 궤짝. 화려하면 안 됩니다.*

```
Stylized dark fairytale object for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Square 1:1 image. A single closed treasure chest seen from the front at a slight angle, centered, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The chest FILLS the frame edge to edge — no ground, no shadow pool, no background elements, no empty margin around it. Bold silhouette, readable at 96px. The chest: a humble old wooden crate-chest with a rounded lid, worn grey-brown planks, two plain dark iron bands and a simple iron latch, one plank slightly split. Nothing shiny, no gold, no glow. No text, no letters, no watermark.
```

## 2. 좋은 상자 — `chest_rare`

*좋은 게 들어 있는 상자. 한눈에 "이건 다르다"가 읽혀야 하되, 몬스터보다 튀면 안 되니 발광은 은은하게.*

```
Stylized dark fairytale object for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Square 1:1 image. A single closed treasure chest seen from the front at a slight angle, centered, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The chest FILLS the frame edge to edge — no ground, no shadow pool, no background elements, no empty margin around it. Bold silhouette, readable at 96px. The chest: a finer dark-wood chest with a domed lid, antique gold corner fittings and a heavy gold clasp shaped like a small wolf head, a deep blood-red velvet strip across the lid, thin warm light leaking out from the seam of the closed lid. Richer than an ordinary crate but still worn and old. No text, no letters, no watermark.
```

## 3. 열린 빈 상자 — `chest_open`

*전리품을 다 가져간 뒤 상태. 두 등급 공용으로 하나만 씁니다.*

```
Stylized dark fairytale object for the dice game REDHOOD. Match the EXACT painting style, angular brushwork, EXTRA-THICK bold black outlines and muted palette of the attached key art. SIMPLE bold shapes, LARGE flat color planes, LOW detail density — no dense repeating texture, no tiny clutter. NOT photorealistic, NOT 3D. Square 1:1 image. A single open and empty treasure chest seen from the front at a slight angle, centered, on one plain flat very dark brown background — solid color, no gradient, no checkerboard. The chest FILLS the frame edge to edge — no ground, no shadow pool, no background elements, no empty margin around it. Bold silhouette, readable at 96px. The chest: an old wooden chest with its lid swung fully open and tilted back, the inside hollow and dark with a worn dull-red cloth lining, nothing inside it, the latch hanging loose. Emptied and quiet. No text, no letters, no watermark.
```

---

## 연동

파일: `assets/ui/chest_normal.png` / `chest_rare.png` / `chest_open.png`

연동 코드는 v0.87에 이미 들어가 있습니다. 세 장을 올리면 `main.js`의 `CHEST_ART_READY`를 `true`로 바꾸고 서비스 워커 캐시 목록에 추가하는 것으로 바로 켜집니다.

동작은 이렇습니다. 몬스터가 쓰러진 **바로 그 자리에 같은 크기로** 상자가 떨어집니다. 일반 전투는 216px, 정예는 234px, 보스는 254px로 몬스터 격에 맞춰 커지고, 아래 주사위 영역으로 넘쳐 내려가는 것도 몬스터와 동일합니다. 전리품을 다 가져가서 [나가기]만 남으면 `chest_open`으로 바뀝니다.

**그래서 상자는 몬스터와 같은 무게로 그려져야 합니다.** 작고 귀여운 소품이 아니라 화면 중앙을 차지하는 주인공입니다.

**세 장을 한 시트로 뽑고 싶다면** 위 묘사를 `Landscape 3:2 image. A 1x3 row of three chests, equal size, equal spacing, identical framing` 로 바꾸고 `IN ORDER — {1} / {2} / {3}` 으로 이어 붙이세요. 다만 셋의 크기가 정확히 같아야 화면에서 안 튀므로, 낱장 3번이 더 안전합니다.
