/* =====================================================================
   몬길 STAR DIVE 과금 계산기 - 계산 로직 & 화면 렌더링
   (이 파일은 수정할 일이 거의 없습니다 - 데이터는 data.js에서 관리하세요)
   ===================================================================== */

/* ---------- 계산 로직 ---------- */

// rewards -> 티켓 총합(원본 엑셀의 G열)을 계산합니다.
// 화면에는 이 숫자 자체를 보여주지 않고, 효율(%) 계산에만 씁니다.
function calcTicketTotal(rewards) {
  const crystalTotal = (rewards.star || 0) + (rewards.crystal || 0); // 원본 H열
  const ticketFromCrystal = crystalTotal / CONFIG.TICKET_PRICE; // 원본 I열
  const ticketFromChoice = rewards.choice
    ? CONFIG.CHOICE_PULL_VALUE[rewards.choice] || 0
    : 0; // 원본 J열
  const destiny = rewards.destiny || 0; // K
  const memory = rewards.memory || 0; // L
  const promise = rewards.promise || 0; // M
  return ticketFromCrystal + ticketFromChoice + destiny + memory + promise; // 원본 G열
}

// 효율(%) = 티켓 총합 * 1뽑가격 / 가격. 가격이 없으면 계산 불가(null).
function calcEfficiency(price, rewards) {
  if (!price || price <= 0) return null;
  const ticketTotal = calcTicketTotal(rewards);
  return (ticketTotal * CONFIG.PULL_PRICE) / price * 100;
}

function getEfficiencyTier(percent) {
  if (percent === null || percent === undefined || Number.isNaN(percent)) return null;
  for (const tier of CONFIG.EFFICIENCY_TIERS) {
    if (percent >= tier.min) return tier;
  }
  return CONFIG.EFFICIENCY_TIERS[CONFIG.EFFICIENCY_TIERS.length - 1];
}

function addRewards(a, b) {
  return {
    destiny: (a.destiny || 0) + (b.destiny || 0),
    memory: (a.memory || 0) + (b.memory || 0),
    promise: (a.promise || 0) + (b.promise || 0),
    star: (a.star || 0) + (b.star || 0),
    crystal: (a.crystal || 0) + (b.crystal || 0),
    // 선택권은 합산 개념이 없어서, 그룹 안에 하나라도 있으면 참고용으로 표시만 함
    choice: a.choice || b.choice || null,
  };
}

const EMPTY_REWARDS = { destiny: 0, memory: 0, promise: 0, star: 0, crystal: 0, choice: null };

/* summary 마커를 실제 계산 가능한 "합산 행"으로 바꿔줍니다.
   direct으로 바로 위에서부터(또는 섹션 시작부터) 지금까지 쌓인 일반 항목들을 더합니다. */
function buildSummaryItem(name, group, bonus) {
  let price = 0;
  let rewards = { ...EMPTY_REWARDS };
  group.forEach((it) => {
    price += it.price || 0;
    rewards = addRewards(rewards, it.rewards);
  });
  // 세트를 전부 샀을 때만 추가로 붙는 완료 보너스 (개별 상품 합산과는 별개)
  if (bonus) rewards = addRewards(rewards, bonus);
  return {
    name,
    type: "",
    price,
    limit: null,
    checkable: false,
    isSummary: true,
    rewards,
  };
}

/* ---------- 상태 ---------- */

// 체크된 항목의 가격만 더해서 상단 총합 과금액에 반영합니다.
const purchaseState = new Map(); // key: "sectionIdx-itemIdx" -> boolean

function itemKey(sectionIdx, itemIdx) {
  return `${sectionIdx}-${itemIdx}`;
}

function formatWon(n) {
  return `₩${Math.round(n).toLocaleString("ko-KR")}`;
}

function formatEfficiency(percent) {
  if (percent === null) return "-";
  return `${percent.toFixed(2)}%`;
}

