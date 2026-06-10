// ==============================================
//  SPECIALISTS DASHBOARD — app.js
//  IMPORTANT: For safe updates, add an "ID" column to your Google Sheet.
//  New tasks will automatically receive an ID.
// ==============================================

const SHEETDB_URL = "https://sheetdb.io/api/v1/gi13znm24cygc";

// ─── Options used by the dashboard dropdowns ────────────────────────────────
const OPTIONS = {
  tipo: ["PROJECT", "PERPETUAL", "ON-DEMAND"],
  vertical: ["Academy", "School", "E-MOA", "Afterschool", "In-Company"],
  estado: ["Not started", "In progress", "Stand By", "Blocked", "Delayed Done", "Done"],
  calidad: ["Revisado y aprobado", "En revisión por especialistas", "Sin revisión de otros especialistas", "Pendiente de revisión"],
  specialists: [
    "Ailil Coutinho",
    "MOA - Victor Colmenares",
    "MrAsdrubal",
    "Dirección Académica",
    "MELISA MOA",
    "Noryley Rodríguez",
    "Roxangel Rodríguez",
    "Norilys Cermeño",
    "Victor Colmenares",
    "Melisa MOA"
  ]
};

// ─── Seed data shown while SheetDB URL is not configured ────────────────────
const SEED_DATA = [
  {
    "ID": "seed-001",
    "Tipo de trabajo": "PERPETUAL",
    "TASKS": "Evaluaciones",
    "Vertical": "School",
    "Brief Description": "Creación de los instrumentos de evaluación para todo el ecosistema MOA.",
    "Specialists": "Ailil Coutinho, MOA - Victor Colmenares",
    "Fecha de Inicio y Fin": "",
    "Estado": "In progress",
    "Calidad": "",
    "Rondas de revisión": "",
    "Comments": "",
    "Deadline 1": "", "Deadline 2": "", "Deadline 3": "", "Deadline 4": "",
    "Noryley": "", "Roxangel": "", "Ailil": "Pruebas Externas Colegios, últi",
    "Asdrubal": "", "Norilys": "", "Victor": "Mis To-Dos * Mis fechas de ent", "Melisa": "",
    "AI Summary": ""
  },
  {
    "ID": "seed-002",
    "Tipo de trabajo": "PERPETUAL",
    "TASKS": "English For Teachers (EFT)",
    "Vertical": "School",
    "Brief Description": "Enseña inglés al equipo docente de MOA School. Cada docente recibe una sesión sincrónica semanal y, cada dos semanas, un paquete de actividades para trabajar de forma autónoma.",
    "Specialists": "MrAsdrubal",
    "Fecha de Inicio y Fin": "",
    "Estado": "In progress",
    "Calidad": "",
    "Rondas de revisión": "2",
    "Comments": "Cada unidad contiene: 1 video presentación, 1 actividad de audio, 1 actividad de vocabulario, 2 prácticas de gramática, 1 creación de diálogo, 2 juegos flash, 1 proyecto",
    "Deadline 1": "", "Deadline 2": "", "Deadline 3": "", "Deadline 4": "",
    "Noryley": "", "Roxangel": "", "Ailil": "",
    "Asdrubal": "Mis To-Dos * Mis fechas de ent", "Norilys": "", "Victor": "", "Melisa": "",
    "AI Summary": ""
  },
  {
    "ID": "seed-003",
    "Tipo de trabajo": "ON-DEMAND",
    "TASKS": "Corrección de workbooks impresos para el año escolar 2026-2027",
    "Vertical": "School",
    "Brief Description": "Revisión y corrección rápida de workbooks MOA School. Errores tipográficos, de contenido y de maquetación detectados.",
    "Specialists": "MELISA MOA, Dirección Académica",
    "Fecha de Inicio y Fin": "May 5, 2026 – May 22, 2026",
    "Estado": "In progress",
    "Calidad": "En revisión por especialistas",
    "Rondas de revisión": "1",
    "Comments": "",
    "Deadline 1": "May 10, 2026", "Deadline 2": "May 15, 2026", "Deadline 3": "", "Deadline 4": "",
    "Noryley": "", "Roxangel": "", "Ailil": "",
    "Asdrubal": "", "Norilys": "", "Victor": "", "Melisa": "Mis To-Dos * Mis fechas de ent",
    "AI Summary": "Corrección urgente de workbooks físicos para distribución en agosto 2026. Prioridad alta."
  }
];

