/* =====================================================================
   app.js — 화면을 그리고 클릭 동작을 처리합니다.
   보통은 이 파일을 건드릴 필요가 없습니다. 데이터만 바꾸려면 data.js를 수정하세요.
   ===================================================================== */

const RING_KEYS = Object.keys(RING_LABELS);
const EQUIP_KEYS = Object.keys(EQUIPMENT_LABELS);

/* 몬스터링 옵션 이름이 길 때, 보기 좋은 지점에서 줄바꿈해서 보여줍니다.
   ("보스 몬스터 피해 증가" -> "보스 몬스터" 줄바꿈 "피해 증가" 처럼)
   실제 데이터(data.js)의 옵션 이름 자체는 바꾸지 않고, 화면에 표시할 때만
   줄바꿈 문자(\n)를 끼워 넣습니다. .ring-slot__value 쪽 CSS에
   white-space: pre-line 이 설정되어 있어야 이 줄바꿈이 실제로 적용됩니다. */
/* 몬스터 이름 중 일부는 자동 줄바꿈(word-break)이 붙는 위치가 어색해서,
   보기 좋은 지점을 직접 지정해 둡니다. 여기 없는 몬스터는 지금처럼
   자동으로 알아서 줄바꿈됩니다. 이름을 data.js에서 바꾸면 이 표도
   같이 맞춰줘야 합니다. */
const MONSTER_NAME_BREAKS = {
  "멍든 피오름 꽃": "멍든\n피오름 꽃",
  "프로스트바이트": "프로스트\n바이트",
  "황금향의 파수꾼": "황금향의\n파수꾼",
  "수도사의 그림자": "수도사의\n그림자",
  "달의 그림자에 물든 하카": "달의 그림자\n에 물든 하카",
  "돈이 너무 좋은 몰리": "돈이 너무\n좋은 몰리",
  "아몬의 그림자": "아몬의\n그림자",
  "뒤틀린 뼈오름 꽃": "뒤틀린\n뼈오름 꽃",
  "뒤틀린 피오름 꽃": "뒤틀린\n피오름 꽃",
};

function formatMonsterName(name) {
  return MONSTER_NAME_BREAKS[name] || name;
}

function formatRingOptionName(name) {
  const DAMAGE_SUFFIX = "피해 증가";
  if (name.endsWith(DAMAGE_SUFFIX)) {
    const prefix = name.slice(0, name.length - DAMAGE_SUFFIX.length).trim();
    return prefix ? `${prefix}\n${DAMAGE_SUFFIX}` : DAMAGE_SUFFIX;
  }
  if (name === "특수 스킬 재사용 대기시간 감소") {
    return "특수 스킬 재사용\n대기시간 감소";
  }
  return name;
}

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
  return { character: null, artifact: null, legendMonster: null, equipment, rings, ringMonsters };
}

const state = {
  slots: Array.from({ length: SLOT_COUNT }, createEmptySlot),
  partyTitle: "",
  contentId: null,
};

/* ---------- 유틸 ---------- */
function findById(list, id) {
  return list.find((it) => it.id === id) || null;
}

function imgOrPlaceholder(src) {
  return src && src.trim() !== "" ? src : "assets/placeholder.svg";
}