// 원본 엑셀의 K~P열(운명의 나침반/기억의 나침반/약속의 나침반/태초의 별/별빛 수정/선택권)을
// "구성" 한 칸 안에 아이콘 + 획득 수량으로 몰아서 보여줍니다.
// 우선순위: 태초의 별 -> 별빛 수정 -> 운명/기억/약속의 나침반 순.
const REWARD_ICONS = [
  { key: "star", label: "태초의 별", icon: "assets/rewards/star.png" },
  { key: "crystal", label: "별빛 수정", icon: "assets/rewards/crystal.png" },
  { key: "destiny", label: "운명의 나침반", icon: "assets/rewards/destiny.png" },
  { key: "memory", label: "기억의 나침반", icon: "assets/rewards/memory.png" },
  { key: "promise", label: "약속의 나침반", icon: "assets/rewards/promise.png" },
];

// 선택권(choice)은 수량이 아니라 "어떤 상품 중 하나를 고르는" 항목이라
// 종류별로 정해진 아이콘만 보여주고 수량 배지는 붙이지 않습니다.
const CHOICE_ICONS = {
  "5성 캐릭터": { label: "5성 캐릭터 선택권", icon: "assets/rewards/choice_character.jpg" },
  "5성 아티팩트": { label: "5성 아티팩트 선택권", icon: "assets/rewards/choice_artifact.jpg" },
  // 픽업 배너 한정 - 아무 5성이나 고르는 게 아니라 이번 배너 캐릭터/아티팩트가 확정 지급되므로
  // "선택권"이 아니라 그냥 확정 지급 대상 이름으로 표기합니다.
  "5성 픽업 캐릭터": { label: "5성 픽업 캐릭터", icon: "assets/rewards/choice_pickup_character.jpg" },
  "5성 픽업 아티팩트": { label: "5성 픽업 아티팩트", icon: "assets/rewards/choice_artifact.jpg" },
};

function formatRewardValue(value) {
  return value ? value.toLocaleString("ko-KR") : "-";
}

// item.rewards -> "구성" 칸에 넣을 아이콘 배지 DOM 목록을 만듭니다.
function buildComposeIcons(rewards) {
  const icons = [];
  if (!rewards) return icons;

  REWARD_ICONS.forEach(({ key, label, icon }) => {
    const value = rewards[key];
    if (!value) return;
    const badge = document.createElement("span");
    badge.className = "reward-icon";
    badge.title = `${label} ${value.toLocaleString("ko-KR")}`;
    const img = document.createElement("img");
    img.src = icon;
    img.alt = label;
    badge.appendChild(img);
    const qty = document.createElement("span");
    qty.className = "reward-icon__qty";
    qty.textContent = value.toLocaleString("ko-KR");
    badge.appendChild(qty);
    icons.push(badge);
  });

  if (rewards.choice) {
    const choiceInfo = CHOICE_ICONS[rewards.choice];
    const badge = document.createElement("span");
    badge.className = "reward-icon reward-icon--choice";
    badge.title = choiceInfo ? choiceInfo.label : rewards.choice;
    if (choiceInfo) {
      const img = document.createElement("img");
      img.src = choiceInfo.icon;
      img.alt = choiceInfo.label;
      badge.appendChild(img);
    } else {
      // 아직 아이콘이 지정되지 않은 새로운 선택권 종류 - 텍스트로 대체 표시
      badge.classList.add("reward-icon--text");
      badge.textContent = rewards.choice;
    }
    icons.push(badge);
  }

  return icons;
}

/* ---------- 렌더링 ---------- */