// ─── Column config: order + labels + icons + editable behavior ──────────────
const COLUMNS = [
  { key: "Tipo de trabajo",       label: "Tipo",          icon: "🏷️", type: "tipo", editable: true },
  { key: "TASKS",                 label: "TASKS",         icon: "📋", type: "title", editable: true },
  { key: "Vertical",              label: "Vertical",      icon: "📂", type: "vertical", editable: true },
  { key: "Brief Description",     label: "Descripción",   icon: "📄", type: "text", editable: true },
  { key: "Specialists",           label: "Specialists",   icon: "👥", type: "specialists", editable: true },
  { key: "Fecha de Inicio y Fin", label: "Fechas",        icon: "📅", type: "daterange", editable: true },
  { key: "Estado",                label: "Estado",        icon: "🔵", type: "estado", editable: true },
  { key: "Calidad",               label: "Calidad",       icon: "⭐", type: "calidad", editable: true },
  { key: "Rondas de revisión",    label: "Rondas",        icon: "🔄", type: "rounds", editable: true },
  { key: "Comments",              label: "Comments",      icon: "💬", type: "text", editable: true },
  { key: "Deadline 1",            label: "Deadline 1",    icon: "🗓️", type: "date", editable: true },
  { key: "Deadline 2",            label: "Deadline 2",    icon: "🗓️", type: "date", editable: true },
  { key: "Deadline 3",            label: "Deadline 3",    icon: "🗓️", type: "date", editable: true },
  { key: "Deadline 4",            label: "Deadline 4",    icon: "🗓️", type: "date", editable: true },
  { key: "Noryley",               label: "Noryley",       icon: "👤", type: "specialist-note", editable: true },
  { key: "Roxangel",              label: "Roxangel",      icon: "👤", type: "specialist-note", editable: true },
  { key: "Ailil",                 label: "Ailil",         icon: "👤", type: "specialist-note", editable: true },
  { key: "Asdrubal",              label: "Asdrubal",      icon: "👤", type: "specialist-note", editable: true },
  { key: "Norilys",               label: "Norilys",       icon: "👤", type: "specialist-note", editable: true },
  { key: "Victor",                label: "Victor",        icon: "👤", type: "specialist-note", editable: true },
  { key: "Melisa",                label: "Melisa",        icon: "👤", type: "specialist-note", editable: true },
  { key: "AI Summary",            label: "AI Summary",    icon: "🤖", type: "text", editable: true },
];

const ALL_SHEET_KEYS = ["ID", ...COLUMNS.map(col => col.key)];

// ─── State ──────────────────────────────────────────────────────────────────
let allData = [];
let filteredData = [];
let sortKey = null;
let sortDir = "asc";
let activeEditor = null;
let createSelectedSpecialists = new Set();