// 캐릭터 이름으로 속성 키를 찾습니다. "프란시스: 서머 다이브!"처럼 스킨이
// 붙은 이름은 CHARACTER_ATTRIBUTES에 그대로는 없으니, ":" 앞의 기본 이름으로
// 한 번 더 찾아봅니다.
function getCharacterAttributeKey(name) {
  if (!name) return null;
  if (CHARACTER_ATTRIBUTES[name]) return CHARACTER_ATTRIBUTES[name];
  const baseName = name.split(":")[0].trim();
  return CHARACTER_ATTRIBUTES[baseName] || null;
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

  // charBtn 자체는 더 이상 이미지 자르기(overflow:hidden)를 담당하지 않습니다.
  // 아티팩트 버튼이 이미지 경계 아래로 살짝 튀어나와야 하는데, overflow:hidden이
  // 걸린 요소 안에 있으면 그 튀어나온 부분이 잘려버리기 때문입니다. 그래서 실제
  // 이미지(또는 빈 상태 안내문구)는 별도의 안쪽 래퍼(.char-card__portrait)에
  // 담아 거기에만 overflow:hidden을 적용하고, 아티팩트 버튼은 그 바깥(charBtn
  // 바로 아래)에 형제로 둡니다. div를 쓰는 이유는 button 안에 button을 중첩할
  // 수 없기 때문이며, 클릭 처리는 기존과 동일하게 data-action 위임으로 동작합니다.
  const charBtn = document.createElement("div");
  charBtn.className = "char-card__button";
  charBtn.dataset.action = "character";
  charBtn.dataset.slotIndex = String(slotIndex);

  const portrait = document.createElement("div");
  portrait.className = "char-card__portrait";

  const charData = slot.character ? findById(CHARACTERS, slot.character) : null;
  if (charData) {
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = imgOrPlaceholder(charData.image);
    img.alt = charData.name;
    portrait.appendChild(img);
  } else {
    charBtn.classList.add("char-card__button--empty");
    const plus = document.createElement("span");
    plus.className = "placeholder-plus";
    plus.textContent = "+";
    portrait.appendChild(plus);
    const hint = document.createElement("span");
    hint.className = "placeholder-hint";
    hint.textContent = "캐릭터 선택";
    portrait.appendChild(hint);
  }
  charBtn.appendChild(portrait);

  // 전설 몬스터링 버튼 (캐릭터 이미지 우측 하단 구석에 겹쳐서 표시되는 동그란
  // 버튼). 캐릭터 선택 여부와 상관없이 항상 표시되며, 선택되면 아이콘 아래에
  // 이름표를 따로 붙여서 보여줍니다. (아티팩트는 더 이상 초상화 위에 겹쳐
  // 표시되지 않고, 이름 아래에 긴 막대 형태로 따로 표시됩니다 - 아래 참고.)
  const legendWrap = document.createElement("div");
  legendWrap.className = "legend-monster-slot";

  const legendMonsterBtn = document.createElement("button");
  legendMonsterBtn.type = "button";
  legendMonsterBtn.className = "slot-badge-btn";
  legendMonsterBtn.dataset.action = "legend-monster";
  legendMonsterBtn.dataset.slotIndex = String(slotIndex);

  const legendMonsterData = slot.legendMonster ? findById(LEGEND_MONSTERS, slot.legendMonster) : null;
  if (legendMonsterData) {
    legendMonsterBtn.classList.add("slot-badge-btn--filled");
    legendMonsterBtn.title = legendMonsterData.name;
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = imgOrPlaceholder(legendMonsterData.image);
    img.alt = legendMonsterData.name;
    legendMonsterBtn.appendChild(img);
  } else {
    legendMonsterBtn.title = "전설 몬스터링 선택";
    const label = document.createElement("span");
    label.className = "slot-badge-btn__label";
    label.textContent = "전설\n몬스터링";
    legendMonsterBtn.appendChild(label);
  }
  legendWrap.appendChild(legendMonsterBtn);

  if (legendMonsterData) {
    const nameEl = document.createElement("div");
    nameEl.className = "legend-monster-slot__name";
    nameEl.textContent = legendMonsterData.name;
    legendWrap.appendChild(nameEl);
  }

  charBtn.appendChild(legendWrap);

  charCard.appendChild(charBtn);

  const charName = document.createElement("div");
  charName.className = "char-card__name";

  if (charData) {
    // 이름 앞에 속성 아이콘만 텍스트와 비슷한 크기로 붙입니다
    // (몬길속성리스트.xlsx 기준, 배경 태그 없이 아이콘만).
    const attrKey = getCharacterAttributeKey(charData.name);
    const attr = attrKey ? ATTRIBUTES[attrKey] : null;
    if (attr) {
      const attrIcon = document.createElement("img");
      attrIcon.className = "char-card__attr-icon";
      attrIcon.loading = "lazy";
      attrIcon.src = attr.icon;
      attrIcon.alt = attr.label;
      attrIcon.title = attr.label;
      charName.appendChild(attrIcon);
    }

    const nameText = document.createElement("span");
    nameText.className = "char-card__name-text";
    nameText.textContent = charData.name;
    charName.appendChild(nameText);
  } else {
    charName.textContent = "캐릭터를 선택하세요";
  }
  charCard.appendChild(charName);

  // 아티팩트 막대 (캐릭터 이름 바로 아래, 카드 폭 전체를 쓰는 긴 사각형).
  // 선택 전에는 안내 문구만, 선택하면 아이콘 + 아티팩트 이름을 보여줍니다.
  const artifactBar = document.createElement("button");
  artifactBar.type = "button";
  artifactBar.className = "artifact-bar";
  artifactBar.dataset.action = "artifact";
  artifactBar.dataset.slotIndex = String(slotIndex);

  const artifactData = slot.artifact ? findById(ARTIFACTS, slot.artifact) : null;
  if (artifactData) {
    artifactBar.classList.add("artifact-bar--filled");
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = imgOrPlaceholder(artifactData.image);
    img.alt = artifactData.name;
    artifactBar.appendChild(img);

    const label = document.createElement("span");
    label.className = "artifact-bar__label";
    label.textContent = artifactData.name;
    artifactBar.appendChild(label);
  } else {
    const label = document.createElement("span");
    label.className = "artifact-bar__label artifact-bar__label--placeholder";
    label.textContent = "아티팩트 선택 +";
    artifactBar.appendChild(label);
  }
  charCard.appendChild(artifactBar);

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
      monsterNameEl.textContent = formatMonsterName(monster.name);
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
      slotValueEl.textContent = opt ? formatRingOptionName(opt.name) : "선택 +";
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

    // 장비를 선택하면 위쪽 부위 이름("장비 모자" 등)은 더 이상 보여주지
    // 않고, 그 자리를 장비 이름에 온전히 내어줍니다. 부위 이름은 아직
    // 선택하지 않은 빈 칸에서만 표시됩니다.
    if (!item) {
      const labelEl = document.createElement("div");
      labelEl.className = "equip-slot__label";

      const dot = document.createElement("span");
      dot.className = "equip-slot__dot";
      dot.style.background = EQUIP_COLORS[equipKey];
      labelEl.appendChild(dot);

      labelEl.appendChild(document.createTextNode(EQUIPMENT_LABELS[equipKey]));
      cell.appendChild(labelEl);
    }

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
const modalPager = document.getElementById("modalPager");
const modalPagerPrev = document.getElementById("modalPagerPrev");
const modalPagerNext = document.getElementById("modalPagerNext");
const modalPagerLabel = document.getElementById("modalPagerLabel");

// modalContext.onSelect / onClear는 모달을 닫을지 계속 열어둘지까지 직접
// 책임집니다(예: 몬스터링 옵션은 4개를 다 채울 때까지 계속 열어둠).
// getSelectedIds()를 주면 이미 선택된 항목을 목록에서 강조 표시합니다.
let modalContext = null; // { items, onSelect, onClear?, getSelectedIds?, filteredItems, page }

// 한 페이지에 보여줄 "줄" 수. 실제 몇 "개"를 보여줄지는 화면에 실제로
// 몇 칸(열)짜리 그리드로 그려지는지에 따라 달라지므로(모달 너비에 따라
// auto-fill로 칸 수가 바뀔 수 있음) 아래 computeModalColumns()로 지금
// 그려진 실제 열 개수를 측정해서 "열 개수 * 이 줄 수"를 페이지당 개수로 씁니다.
const MODAL_ROWS_PER_PAGE = 5;

function computeModalColumns() {
  const colsStr = window.getComputedStyle(modalList).gridTemplateColumns;
  const cols = colsStr.split(" ").filter(Boolean).length;
  return cols > 0 ? cols : 1;
}

function openModal({ title, items, onSelect, onClear, getSelectedIds }) {
  modalContext = { items, onSelect, onClear, getSelectedIds, filteredItems: items, page: 0 };
  modalTitle.textContent = title;
  modalSearch.value = "";
  // 열 개수를 측정하려면 모달이 실제로 화면에 보여서 너비를 가진 다음이어야
  // 하므로, 목록을 그리기 전에 먼저 보이게 합니다.
  modalOverlay.classList.remove("hidden");
  renderModalList(items);
  modalSearch.focus();
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  modalContext = null;
}

// items: 검색어로 걸러진(또는 전체) 목록. 이 목록을 모달 상태에 저장해두고
// 그중 현재 페이지에 해당하는 부분만 그립니다.
function renderModalList(items) {
  modalContext.filteredItems = items;
  modalContext.page = 0;
  renderModalPage();
}

function renderModalPage() {
  modalList.innerHTML = "";

  const selectedIds = modalContext.getSelectedIds ? modalContext.getSelectedIds() : null;
  const items = modalContext.filteredItems;

  const columns = computeModalColumns();
  // "선택 해제" 버튼이 모든 페이지에 한 칸씩 차지하므로, 실제 항목은
  // (페이지당 전체 칸 수 - 1)개씩 보여줘서 페이지마다 줄 수가 똑같이 맞도록 합니다.
  const totalSlotsPerPage = Math.max(1, columns * MODAL_ROWS_PER_PAGE);
  const itemsPerPage = Math.max(1, totalSlotsPerPage - 1);
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  if (modalContext.page > totalPages - 1) modalContext.page = totalPages - 1;
  if (modalContext.page < 0) modalContext.page = 0;
  modalContext.totalPages = totalPages;

  // "선택 해제" 버튼은 페이지를 넘겨도 계속 보이도록 모든 페이지 맨 앞에 둡니다.
  const clearItem = document.createElement("div");
  clearItem.className = "modal__item modal__item--clear";
  clearItem.textContent = "선택 해제";
  clearItem.addEventListener("click", () => {
    if (modalContext.onClear) {
      modalContext.onClear();
    } else {
      modalContext.onSelect(null);
    }
  });
  modalList.appendChild(clearItem);

  const start = modalContext.page * itemsPerPage;
  const pageItems = items.slice(start, start + itemsPerPage);

  pageItems.forEach((item) => {
    const el = document.createElement("div");
    el.className =
      "modal__item" + (selectedIds && selectedIds.has(item.id) ? " modal__item--selected" : "");

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
    });

    modalList.appendChild(el);
  });

  // 페이지가 1개뿐이면 페이지 넘김 버튼 자체를 숨깁니다.
  if (totalPages <= 1) {
    modalPager.classList.add("hidden");
  } else {
    modalPager.classList.remove("hidden");
    modalPagerLabel.textContent = `${modalContext.page + 1} / ${totalPages}`;
    // 처음/마지막 페이지에서도 계속 누를 수 있게 순환합니다. (처음 → 이전 = 마지막, 마지막 → 다음 = 처음)
    modalPagerPrev.disabled = false;
    modalPagerNext.disabled = false;
  }
}

