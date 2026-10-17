# 성소 시뮬레이터

- 별도 탭에서 속성 선택 → 원본 LIMITATION_GROUP의 ORDER별 유물 목록 → 유물 등급 선택.
- 카테고리 제목은 표시 순서의 효과 내용을 기준으로 붙인 UI 명칭: 보스 강화 / 캐릭터 약화 / 실패 조건 / 편성 조건 / 특수 시련.
- 5속성 × 24유물 그룹 = 120그룹, 등급 변형 포함 380개. 같은 그룹은 1등급만 선택. 속성별 선택 초안은 탭 안에서만 유지.
- 주소의 #에 현재 속성과 유물 ID를 담는다. 현재 주소를 다시 열거나 새로고침하면 복원된다. 서버 저장·DB·로그인 없음.
- PNG 저장에는 선택한 성소·유물·등급·수치·아이콘 및 복원 정보가 포함된다. 해당 원본 PNG 업로드로 복원. 일반 이미지 인식 기능 없음.
- PNG 저장 라이브러리는 저장 클릭 시에만 로딩한다. 모바일에서는 PNG 미리보기와 다운로드 버튼을 제공한다.
- 전투 결과, 클리어 가능 여부, 시련 사이의 상호작용은 계산하지 않는다. 합계는 원본 LEVEL을 단순 합산한 값.

## 원본 및 재생성

`STARDIVE_Extract/tables_json`의 DUNGEON_ELEMENTAL_LIMITATION, LIMITATION_GROUP, ITEM_LIST, ABILITY_GROUP_INFO, ABILITY_PARAMETER, LOCAL을 연결한다. 모든 설명 수치를 빌드 시 해석하므로 브라우저에 전체 게임 테이블을 싣지 않는다.

- 데이터: `python tools/build-sanctuary-data.py [tables_json 경로]`
- 유물 이미지: `python tools/build-sanctuary-icons.py [Icon_Limitation uasset 폴더]`
- 검증: `node tests/sanctuary.test.cjs`

유물 아이콘은 원본 Texture2D에서 복호화한 뒤 128px로 축소하고 무손실 WebP로 저장한다. 목록에서는 보이는 이미지부터 요청한다. 성소 선택 이미지는 기존 assets/contents/ele_*.png를 재사용하며 수정하지 않는다. 저장 이미지에도 같은 원본을 사용한다.

## 배포 파일

sanctuary/ 폴더 전체, assets/sanctuary/ 폴더 전체, 기존 png-export-loader.js 및 vendor/html2canvas.min.js가 필요하다.
탭 추가로 index.html / Statcal/index.html / calculator/index.html / recipes/index.html, 모바일 메뉴 5열 변경으로 style.css / calculator/style.css를 함께 반영한다. analytics.js에는 sanctuary 페이지 구분만 추가했다.

## 성소 기록

PNG 저장·업로드 성공 시 성소 전용 브라우저 기록에 최대 50개를 보관한다. 파티 기록과 저장 키가 다르며 서버 전송은 없다. 각 기록에서 성소 이름, 총합 시련 단계, 유물 수, 저장 날짜를 확인하고 눌러 복원할 수 있다.

기록 창의 TXT 다운로드와 상단의 기록 업로드를 지원한다. 업로드는 1MB/50개 제한 및 모든 기록의 속성·유물·등급 검증 후 덮어쓰기 경고를 표시한다. 수락하면 전체 성소 기록을 교체하고 파일 최상단 구성을 적용한다. 빈 기록 파일은 기록과 현재 선택을 초기화한다. 형식 오류나 저장 실패 시 기존 기록을 유지하고, 저장 실패 시 편성 화면도 이전 선택으로 복구한다.

`sanctuary/history.js`가 추가 배포 파일이며 검증은 `node tests/sanctuary-history.test.cjs`로 실행한다.

## 2026-10-18 리뷰 반영
- 감소 설명의 음수 매개변수는 뒤에 감소라는 방향 표현이 있을 때만 양수 크기로 표시한다. 원본 테이블과 다른 의미의 부호는 변경하지 않는다.
- PNG 내부 조각을 스트리밍 검사하고 최대 4096개/25MB로 제한한다. 키워드는 짧은 바이트 비교를 사용하며, 메타데이터를 찾은 뒤에도 나머지 구조를 검사한다. 성소 정보 중복도 거부한다.
- 속성 선택 및 기록 목록용 96px 썸네일은 sanctuary/assets/ele_*.png에 별도로 생성한다. 5장 합계 60,232바이트(원본5장 2,055,728바이트 대비 약97% 감소). 저장 PNG의 헤더는 기존 원본 이미지를 계속 사용한다.
- 썸네일 재생성: python tools/build-sanctuary-thumbnails.py. 데이터 재생성 후 elements.thumbnail 경로도 배포해야 한다.

유물 배포 이미지 최적화: assets/sanctuary/LIMITATION_*.webp 120개(128px, 무손실 압축)를 사용한다. 예전 LIMITATION_*.png는 배포에서 삭제한다. 기존 256px PNG 원본 백업은 사이트 밖 F:/MongilData/Output/sanctuary-original-icons에 있으며 커밋하지 않는다. 전체 유물 이미지 합계는1,898,082바이트다.