// ─── Fetch from SheetDB ─────────────────────────────────────────────────────
async function fetchData() {
  const loading = document.getElementById("loading-state");
  const errorEl  = document.getElementById("error-state");
  const table    = document.getElementById("main-table");

  loading.style.display = "flex";
  errorEl.style.display = "none";
  table.style.display   = "none";

  if (SHEETDB_URL.includes("YOUR_SHEETDB_ID_HERE")) {
    allData = normalizeRows(SEED_DATA);
    filteredData = [...allData];
    loading.style.display = "none";
    renderTable(filteredData);
    return;
  }

  try {
    const res = await fetch(SHEETDB_URL, { headers: { "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    allData = normalizeRows(Array.isArray(json) ? json : json.data || []);
    filteredData = [...allData];
    loading.style.display = "none";
    renderTable(filteredData);
  } catch (err) {
    console.error("SheetDB error:", err);
    loading.style.display = "none";
    errorEl.style.display = "flex";
  }
}

function normalizeRows(rows) {
  return rows.map((row, index) => ({
    ...row,
    __localIndex: index,
    __originalTaskName: row["TASKS"] || ""
  }));
}

// ─── POST new row to SheetDB ────────────────────────────────────────────────
async function postRow(rowData) {
  if (!rowData.ID) rowData.ID = createId();

  if (SHEETDB_URL.includes("YOUR_SHEETDB_ID_HERE")) {
    allData.push({ ...rowData, __localIndex: allData.length, __originalTaskName: rowData["TASKS"] || "" });
    filteredData = [...allData];
    renderTable(filteredData);
    return true;
  }

  try {
    const res = await fetch(SHEETDB_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [rowData] })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await fetchData();
    return true;
  } catch (err) {
    console.error("POST error:", err);
    return false;
  }
}

// ─── PATCH one cell to SheetDB ──────────────────────────────────────────────
async function patchCell(row, key, newValue) {
  const oldValue = row[key] || "";
  row[key] = newValue;
  renderTable(filteredData);

  if (SHEETDB_URL.includes("YOUR_SHEETDB_ID_HERE")) return true;

  // Best practice: update by ID. Fallback: update by TASKS if old rows do not have ID yet.
  const matchColumn = row.ID ? "ID" : "TASKS";
  const matchValue = row.ID || row.__originalTaskName || row["TASKS"];

  if (!matchValue) {
    row[key] = oldValue;
    renderTable(filteredData);
    showToast("This row cannot be updated because it has no ID or TASKS value.", "error");
    return false;
  }

  try {
    const res = await fetch(`${SHEETDB_URL}/${encodeURIComponent(matchColumn)}/${encodeURIComponent(matchValue)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { [key]: newValue } })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (key === "TASKS") row.__originalTaskName = newValue;
    showToast("Saved", "success");
    return true;
  } catch (err) {
    console.error("PATCH error:", err);
    row[key] = oldValue;
    renderTable(filteredData);
    showToast("Could not save the change. Check SheetDB and the ID column.", "error");
    return false;
  }
}

function createId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ─── Render Table ───────────────────────────────────────────────────────────
function renderTable(data) {
  const table = document.getElementById("main-table");
  const thead = document.getElementById("table-head-row");
  const tbody = document.getElementById("table-body");

  thead.innerHTML = "";
  COLUMNS.forEach(col => {
    const th = document.createElement("th");
    th.innerHTML = `<div class="th-inner"><span class="th-icon">${col.icon}</span>${col.label}</div>`;
    th.dataset.key = col.key;
    th.title = `Sort by ${col.label}`;
    th.addEventListener("click", () => handleSort(col.key));
    thead.appendChild(th);
  });

  tbody.innerHTML = "";
  if (data.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = COLUMNS.length;
    td.style.textAlign = "center";
    td.style.padding = "40px";
    td.style.color = "#787774";
    td.textContent = "No tasks found.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    data.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      COLUMNS.forEach(col => {
        const td = document.createElement("td");
        td.innerHTML = renderCell(row[col.key] || "", col.type, col.key);
        td.dataset.rowIndex = String(rowIndex);
        td.dataset.key = col.key;
        td.dataset.type = col.type;
        if (col.editable) {
          td.classList.add("editable-cell");
          td.title = "Click to edit";
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  table.style.display = "table";
}

// ─── Cell Renderers ─────────────────────────────────────────────────────────
function renderCell(value, type) {
  if (!value && value !== 0) return `<span class="cell-empty"></span>`;

  switch (type) {
    case "title":
      return `<div class="task-title" title="${esc(value)}">${esc(value)}</div>`;
    case "tipo":
      return renderTipoBadge(value);
    case "vertical": {
      const parts = splitMulti(value);
      return `<div class="badges-col">${parts.map(p => renderVerticalBadge(p)).join("")}</div>`;
    }
    case "specialists": {
      const names = splitMulti(value);
      return `<div class="specialists-col">${names.map((n, i) => renderAvatarChip(n, i)).join("")}</div>`;
    }
    case "daterange":
      return `<span class="date-range">📅 ${esc(value)}</span>`;
    case "date":
      return `<span class="date-range">${esc(value)}</span>`;
    case "estado":
      return renderEstado(value);
    case "calidad":
      return renderCalidad(value);
    case "rounds":
      return `<span class="rounds-badge">${esc(value)}</span>`;
    case "specialist-note":
      return `<div class="text-truncate text-small" title="${esc(value)}">${esc(value)}</div>`;
    case "text":
    default:
      return `<div class="text-truncate" title="${esc(value)}">${esc(value)}</div>`;
  }
}

function renderTipoBadge(val) {
  const map = { "PROJECT": "badge--project", "PERPETUAL": "badge--perpetual", "ON-DEMAND": "badge--ondemand" };
  const cls = map[String(val).toUpperCase()] || "badge--notstarted";
  return `<span class="badge ${cls}">${esc(val)}</span>`;
}

function renderVerticalBadge(val) {
  const map = {
    "academy": "badge--academy", "school": "badge--school", "e-moa": "badge--emoa",
    "afterschool": "badge--afterschool", "in-company": "badge--incompany"
  };
  const key = String(val).toLowerCase().replace(/\s+/g, "-");
  const cls = map[key] || "badge--academy";
  return `<span class="badge ${cls}">${esc(val)}</span>`;
}

function renderAvatarChip(name, idx) {
  const initials = String(name).split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase();
  const colorClass = `avatar-${idx % 7}`;
  return `<span class="avatar-chip"><span class="avatar-initials ${colorClass}">${esc(initials)}</span>${esc(name)}</span>`;
}

function renderEstado(val) {
  const key = String(val).toLowerCase().replace(/\s+/g, "");
  const map = {
    "notstarted": "notstarted", "inprogress": "inprogress", "standby": "standby",
    "blocked": "blocked", "done": "done", "delayeddone": "delayeddone"
  };
  const slug = map[key] || "notstarted";
  return `<span class="status-pill status-pill--${slug}"><span class="status-dot status-dot--${slug}"></span>${esc(val)}</span>`;
}

function renderCalidad(val) {
  const lower = String(val).toLowerCase();
  let cls = "badge--calidad-pending";
  if (lower.includes("aprobado") || lower.includes("approved")) cls = "badge--calidad-approved";
  else if (lower.includes("revisión por") || lower.includes("revision por")) cls = "badge--calidad-review";
  else if (lower.includes("sin revisión") || lower.includes("sin revision")) cls = "badge--calidad-norev";
  return `<span class="badge ${cls}">${esc(val)}</span>`;
}

function splitMulti(value) {
  return String(value || "").split(",").map(s => s.trim()).filter(Boolean);
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Inline editing ─────────────────────────────────────────────────────────
function initInlineEditing() {
  document.getElementById("table-body").addEventListener("click", (e) => {
    const td = e.target.closest("td.editable-cell");
    if (!td || e.target.closest(".inline-editor")) return;
    const row = filteredData[Number(td.dataset.rowIndex)];
    if (!row) return;
    openEditor(td, row, td.dataset.key, td.dataset.type);
  });
}

function openEditor(td, row, key, type) {
  if (activeEditor) renderTable(filteredData);
  activeEditor = { td, row, key };

  const value = row[key] || "";
  td.classList.add("editing");
  td.innerHTML = getEditorHTML(value, type, key);

  const firstInput = td.querySelector("input, textarea, select");
  if (firstInput) firstInput.focus();

  td.querySelector(".inline-save").addEventListener("click", async () => {
    const newValue = getEditorValue(td, type);
    activeEditor = null;
    await patchCell(row, key, newValue);
  });

  td.querySelector(".inline-cancel").addEventListener("click", () => {
    activeEditor = null;
    renderTable(filteredData);
  });
}

function getEditorHTML(value, type, key) {
  if (["tipo", "estado", "calidad"].includes(type)) {
    const list = OPTIONS[type] || [];
    return `
      <div class="inline-editor inline-editor--select">
        <select class="inline-input">${list.map(opt => `<option value="${esc(opt)}" ${opt === value ? "selected" : ""}>${esc(opt)}</option>`).join("")}</select>
        ${editorActions()}
      </div>`;
  }

  if (["vertical", "specialists"].includes(type)) {
    const list = type === "vertical" ? OPTIONS.vertical : OPTIONS.specialists;
    const current = splitMulti(value);
    return `
      <div class="inline-editor inline-editor--multi">
        <div class="multi-options">
          ${list.map(opt => `
            <label class="multi-option">
              <input type="checkbox" value="${esc(opt)}" ${current.includes(opt) ? "checked" : ""} />
              <span>${esc(opt)}</span>
            </label>`).join("")}
        </div>
        ${editorActions()}
      </div>`;
  }

  if (type === "date") {
    return `
      <div class="inline-editor inline-editor--date">
        <input class="inline-input" type="date" value="${esc(parseDateToInput(value))}" />
        ${editorActions()}
      </div>`;
  }

  if (type === "daterange") {
    const [start, end] = parseDateRange(value);
    return `
      <div class="inline-editor inline-editor--date-range">
        <input class="inline-input" data-range="start" type="date" value="${esc(parseDateToInput(start))}" />
        <input class="inline-input" data-range="end" type="date" value="${esc(parseDateToInput(end))}" />
        ${editorActions()}
      </div>`;
  }

  const isLongText = ["Brief Description", "Comments", "AI Summary"].includes(key) || type === "specialist-note";
  const tag = isLongText ? "textarea" : "input";
  if (tag === "textarea") {
    return `
      <div class="inline-editor inline-editor--text">
        <textarea class="inline-input" rows="4">${esc(value)}</textarea>
        ${editorActions()}
      </div>`;
  }

  return `
    <div class="inline-editor inline-editor--text">
      <input class="inline-input" type="text" value="${esc(value)}" />
      ${editorActions()}
    </div>`;
}

function editorActions() {
  return `
    <div class="inline-actions">
      <button type="button" class="inline-save">Save</button>
      <button type="button" class="inline-cancel">Cancel</button>
    </div>`;
}

function getEditorValue(td, type) {
  if (["vertical", "specialists"].includes(type)) {
    return Array.from(td.querySelectorAll(".multi-option input:checked")).map(input => input.value).join(", ");
  }

  if (type === "date") {
    const dateValue = td.querySelector("input[type='date']").value;
    return dateValue ? formatDateForDisplay(dateValue) : "";
  }

  if (type === "daterange") {
    const start = td.querySelector("input[data-range='start']").value;
    const end = td.querySelector("input[data-range='end']").value;
    const startText = start ? formatDateForDisplay(start) : "";
    const endText = end ? formatDateForDisplay(end) : "";
    if (startText && endText) return `${startText} – ${endText}`;
    return startText || endText || "";
  }

  const input = td.querySelector("input, textarea, select");
  return input ? input.value.trim() : "";
}

function parseDateRange(value) {
  if (!value) return ["", ""];
  const parts = String(value).split(/\s+[–-]\s+/);
  return [parts[0] || "", parts[1] || ""];
}

function parseDateToInput(value) {
  if (!value) return "";
  const clean = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const parsed = new Date(clean);
  if (Number.isNaN(parsed.getTime())) return "";
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateForDisplay(inputDate) {
  const date = new Date(`${inputDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return inputDate;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Sort ───────────────────────────────────────────────────────────────────
function handleSort(key) {
  if (activeEditor) activeEditor = null;
  if (sortKey === key) sortDir = sortDir === "asc" ? "desc" : "asc";
  else { sortKey = key; sortDir = "asc"; }

  filteredData = [...filteredData].sort((a, b) => {
    const av = (a[key] || "").toString().toLowerCase();
    const bv = (b[key] || "").toString().toLowerCase();
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  renderTable(filteredData);
}

// ─── Search ─────────────────────────────────────────────────────────────────
function handleSearch(query) {
  const q = query.toLowerCase().trim();
  filteredData = q
    ? allData.filter(row => Object.values(row).some(v => String(v || "").toLowerCase().includes(q)))
    : [...allData];
  renderTable(filteredData);
}

// ─── Tabs ───────────────────────────────────────────────────────────────────
function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("tab--active"));
      tab.classList.add("tab--active");
      const viewId = "view-" + tab.dataset.tab;
      document.querySelectorAll(".view").forEach(v => v.classList.remove("view--active"));
      const view = document.getElementById(viewId);
      if (view) view.classList.add("view--active");
    });
  });
}

// ─── Toolbar ────────────────────────────────────────────────────────────────
function initToolbar() {
  const searchBtn = document.getElementById("btn-search");
  const searchBar = document.getElementById("search-bar");
  const searchInput = document.getElementById("search-input");

  searchBtn.addEventListener("click", () => {
    const visible = searchBar.style.display !== "none";
    searchBar.style.display = visible ? "none" : "block";
    if (!visible) searchInput.focus();
  });

  searchInput.addEventListener("input", () => handleSearch(searchInput.value));

  document.getElementById("btn-new").addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("tab--active"));
    const submitTab = document.querySelector('[data-tab="submit"]');
    if (submitTab) submitTab.classList.add("tab--active");
    document.querySelectorAll(".view").forEach(v => v.classList.remove("view--active"));
    document.getElementById("view-submit").classList.add("view--active");
  });
}

