/* =====================================================================
   몬길 STAR DIVE 과금 계산기 - 데이터 파일
   =====================================================================
   ★★★ 나중에 상품이 추가되거나 가격/보상이 바뀌면 이 파일만 고치면 됩니다 ★★★

   각 상품(item)에 적어야 하는 값은 딱 이것뿐입니다:
     - name  : 상품명
     - type  : 상품 타입 (표에 그대로 표시됨)
     - price : 가격(원). 가격이 없는(단독 구매 불가) 항목은 null
     - limit : 구매 제한 (없으면 null) - 화면 표시용 정보일 뿐, 계산에는 안 씀
     - rewards: 실제로 지급되는 보상 개수만 입력
         destiny : 운명의 나침반 개수 (픽업 캐릭터 티켓)
         memory  : 기억의 나침반 개수 (전무 티켓)
         promise : 약속의 나침반 개수 (상시 티켓)
         star    : 태초의 별 개수
         crystal : 별빛 수정 개수
         choice  : 선택권 종류 - "5성 캐릭터" | "5성 아티팩트"
                   | "5성 픽업 캐릭터" | "5성 픽업 아티팩트" (이번 배너 한정 확정 지급) | null

   화면에 보이는 "효율" 퍼센트, 티켓 총합, 수정 환산 같은 값들은
   전부 calc.js에서 위 rewards 값만 가지고 자동 계산합니다.
   (원본 엑셀의 G/H/I/J 열에 해당하는 계산용 열은 여기 없습니다 - 그대로가 맞습니다)

   checkable: false 인 항목은 체크박스가 없는 "참고용" 행입니다.
     - 총합 효율 같은 요약 행 (summary: true 로 자동 생성됨, 직접 안 적어도 됨)
     - "이 상자를 열었을 때 이런 결과가 나올 수도 있다"는 대체 결과 안내 행
     - 단독으로는 안 팔고, 바로 위 상품들을 전부 사야만 같이 딸려오는 보상 행
       (원본 엑셀에도 가격 칸이 비어 있고, 보상 칸에 그 값이 그대로 적혀 있음.
        예: "몬스터링,장비,스타터 성장 팩 종합" - 태초의 별 -525는 오타가 아니라
        엑셀 원본에 실제로 마이너스로 적혀 있는 값입니다)
   ===================================================================== */

const CONFIG = {
  // 수정(별빛 수정 + 태초의 별) 몇 개를 티켓 1장으로 칠지
  TICKET_PRICE: 160,
  // 효율 계산 기준: "1뽑" 가격을 얼마로 볼지 (3000원당 1뽑)
  PULL_PRICE: 3000,
  // 선택권 하나가 몇 뽑 가치인지
  CHOICE_PULL_VALUE: {
    "5성 캐릭터": 90,
    "5성 아티팩트": 80,
    // 픽업 배너 한정 - "아무 5성 중 택1"이 아니라 이번 배너의 특정 캐릭터/아티팩트가
    // 확정으로 나오는 경우. 뽑 가치 자체는 동일하게 계산합니다.
    "5성 픽업 캐릭터": 90,
    "5성 픽업 아티팩트": 80,
  },
  // 효율(%) 색상 구간 - 초록색 이상이면 확실히 효율 좋은 것
  // 빨강 ▶ 노랑 ▶ 초록 ▶ 파랑 순, 파랑이 제일 좋음
  EFFICIENCY_TIERS: [
    { min: 250, className: "eff-blue", label: "최상" },
    { min: 175, className: "eff-green", label: "좋음" },
    { min: 150, className: "eff-yellow", label: "보통" },
    { min: -Infinity, className: "eff-red", label: "낮음" },
  ],
};

// 빈 rewards를 매번 다 안 적어도 되게 하는 도우미
function R(rewards) {
  return {
    destiny: rewards.destiny || 0,
    memory: rewards.memory || 0,
    promise: rewards.promise || 0,
    star: rewards.star || 0,
    crystal: rewards.crystal || 0,
    choice: rewards.choice || null,
  };
}

