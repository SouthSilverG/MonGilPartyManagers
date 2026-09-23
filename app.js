/* =====================================================================
   app.js — 화면을 그리고 클릭 동작을 처리합니다.
   보통은 이 파일을 건드릴 필요가 없습니다. 데이터만 바꾸려면 data.js를 수정하세요.
   ===================================================================== */

const RING_KEYS = Object.keys(RING_LABELS);
const EQUIP_KEYS = Object.keys(EQUIPMENT_LABELS);

/* 장비 부위별 포인트 색상 (라벨 앞 작은 점 표시용, 순수 UI 장식) */
const EQUIP_COLORS = {
  hat: "#5b9dff",
  top: "#f5a742",
  gloves: "#ef5d7a",
  shoes: "#3ecf8e",
};

/* ---------- 상태 ---------- */
function createEmptySlot() {
  const rings = {};
  const ringMonsters = {};
  RING_KEYS.forEach((k) => {
    rings[k] = [null, null, null, null];
    ringMonsters[k] = null;
  });
  const equipment = {};
  EQUIP_KEYS.forEach((k) => (equipment[k] = null));
  return { character: null, equipment, rings, ringMonsters };
}

const state = {
  slots: Array.from({ length: SLOT_COUNT }, createEmptySlot),
};

/* ---------- 유틸 ---------- */
function findById(list, id) {
  return list.find((it) => it.id === id) || null;
}

function imgOrPlaceholder(src) {
  return src && src.trim() !== "" ? src : "assets/placeholder.svg";
}

/* ---------- 렌더링 ---------- */
const slotsEl = document.getElementById("slots");

function render() {
  slotsEl.innerHTML = "";
  state.slots.forEach((slot, slotIndex) => {
    slotsEl.appendChild(renderSlot(slot, slotIndex));
  });
}

