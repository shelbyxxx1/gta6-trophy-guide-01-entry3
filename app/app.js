"use strict";

// The Leonida Fieldbook — tracker logic.
// Everything runs locally: the trophy data is the JSON file beside this
// script, progress lives in localStorage, and nothing is fetched from a
// network beyond the app's own files.

const PROGRESS_KEY = "leonida-fieldbook-progress-v1";
const SPOILER_KEY = "leonida-fieldbook-spoiler-v1";
const SAMPLE_EARNED = [2, 3, 4, 8, 16, 21, 28, 35, 44, 53];

let DATA = null;
let earned = loadProgress();
let spoilerShield = localStorage.getItem(SPOILER_KEY) === "1";

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
    return new Set(Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeTotals() {
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const done = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of DATA.trophies) {
    totals[t.grade] += 1;
    if (earned.has(t.id)) done[t.grade] += 1;
  }
  return { totals, done };
}

function renderProgress() {
  const total = DATA.trophies.length;
  const pct = Math.round((earned.size / total) * 100);
  document.getElementById("ringPct").textContent = pct + "%";
  const ring = document.getElementById("ringFill");
  ring.style.strokeDashoffset = String(326.7 * (1 - earned.size / total));
  const { totals, done } = gradeTotals();
  const board = document.getElementById("gradeBoard");
  board.innerHTML = "";
  for (const grade of ["platinum", "gold", "silver", "bronze"]) {
    const chip = document.createElement("div");
    chip.className = "grade-chip " + grade;
    const strong = document.createElement("strong");
    strong.textContent = done[grade] + " / " + totals[grade];
    const span = document.createElement("span");
    span.textContent = grade;
    chip.append(strong, span);
    board.appendChild(chip);
  }
  document.getElementById("standfirst").textContent =
    DATA.subtitle + " You have earned " + earned.size + " of " + total + " trophies.";
}

function trophyCard(t, { inWatchlist = false } = {}) {
  const card = document.createElement("article");
  card.className = "trophy " + t.grade + (earned.has(t.id) ? " earned" : "");
  const isHiddenStory = spoilerShield && t.kind === "story" && !earned.has(t.id);
  if (isHiddenStory) card.classList.add("hidden-story");

  const head = document.createElement("div");
  head.className = "trophy-head";
  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = earned.has(t.id);
  box.setAttribute("aria-label", "Mark " + t.name + " as earned");
  box.addEventListener("change", () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    saveProgress();
    renderAll();
  });
  const name = document.createElement("h3");
  name.className = "trophy-name";
  name.textContent = isHiddenStory ? "Hidden story trophy" : t.name;
  const grade = document.createElement("span");
  grade.className = "badge";
  grade.textContent = t.grade;
  head.append(box, name, grade);
  if (t.kind !== t.grade) {
    const kind = document.createElement("span");
    kind.className = "badge";
    kind.textContent = t.kind;
    head.appendChild(kind);
  }
  if (t.missable) {
    const watch = document.createElement("span");
    watch.className = "badge watch";
    watch.textContent = "watchlist";
    head.appendChild(watch);
  }
  card.appendChild(head);

  const desc = document.createElement("p");
  desc.className = "official-desc";
  desc.textContent = isHiddenStory
    ? "Name and description hidden by the spoiler shield until this trophy is earned."
    : "“" + t.description + "”";
  card.appendChild(desc);

  if (!isHiddenStory) {
    const guide = document.createElement("p");
    guide.className = "guide-text";
    guide.textContent = t.guide;
    card.appendChild(guide);
    if (t.missable && t.missableReason) {
      const reason = document.createElement("p");
      reason.className = "missable-reason";
      reason.textContent = t.missableReason;
      card.appendChild(reason);
    }
    const src = document.createElement("p");
    src.className = "source-line";
    src.textContent = "Sources: " + t.sources;
    card.appendChild(src);
  }
  if (inWatchlist) card.dataset.watchlist = "1";
  return card;
}

function currentFilters() {
  return {
    q: document.getElementById("searchBox").value.trim().toLowerCase(),
    kind: document.getElementById("kindFilter").value,
    grade: document.getElementById("gradeFilter").value,
    hideEarned: document.getElementById("hideEarned").checked,
  };
}

function matches(t, f) {
  if (f.grade !== "all" && t.grade !== f.grade) return false;
  if (f.kind === "missable" && !t.missable) return false;
  if (f.kind === "online") return false; // the official list contains no online trophies
  if (f.kind !== "all" && f.kind !== "missable" && t.kind !== f.kind) return false;
  if (f.hideEarned && earned.has(t.id)) return false;
  if (f.q) {
    const hay = (t.name + " " + t.description + " " + t.guide + " " + t.kind).toLowerCase();
    if (!hay.includes(f.q)) return false;
  }
  return true;
}

