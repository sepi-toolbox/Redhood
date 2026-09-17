# REDHOOD Unity 이식 — 새 Work 인계

## 사용자 요청

`sepi-toolbox/Redhood`의 규칙과 데이터를 보존하며 Unity 이식을 계속한다.
사용자가 새 Work에서 이어가기를 요청하여 현재 작업을 체크포인트로 보존했다.
현재 대화에서는 새 Work를 생성하는 기능이 없으므로 생성했다고 안내하지 않는다.

## 저장소와 현재 변경

- 저장소: https://github.com/sepi-toolbox/Redhood
- Draft PR: https://github.com/sepi-toolbox/Redhood/pull/2
- 작업 브랜치: `codex/unity-vertical-slice`
- 인계 직전 GitHub 기준 커밋: `b3871cf74af2ca002423b19f7cd23b672ece680e`
- 이번 개선 사항은 인계 bundle의 로컬 체크포인트에 있다. GitHub 반영은 아직 미완료다.
- 원본 웹판과 Godot 파일은 변경하지 않았다. 변경 범위는 `unity/`다.
- 전체 저장소의 `data/`, `assets/`를 사용하는 프로젝트이므로 `unity/`만 분리해서 열지 않는다.

## 완료한 내용

- Unity 의존성이 없는 C# 코어, 원본 JSON 로더, 최신 JS와 맞춘 족보 계산기.
- 주사위 5개, 선택 리롤, 족보 미리보기/확정, 다음 턴, 승리/재시작의 연습 세션.
- 원본 숲/늑대/버튼/주사위 아트와 Nanum Gothic 한글 폰트를 연결한 uGUI 화면.
- Resources 기반 데이터 로딩과 에디터/플레이 진입/빌드 전 원본 데이터·아트 동기화.
- 메타 파일, 씬 GUID, .NET/Unity 공용 테스트 및 최신 JS 기준값 생성 도구.
- 상세 사용법과 구현/미구현 범위는 `unity/README.md`에 기록했다.

## 검증 결과와 한계

- 실제 C# Release 빌드 성공. NUnit 16개 통과.
- 최신 JS 기준 913건과 전체 주사위 조합 대조 268,912건 통과.
- `node test/unit.mjs`, `node test/assetcheck.mjs` 통과.
- Unity Editor는 이 환경에 없었다. Unity 전체 컴파일/임포트/화면/기기 빌드는 미검증이다.
- 적 행동/피격/패배/상태이상/변형/런 루프는 아직 미이식이다. 현재 화면은 족보 연습 모드다.
- Godot의 과거 450건 중 20건은 최신 JS 결과와 다르다. 그대로 검증 기준으로 삼지 않는다.

## 다음 작업

1. 첨부 bundle을 복원하고 GitHub 브랜치의 최신 상태를 확인한다. 기존 변경을 덮어쓰지 않는다.
2. 현재 개선 사항을 같은 Draft PR에 반영한다. main 병합이나 강제 push는 하지 않는다.
3. Unity 6000.0.40f1에서 패키지 임포트, 전체 컴파일, 세로 화면과 조작을 확인한다.
4. `js/engine.js`의 적 행동 선택·예고·턴 처리를 대조 테스트와 함께 이식한다.
   `cardbattle.js`는 별도 카드 전투 프로토타입이므로 섞지 않는다.

## 검증 재실행

Node.js와 .NET 8 SDK가 있는 저장소 루트에서:

```sh
node unity/tools/verify.mjs --exhaustive
```

이전 환경의 .NET CLI는 `/proc` 시작 시간 조회 중 실패하는 경우가 있어
MSBuild와 NUnitLite DLL을 직접 실행해 검증했다. 이것은 Unity 실행 검증을 대신하지 않는다.

## GitHub 반영 미완료 사유

일반 git push에는 인증이 없었다. GitHub 연결 도구는 사용 가능했으나,
약 2MB의 폰트 blob 업로드 중 사용자 메시지로 호출이 중단되었다.
업로드/커밋/브랜치 갱신이 완료되었다고 가정하지 말고 원격 상태를 다시 확인한다.
저장소 문서에 남은 다른 서비스 인증 토큰 전용 방법을 사용하지 않는다.
