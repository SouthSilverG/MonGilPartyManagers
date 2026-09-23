# 몬길 스타다이브 파티 에디터 (프로토타입)

"몬스터길들이기: 스타다이브" 파티 조합 도구입니다.
캐릭터 3슬롯 + 몬스터링(몬스터 + 옵션 4칸) + 장비를 골라 화면을 구성하고, PNG로 저장할 수 있습니다.
몬스터링1에는 "링크체인" 배지가 표시되어 강조됩니다.


## 폴더 구성

```
monkil-stardive-builder/
├─ index.html      화면 뼈대 (거의 수정할 일 없음)
├─ style.css       색상/레이아웃 (색을 바꾸고 싶을 때만 수정)
├─ app.js          동작 로직 (팝업, 클릭 처리, PNG 저장 — 수정할 일 없음)
├─ data.js         ★ 실제 데이터는 여기에만 입력하면 됩니다 ★
├─ assets/
│  └─ placeholder.svg   이미지 없을 때 대신 보이는 플레이스홀더
└─ README.md
```

## 1. 내 데이터 채워 넣기 (제일 중요)

**`data.js` 파일 하나만 수정하면 됩니다.** 코드를 몰라도 됩니다 — 아래 형태만 그대로 복사해서 이름과 경로만 바꾸면 됩니다.

### 캐릭터 추가하기
```js
const CHARACTERS = [
  { id: "char_01", name: "전사 아론", image: "assets/characters/aron.png" },
  { id: "char_02", name: "마법사 리나", image: "assets/characters/rina.png" },
  // 필요한 만큼 계속 추가
];
```
- `id` : 다른 항목과 겹치지 않는 값이면 아무거나 괜찮습니다 (영문/숫자 추천).
- `name` : 화면에 표시될 이름.
- `image` : 이미지 파일 경로. `assets/characters/` 같은 폴더를 새로 만들어서 그림 파일을 넣고 경로만 맞춰주면 됩니다.

### 장비 추가하기 (모자/상의/장갑/신발)
```js
const EQUIPMENT = {
  hat:    [ { id: "hat_01", name: "가죽 모자", image: "assets/equipment/hat_01.png" } ],
  top:    [ { id: "top_01", name: "가죽 갑옷", image: "assets/equipment/top_01.png" } ],
  gloves: [ { id: "gloves_01", name: "가죽 장갑", image: "assets/equipment/gloves_01.png" } ],
  shoes:  [ { id: "shoes_01", name: "가죽 신발", image: "assets/equipment/shoes_01.png" } ],
};
```

### 몬스터링에 들어갈 몬스터 추가하기
"몬스터링1/2/3" 칸을 클릭하면 뜨는 목록입니다 (옵션 4칸과는 별개로, 이 링에 어떤 몬스터를 넣을지 고르는 용도).
```js
const MONSTERS = [
  { id: "mons_01", name: "불꽃 도마뱀", image: "assets/monsters/mons_01.png" },
  { id: "mons_02", name: "얼음 늑대", image: "assets/monsters/mons_02.png" },
];
```

### 몬스터링 옵션 추가하기
```js
const RING_OPTIONS = {
  ring1: [ { id: "r1_01", name: "공격력 +10%" }, { id: "r1_02", name: "치명타 +5%" } ],
  ring2: [ /* ... */ ],
  ring3: [ /* ... */ ],
};
```
몬스터링 옵션은 이미지 없이 텍스트만 있어도 됩니다 (`image` 생략 가능).

### 링크체인 배지 위치 바꾸기
```js
const LINK_CHAIN_RING = "ring1"; // "ring2" 나 "ring3"로 바꾸면 그 줄에 배지가 붙습니다
```

이미지 파일은 `assets/` 아래에 원하는 구조로 폴더를 만들어 넣고, `data.js`에 그 경로만 맞춰 적으면 자동으로 반영됩니다.

## 2. 화면에서 사용하는 방법