function renderSlot(slot, slotIndex) {
  const col = document.createElement("div");
  col.className = "slot";
  col.dataset.slotIndex = String(slotIndex);

  // 헤더
  const header = document.createElement("div");
  header.className = "slot__header";
  header.textContent = `${slotIndex + 1}번 슬롯`;
  col.appendChild(header);

  // 캐릭터 카드
  const charCard = document.createElement("div");
  charCard.className = "char-card";

  const charBtn = document.createElement("button");
  charBtn.className = "char-card__button";
  charBtn.dataset.action = "character";
  charBtn.dataset.slotIndex = String(slotIndex);

  const charData = slot.character ? findById(CHARACTERS, slot.character) : null;
  if (charData) {
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = imgOrPlaceholder(charData.image);
    img.alt = charData.name;
    charBtn.appendChild(img);
  } else {
    charBtn.classList.add("char-card__button--empty");
    const plus = document.createElement("span");
    plus.className = "placeholder-plus";
    plus.textContent = "+";
    charBtn.appendChild(plus);
    const hint = document.createElement("span");
    hint.className = "placeholder-hint";
    hint.textContent = "캐릭터 선택";
    charBtn.appendChild(hint);
  }
  charCard.appendChild(charBtn);

  const charName = document.createElement("div");
  charName.className = "char-card__name";
  charName.textContent = charData ? charData.name : "캐릭터를 선택하세요";
  charCard.appendChild(charName);

  col.appendChild(charCard);

  // 몬스터링
  const ringsWrap = document.createElement("div");
  ringsWrap.className = "rings";

  RING_KEYS.forEach((ringKey) => {
    const row = document.createElement("div");
    row.className = "ring-row" + (ringKey === LINK_CHAIN_RING ? " ring-row--linkchain" : "");

    const monsterId = slot.ringMonsters[ringKey];
    const monster = monsterId ? findById(MONSTERS, monsterId) : null;

    const monsterBtn = document.createElement("button");
    monsterBtn.className =
      "ring-row__label" + (monster ? " ring-row__label--filled" : " ring-row__label--empty");
    monsterBtn.dataset.action = "ring-monster";
    monsterBtn.dataset.slotIndex = String(slotIndex);
    monsterBtn.dataset.ring = ringKey;

    if (ringKey === LINK_CHAIN_RING) {
      const badge = document.createElement("span");
      badge.className = "badge-linkchain";
      badge.textContent = "링크체인";
      monsterBtn.appendChild(badge);
    }

    if (monster) {
      // 선택된 상태: 링 번호 텍스트 대신 몬스터 아이콘 + 이름을 보여줍니다.
      const iconEl = document.createElement("img");
      iconEl.className = "ring-row__monster-icon";
      iconEl.loading = "lazy";
      iconEl.src = imgOrPlaceholder(monster.image);
      iconEl.alt = monster.name;
      monsterBtn.appendChild(iconEl);

      const monsterNameEl = document.createElement("span");
      monsterNameEl.className = "ring-row__monster-name";
      monsterNameEl.textContent = monster.name;
      monsterBtn.appendChild(monsterNameEl);
    } else {
      // 선택 전: 몇 번째 몬스터링인지 + 선택 안내 문구를 보여줍니다.
      const ringNameEl = document.createElement("span");
      ringNameEl.className = "ring-row__ring-name";
      ringNameEl.textContent = RING_LABELS[ringKey];
      monsterBtn.appendChild(ringNameEl);

      const monsterNameEl = document.createElement("span");
      monsterNameEl.className = "ring-row__monster-name ring-row__monster-name--placeholder";
      monsterNameEl.textContent = "몬스터링 선택 +";
      monsterBtn.appendChild(monsterNameEl);
    }

    row.appendChild(monsterBtn);

    slot.rings[ringKey].forEach((optId, optIndex) => {
      const cell = document.createElement("div");
      cell.className = "ring-slot" + (optId ? " filled" : "");
      cell.dataset.action = "ring";
      cell.dataset.slotIndex = String(slotIndex);
      cell.dataset.ring = ringKey;
      cell.dataset.optIndex = String(optIndex);

      const opt = optId ? findById(RING_OPTIONS[ringKey], optId) : null;

      if (!opt) {
        // 선택 전에만 "옵션1/2/3/4" 라벨을 보여주고, 선택되면 숨깁니다.
        const slotLabelEl = document.createElement("span");
        slotLabelEl.className = "ring-slot__label";
        slotLabelEl.textContent = `옵션${optIndex + 1}`;
        cell.appendChild(slotLabelEl);
      }

      const slotValueEl = document.createElement("span");
      slotValueEl.className = "ring-slot__value";
      slotValueEl.textContent = opt ? opt.name : "선택 +";
      cell.appendChild(slotValueEl);

      row.appendChild(cell);
    });

    ringsWrap.appendChild(row);
  });

  col.appendChild(ringsWrap);

  // 장비
  const equipGrid = document.createElement("div");
  equipGrid.className = "equip-grid";

  EQUIP_KEYS.forEach((equipKey) => {
    const itemId = slot.equipment[equipKey];
    const item = itemId ? findById(EQUIPMENT[equipKey], itemId) : null;

    const cell = document.createElement("div");
    cell.className = "equip-slot" + (item ? "" : " equip-slot--empty");
    cell.dataset.action = "equip";
    cell.dataset.slotIndex = String(slotIndex);
    cell.dataset.equip = equipKey;

    const labelEl = document.createElement("div");
    labelEl.className = "equip-slot__label";

    const dot = document.createElement("span");
    dot.className = "equip-slot__dot";
    dot.style.background = EQUIP_COLORS[equipKey];
    labelEl.appendChild(dot);

    labelEl.appendChild(document.createTextNode(EQUIPMENT_LABELS[equipKey]));
    cell.appendChild(labelEl);

    if (item) {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = imgOrPlaceholder(item.image);
      img.alt = item.name;
      cell.appendChild(img);

      const valueEl = document.createElement("div");
      valueEl.className = "equip-slot__value";
      valueEl.textContent = item.name;
      cell.appendChild(valueEl);
    } else {
      const valueEl = document.createElement("div");
      valueEl.className = "equip-slot__value";
      valueEl.textContent = "+";
      cell.appendChild(valueEl);
    }

    equipGrid.appendChild(cell);
  });

  col.appendChild(equipGrid);

  return col;
}

