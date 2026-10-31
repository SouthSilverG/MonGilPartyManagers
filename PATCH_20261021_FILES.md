# 2026-10-21 로컬 반영 파일

배포 필수(사이트 루트 기준):
- data.js
- assets/characters/chloe.webp
- index.html
- Statcal/index.html
- Statcal/stats-data.js
- Statcal/stats-engine.js
- Statcal/stats-editor.js
- Statcal/effect-metadata.js
- analytics.js
- analytics-privacy.html
- calculator/index.html

작업 이력·재현 도구(권장):
- WORK_HISTORY.md
- tools/build-effect-metadata.py
- tests/stats-20261021.test.cjs
- tests/analytics.test.cjs
- tests/fixtures/artifact-source-audit.json
- STAT_AUDIT.md

원본 클라이언트/키/추출 전체/백업/Output는 사이트 배포 대상 아님.
추가 패치 없음·클로에 모집 확인: 사용자 직접 확인. 원격 커밋·배포 미실시.
실게임 발동/중첩과 이번 PNG 다운로드파일 재업로드는 검증 완료 아님.


## 장비 부옵 점수 계산기
- equipment-score/ 전체
- manager-links.js / sidebar.css
- Statcal/app.js 및 각 도구 index.html 캐시 갱신
- WORK_HISTORY.md

## 2026-10-31 실험 기능 원복
- 보스컷 전용 페이지/테스트 제거, 상세 에디터 진입 버튼 제거
- Statcal/app.js / Statcal/index.html / WORK_HISTORY.md
- 사이트 밖 Output 백업은 커밋하지 않음


## 2026-10-31 장비·몬스터링 추천 추가
- recommendations.js (신규)
- app.js / Statcal/app.js
- index.html / Statcal/index.html / style.css
- docs/CHARACTER_RECOMMENDATIONS.md / WORK_HISTORY.md