modalPagerPrev.addEventListener("click", () => {
  const total = modalContext.totalPages || 1;
  modalContext.page = modalContext.page <= 0 ? total - 1 : modalContext.page - 1;
  renderModalPage();
});

modalPagerNext.addEventListener("click", () => {
  const total = modalContext.totalPages || 1;
  modalContext.page = modalContext.page >= total - 1 ? 0 : modalContext.page + 1;
  renderModalPage();
});

modalSearch.addEventListener("input", () => {
  const q = modalSearch.value.trim().toLowerCase();
  // 검색은 지금 보고 있는 페이지와 상관없이 항상 전체 목록(modalContext.items)
  // 안에서 찾고, 결과가 나오면 다시 1페이지부터 보여줍니다.
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
      onSelect: (id) => {
        slot.character = id;
        closeModal();
        render();
      },
    });
  } else if (action === "artifact") {
    openModal({
      title: "아티팩트 선택",
      items: ARTIFACTS,
      getSelectedIds: () => new Set(slot.artifact ? [slot.artifact] : []),
      onSelect: (id) => {
        slot.artifact = id;
        closeModal();
        render();
      },
    });
  } else if (action === "legend-monster") {
    openModal({
      title: "전설 몬스터링 선택",
      items: LEGEND_MONSTERS,
      getSelectedIds: () => new Set(slot.legendMonster ? [slot.legendMonster] : []),
      onSelect: (id) => {
        slot.legendMonster = id;
        closeModal();
        render();
      },
    });
  } else if (action === "equip") {
    const equipKey = target.dataset.equip;
    openModal({
      title: EQUIPMENT_LABELS[equipKey] + " 선택",
      items: EQUIPMENT[equipKey],
      onSelect: (id) => {
        slot.equipment[equipKey] = id;
        closeModal();
        render();
      },
    });
  } else if (action === "ring") {
    const ringKey = target.dataset.ring;
    const optIndex = Number(target.dataset.optIndex);
    openRingOptionModal(slotIndex, ringKey, optIndex);
  } else if (action === "ring-monster") {
    const ringKey = target.dataset.ring;
    openModal({
      title: RING_LABELS[ringKey] + " - 몬스터 선택",
      items: MONSTERS,
      onSelect: (id) => {
        slot.ringMonsters[ringKey] = id;
        closeModal();
        render();
      },
    });
  }
});

