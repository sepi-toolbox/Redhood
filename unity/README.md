# REDHOOD — Unity 이식

현재 단계: **원본 아트가 적용된 늑대 단일 전투 + 웹판과 대조한 C# 규칙 코어**.
기존 웹판·Godot 파일은 변경하지 않는다. 전체 런을 이식한 상태는 아니다.

## 실행

1. `codex/unity-vertical-slice` 브랜치의 **저장소 전체**를 받는다.
   `unity/`만 받으면 원본 `data/`, `assets/`가 없어 실행되지 않는다.
2. Unity Hub에서 저장소의 `unity/` 폴더를 프로젝트로 추가한다.
   프로젝트 기준 버전은 **6000.0.40f1**이다. 다른 6000.0 패치로의 업그레이드는 에디터에서 확인한다.
3. 패키지 설치와 임포트가 끝나면 **REDHOOD → Open battle prototype**을 선택한다.
4. Play를 누른다. Game 뷰를 390×844 또는 다른 세로 비율로 맞춘다.
5. **주사위 굴리기 → 리롤할 주사위 탭 → 족보 선택 → 확정 → 적 행동 진행** 순으로 조작한다.

원본처럼 첫 굴림·리롤 직후에는 모두 유지 상태다. 선택한 주사위만 리롤하며,
아무것도 선택하지 않으면 횟수가 소모되지 않는다. 승리/패배 후 우측 상단에서 재시작할 수 있다.
늑대 위에 다음 행동을 표시한다. 출혈 주사위에는 남은 턴을, 족보 확정 버튼에는
출혈로 잃을 HP를 표시한다. 리롤 피해가 걸렸을 때는 내 체력 옆에 수치와 남은 턴을 표시한다.

## 포함 범위 / 남은 범위

| 항목 | 현재 상태 |
|---|---|
| 족보 8종·금박·쌍눈·피해 계산 유물 훅·벼름 배율 | 순수 C# 계산기에서 지원 및 JS 대조 |
| 5개 주사위·선택 리롤·족보 미리보기·확정·턴·승리/패배 | 단일 전투에서 지원 |
| 늑대 행동 | 가중치·등장 턴·쿨다운·연속 사용 제한·연계기·파쇄·국면 전환 |
| 늑대 공격·힘·출혈·리롤 피해 | 원본 효과와 지속시간/처리 순서 대조 완료 |
| 적 체력·이름, 시작 주사위 | 원본 JSON에서 로드 |
| 숲·늑대·주사위·버튼, 한글 폰트 | uGUI 화면에 연결 |
| 모바일 화면 비율·안전 영역 | 레이아웃 코드 적용, 기기 검증 대기 |
| 다른 적·다중 적·출혈 외 상태이상·변형·획득 족보 제한 | **아직 미이식** |
| 특수 주사위의 굴림 효과·유물 런타임 효과 | 계산기 외 전투 효과는 **미이식** |
| 지도·상점·이벤트·저장·음향·모바일 빌드 | **미이식 / 미검증** |

단일 전투는 **늑대 1마리, 막/층 1, 계몽 0, 일반 시작 주사위, 모든 기본 족보 개방** 조건이다.
적 반격과 플레이어 사망을 처리한다. 미지원 적은 실행 전에 명시적으로 거부한다.
벼름과 유물 계산은 계산기 테스트에서만 검증하며 실제 전투 세션에서는 사용하지 않는다.

## 구조와 데이터

- `Assets/Scripts/Core/`: Unity 의존성이 없는 데이터·족보·적 행동 선택·전투 세션.
- `Assets/Scripts/Runtime/`: Resources 로더와 uGUI 화면.
- `Assets/Editor/RedhoodSourceAssets.cs`: 원본 데이터와 필요한 아트만 자동 동기화.
- `Assets/Tests/EditMode/`: Unity Test Runner와 .NET에서 공유하는 NUnit 테스트.
- `Tests/Fixtures/current-golden.json`: 최신 JS에서 생성한 고정 대조값 913건.
- `Tests/Fixtures/battle-golden.json`: 실제 `js/engine.js`를 같은 난수로 실행한 24개 전투 시나리오, 1,044개 상태 비교.

단일 원본은 저장소의 `data/*.json`, `assets/`다. 에디터 로드·Play 진입·빌드 전에
`Assets/Resources/Redhood/`에 필요한 파일만 동기화한다. 이 사본은 git에 넣지 않는다.
플레이어는 Resources로 읽으므로 Android/WebGL에서 StreamingAssets를
`File.ReadAllText`로 읽는 문제를 피한다.
[Unity 파일 접근 제약](https://docs.unity3d.com/6000.0/Documentation/Manual/StreamingAssets.html)

한글 폰트는 Google Fonts의 Nanum Gothic에서 게임에 사용되는 글자를 추린 **Redhood UI**다.
폰트 이름을 변경하고 SIL OFL 라이선스와 수정 내역을 함께 포함한다. 약 2MB에서 약 245KB로 줄였다.
새 문구를 추가할 때 원본 전체 폰트를 받아 `python unity/tools/subset-font.py /path/to/NanumGothic-Regular.ttf`로 재생성한다.
[원본 폰트와 라이선스](https://github.com/google/fonts/tree/main/ofl/nanumgothic)

## 검증

Unity에서는 **Window → General → Test Runner → EditMode → Run All**.
Node.js와 .NET 8 SDK가 있으면 저장소 루트에서:

```sh
node unity/tools/verify.mjs --exhaustive
```

- C# 9 / .NET Standard 2.1 규칙 코어를 실제 컴파일한다.
- NUnit 테스트 20개: 데이터·턴 제어·중복 확정·승패·리롤 피해 사망·계산 회귀·전투 재생 등.
- 웹판과 같은 난수/굴림/리롤/족보 선택으로 1,044개 시점의 체력·출혈·리롤 피해·다음 행동·국면·턴 상태를 비교한다.
- 최신 JS 대조 913건.
- 0~6의 모든 순서 있는 5개 주사위 조합 × 8개 족보 × 일반/기절: 268,912건.
- 원본 파일 SHA-256 검사로 낡은 대조값을 감지한다.
- 완전 열거 파일은 `Tests/Generated/`에 생성되며 git에 넣지 않는다.

데이터/JS 변경 후 기준값을 갱신하려면:

```sh
node unity/tools/generate-golden.mjs
node unity/tools/generate-battle-golden.mjs
```

Godot의 과거 450건은 변경하지 않는다. 그중 20건은 현재 웹판의 결과와 다르며,
기여 인덱스도 일부 정렬되어 있어 그대로 Unity 검증 기준으로 사용할 수 없었다.

**검증 한계:** .NET 검증은 규칙 코어에 대한 것이다. Unity 에디터의 전체 컴파일,
씬 실행·화면 QA, 패키지 임포트와 Android/iOS/WebGL 빌드는 아직 수행하지 않았다.
이 PR은 그 확인이 끝날 때까지 Draft로 유지한다.

## 다음 이식 단위

먼저 Unity 에디터에서 씬/입력/한글/세로 화면을 실제 검증한다.
그다음 출혈 외 상태이상과 다른 적을 전투 대조 테스트와 함께 확장한다.
카드 전투 프로토타입인 `cardbattle.js`는 이 족보형 이식에 섞지 않는다.