function renderAll() {
  const root = document.getElementById("sections");
  root.innerHTML = "";

  SECTIONS.forEach((section, sectionIdx) => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "product-section";

    const titleEl = document.createElement("h2");
    titleEl.className = "product-section__title";
    titleEl.textContent = section.title;
    sectionEl.appendChild(titleEl);

    const table = document.createElement("div");
    table.className = "product-table";

    const head = document.createElement("div");
    head.className = "product-row product-row--head";
    head.innerHTML = `
      <span class="col-check"></span>
      <span class="col-name">상품명</span>
      <span class="col-type">타입</span>
      <span class="col-price">가격</span>
      <span class="col-limit">구매 제한</span>
      <span class="col-eff">효율</span>
      <span class="col-compose">구성</span>
    `;
    table.appendChild(head);

    let group = []; // summary 계산용으로 쌓아두는 직전 항목들

    section.items.forEach((rawItem, itemIdx) => {
      let item = rawItem;
      if (rawItem.summary) {
        item = buildSummaryItem(rawItem.name, group, rawItem.bonus);
        group = []; // 다음 그룹을 위해 리셋
      } else {
        group.push(rawItem);
      }

      const row = document.createElement("div");
      row.className = "product-row" + (item.isSummary ? " product-row--summary" : "");

      // 체크박스
      const checkCell = document.createElement("span");
      checkCell.className = "col-check";
      if (item.checkable !== false && !item.isSummary) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "buy-checkbox";
        const key = itemKey(sectionIdx, itemIdx);
        checkbox.checked = !!purchaseState.get(key);
        checkbox.addEventListener("change", () => {
          purchaseState.set(key, checkbox.checked);
          updateTotal();
        });
        checkCell.appendChild(checkbox);
      }
      row.appendChild(checkCell);

      const nameCell = document.createElement("span");
      nameCell.className = "col-name";
      nameCell.textContent = item.name;
      if (item.isSummary) nameCell.classList.add("is-summary-name");
      row.appendChild(nameCell);

      const typeCell = document.createElement("span");
      typeCell.className = "col-type";
      typeCell.textContent = item.type || "";
      row.appendChild(typeCell);

      const priceCell = document.createElement("span");
      priceCell.className = "col-price";
      priceCell.textContent = item.price ? formatWon(item.price) : "-";
      row.appendChild(priceCell);

      const limitCell = document.createElement("span");
      limitCell.className = "col-limit";
      limitCell.textContent = item.limit ? `${item.limit}회` : "-";
      row.appendChild(limitCell);

      const effCell = document.createElement("span");
      effCell.className = "col-eff";
      const percent = calcEfficiency(item.price, item.rewards);
      const tier = getEfficiencyTier(percent);
      const badge = document.createElement("span");
      badge.className = "eff-badge" + (tier ? ` ${tier.className}` : "");
      badge.textContent = formatEfficiency(percent);
      effCell.appendChild(badge);
      row.appendChild(effCell);

      // 지급 재화 - 아이콘 + 획득 수량 배지로 "구성" 한 칸에 몰아서 표시
      const composeCell = document.createElement("span");
      composeCell.className = "col-compose";
      const composeIcons = buildComposeIcons(item.rewards);
      if (composeIcons.length) {
        composeIcons.forEach((icon) => composeCell.appendChild(icon));
      } else {
        composeCell.textContent = "-";
        composeCell.classList.add("col-compose--empty");
      }
      row.appendChild(composeCell);

      table.appendChild(row);
    });

    sectionEl.appendChild(table);
    root.appendChild(sectionEl);
  });

  updateTotal();
}

function updateTotal() {
  let total = 0;
  SECTIONS.forEach((section, sectionIdx) => {
    section.items.forEach((item, itemIdx) => {
      if (item.summary) return; // summary 마커 자체는 가격이 없음(자동 계산된 실제 행에서 처리)
      const key = itemKey(sectionIdx, itemIdx);
      if (purchaseState.get(key) && item.price) {
        total += item.price;
      }
    });
  });
  document.getElementById("totalPrice").textContent = formatWon(total);
}

renderAll();