// 몬스터링 옵션 선택: 한 번 열면(옵션1~4 중 아무 칸이나 클릭) 빈 칸을 차례로
// 채워나가고, 4칸이 다 채워지면 자동으로 닫힙니다. 이미 채워진 칸을 눌러서
// 값을 바꾸는 경우에는(다른 빈 칸이 없다면) 하나만 고르고 바로 닫힙니다.
// 이 링에서 이미 선택된 옵션은 목록에서 강조 표시됩니다.
function openRingOptionModal(slotIndex, ringKey, startOptIndex) {
  let currentOptIndex = startOptIndex;

  function findNextEmptyIndex(excludeIndex) {
    const arr = state.slots[slotIndex].rings[ringKey];
    for (let i = 0; i < arr.length; i++) {
      if (i !== excludeIndex && arr[i] === null) return i;
    }
    return -1;
  }

  function updateTitle() {
    modalTitle.textContent = `${RING_LABELS[ringKey]} - 옵션 선택 (옵션${currentOptIndex + 1})`;
  }

  function continueOrClose() {
    const nextEmpty = findNextEmptyIndex(currentOptIndex);
    if (nextEmpty === -1) {
      closeModal();
    } else {
      currentOptIndex = nextEmpty;
      updateTitle();
      modalSearch.value = "";
      renderModalList(modalContext.items);
      modalSearch.focus();
    }
  }

  openModal({
    title: `${RING_LABELS[ringKey]} - 옵션 선택 (옵션${startOptIndex + 1})`,
    items: RING_OPTIONS[ringKey],
    getSelectedIds: () =>
      new Set(state.slots[slotIndex].rings[ringKey].filter((v) => v !== null)),
    onSelect: (id) => {
      const arr = state.slots[slotIndex].rings[ringKey];

      // 같은 몬스터링 안에서는 옵션을 중복해서 고를 수 없습니다.
      // 이미 선택되어 있는 옵션을 다시 누르면 칸을 옮기지 않고
      // 무조건 선택 해제만 합니다. 지금 고르고 있는 칸은 그대로
      // 비워둔 채 모달은 계속 열어둡니다.
      const existingIndex = arr.findIndex((v) => v === id);
      if (existingIndex !== -1) {
        arr[existingIndex] = null;
        render();
        renderModalList(modalContext.items);
        return;
      }

      arr[currentOptIndex] = id;
      render();
      continueOrClose();
    },
    onClear: () => {
      state.slots[slotIndex].rings[ringKey][currentOptIndex] = null;
      closeModal();
      render();
    },
  });
}

/* ---------- PNG 안에 파티 데이터 숨기기 (업로드 기능용) ----------
   저장(PNG)을 누르면, 화면에는 안 보이지만 파일 안에는 지금 파티 상태
   (캐릭터 / 몬스터링 / 몬스터링 옵션 / 장비 / 파티 이름 / 컨텐츠 / 비고)를
   그대로 텍스트(JSON)로 같이 저장해 둡니다. PNG 파일 형식에 있는 "iTXt"라는,
   화면에는 전혀 보이지 않는 텍스트 전용 조각(청크)을 이용합니다.
   나중에 그 PNG를 업로드하면 이 데이터를 다시 읽어서 파티를 그대로
   복원합니다. (이 도구에서 저장한 PNG가 아니면 이 데이터가 없어서
   복원할 수 없습니다.) */

const PARTY_PNG_KEYWORD = "mongil-stardive-party";
const PARTY_PNG_SCHEMA = 1;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function writeUint32BE(value) {
  return new Uint8Array([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ]);
}

function readUint32BE(bytes, offset) {
  return (
    ((bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]) >>>
    0
  );
}

function concatBytes(chunks) {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  chunks.forEach((c) => {
    out.set(c, offset);
    offset += c.length;
  });
  return out;
}

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

function checkPngSignature(bytes) {
  if (bytes.length < 8) return false;
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== PNG_SIGNATURE[i]) return false;
  }
  return true;
}