// ─── Submit Form / MOA People Picker ───────────────────────────────────────
function initSubmitForm() {
  const form = document.getElementById("submit-form");
  const feedback = document.getElementById("form-feedback");
  const picker = document.getElementById("specialists-picker");
  const trigger = document.getElementById("specialists-trigger");
  const dropdown = document.getElementById("specialists-dropdown");
  const search = document.getElementById("specialists-search");

  renderCreateSpecialistOptions();
  updateCreateSpecialistsUI();

  trigger.addEventListener("click", () => {
    const isOpen = picker.classList.toggle("is-open");
    dropdown.hidden = !isOpen;
    trigger.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      search.value = "";
      renderCreateSpecialistOptions();
      setTimeout(() => search.focus(), 0);
    }
  });

  search.addEventListener("input", () => renderCreateSpecialistOptions(search.value));

  document.addEventListener("click", (e) => {
    if (!picker.contains(e.target)) closeCreateSpecialistPicker();
  });

  document.getElementById("selected-specialists").addEventListener("click", (e) => {
    const removeButton = e.target.closest("[data-remove-specialist]");
    if (!removeButton) return;
    createSelectedSpecialists.delete(removeButton.dataset.removeSpecialist);
    updateCreateSpecialistsUI();
    renderCreateSpecialistOptions(search.value);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback.textContent = "Submitting…";
    feedback.className = "form-feedback";

    const formData = new FormData(form);
    const row = {};
    ALL_SHEET_KEYS.forEach(key => { row[key] = ""; });

    row.ID = createId();
    row["TASKS"] = (formData.get("TASKS") || "").trim();
    row["Tipo de trabajo"] = formData.get("Tipo de trabajo") || "";
    row["Vertical"] = formData.get("Vertical") || "";
    row["Specialists"] = Array.from(createSelectedSpecialists).join(", ");
    row["Brief Description"] = (formData.get("Brief Description") || "").trim();

    // Estado, Calidad, Rondas, Comments, Deadlines and specialist boxes stay empty.
    // They are edited directly from the dashboard after the task is created.

    const ok = await postRow(row);
    if (ok) {
      feedback.textContent = "Task submitted successfully.";
      feedback.className = "form-feedback form-feedback--success";
      form.reset();
      createSelectedSpecialists.clear();
      closeCreateSpecialistPicker();
      updateCreateSpecialistsUI();
      renderCreateSpecialistOptions();
    } else {
      feedback.textContent = "Error submitting. Check the console and your SheetDB URL.";
      feedback.className = "form-feedback form-feedback--error";
    }
  });
}