/* ---------- 모달(팝업 선택창) ---------- */
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalList = document.getElementById("modalList");
const modalSearch = document.getElementById("modalSearch");
const modalClose = document.getElementById("modalClose");

let modalContext = null; // { type, slotIndex, equipKey?, ringKey?, optIndex?, items, onSelect }

function openModal({ title, items, onSelect }) {
  modalContext = { items, onSelect };
  modalTitle.textContent = title;
  modalSearch.value = "";
  renderModalList(items);
  modalOverlay.classList.remove("hidden");
  modalSearch.focus();
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  modalContext = null;
}

function renderModalList(items) {
  modalList.innerHTML = "";

  const clearItem = document.createElement("div");
  clearItem.className = "modal__item modal__item--clear";
  clearItem.textContent = "선택 해제";
  clearItem.addEventListener("click", () => {
    modalContext.onSelect(null);
    closeModal();
    render();
  });
  modalList.appendChild(clearItem);

  items.forEach((item) => {
    const el = document.createElement("div");
    el.className = "modal__item";

    if (item.image) {
      const img = document.createElement("img");
      // 선택창을 열 때 목록에 있는 이미지를 한꺼번에 다 받지 않고,
      // 스크롤해서 실제로 화면에 보일 때만 그때그때 받아오게 합니다(트래픽 절약).
      img.loading = "lazy";
      img.src = imgOrPlaceholder(item.image);
      img.alt = item.name;
      el.appendChild(img);
    }

    const nameEl = document.createElement("div");
    nameEl.textContent = item.name;
    el.appendChild(nameEl);

    el.addEventListener("click", () => {
      modalContext.onSelect(item.id);
      closeModal();
      render();
    });

    modalList.appendChild(el);
  });
}

modalSearch.addEventListener("input", () => {
  const q = modalSearch.value.trim().toLowerCase();
  const filtered = modalContext.items.filter((it) =>
    it.name.toLowerCase().includes(q)
  );
  renderModalList(filtered);
});

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalOverlay.classList.contains("hidden")) closeModal();
});

/* ---------- 클릭 위임 처리 ---------- */
slotsEl.addEventListener("click", (e) => {
  const target = e.target.closest("[data-action]");
  if (!target) return;

  const slotIndex = Number(target.dataset.slotIndex);
  const action = target.dataset.action;
  const slot = state.slots[slotIndex];

  if (action === "character") {
    openModal({
      title: "캐릭터 선택",
      items: CHARACTERS,
      onSelect: (id) => (slot.character = id),
    });
  } else if (action === "equip") {
    const equipKey = target.dataset.equip;
    openModal({
      title: EQUIPMENT_LABELS[equipKey] + " 선택",
      items: EQUIPMENT[equipKey],
      onSelect: (id) => (slot.equipment[equipKey] = id),
    });
  } else if (action === "ring") {
    const ringKey = target.dataset.ring;
    const optIndex = Number(target.dataset.optIndex);
    openModal({
      title: RING_LABELS[ringKey] + " - 옵션 선택",
      items: RING_OPTIONS[ringKey],
      onSelect: (id) => (slot.rings[ringKey][optIndex] = id),
    });
  } else if (action === "ring-monster") {
    const ringKey = target.dataset.ring;
    openModal({
      title: RING_LABELS[ringKey] + " - 몬스터 선택",
      items: MONSTERS,
      onSelect: (id) => (slot.ringMonsters[ringKey] = id),
    });
  }
});

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

  const captureArea = document.getElementById("captureArea");
  html2canvas(captureArea, { backgroundColor: "#101214", scale: 2, useCORS: true })
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
        const filename = `몬길스타다이브_파티_${stamp}.png`;

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
                .share({ files: [file], title: "몬길 스타다이브 파티" })
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

/* ---------- 초기 렌더 ---------- */
render();