// PNG 파일(ArrayBuffer)의 맨 처음 IHDR 조각 바로 뒤에, 파티 데이터를 담은
// iTXt 조각을 끼워 넣은 새 PNG 바이트를 만들어 돌려줍니다.
function embedPartyDataInPng(arrayBuffer, jsonText) {
  const bytes = new Uint8Array(arrayBuffer);
  if (!checkPngSignature(bytes)) {
    throw new Error("PNG 파일 형식이 아닙니다.");
  }

  const firstChunkDataLength = readUint32BE(bytes, 8);
  const firstChunkType = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
  if (firstChunkType !== "IHDR") {
    throw new Error("PNG 파일 형식이 올바르지 않습니다(IHDR 없음).");
  }
  const ihdrEnd = 8 + 4 + 4 + firstChunkDataLength + 4; // signature + (len+type+data+crc)

  const keywordBytes = new TextEncoder().encode(PARTY_PNG_KEYWORD);
  const textBytes = new TextEncoder().encode(jsonText);
  const chunkData = concatBytes([
    keywordBytes,
    new Uint8Array([0]), // keyword 뒤 null 종료
    new Uint8Array([0, 0]), // 압축 플래그(0=비압축) + 압축 방식(0)
    new Uint8Array([0]), // 빈 언어 태그 + null 종료
    new Uint8Array([0]), // 빈 번역된 키워드 + null 종료
    textBytes,
  ]);

  const chunkType = new TextEncoder().encode("iTXt");
  const crc = crc32(concatBytes([chunkType, chunkData]));

  const newChunk = concatBytes([
    writeUint32BE(chunkData.length),
    chunkType,
    chunkData,
    writeUint32BE(crc),
  ]);

  return concatBytes([bytes.slice(0, ihdrEnd), newChunk, bytes.slice(ihdrEnd)]);
}

// 업로드된 PNG(ArrayBuffer)에서 파티 데이터(JSON 문자열)를 찾아 돌려줍니다.
// 이 도구가 저장한 PNG가 아니거나(데이터 없음) 손상된 파일이면 null을
// 돌려줍니다.
function extractPartyDataFromPng(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  if (!checkPngSignature(bytes)) return null;

  let offset = 8;
  while (offset + 8 <= bytes.length) {
    const dataLength = readUint32BE(bytes, offset);
    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7]
    );
    const dataStart = offset + 8;
    const dataEnd = dataStart + dataLength;
    if (dataLength < 0 || dataEnd > bytes.length) break; // 손상된 파일

    if (type === "iTXt") {
      const chunkBytes = bytes.slice(dataStart, dataEnd);
      let p = 0;
      while (p < chunkBytes.length && chunkBytes[p] !== 0) p++;
      const keyword = new TextDecoder().decode(chunkBytes.slice(0, p));
      if (keyword === PARTY_PNG_KEYWORD) {
        p++; // keyword의 null 종료 건너뛰기
        const compressionFlag = chunkBytes[p];
        p += 2; // 압축 플래그 + 압축 방식
        if (compressionFlag !== 0) return null; // 압축된 텍스트는 지원하지 않음
        while (p < chunkBytes.length && chunkBytes[p] !== 0) p++;
        p++; // 언어 태그 null 종료
        while (p < chunkBytes.length && chunkBytes[p] !== 0) p++;
        p++; // 번역된 키워드 null 종료
        return new TextDecoder("utf-8").decode(chunkBytes.slice(p));
      }
    }

    if (type === "IEND") break;
    offset = dataEnd + 4; // +4는 CRC
  }
  return null;
}

// 지금 파티 상태를 JSON 문자열로 만듭니다(PNG 안에 숨겨 저장할 내용).
function buildPartyExportPayload() {
  return JSON.stringify({
    app: PARTY_PNG_KEYWORD,
    schema: PARTY_PNG_SCHEMA,
    partyTitle: state.partyTitle,
    contentId: state.contentId,
    remarks: document.getElementById("remarksText").value,
    slots: state.slots,
  });
}