- 각 슬롯의 캐릭터 칸/장비 칸/몬스터링 옵션 칸을 클릭하면 목록 팝업이 뜹니다.
- 팝업 위쪽 검색창으로 이름 검색이 가능합니다.
- 목록 맨 위 "선택 해제"를 누르면 해당 칸이 비워집니다.
- 우측 상단 "PNG로 저장" 버튼을 누르면 현재 화면(3개 슬롯 + 비고란)이 PNG 파일로 다운로드됩니다.
- 비고란은 자유롭게 텍스트를 입력할 수 있는 메모칸입니다.

## 3. GitHub Pages로 배포하기 (처음부터 안내)

### 준비물
GitHub 계정 (없다면 https://github.com 에서 무료로 가입)

### 방법 A — 웹 브라우저에서 업로드만으로 배포 (git 명령어 몰라도 됨)
1. github.com에 로그인 후 오른쪽 위 **+** 버튼 → **New repository** 클릭.
2. Repository name에 원하는 이름 입력 (예: `monkil-stardive-builder`). Public으로 설정. **Create repository** 클릭.
3. 저장소 페이지에서 **Add file → Upload files** 클릭.
4. 이 폴더 안의 파일/폴더를 전부(즉 `index.html`, `style.css`, `app.js`, `data.js`, `assets` 폴더 통째로) 끌어다 놓기.
5. 아래 **Commit changes** 클릭해서 업로드 완료.
6. 저장소 상단 메뉴에서 **Settings → Pages** 로 이동.
7. "Build and deployment" 항목에서 Source를 **Deploy from a branch** 로 두고, Branch를 `main` / `/(root)` 로 선택한 뒤 **Save**.
8. 1~2분 기다리면 같은 화면 위쪽에 `https://<내계정이름>.github.io/<저장소이름>/` 형태의 주소가 표시됩니다. 이 주소가 완성된 사이트 링크입니다.

### 방법 B — git 명령어로 배포 (터미널 사용 가능한 경우)
```bash
cd monkil-stardive-builder
git init
git add .
git commit -m "몬길 스타다이브 파티 에디터 초기 버전"
git branch -M main
git remote add origin https://github.com/<내계정이름>/<저장소이름>.git
git push -u origin main
```
이후 GitHub 저장소의 **Settings → Pages**에서 위 7번과 동일하게 설정하면 됩니다.

### 나중에 데이터를 수정했을 때
`data.js`만 수정한 뒤, 같은 저장소에 다시 업로드(Upload files)하거나 `git add . && git commit -m "데이터 업데이트" && git push` 하면 사이트에 자동 반영됩니다 (몇 분 정도 걸릴 수 있음).

## 4. 커스터마이징 팁

- 색상을 바꾸고 싶으면 `style.css` 맨 위 `:root { ... }` 안의 색상 코드만 바꾸면 전체 톤이 바뀝니다.
- 슬롯 개수를 3개보다 늘리거나 줄이고 싶으면 `data.js` 맨 아래 `SLOT_COUNT` 숫자만 바꾸면 됩니다.
- 몬스터링 이름(몬스터링1/2/3)이나 장비 부위 이름(모자/상의/장갑/신발)을 바꾸고 싶으면 `data.js`의 `RING_LABELS`, `EQUIPMENT_LABELS`를 수정하면 됩니다.

## 5. 로컬에서 미리 보기

인터넷에 올리기 전에 내 컴퓨터에서 먼저 확인하고 싶다면, 이 폴더에서 다음 중 하나를 실행하세요.

- VS Code 사용 시: "Live Server" 확장 설치 후 `index.html`에서 우클릭 → Open with Live Server
- 파이썬이 설치되어 있다면: 이 폴더에서 터미널을 열고 `python -m http.server 8000` 실행 후 브라우저에서 `http://localhost:8000` 접속

**주의: 파일을 더블클릭해서 여는 방식(주소창이 `file://`로 시작)은 추천하지 않습니다.**
캐릭터/장비 선택 등 화면은 정상적으로 보이지만, 브라우저 보안 정책 때문에 **"PNG로 저장" 버튼이 작동하지 않습니다** (클릭해도 안내 메시지만 뜨고 저장이 안 됨).
반드시 위의 Live Server / `python -m http.server` 같은 로컬 서버로 실행하거나, GitHub Pages에 올려서 `https://` 주소로 접속해주세요.