/* ---------- PNG로 저장 ---------- */
document.getElementById("btnSavePng").addEventListener("click", () => {
  // file:// 로 index.html을 직접 더블클릭해서 연 경우, 브라우저 보안 정책 때문에
  // 캔버스가 "오염(tainted)"되어 이미지 저장이 조용히 실패할 수 있습니다.
  // 이 경우 아래 에러가 나기 전에 미리 안내하고 중단합니다.
  if (location.protocol === "file:") {
    alert(
      "이 화면을 파일로 직접 열면(주소창이 file:// 로 시작) 브라우저 보안 정책 때문에 PNG 저장이 되지 않습니다.\n\n" +
        "아래 방법 중 하나로 실행해 주세요.\n" +
        "1) GitHub Pages에 올려서 https:// 주소로 접속\n" +
        "2) 로컬 서버로 실행 (예: 이 폴더에서 `python -m http.server` 실행 후 http://localhost:8000 접속)"
    );
    return;
  }

  // 모바일 브라우저(특히 iOS Safari)는 <a download> + blob 방식을
  // PC와 똑같이 처리해주지 않는 경우가 많습니다(다운로드 대신 그냥 열리거나
  // 아무 반응이 없을 수 있음). 그래서 모바일에서는 기기의 "공유하기" 창을 띄워
  // 거기서 "이미지 저장"을 누르면 실제 파일로 저장되게 합니다 — 이게 모바일 웹에서
  // PC의 자동 다운로드와 가장 비슷한 결과(진짜 파일이 기기에 저장됨)를 냅니다.
  const isMobile =
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPadOS는 Mac으로 위장함

  // 파티 매니저 탭과 마찬가지로, 사이드바를 뺀 이 페이지의 콘텐츠 영역(#captureArea)만 캡처합니다.
  const captureArea = document.getElementById("captureArea");
  html2canvas(captureArea, { backgroundColor: "#0a0b10", scale: 2, useCORS: true })
    .then((canvas) => {
      // toDataURL 대신 toBlob + objectURL을 사용합니다.
      // 이렇게 해야 브라우저가 일반적인 "파일 다운로드"로 인식해서
      // 기본 다운로드 폴더(예: 다운로드 폴더)로 저장해줍니다.
      canvas.toBlob((blob) => {
        if (!blob) {
          alert("PNG 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
          return;
        }
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
        const filename = `몬길STARDIVE_과금계산기_${stamp}.png`;

        const downloadViaAnchor = (showFallbackPreview) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = filename;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          link.remove();

          if (showFallbackPreview) {
            // 자동 다운로드가 안 되는 구형/특수 모바일 브라우저를 위한 예비 수단으로
            // 미리보기 창을 띄워 둡니다(길게 눌러 저장 가능).
            showPngPreview(url, filename);
          } else {
            // PC에서는 기존과 동일하게 조용히 다운로드만 하고, 메모리 정리를 위해
            // 잠시 후 objectURL을 해제합니다.
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }
        };

        const canUseShare =
          isMobile &&
          typeof navigator.share === "function" &&
          typeof navigator.canShare === "function";

        let sharedHandled = false;
        if (canUseShare) {
          try {
            const file = new File([blob], filename, { type: "image/png" });
            if (navigator.canShare({ files: [file] })) {
              sharedHandled = true;
              navigator
                .share({ files: [file], title: "몬길 STAR DIVE 과금 계산기" })
                .catch((err) => {
                  // 사용자가 공유창을 취소한 경우(AbortError)는 실패가 아니므로 그대로 둡니다.
                  if (err && err.name !== "AbortError") {
                    downloadViaAnchor(true);
                  }
                });
            }
          } catch (err) {
            sharedHandled = false;
          }
        }

        if (!sharedHandled) {
          // 공유하기를 못 쓰는 모바일 브라우저는 미리보기(길게 눌러 저장) 예비 수단을
          // 함께 보여주고, PC는 기존처럼 자동 다운로드만 합니다.
          downloadViaAnchor(isMobile);
        }
      }, "image/png");
    })
    .catch((err) => {
      console.error("PNG 저장 실패:", err);
      alert(
        "PNG 저장 중 문제가 발생했습니다.\n\n" +
          (err && err.message ? err.message : err) +
          "\n\n브라우저 콘솔(F12)에서 자세한 오류를 확인할 수 있습니다."
      );
    });
});

function showPngPreview(url, filename) {
  const overlay = document.getElementById("pngPreviewOverlay");
  const img = document.getElementById("pngPreviewImage");
  const dl = document.getElementById("pngPreviewDownload");
  img.src = url;
  dl.href = url;
  dl.download = filename;
  overlay.classList.remove("hidden");
}

const pngPreviewOverlay = document.getElementById("pngPreviewOverlay");
const pngPreviewImage = document.getElementById("pngPreviewImage");
document.getElementById("pngPreviewClose").addEventListener("click", () => {
  pngPreviewOverlay.classList.add("hidden");
  if (pngPreviewImage.src) {
    URL.revokeObjectURL(pngPreviewImage.src);
    pngPreviewImage.removeAttribute("src");
  }
});