// PNG에서 꺼낸 JSON 문자열을 검증하고, 지금 화면(파티 상태)에 그대로
// 반영합니다. 형식이 이상하면 에러를 던집니다(호출하는 쪽에서 alert로 안내).
function applyImportedPartyPayload(jsonText) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch (err) {
    throw new Error("파티 데이터를 읽는 데 실패했습니다(JSON 형식 오류).");
  }
  if (!data || typeof data !== "object" || !Array.isArray(data.slots)) {
    throw new Error("파티 데이터 형식이 올바르지 않습니다.");
  }

  const newSlots = Array.from({ length: SLOT_COUNT }, createEmptySlot);
  data.slots.slice(0, SLOT_COUNT).forEach((savedSlot, i) => {
    if (!savedSlot || typeof savedSlot !== "object") return;
    const fresh = createEmptySlot();
    fresh.character = typeof savedSlot.character === "string" ? savedSlot.character : null;
    fresh.artifact = typeof savedSlot.artifact === "string" ? savedSlot.artifact : null;
    fresh.legendMonster = typeof savedSlot.legendMonster === "string" ? savedSlot.legendMonster : null;

    RING_KEYS.forEach((k) => {
      const savedMonster = savedSlot.ringMonsters && savedSlot.ringMonsters[k];
      fresh.ringMonsters[k] = typeof savedMonster === "string" ? savedMonster : null;

      const savedRingArr =
        savedSlot.rings && Array.isArray(savedSlot.rings[k]) ? savedSlot.rings[k] : [];
      fresh.rings[k] = [0, 1, 2, 3].map((idx) => {
        const v = savedRingArr[idx];
        return typeof v === "string" ? v : null;
      });
    });

    EQUIP_KEYS.forEach((k) => {
      const savedEquip = savedSlot.equipment && savedSlot.equipment[k];
      fresh.equipment[k] = typeof savedEquip === "string" ? savedEquip : null;
    });

    newSlots[i] = fresh;
  });

  state.slots = newSlots;
  state.partyTitle = typeof data.partyTitle === "string" ? data.partyTitle : "";
  state.contentId = typeof data.contentId === "string" ? data.contentId : null;

  partyTitleInput.value = state.partyTitle;
  partyTitleAutoFilled = state.partyTitle.trim() === "";

  document.getElementById("remarksText").value = typeof data.remarks === "string" ? data.remarks : "";

  renderContentBox();
  render();
}

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

  // html2canvas는 <textarea>/<input> 같은 입력 요소 안의 글자를 실제
  // 화면과 다르게(윗부분이 잘린 것처럼) 그리는 문제가 있습니다. 캡처하는
  // 동안에만 이런 요소들을 똑같이 생긴 일반 텍스트 박스(div)로 잠깐
  // 바꿔치기해서 캡처하고, 끝나면 원래대로 되돌립니다.
  const remarksTextarea = document.getElementById("remarksText");
  const remarksClone = document.createElement("div");
  remarksClone.className = "remarks__textarea remarks__textarea--capture-clone";
  const remarksHasText = remarksTextarea.value.trim() !== "";
  remarksClone.textContent = remarksHasText ? remarksTextarea.value : remarksTextarea.placeholder;
  if (!remarksHasText) {
    remarksClone.classList.add("remarks__textarea--capture-placeholder");
  }
  remarksTextarea.insertAdjacentElement("afterend", remarksClone);
  remarksTextarea.classList.add("remarks__textarea--capture-hidden");

  const partyTitleInputEl = document.getElementById("partyTitleInput");
  const partyTitleClone = document.createElement("div");
  partyTitleClone.className = "party-title-box__input party-title-box__input--capture-clone";
  const partyTitleHasText = partyTitleInputEl.value.trim() !== "";
  partyTitleClone.textContent = partyTitleHasText ? partyTitleInputEl.value : partyTitleInputEl.placeholder;
  if (!partyTitleHasText) {
    partyTitleClone.classList.add("party-title-box__input--capture-placeholder");
  }
  partyTitleInputEl.insertAdjacentElement("afterend", partyTitleClone);
  partyTitleInputEl.classList.add("party-title-box__input--capture-hidden");

  const restoreRemarks = () => {
    remarksClone.remove();
    remarksTextarea.classList.remove("remarks__textarea--capture-hidden");
    partyTitleClone.remove();
    partyTitleInputEl.classList.remove("party-title-box__input--capture-hidden");
  };

  // 페이지를 아래로 스크롤한 상태에서 저장을 누르면 html2canvas가 스크롤
  // 위치를 고려하지 않아 화면 위쪽(파티 이름 등)이 잘려 나오는 경우가
  // 있어서, 항상 스크롤이 0인 것처럼 캡처하도록 보정값을 함께 넘깁니다.
  html2canvas(captureArea, {
    backgroundColor: "#101214",
    scale: 2,
    useCORS: true,
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight,
  })
    .then((canvas) => {
      // toDataURL 대신 toBlob + objectURL을 사용합니다.
      // 이렇게 해야 브라우저가 일반적인 "파일 다운로드"로 인식해서
      // 기본 다운로드 폴더(예: 다운로드 폴더)로 저장해줍니다.
      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert("PNG 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
          return;
        }

        // "기록" 목록에도 이 파티를 남깁니다(실패해도 PNG 저장에는 영향 없음).
        addHistoryEntry(buildPartyExportPayload());

        // 화면에는 안 보이지만, 파일 안에는 지금 파티 상태를 그대로 텍스트로
        // 같이 저장해 둡니다. 나중에 "업로드 (PNG)"로 이 파일을 다시 올리면
        // 이 데이터를 읽어서 파티를 그대로 복원할 수 있습니다.
        try {
          const originalBytes = await blob.arrayBuffer();
          const embeddedBytes = embedPartyDataInPng(originalBytes, buildPartyExportPayload());
          blob = new Blob([embeddedBytes], { type: "image/png" });
        } catch (err) {
          console.error("파티 데이터 저장 실패(이미지는 정상 저장됩니다):", err);
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
    })
    .finally(() => {
      restoreRemarks();
    });
});

/* ---------- PNG 업로드 (파티 복원) ---------- */
const btnUploadPng = document.getElementById("btnUploadPng");
const uploadPngInput = document.getElementById("uploadPngInput");

btnUploadPng.addEventListener("click", () => {
  uploadPngInput.click();
});

uploadPngInput.addEventListener("change", async () => {
  const file = uploadPngInput.files && uploadPngInput.files[0];
  // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 매번 비워둡니다.
  uploadPngInput.value = "";
  if (!file) return;

  if (file.type && file.type !== "image/png" && !file.name.toLowerCase().endsWith(".png")) {
    alert("PNG 파일만 업로드할 수 있습니다.");
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const jsonText = extractPartyDataFromPng(arrayBuffer);
    if (!jsonText) {
      alert(
        "이 PNG에서 파티 정보를 찾을 수 없습니다.\n\n" +
          "이 도구의 \"저장 (PNG)\" 버튼으로 저장한 파일만 다시 불러올 수 있어요. " +
          "다른 곳에서 받은 이미지이거나, 이 기능이 추가되기 전에 저장한 PNG일 수 있습니다."
      );
      return;
    }
    applyImportedPartyPayload(jsonText);
    addHistoryEntry(jsonText); // 업로드한 파티도 "기록"에 남깁니다.
  } catch (err) {
    console.error("PNG 업로드 실패:", err);
    alert(
      "파티를 불러오는 중 문제가 발생했습니다.\n\n" +
        (err && err.message ? err.message : err)
    );
  }
});

