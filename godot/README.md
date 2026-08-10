# REDHOOD — Godot 이식 (준비 완료 상태)

## 지금 들어있는 것

- `project.godot` — Godot 4.3, 모바일 세로(390×844), GL Compatibility (저사양·웹 내보내기 호환)
- `scripts/yahtzee.gd` — 족보 판정·피해 계산 포팅. **JS 원본과 골든 벡터 450건 대조 통과 (100% 일치)**
- `scripts/game_db.gd` — data/*.json 로더. 원본 JSON을 한 글자도 안 바꾸고 읽는다
- `data/` — 게임 데이터 사본 (`../data`가 원본. 데이터 매니저 워크플로 그대로 유효)
- `tests/run_tests.gd` + `golden_yahtzee.json` — 포팅 검증 하네스

## 성권 준비물

1. https://godotengine.org/download 에서 **Godot 4.3 이상 (Standard)** 설치 — .NET 버전 아님, 무료·5분
2. 실행 → [가져오기] → 이 저장소의 `godot/project.godot` 선택
3. (나중에 앱 빌드할 때) 에디터에서 안드로이드 내보내기 템플릿 설치 — 지금은 불필요

## 검증 돌리는 법 (선택)

    godot --headless --path godot -s tests/run_tests.gd
    # → "골든 대조 450건 · 실패 0" 이면 로직 포팅이 JS와 동일하다는 뜻

골든 벡터 재생성(데이터가 바뀌면): `node tools/gen_golden.mjs`

## 진행 계획

1. **전투 수직 슬라이스** ← 다음 단계: engine.gd(전투 상태기계) 포팅 + 주사위/족보판 한 화면
2. 런 루프 (지도·보상·상점·이벤트)
3. 폴리시 (연출·사운드) — Tween/파티클로 웹판보다 좋아지는 구간
4. 안드로이드/iOS 내보내기

## 원칙

- **데이터의 진실은 `data/*.json` 하나** — 웹판·고도판·데이터 매니저·시뮬레이터가 전부 같은 파일을 본다
- 로직 포팅은 반드시 골든 벡터로 JS와 대조 후 채택 (감이 아니라 450건 일치로 증명)
