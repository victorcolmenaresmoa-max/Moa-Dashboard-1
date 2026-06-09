// ==============================================
//  SPECIALISTS DASHBOARD — app.js
//  Replace SHEETDB_URL with your actual endpoint
// ==============================================

const SHEETDB_URL = "https://sheetdb.io/api/v1/gi13znm24cygc";

// ─── Seed data shown while SheetDB URL is not configured ───────────────────
const SEED_DATA = [
  {
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
  },
  {
    "Tipo de trabajo": "PROJECT",
    "TASKS": "Rediseño del currículo Academy Q3",
    "Vertical": "Academy",
    "Brief Description": "Actualización completa del currículo trimestral alineado con los nuevos estándares de calidad MOA para el tercer trimestre.",
    "Specialists": "Noryley Rodríguez, Roxangel Pérez",
    "Fecha de Inicio y Fin": "Apr 1, 2026 – Jun 30, 2026",
    "Estado": "Stand By",
    "Calidad": "Pendiente de revisión",
    "Rondas de revisión": "3",
    "Comments": "En espera de aprobación del comité académico.",
    "Deadline 1": "May 1, 2026", "Deadline 2": "Jun 1, 2026", "Deadline 3": "Jun 30, 2026", "Deadline 4": "",
    "Noryley": "Mis To-Dos * Mis fechas de ent", "Roxangel": "Revisión pendiente",
    "Ailil": "", "Asdrubal": "", "Norilys": "", "Victor": "", "Melisa": "",
    "AI Summary": "Proyecto de rediseño curricular en pausa por aprobación institucional."
  },
  {
    "Tipo de trabajo": "ON-DEMAND",
    "TASKS": "Creación de materiales E-MOA Semana 12",
    "Vertical": "E-MOA",
    "Brief Description": "Producción de materiales digitales interactivos para la semana 12 del programa E-MOA.",
    "Specialists": "Norilys Castro",
    "Fecha de Inicio y Fin": "May 20, 2026 – May 27, 2026",
    "Estado": "Blocked",
    "Calidad": "Sin revisión de otros especialistas",
    "Rondas de revisión": "",
    "Comments": "Bloqueado por falta de assets gráficos del equipo de diseño.",
    "Deadline 1": "May 27, 2026", "Deadline 2": "", "Deadline 3": "", "Deadline 4": "",
    "Noryley": "", "Roxangel": "", "Ailil": "",
    "Asdrubal": "", "Norilys": "Mis To-Dos * En espera de diseño", "Victor": "", "Melisa": "",
    "AI Summary": ""
  }
];

// ─── Column config: order + labels + icons ─────────────────────────────────
const COLUMNS = [
  { key: "Tipo de trabajo",      label: "Tipo",           icon: "🏷️",  type: "tipo" },
  { key: "TASKS",                label: "TASKS",          icon: "📋",  type: "title" },
  { key: "Vertical",             label: "Vertical",       icon: "📂",  type: "vertical" },
  { key: "Brief Description",    label: "Descripción",    icon: "📄",  type: "text" },
  { key: "Specialists",          label: "Specialists",    icon: "👥",  type: "specialists" },
  { key: "Fecha de Inicio y Fin",label: "Fechas",         icon: "📅",  type: "daterange" },
  { key: "Estado",               label: "Estado",         icon: "🔵",  type: "estado" },
  { key: "Calidad",              label: "Calidad",        icon: "⭐",  type: "calidad" },
  { key: "Rondas de revisión",   label: "Rondas",         icon: "🔄",  type: "rounds" },
  { key: "Comments",             label: "Comments",       icon: "💬",  type: "text" },
  { key: "Deadline 1",           label: "Deadline 1",     icon: "🗓️",  type: "date" },
  { key: "Deadline 2",           label: "Deadline 2",     icon: "🗓️",  type: "date" },
  { key: "Deadline 3",           label: "Deadline 3",     icon: "🗓️",  type: "date" },
  { key: "Deadline 4",           label: "Deadline 4",     icon: "🗓️",  type: "date" },
  { key: "Noryley",              label: "Noryley",        icon: "👤",  type: "specialist-note" },
  { key: "Roxangel",             label: "Roxangel",       icon: "👤",  type: "specialist-note" },
  { key: "Ailil",                label: "Ailil",          icon: "👤",  type: "specialist-note" },
  { key: "Asdrubal",             label: "Asdrubal",       icon: "👤",  type: "specialist-note" },
  { key: "Norilys",              label: "Norilys",        icon: "👤",  type: "specialist-note" },
  { key: "Victor",               label: "Victor",         icon: "👤",  type: "specialist-note" },
  { key: "Melisa",               label: "Melisa",         icon: "👤",  type: "specialist-note" },
  { key: "AI Summary",           label: "AI Summary",     icon: "🤖",  type: "text" },
];