/* ---------- 기록(히스토리) ----------
   "저장 (PNG)"을 누르거나 PNG를 "업로드"할 때마다 그 시점의 파티를 이 브라우저
   (localStorage)에 한 건씩 쌓아 둡니다. 목록에는 파티 이름이 표시되고(이름이
   같아도 각각 별도 기록), 항목을 누르면 현재 화면이 그 파티로 바뀝니다.
   - 같은 PC/같은 브라우저에서만 보이고, 브라우저 데이터를 지우면 사라집니다.
   - 최대 HISTORY_MAX건까지만 보관하고, 넘으면 가장 오래된 것부터 지웁니다. */
const HISTORY_KEY = "monkil_party_history_v1";
const HISTORY_MAX = 50;

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function saveHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    return false; // 저장소가 막혀 있거나 가득 찬 경우에도 다른 기능은 그대로 동작
  }
}

function addHistoryEntry(payloadJson) {
  try {
    const data = JSON.parse(payloadJson);
    const title = data && typeof data.partyTitle === "string" ? data.partyTitle.trim() : "";
    const list = loadHistory();
    list.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      savedAt: Date.now(),
      title,
      payload: payloadJson,
    });
    saveHistory(list.slice(0, HISTORY_MAX));
  } catch (e) {
    // 기록 실패는 조용히 무시합니다.
  }
}

const historyOverlay = document.getElementById("historyOverlay");
const historyListEl = document.getElementById("historyList");

function formatHistoryTime(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderHistoryList() {
  const list = loadHistory();
  historyListEl.innerHTML = "";
  if (list.length === 0) {
    const empty = document.createElement("div");
    empty.className = "history-modal__empty";
    empty.textContent = "아직 기록이 없습니다. 저장(PNG)하거나 PNG를 업로드하면 여기에 쌓여요.";
    historyListEl.appendChild(empty);
    return;
  }
  list.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "history-item";

    const main = document.createElement("div");
    main.className = "history-item__main";
    const t = document.createElement("div");
    t.className = "history-item__title";
    t.textContent = entry.title || "(이름 없는 파티)";
    const time = document.createElement("div");
    time.className = "history-item__time";
    time.textContent = formatHistoryTime(entry.savedAt);
    main.appendChild(t);

    // 이름과 날짜 사이에: 이 기록에 편성된 캐릭터(아이콘 + 이름)
    const members = document.createElement("div");
    members.className = "history-item__members";
    let parsed = null;
    try { parsed = JSON.parse(entry.payload); } catch (e) { parsed = null; }
    const slotList = parsed && Array.isArray(parsed.slots) ? parsed.slots : [];
    slotList.forEach((sl) => {
      const c = sl && sl.character ? findById(CHARACTERS, sl.character) : null;
      if (!c) return;
      const chip = document.createElement("span");
      chip.className = "history-item__member";
      const ic = document.createElement("img");
      ic.className = "history-item__member-icon";
      ic.loading = "lazy";
      ic.src = imgOrPlaceholder(c.image);
      ic.alt = "";
      const nm = document.createElement("span");
      nm.textContent = c.name;
      chip.appendChild(ic);
      chip.appendChild(nm);
      members.appendChild(chip);
    });
    if (!members.children.length) {
      members.classList.add("history-item__members--empty");
      members.textContent = "편성된 캐릭터 없음";
    }
    main.appendChild(members);
    main.appendChild(time);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "history-item__delete";
    del.title = "이 기록 삭제";
    del.textContent = "✕";
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      saveHistory(loadHistory().filter((x) => x.id !== entry.id));
      renderHistoryList();
    });

    row.appendChild(main);
    row.appendChild(del);
    row.addEventListener("click", () => {
      try {
        applyImportedPartyPayload(entry.payload);
        closeHistory();
      } catch (err) {
        alert("이 기록을 불러오지 못했습니다.\n\n" + (err && err.message ? err.message : err));
      }
    });
    historyListEl.appendChild(row);
  });
}

function openHistory() {
  renderHistoryList();
  historyOverlay.classList.remove("hidden");
}
function closeHistory() {
  historyOverlay.classList.add("hidden");
}

document.getElementById("btnHistory").addEventListener("click", openHistory);
document.getElementById("historyClose").addEventListener("click", closeHistory);
historyOverlay.addEventListener("click", (e) => {
  if (e.target === historyOverlay) closeHistory();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !historyOverlay.classList.contains("hidden")) closeHistory();
});
// 초기화: 지금 화면(캐릭터/몬스터링/장비/파티 이름/컨텐츠/비고)을 전부 빈 상태로
// 되돌립니다. 이미 쌓인 "기록"은 건드리지 않습니다.
document.getElementById("btnReset").addEventListener("click", () => {
  if (!confirm("현재 설정된 화면을 초기화하시겠습니까?")) return;
  applyImportedPartyPayload(
    JSON.stringify({ slots: [], partyTitle: "", contentId: null, remarks: "" })
  );
});