function closeCreateSpecialistPicker() {
  const picker = document.getElementById("specialists-picker");
  const trigger = document.getElementById("specialists-trigger");
  const dropdown = document.getElementById("specialists-dropdown");
  if (!picker || !trigger || !dropdown) return;
  picker.classList.remove("is-open");
  dropdown.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
}

function renderCreateSpecialistOptions(filter = "") {
  const list = document.getElementById("specialists-create-list");
  if (!list) return;

  const q = filter.trim().toLowerCase();
  const visibleSpecialists = OPTIONS.specialists.filter(name => name.toLowerCase().includes(q));

  if (visibleSpecialists.length === 0) {
    list.innerHTML = `<div class="empty-people-result">No specialist found.</div>`;
    return;
  }

  list.innerHTML = visibleSpecialists.map(name => {
    const selected = createSelectedSpecialists.has(name);
    return `
      <button type="button" class="people-option ${selected ? "is-selected" : ""}" data-specialist="${esc(name)}" role="option" aria-selected="${selected}">
        <span class="people-option__avatar">${esc(getInitials(name))}</span>
        <span class="people-option__name">${esc(name)}</span>
        <span class="people-option__check">✓</span>
      </button>`;
  }).join("");

  list.querySelectorAll(".people-option").forEach(button => {
    button.addEventListener("click", () => {
      const name = button.dataset.specialist;
      if (createSelectedSpecialists.has(name)) createSelectedSpecialists.delete(name);
      else createSelectedSpecialists.add(name);
      updateCreateSpecialistsUI();
      renderCreateSpecialistOptions(document.getElementById("specialists-search").value);
    });
  });
}