// ─── State ──────────────────────────────────────────────────────────────────
let allData = [];
let filteredData = [];
let sortKey = null;
let sortDir = "asc";

// ─── Fetch from SheetDB (with seed fallback) ────────────────────────────────
async function fetchData() {
  const loading = document.getElementById("loading-state");
  const errorEl  = document.getElementById("error-state");
  const table    = document.getElementById("main-table");

  loading.style.display = "flex";
  errorEl.style.display = "none";
  table.style.display   = "none";

  // If URL still has placeholder, use seed data
  if (SHEETDB_URL.includes("YOUR_SHEETDB_ID_HERE")) {
    allData = SEED_DATA;
    filteredData = [...allData];
    loading.style.display = "none";
    renderTable(filteredData);
    return;
  }

  try {
    const res = await fetch(SHEETDB_URL, {
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    allData = Array.isArray(json) ? json : json.data || [];
    filteredData = [...allData];
    loading.style.display = "none";
    renderTable(filteredData);
  } catch (err) {
    console.error("SheetDB error:", err);
    loading.style.display = "none";
    errorEl.style.display = "flex";
  }
}

// ─── POST new row to SheetDB ─────────────────────────────────────────────────
async function postRow(rowData) {
  if (SHEETDB_URL.includes("YOUR_SHEETDB_ID_HERE")) {
    // Fake success in demo mode
    allData.push(rowData);
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

// ─── Render Table ────────────────────────────────────────────────────────────
function renderTable(data) {
  const table = document.getElementById("main-table");
  const thead = document.getElementById("table-head-row");
  const tbody = document.getElementById("table-body");

  // Build header once
  thead.innerHTML = "";
  COLUMNS.forEach(col => {
    const th = document.createElement("th");
    th.innerHTML = `<div class="th-inner"><span class="th-icon">${col.icon}</span>${col.label}</div>`;
    th.dataset.key = col.key;
    th.title = `Sort by ${col.label}`;
    th.addEventListener("click", () => handleSort(col.key));
    thead.appendChild(th);
  });

  // Build rows
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
    data.forEach(row => {
      const tr = document.createElement("tr");
      COLUMNS.forEach(col => {
        const td = document.createElement("td");
        td.innerHTML = renderCell(row[col.key] || "", col.type, col.key);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  table.style.display = "table";
}

// ─── Cell Renderers ──────────────────────────────────────────────────────────
function renderCell(value, type, key) {
  if (!value && value !== 0) return `<span class="date-empty">—</span>`;

  switch (type) {
    case "title":
      return `<div class="task-title" title="${esc(value)}">${esc(value)}</div>`;

    case "tipo":
      return renderTipoBadge(value);

    case "vertical": {
      const parts = value.split(",").map(s => s.trim()).filter(Boolean);
      return `<div class="badges-col">${parts.map(p => renderVerticalBadge(p)).join("")}</div>`;
    }

    case "specialists": {
      const names = value.split(",").map(s => s.trim()).filter(Boolean);
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
  const map = {
    "PROJECT":   "badge--project",
    "PERPETUAL": "badge--perpetual",
    "ON-DEMAND": "badge--ondemand"
  };
  const cls = map[val.toUpperCase()] || "badge--notstarted";
  return `<span class="badge ${cls}">${esc(val)}</span>`;
}

function renderVerticalBadge(val) {
  const map = {
    "academy":     "badge--academy",
    "school":      "badge--school",
    "e-moa":       "badge--emoa",
    "afterschool": "badge--afterschool",
    "in-company":  "badge--incompany"
  };
  const key = val.toLowerCase().replace(/\s+/g, "-");
  const cls = map[key] || "badge--academy";
  return `<span class="badge ${cls}">${esc(val)}</span>`;
}

function renderAvatarChip(name, idx) {
  const initials = name.split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase();
  const colorClass = `avatar-${idx % 7}`;
  return `<span class="avatar-chip">
    <span class="avatar-initials ${colorClass}">${initials}</span>
    ${esc(name.split(" ")[0])}
  </span>`;
}

function renderEstado(val) {
  const key = val.toLowerCase().replace(/\s+/g, "");
  const map = {
    "notstarted":  "notstarted",
    "inprogress":  "inprogress",
    "standby":     "standby",
    "blocked":     "blocked",
    "done":        "done",
    "delayeddone": "delayeddone"
  };
  const slug = map[key] || "notstarted";
  return `<span class="status-pill status-pill--${slug}">
    <span class="status-dot status-dot--${slug}"></span>
    ${esc(val)}
  </span>`;
}

function renderCalidad(val) {
  const lower = val.toLowerCase();
  let cls = "badge--calidad-pending";
  if (lower.includes("aprobado") || lower.includes("approved")) cls = "badge--calidad-approved";
  else if (lower.includes("revisión por")) cls = "badge--calidad-review";
  else if (lower.includes("sin revisión") || lower.includes("sin revision")) cls = "badge--calidad-norev";
  return `<span class="badge ${cls}">${esc(val)}</span>`;
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Sort ────────────────────────────────────────────────────────────────────
function handleSort(key) {
  if (sortKey === key) {
    sortDir = sortDir === "asc" ? "desc" : "asc";
  } else {
    sortKey = key;
    sortDir = "asc";
  }
  filteredData = [...filteredData].sort((a, b) => {
    const av = (a[key] || "").toString().toLowerCase();
    const bv = (b[key] || "").toString().toLowerCase();
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  renderTable(filteredData);
}

// ─── Search ──────────────────────────────────────────────────────────────────
function handleSearch(query) {
  const q = query.toLowerCase().trim();
  if (!q) {
    filteredData = [...allData];
  } else {
    filteredData = allData.filter(row =>
      Object.values(row).some(v => String(v || "").toLowerCase().includes(q))
    );
  }
  renderTable(filteredData);
}

// ─── Tabs ────────────────────────────────────────────────────────────────────
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

// ─── Search toggle ────────────────────────────────────────────────────────────
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
    // Switch to submit view
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("tab--active"));
    const submitTab = document.querySelector('[data-tab="submit"]');
    if (submitTab) submitTab.classList.add("tab--active");
    document.querySelectorAll(".view").forEach(v => v.classList.remove("view--active"));
    document.getElementById("view-submit").classList.add("view--active");
  });
}

// ─── Submit Form ──────────────────────────────────────────────────────────────
function initSubmitForm() {
  const form = document.getElementById("submit-form");
  const feedback = document.getElementById("form-feedback");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedback.textContent = "Submitting…";
    feedback.className = "form-feedback";

    const formData = new FormData(form);
    const row = {};
    COLUMNS.forEach(col => { row[col.key] = ""; });
    for (const [k, v] of formData.entries()) { row[k] = v; }

    const ok = await postRow(row);
    if (ok) {
      feedback.textContent = "✅ Task submitted successfully!";
      feedback.className = "form-feedback form-feedback--success";
      form.reset();
    } else {
      feedback.textContent = "❌ Error submitting. Check the console and your SheetDB URL.";
      feedback.className = "form-feedback form-feedback--error";
    }
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initToolbar();
  initSubmitForm();
  fetchData();
});