/* summary 마커: 바로 위, 직전 summary(또는 섹션 시작)부터 여기까지의
   항목들을 자동으로 합산해서 만드는 "총합 효율" 행입니다.
   가격/보상 모두 자동 합산되므로, 개별 상품이 바뀌면 알아서 같이 바뀝니다.

   bonusRewards: 원본 엑셀 확인 결과, "전체 세트를 다 사면" 개별 상품들의
   보상 합계와는 별개로 추가 보너스(번들 완성 보너스)가 붙어있었습니다
   (예: 5성 캐릭터 선택권 추가 지급). 이 보너스는 개별 상품에서 나오는 게
   아니라 세트 자체에 붙는 것이라서, 자동 합산으로는 알 수 없어 여기 직접
   적어둡니다 - 나중에 이 세트의 "완료 보너스"가 바뀌면 이 값만 고치면 됩니다. */
function summaryRow(name, bonusRewards) {
  return { summary: true, name, bonus: R(bonusRewards || {}) };
}

const SECTIONS = [
  {
    title: "월정액 (구독은 일퀘 다했다는 기준)",
    items: [
      {
        name: "샛별의 서약 (뽑기권만 교환 기준)",
        type: "구독",
        price: 9900,
        rewards: R({ destiny: 15, star: 495, crystal: 1650 }),
      },
      {
        name: "블랙 멤버쉽",
        type: "월정액",
        price: 6000,
        rewards: R({ star: 300, crystal: 3360 }),
      },
    ],
  },
  {
    title: "패스 (뽑기만 계산함)",
    items: [
      {
        name: "비즈니스 클래스",
        type: "패스",
        price: 12000,
        rewards: R({ destiny: 5, crystal: 320 }),
      },
      {
        name: "퍼스트 클래스",
        type: "패스",
        price: 26000,
        rewards: R({ destiny: 12, crystal: 800 }),
      },
    ],
  },
  {
    title: "기록의 정원",
    items: [
      {
        name: "[새로운 여정] 특별 팩",
        type: "레나의 스타터 지원",
        price: 4400,
        limit: 1,
        rewards: R({ promise: 5 }),
      },
      {
        name: "[새로운 인연] 특별 팩",
        type: "레나의 스타터 지원",
        price: 9900,
        limit: 1,
        rewards: R({ promise: 10 }),
      },
      {
        name: "[약속의 나침반] 특별 팩",
        type: "레나의 스타터 지원",
        price: 15000,
        limit: 1,
        rewards: R({ promise: 15 }),
      },
      {
        name: "모험 스타터 팩 I",
        type: "레나의 스타터 지원",
        price: 6000,
        limit: 1,
        rewards: R({ destiny: 2, memory: 2, crystal: 150 }),
      },
      {
        name: "모험 스타터 팩 II",
        type: "레나의 스타터 지원",
        price: 15000,
        limit: 1,
        rewards: R({ destiny: 5, memory: 5, crystal: 400 }),
      },
      {
        // 단독 구매 상품이 아니라, 바로 위 5개 상품을 전부 사야만 같이 딸려오는
        // 보상입니다. 그래서 체크박스도 없고(checkable: false), 가격도 없습니다.
        // (태초의 별 -525는 오타가 아니라 원본 엑셀에 실제로 적혀 있는 값입니다.
        //  아마도 위 5개 상품의 별빛 수정 보상 중 일부를 태초의 별로 환산해서
        //  다시 빼주는 정산용 항목으로 보입니다 - 최종 "총합 효율" 값이 원본과
        //  정확히 일치하는 걸로 볼 때, 계산 자체는 이렇게 하는 게 맞습니다.)
        name: "몬스터링,장비,스타터 성장 팩 종합 (5개 완료 시 자동 지급)",
        type: "레나의 스타터 지원",
        price: null,
        limit: 1,
        checkable: false,
        rewards: R({ star: -525 }),
      },
      // 이 6개 상품을 전부 사면 개별 보상 합계 외에 추가로 붙는 세트 완료 보너스
      summaryRow("레나의 스타터 지원 보상 총합 효율", { memory: 1, promise: 1, choice: "5성 캐릭터" }),

      {
        name: "장비 스타터 팩 S",
        type: "레나의 스타터 지원 II",
        price: 3000,
        limit: 1,
        rewards: R({ promise: 2 }),
      },
      {
        name: "모험 스타터 팩 S",
        type: "레나의 스타터 지원 II",
        price: 33000,
        limit: 1,
        rewards: R({ memory: 10, promise: 15 }),
      },
      {
        name: "스타터 성장 팩 S",
        type: "레나의 스타터 지원 II",
        price: 9900,
        limit: 1,
        rewards: R({}),
      },
      {
        name: "몬스터링 스타터 팩 S",
        type: "레나의 스타터 지원 II",
        price: 7500,
        limit: 1,
        rewards: R({}),
      },
      // 이 4개 상품을 전부 사면 붙는 세트 완료 보너스
      summaryRow("레나의 스타터 지원 보상 II 총합 효율", { memory: 1, choice: "5성 캐릭터" }),
    ],
  },
  {
    title: "상시 패키지",
    items: [
      {
        name: "레나의 운명의 나침반 접수 I",
        type: "패키지",
        price: 12000,
        limit: 2,
        rewards: R({ destiny: 5, crystal: 400 }),
      },
      {
        name: "레나의 운명의 나침반 접수 II",
        type: "패키지",
        price: 33000,
        limit: 2,
        rewards: R({ destiny: 15, crystal: 400 }),
      },
      {
        name: "레나의 운명의 나침반 접수 III",
        type: "패키지",
        price: 55000,
        limit: 2,
        rewards: R({ destiny: 25, crystal: 700 }),
      },
      {
        name: "레나의 약속의 나침반 접수 I",
        type: "패키지",
        price: 12000,
        limit: 2,
        rewards: R({ promise: 5, crystal: 400 }),
      },
      {
        name: "레나의 약속의 나침반 접수 II",
        type: "패키지",
        price: 33000,
        limit: 2,
        rewards: R({ promise: 15, crystal: 400 }),
      },
      {
        name: "[아티팩트] 기억의 나침판 I",
        type: "패키지",
        price: 7500,
        limit: 2,
        rewards: R({ memory: 5 }),
      },
      {
        name: "[아티팩트] 기억의 나침판 II",
        type: "패키지",
        price: 15000,
        limit: 2,
        rewards: R({ memory: 10 }),
      },
      {
        name: "[아티팩트] 기억의 나침판 III",
        type: "패키지",
        price: 55000,
        limit: 2,
        rewards: R({ memory: 35 }),
      },
      {
        name: "[레기눌라] 별빛의 반짝임 팩",
        type: "패키지",
        price: 20000,
        limit: 2,
        rewards: R({ crystal: 300 }),
      },
      {
        name: "전설 몬스터 전승 팩",
        type: "패키지",
        price: 15000,
        limit: 3,
        rewards: R({ crystal: 300 }),
      },
    ],
  },
  {
    title: "스텝업",
    items: [
      {
        name: "픽업 캐릭터 스텝업 2",
        type: "스텝업",
        price: 6000,
        limit: 1,
        rewards: R({ destiny: 5 }),
      },
      {
        name: "픽업 캐릭터 스텝업 3 (4포함)",
        type: "스텝업",
        price: 20000,
        limit: 1,
        rewards: R({ destiny: 10, memory: 10, crystal: 300 }),
      },
      {
        name: "픽업 캐릭터 스텝업 5",
        type: "스텝업",
        price: 37000,
        limit: 1,
        rewards: R({ destiny: 20, memory: 5 }),
      },
      {
        name: "픽업 캐릭터 스텝업 6 (7포함)",
        type: "스텝업",
        price: 60000,
        limit: 1,
        rewards: R({ destiny: 30, memory: 30, crystal: 1600 }),
      },
      {
        name: "STAR DIVE II",
        type: "스텝업",
        price: 6000,
        limit: 1,
        rewards: R({ promise: 5 }),
      },
      {
        name: "STAR DIVE III",
        type: "스텝업",
        price: 9900,
        limit: 1,
        rewards: R({ promise: 10 }),
      },
      {
        name: "STAR DIVE IV",
        type: "스텝업",
        price: 25000,
        limit: 1,
        rewards: R({ promise: 30, choice: "5성 아티팩트" }),
      },
    ],
  },
  {
    title: "픽업 캐릭터 한정 팝업 패키지",
    items: [
      {
        name: "[픽업 캐릭터] 운명 선택 상자 (티켓 등장)",
        type: "패키지",
        price: 65000,
        limit: 1,
        rewards: R({ destiny: 35 }),
      },
      {
        name: "[픽업 캐릭터] 운명 선택 상자 (캐릭터 등장 시)",
        type: "패키지",
        price: 65000,
        checkable: false, // 위 상품과 같은 상자의 "다른 결과"일 뿐이라 별도 체크 불가 (참고용)
        rewards: R({ choice: "5성 픽업 캐릭터" }),
      },
      {
        name: "[픽업 캐릭터] 운명의 나침반",
        type: "패키지",
        price: 60000,
        limit: 1,
        rewards: R({ destiny: 35 }),
      },
      {
        name: "[픽업 아티팩트] 특급 상자 (아티팩트 선택)",
        type: "패키지",
        price: 30000,
        limit: 1,
        rewards: R({ choice: "5성 픽업 아티팩트" }),
      },
      {
        name: "[픽업 아티팩트] 특급 상자 (무기뽑 20개 선택)",
        type: "패키지",
        price: 30000,
        checkable: false, // 같은 상자의 "다른 결과" 참고용
        rewards: R({ memory: 20 }),
      },
    ],
  },
  {
    title: "여정의 궤적",
    items: [
      { name: "에피소드 1", price: 15000, limit: 1, rewards: R({ star: 1200 }) },
      { name: "에피소드 2", price: 25000, limit: 1, rewards: R({ star: 2000 }) },
      { name: "에피소드 3", price: 25000, limit: 1, rewards: R({ star: 2000 }) },
      { name: "에피소드 4", price: 55000, limit: 1, rewards: R({ star: 4400 }) },
      { name: "에피소드 5", price: 55000, limit: 1, rewards: R({ star: 4400 }) },
      { name: "에피소드 6", price: 65000, limit: 1, rewards: R({ star: 7000 }) },
    ],
  },
  {
    title: "태초의 별 (첫 구매)",
    items: [
      { name: "태초의 별 75+75 (첫 구매)", type: "초회", price: 1500, limit: 1, rewards: R({ star: 150 }) },
      { name: "태초의 별 300+300 (첫 구매)", type: "초회", price: 6000, limit: 1, rewards: R({ star: 600 }) },
      { name: "태초의 별 950+1050 (첫 구매)", type: "초회", price: 19000, limit: 1, rewards: R({ star: 2000 }) },
      { name: "태초의 별 1850+2000 (첫 구매)", type: "초회", price: 37000, limit: 1, rewards: R({ star: 3850 }) },
      { name: "태초의 별 3250+3850 (첫 구매)", type: "초회", price: 65000, limit: 1, rewards: R({ star: 7100 }) },
      { name: "태초의 별 5950+7050 (첫 구매)", type: "초회", price: 119000, limit: 1, rewards: R({ star: 13000 }) },
    ],
  },
  {
    title: "태초의 별 (웹 상점)",
    items: [
      { name: "태초의 별 75+75 (웹 상점)", type: "초회", price: 1500, limit: 1, rewards: R({ star: 150 }) },
      { name: "태초의 별 300+300 (웹 상점)", type: "초회", price: 6000, limit: 1, rewards: R({ star: 600 }) },
      { name: "태초의 별 950+1050 (웹 상점)", type: "초회", price: 19000, limit: 1, rewards: R({ star: 2000 }) },
      { name: "태초의 별 1850+2000 (웹 상점)", type: "초회", price: 37000, limit: 1, rewards: R({ star: 3850 }) },
      { name: "태초의 별 3250+3850 (웹 상점)", type: "초회", price: 65000, limit: 1, rewards: R({ star: 7100 }) },
      { name: "태초의 별 5950+7050 (웹 상점)", type: "초회", price: 119000, limit: 1, rewards: R({ star: 13000 }) },
    ],
  },
  {
    title: "깡트럭",
    items: [
      { name: "태초의 별 75", type: "깡트럭", price: 1500, rewards: R({ star: 75 }) },
      { name: "태초의 별 300+40", type: "깡트럭", price: 6000, rewards: R({ star: 340 }) },
      { name: "태초의 별 950+150", type: "깡트럭", price: 19000, rewards: R({ star: 1100 }) },
      { name: "태초의 별 1850+400", type: "깡트럭", price: 37000, rewards: R({ star: 2250 }) },
      { name: "태초의 별 3250+800", type: "깡트럭", price: 65000, rewards: R({ star: 4050 }) },
      { name: "태초의 별 5950+2150", type: "깡트럭", price: 119000, rewards: R({ star: 8100 }) },
    ],
  },
];
