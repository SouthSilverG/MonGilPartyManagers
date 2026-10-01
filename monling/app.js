/* =====================================================================
   monling/app.js — 몬스터링 도감 탭 로직.
   data.js의 MONSTERLINGS 배열만 읽어서 표를 그립니다. 새 몬스터가
   data.js에 추가되면 이 파일은 손댈 필요 없이 자동으로 표에 반영됩니다.
   ===================================================================== */

const ELEMENT_ORDER = ["물리", "땅", "바람", "번개", "불", "얼음", "물", "암흑", "공용", "없음", "데이터없음"];

function elementSortKey(el) {
  const idx = ELEMENT_ORDER.indexOf(el);
  return idx === -1 ? ELEMENT_ORDER.length : idx;
}

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" rx="8" fill="#20232e"/><text x="24" y="28" font-size="10" fill="#6b7280" text-anchor="middle">이미지</text></svg>'
  );

function imgOrPlaceholder(src) {
  return src ? src : PLACEHOLDER_IMG;
}

// 각 몬스터링의 "현재 보고 있는 링크체인 레벨"을 저장합니다(새로고침해도 유지).
const LEVEL_STORAGE_KEY = "monling_levels_v1";

function loadLevels() {
  try {
    const raw = localStorage.getItem(LEVEL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLevels(levels) {
  try {
    localStorage.setItem(LEVEL_STORAGE_KEY, JSON.stringify(levels));
  } catch (e) {
    // 저장이 막혀 있어도(시크릿 모드 등) 기능은 계속 동작하게 둡니다.
  }
}

let levelState = loadLevels();

function getLevel(m) {
  const stageCount = m.linkChain.stages.length;
  if (stageCount === 0) return 0;
  const saved = levelState[m.id];
  if (typeof saved === "number" && saved >= 1 && saved <= stageCount) return saved;
  return 1;
}

function setLevel(m, level) {
  const stageCount = m.linkChain.stages.length;
  const clamped = Math.max(1, Math.min(stageCount, level));
  levelState[m.id] = clamped;
  saveLevels(levelState);
  return clamped;
}

/* ---------- 속성 필터 옵션 채우기 (데이터에 실제로 존재하는 값만) ---------- */
const linkChainElementFilter = document.getElementById("linkChainElementFilter");
const presentLinkChainElements = Array.from(
  new Set(MONSTERLINGS.filter((m) => m.hasLinkChain).map((m) => m.linkChain.element))
).sort((a, b) => elementSortKey(a) - elementSortKey(b));
presentLinkChainElements.forEach((el) => {
  const opt = document.createElement("option");
  opt.value = el;
  opt.textContent = el;
  linkChainElementFilter.appendChild(opt);
});

const breedElementFilter = document.getElementById("breedElementFilter");
const presentBreedElements = Array.from(new Set(MONSTERLINGS.map((m) => m.breedEffect.element))).sort(
  (a, b) => elementSortKey(a) - elementSortKey(b)
);
presentBreedElements.forEach((el) => {
  const opt = document.createElement("option");
  opt.value = el;
  opt.textContent = el;
  breedElementFilter.appendChild(opt);
});

const searchInput = document.getElementById("searchInput");
const linkChainFilter = document.getElementById("linkChainFilter");
const tableBody = document.getElementById("tableBody");
const resultCount = document.getElementById("resultCount");

function elementBadgeClass(el) {
  const map = {
    "물리": "elem-physical",
    "땅": "elem-earth",
    "바람": "elem-wind",
    "번개": "elem-lightning",
    "불": "elem-fire",
    "얼음": "elem-ice",
    "물": "elem-water",
    "암흑": "elem-dark",
    "공용": "elem-weak",
  };
  return "elem-badge " + (map[el] || "elem-none");
}

function renderElementBadge(el) {
  const span = document.createElement("span");
  span.className = elementBadgeClass(el);
  span.textContent = el || "–";
  return span;
}

function formatStageSummary(stage) {
  if (!stage) return "";
  return `피해량 ${stage.damagePercent}%`;
}

function renderRow(m) {
  const tr = document.createElement("tr");

  // 아이콘 / 이름
  const tdIcon = document.createElement("td");
  tdIcon.className = "col-icon";
  const iconWrap = document.createElement("div");
  iconWrap.className = "monling-name-cell";
  const img = document.createElement("img");
  img.loading = "lazy";
  img.src = imgOrPlaceholder(m.image);
  img.alt = m.name;
  iconWrap.appendChild(img);
  const nameBox = document.createElement("div");
  nameBox.className = "monling-name-cell__text";
  const nameEl = document.createElement("div");
  nameEl.className = "monling-name-cell__ko";
  nameEl.textContent = m.name;
  const nameEnEl = document.createElement("div");
  nameEnEl.className = "monling-name-cell__en";
  nameEnEl.textContent = m.nameEn;
  nameBox.appendChild(nameEl);
  nameBox.appendChild(nameEnEl);
  iconWrap.appendChild(nameBox);
  tdIcon.appendChild(iconWrap);
  tr.appendChild(tdIcon);

  // 링크체인 속성
  const tdLcElement = document.createElement("td");
  tdLcElement.className = "col-element col-element--lc";
  if (m.hasLinkChain) {
    tdLcElement.appendChild(renderElementBadge(m.linkChain.element));
  } else {
    tdLcElement.textContent = "–";
    tdLcElement.classList.add("cell-muted");
  }
  tr.appendChild(tdLcElement);

  // 품종 속성
  const tdBreedElement = document.createElement("td");
  tdBreedElement.className = "col-element col-element--breed";
  tdBreedElement.appendChild(renderElementBadge(m.breedEffect.element));
  tr.appendChild(tdBreedElement);

  // 링크체인 유무
  const tdHas = document.createElement("td");
  tdHas.className = "col-linkchain";
  const hasMark = document.createElement("span");
  hasMark.className = m.hasLinkChain ? "linkchain-mark linkchain-mark--yes" : "linkchain-mark linkchain-mark--no";
  hasMark.textContent = m.hasLinkChain ? "✓" : "–";
  tdHas.appendChild(hasMark);
  tr.appendChild(tdHas);

  // 링크체인 레벨
  const tdLevel = document.createElement("td");
  tdLevel.className = "col-level";
  if (m.hasLinkChain && m.linkChain.stages.length > 0) {
    const stepper = document.createElement("div");
    stepper.className = "level-stepper";

    const level = getLevel(m);

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "level-stepper__btn";
    prevBtn.textContent = "◀";
    prevBtn.disabled = level <= 1;

    const numInput = document.createElement("input");
    numInput.type = "number";
    numInput.className = "level-stepper__input";
    numInput.min = "1";
    numInput.max = String(m.linkChain.stages.length);
    numInput.value = String(level);

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "level-stepper__btn";
    nextBtn.textContent = "▶";
    nextBtn.disabled = level >= m.linkChain.stages.length;

    function applyLevel(newLevel) {
      const clamped = setLevel(m, newLevel);
      renderAll(); // 레벨에 따라 쿨타임/효과 칸도 같이 바뀌어야 하므로 전체를 다시 그립니다.
    }

    prevBtn.addEventListener("click", () => applyLevel(level - 1));
    nextBtn.addEventListener("click", () => applyLevel(level + 1));
    numInput.addEventListener("change", () => {
      const v = parseInt(numInput.value, 10);
      applyLevel(Number.isNaN(v) ? 1 : v);
    });

    stepper.appendChild(prevBtn);
    stepper.appendChild(numInput);
    stepper.appendChild(nextBtn);
    tdLevel.appendChild(stepper);
  } else {
    tdLevel.textContent = "–";
    tdLevel.classList.add("cell-muted");
  }
  tr.appendChild(tdLevel);

  // 쿨타임 (링크체인 현재 레벨 기준 / 품종효과 고정값)
  const tdCooldown = document.createElement("td");
  tdCooldown.className = "col-cooldown";
  const lcCooldownLine = document.createElement("div");
  if (m.hasLinkChain && m.linkChain.stages.length > 0) {
    const level = getLevel(m);
    const stage = m.linkChain.stages[level - 1];
    lcCooldownLine.innerHTML = `<span class="cooldown-label cooldown-label--lc">링크체인</span> ${stage.cooldownSeconds}초`;
  } else {
    lcCooldownLine.innerHTML = `<span class="cooldown-label cooldown-label--lc">링크체인</span> –`;
  }
  const breedCooldownLine = document.createElement("div");
  const breedCd = m.breedEffect.cooldownSeconds;
  breedCooldownLine.innerHTML = `<span class="cooldown-label cooldown-label--breed">품종</span> ${breedCd != null ? breedCd + "초" : "상시/즉시"}`;
  tdCooldown.appendChild(lcCooldownLine);
  tdCooldown.appendChild(breedCooldownLine);
  tr.appendChild(tdCooldown);

  // 품종 및 링크체인 효과
  const tdEffect = document.createElement("td");
  tdEffect.className = "col-effect";

  if (m.hasLinkChain) {
    const lcLine = document.createElement("div");
    lcLine.className = "effect-line";
    const level = getLevel(m);
    const stage = m.linkChain.stages[level - 1];

    // 대미지보다 발동 조건 / 실제 효과 / 레벨별 수치를 품종효과처럼
    // "A / B / C" 한 줄로 간단히 보여줍니다(긴 문장을 그대로 읽지 않아도 되게).
    const condition = m.linkChain.appearanceConditions || "조건 없음";

    const introPrefix = "몬스터링 장착 시 등장 조건에 따라 나타나";
    let effectText = m.linkChain.intro || m.linkChain.name;
    if (effectText.startsWith(introPrefix)) {
      effectText = effectText.slice(introPrefix.length).trim();
    }
    if (m.linkChain.extraEffects.length > 0) {
      effectText += ` (추가효과: ${m.linkChain.extraEffects.join(", ")})`;
    }

    const levelText = stage ? `Lv.${level} ${formatStageSummary(stage)}` : "";

    const parts = [condition, effectText];
    if (levelText) parts.push(levelText);
    lcLine.innerHTML = `<span class="effect-label effect-label--lc">링크체인</span> ${parts.join(" / ")}`;
    tdEffect.appendChild(lcLine);
  }

  const breedLine = document.createElement("div");
  breedLine.className = "effect-line";
  const rawBreedText = m.breedEffect.text || "데이터 없음(몬링 패치 분석 전)";
  // 쿨타임은 옆 "쿨타임" 칸에 이미 표시되므로 품종효과 문장 속 "(OO초에 1회 발동)"은 중복이라 뺍니다.
  const breedText = rawBreedText.replace(/\s*\(\d+(?:\.\d+)?\s*초에\s*1회\s*발동\)/g, "");
  breedLine.innerHTML = `<span class="effect-label effect-label--breed">품종</span> ${breedText.replace(/\n/g, " / ")}`;
  tdEffect.appendChild(breedLine);

  tr.appendChild(tdEffect);

  return tr;
}

function renderAll() {
  const q = searchInput.value.trim().toLowerCase();
  const lcElFilter = linkChainElementFilter.value;
  const breedElFilter = breedElementFilter.value;
  const lcFilter = linkChainFilter.value;

  const filtered = MONSTERLINGS.filter((m) => {
    if (q && !(m.name.toLowerCase().includes(q) || m.nameEn.toLowerCase().includes(q))) return false;
    if (lcElFilter && (!m.hasLinkChain || m.linkChain.element !== lcElFilter)) return false;
    if (breedElFilter && m.breedEffect.element !== breedElFilter) return false;
    if (lcFilter === "yes" && !m.hasLinkChain) return false;
    if (lcFilter === "no" && m.hasLinkChain) return false;
    return true;
  });

  tableBody.innerHTML = "";
  filtered.forEach((m) => tableBody.appendChild(renderRow(m)));

  resultCount.textContent = `총 ${MONSTERLINGS.length}종 중 ${filtered.length}종 표시`;
}

searchInput.addEventListener("input", renderAll);
linkChainElementFilter.addEventListener("change", renderAll);
breedElementFilter.addEventListener("change", renderAll);
linkChainFilter.addEventListener("change", renderAll);

renderAll();