function renderChecklist() {
  const f = currentFilters();
  const list = document.getElementById("trophyList");
  list.innerHTML = "";
  const shown = DATA.trophies.filter((t) => matches(t, f));
  for (const t of shown) list.appendChild(trophyCard(t));
  const line = document.getElementById("resultLine");
  if (f.kind === "online") {
    line.textContent = "The official list contains no online trophies — every one of the 55 can be earned in single player. Showing 0 of 55.";
  } else {
    line.textContent = "Showing " + shown.length + " of " + DATA.trophies.length + " trophies.";
  }
}

function renderRoadmap() {
  const wrap = document.getElementById("roadmapList");
  wrap.innerHTML = "";
  const byId = new Map(DATA.trophies.map((t) => [t.id, t]));
  for (const stage of DATA.roadmap) {
    const box = document.createElement("section");
    box.className = "stage";
    const h = document.createElement("h3");
    const no = document.createElement("span");
    no.className = "stage-no";
    no.textContent = "Stage " + stage.stage + " · ";
    h.append(no, document.createTextNode(stage.title));
    const p = document.createElement("p");
    p.textContent = stage.detail;
    const ul = document.createElement("ul");
    for (const id of stage.trophyIds) {
      const t = byId.get(id);
      const li = document.createElement("li");
      li.textContent = (earned.has(id) ? "✓ " : "○ ") + t.name + " (" + t.grade + ")";
      ul.appendChild(li);
    }
    box.append(h, p, ul);
    wrap.appendChild(box);
  }
}

function renderWatchlist() {
  const wrap = document.getElementById("watchList");
  wrap.innerHTML = "";
  for (const t of DATA.trophies.filter((x) => x.missable)) {
    wrap.appendChild(trophyCard(t, { inWatchlist: true }));
  }
}

function renderSources() {
  document.getElementById("methodText").textContent = DATA.method;
  const wrap = document.getElementById("sourceList");
  wrap.innerHTML = "";
  for (const s of DATA.sources) {
    const card = document.createElement("article");
    card.className = "source-card";
    const h = document.createElement("h3");
    h.textContent = s.name;
    const p = document.createElement("p");
    p.textContent = s.detail;
    const a = document.createElement("a");
    a.href = s.url;
    a.textContent = s.url;
    a.rel = "noopener";
    card.append(h, p, a);
    wrap.appendChild(card);
  }
}

function renderAll() {
  renderProgress();
  renderChecklist();
  renderRoadmap();
  renderWatchlist();
  renderSources();
}

function switchView(name) {
  for (const tab of document.querySelectorAll(".tab")) {
    tab.classList.toggle("active", tab.dataset.view === name);
  }
  for (const view of document.querySelectorAll(".view")) {
    view.hidden = view.id !== "view-" + name;
  }
}

function applyUrlParams() {
  const params = new URLSearchParams(location.search);
  const view = params.get("view");
  if (view && ["checklist", "roadmap", "watchlist", "sources"].includes(view)) switchView(view);
  const grade = params.get("grade");
  if (grade) document.getElementById("gradeFilter").value = grade;
  const kind = params.get("kind");
  if (kind) document.getElementById("kindFilter").value = kind;
  if (params.get("spoiler") === "1") {
    spoilerShield = true;
    document.getElementById("spoilerToggle").checked = true;
  }
  if (params.get("demo") === "1" && earned.size === 0) {
    earned = new Set(SAMPLE_EARNED);
  }
}

async function boot() {
  const res = await fetch("data/trophies.json");
  DATA = await res.json();
  document.getElementById("spoilerToggle").checked = spoilerShield;
  applyUrlParams();
  renderAll();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => switchView(tab.dataset.view));
});
for (const id of ["searchBox", "kindFilter", "gradeFilter", "hideEarned"]) {
  document.getElementById(id).addEventListener("input", renderChecklist);
  document.getElementById(id).addEventListener("change", renderChecklist);
}
document.getElementById("spoilerToggle").addEventListener("change", (e) => {
  spoilerShield = e.target.checked;
  localStorage.setItem(SPOILER_KEY, spoilerShield ? "1" : "0");
  renderAll();
});
document.getElementById("exportBtn").addEventListener("click", () => {
  const payload = JSON.stringify({ fieldbook: "leonida", earned: [...earned].sort((a, b) => a - b) }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "leonida-fieldbook-progress.json";
  a.click();
  URL.revokeObjectURL(url);
});
document.getElementById("importFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (Array.isArray(ids)) {
      earned = new Set(ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
      saveProgress();
      renderAll();
    }
  } catch {
    // A file that is not fieldbook progress is ignored rather than fatal.
  }
  e.target.value = "";
});
document.getElementById("demoBtn").addEventListener("click", () => {
  earned = new Set(SAMPLE_EARNED);
  saveProgress();
  renderAll();
});
document.getElementById("resetBtn").addEventListener("click", () => {
  earned = new Set();
  saveProgress();
  renderAll();
});

boot();