function updateCreateSpecialistsUI() {
  const selectedBox = document.getElementById("selected-specialists");
  const hidden = document.getElementById("specialists-hidden");
  const trigger = document.getElementById("specialists-trigger");
  if (!selectedBox || !hidden || !trigger) return;

  const selected = Array.from(createSelectedSpecialists);
  hidden.value = selected.join(", ");

  const placeholder = trigger.querySelector(".people-picker__placeholder");
  if (placeholder) {
    placeholder.textContent = selected.length
      ? `${selected.length} specialist${selected.length === 1 ? "" : "s"} selected`
      : "Selecciona uno o varios especialistas";
    placeholder.style.color = selected.length ? "var(--moa-ink)" : "var(--text-secondary)";
  }

  selectedBox.innerHTML = selected.map(name => `
    <span class="selected-person-chip">
      <span class="selected-person-chip__avatar">${esc(getInitials(name))}</span>
      <span>${esc(name)}</span>
      <button type="button" class="selected-person-chip__remove" data-remove-specialist="${esc(name)}" aria-label="Remove ${esc(name)}">×</button>
    </span>
  `).join("");
}

function getInitials(name) {
  return String(name)
    .replace(/^MOA\s*-\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0] || "")
    .join("")
    .toUpperCase();
}

// ─── Toast ──────────────────────────────────────────────────────────────────
function showToast(message, type = "success") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast toast--${type} toast--show`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("toast--show"), 1800);
}

// ─── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initToolbar();
  initInlineEditing();
  initSubmitForm();
  fetchData();
});