document.getElementById("historyClearAll").addEventListener("click", () => {
  if (loadHistory().length === 0) return;
  if (confirm("기록을 모두 삭제하시겠습니까?")) {
    saveHistory([]);
    renderHistoryList();
  }
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

/* ---------- 파티 제목 ---------- */
const partyTitleInput = document.getElementById("partyTitleInput");

// 사용자가 파티 이름을 직접 타이핑한 적이 있는지 추적합니다.
// true인 동안에는(=아직 자동으로 채워진 이름 그대로 두었을 때) 컨텐츠를
// 바꿀 때마다 "{컨텐츠 이름} 파티"로 계속 갱신되고, 사용자가 한 번이라도
// 직접 수정하면 그 뒤로는 컨텐츠를 바꿔도 이름을 건드리지 않습니다.
let partyTitleAutoFilled = true;

partyTitleInput.addEventListener("input", () => {
  state.partyTitle = partyTitleInput.value;
  partyTitleAutoFilled = false;
});

/* ---------- 컨텐츠(토벌 / 전설토벌) 설정 ---------- */
const contentBox = document.getElementById("contentBox");
const contentModalOverlay = document.getElementById("contentModalOverlay");
const contentModalTabs = document.getElementById("contentModalTabs");
const contentModalGrid = document.getElementById("contentModalGrid");
const contentModalClose = document.getElementById("contentModalClose");

let activeContentTab = CONTENT_TABS[0].key;

function findContentById(id) {
  for (const tab of CONTENT_TABS) {
    const found = (CONTENTS[tab.key] || []).find((item) => item.id === id);
    if (found) return found;
  }
  return null;
}

function renderContentModalTabs() {
  contentModalTabs.innerHTML = "";
  CONTENT_TABS.forEach((tab) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "content-modal__tab" + (tab.key === activeContentTab ? " is-active" : "");
    btn.textContent = tab.label;
    btn.addEventListener("click", () => {
      activeContentTab = tab.key;
      renderContentModalTabs();
      renderContentModalGrid();
    });
    contentModalTabs.appendChild(btn);
  });
}

function renderContentModalGrid() {
  contentModalGrid.innerHTML = "";
  const items = CONTENTS[activeContentTab] || [];
  items.forEach((item) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "content-item";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = item.image;
    img.alt = item.name;
    card.appendChild(img);

    const nameEl = document.createElement("span");
    nameEl.textContent = item.name;
    card.appendChild(nameEl);

    card.addEventListener("click", () => {
      selectContent(item);
      closeContentModal();
    });

    contentModalGrid.appendChild(card);
  });
}

function openContentModal() {
  activeContentTab = CONTENT_TABS[0].key;
  renderContentModalTabs();
  renderContentModalGrid();
  contentModalOverlay.classList.remove("hidden");
}

function closeContentModal() {
  contentModalOverlay.classList.add("hidden");
}

function renderContentBox() {
  const item = state.contentId ? findContentById(state.contentId) : null;
  contentBox.innerHTML = "";

  if (item) {
    contentBox.classList.remove("content-box--empty");
    const nameEl = document.createElement("span");
    nameEl.className = "content-box__name";
    nameEl.textContent = item.name;
    contentBox.appendChild(nameEl);

    // <img>의 object-fit: cover 대신 background-image + background-size:
    // cover를 씁니다. PNG로 저장할 때 쓰는 html2canvas가 object-fit을
    // 제대로 반영하지 못해서(이미지가 눌린 것처럼 나옴), 배경 이미지
    // 방식으로 하면 웹 화면과 PNG 저장 양쪽에서 똑같이 잘 잘려서 보입니다.
    const img = document.createElement("span");
    img.className = "content-box__image";
    img.style.backgroundImage = `url("${item.image}")`;
    img.setAttribute("role", "img");
    img.setAttribute("aria-label", item.name);
    contentBox.appendChild(img);

    // 이미지 왼쪽을 배경색으로 자연스럽게 흐려지게 하는 효과입니다.
    // CSS mask-image는 PNG로 저장(html2canvas)할 때 제대로 렌더링되지
    // 않아서(경계가 뚝 끊겨 보임), 대신 실제 그라데이션 배경을 가진
    // 별도 요소를 이미지 위에 겹쳐서 같은 효과를 냅니다.
    const fade = document.createElement("span");
    fade.className = "content-box__image-fade";
    contentBox.appendChild(fade);
  } else {
    contentBox.classList.add("content-box--empty");
    const plus = document.createElement("span");
    plus.className = "content-box__plus";
    plus.textContent = "+";
    contentBox.appendChild(plus);

    const label = document.createElement("span");
    label.className = "content-box__label";
    label.textContent = "컨텐츠 설정";
    contentBox.appendChild(label);
  }
}

function selectContent(item) {
  state.contentId = item.id;
  renderContentBox();

  // 아직 사용자가 파티 이름을 직접 수정한 적이 없다면(=자동 채움 상태 유지 중)
  // 컨텐츠를 바꿀 때마다 "{컨텐츠 이름} 파티"로 계속 갱신합니다.
  // 사용자가 한 번이라도 직접 타이핑했다면 그 이후로는 덮어쓰지 않습니다.
  if (partyTitleAutoFilled || partyTitleInput.value.trim() === "") {
    partyTitleInput.value = `${item.name} 파티`;
    state.partyTitle = partyTitleInput.value;
    partyTitleAutoFilled = true;
  }
}

contentBox.addEventListener("click", openContentModal);
contentModalClose.addEventListener("click", closeContentModal);
contentModalOverlay.addEventListener("click", (e) => {
  if (e.target === contentModalOverlay) closeContentModal();
});

renderContentBox();

/* ---------- 초기 렌더 ---------- */
render();
