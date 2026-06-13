// ==============================================
//  SPECIALISTS DASHBOARD — app.js
//  Sub-items version
//  IMPORTANT: For sub-items to persist in Google Sheets,
//  add this exact column header to your sheet: Parent ID
// ==============================================

const SHEETDB_URL = "https://sheetdb.io/api/v1/x5jcywsg1m518";
const PARENT_ID_KEY = "Parent ID";
const OPEN_SUBITEMS_STORAGE_KEY = "moa-dashboard-open-subitems-v1";

// ─── Options used by the dashboard dropdowns ────────────────────────────────
const OPTIONS = {
  tipo: ["PROJECT", "PERPETUAL", "ON-DEMAND"],
  vertical: ["Academy", "School", "E-MOA", "Afterschool", "In-Company"],
  estado: ["Not started", "In progress", "Stand By", "Blocked", "Delayed Done", "Done"],
  calidad: [
    "Revisado y aprobado",
    "En revisión por especialistas",
    "Sin revisión de otros especialistas",
    "Pendiente de revisión"
  ],
  specialists: [
    "Victor Colmenares",
    "Roxangel Rodriguez",
    "Ailil Coutinho",
    "Norilys Cermeño",
    "Dirección Académica",
    "Veronica Gonzales",
    "Melisa Espinal",
    "Noryley Suescun",
    "Ninfa Vivas",
    "Asdrubal Marquez"
  ]
};

// These are the visible columns in the table. Keep the key names equal to the
// headers in Google Sheets. Sub-items are stored as normal rows whose "Parent ID"
// points to the parent task's ID.
const COLUMNS = [
  { key: "TASKS",                 label: "TASKS",             icon: "Aa", type: "title", editable: true },
  { key: "Specialists",           label: "Specialists",       icon: "👥", type: "specialists", editable: true },
  { key: "Tipo de trabajo",       label: "Tipo de trabajo",   icon: "◎", type: "tipo", editable: true },
  { key: "Vertical",              label: "Vertical",          icon: "☷", type: "vertical", editable: true },
  { key: "Deadline 1",            label: "Deadline 1",        icon: "📅", type: "date", editable: true },
  { key: "AI Summary",            label: "AI Summary",        icon: "≋", type: "text", editable: true },
  { key: "Brief Description",     label: "Brief Description", icon: "≡", type: "text", editable: true },
  { key: "Calidad",               label: "Calidad",           icon: "◎", type: "calidad", editable: true },
  { key: "Estado",                label: "Estado",            icon: "●", type: "estado", editable: true },
  { key: "Fecha de Inicio y Fin", label: "Fechas",            icon: "📅", type: "daterange", editable: true },
  { key: "Rondas de revisión",    label: "Rondas",            icon: "↻", type: "rounds", editable: true },
  { key: "Comments",              label: "Comments",          icon: "☰", type: "text", editable: true },
  { key: "Deadline 2",            label: "Deadline 2",        icon: "📅", type: "date", editable: true },
  { key: "Deadline 3",            label: "Deadline 3",        icon: "📅", type: "date", editable: true },
  { key: "Deadline 4",            label: "Deadline 4",        icon: "📅", type: "date", editable: true },
  { key: "Noryley",               label: "Noryley",           icon: "👤", type: "specialist-note", editable: true },
  { key: "Roxangel",              label: "Roxangel",          icon: "👤", type: "specialist-note", editable: true },
  { key: "Ailil",                 label: "Ailil",             icon: "👤", type: "specialist-note", editable: true },
  { key: "Asdrubal",              label: "Asdrubal",          icon: "👤", type: "specialist-note", editable: true },
  { key: "Norilys",               label: "Norilys",           icon: "👤", type: "specialist-note", editable: true },
  { key: "Victor",                label: "Victor",            icon: "👤", type: "specialist-note", editable: true },
  { key: "Melisa",                label: "Melisa",            icon: "👤", type: "specialist-note", editable: true }
];

const COLUMN_ALIASES = {
  "Noryley": ["Noryley Suescun"],
  "Roxangel": ["Roxangel Rodriguez"],
  "Ailil": ["Ailil Coutinho"],
  "Asdrubal": ["Asdrubal Marquez"],
  "Norilys": ["Norilys Cermeño", "Norilys Cermeno"],
  "Victor": ["Victor Colmenares"],
  "Melisa": ["Melisa Espinal"],
  [PARENT_ID_KEY]: ["ParentID", "Parent Id", "Parent id", "Subitem Parent", "Parent Task ID"]
};

const ALL_SHEET_KEYS = ["ID", PARENT_ID_KEY, ...COLUMNS.map(col => col.key)];

// ─── Seed data shown while SheetDB URL is not configured ────────────────────
const SEED_DATA = [
  {
    "ID": "seed-001",
    [PARENT_ID_KEY]: "",
    "Tipo de trabajo": "PERPETUAL",
    "TASKS": "Evaluaciones",
    "Vertical": "School",
    "Brief Description": "Creación de los instrumentos de evaluación para todo el ecosistema MOA.",
    "Specialists": "Ailil Coutinho, Victor Colmenares",
    "Fecha de Inicio y Fin": "",
    "Estado": "In progress",
    "Calidad": "",
    "Rondas de revisión": "",
    "Comments": "",
    "Deadline 1": "",
    "Deadline 2": "",
    "Deadline 3": "",
    "Deadline 4": "",
    "Noryley": "",
    "Roxangel": "",
    "Ailil": "Pruebas Externas Colegios, último lote",
    "Asdrubal": "",
    "Norilys": "",
    "Victor": "Mis To-Dos · Mis fechas de entrega",
    "Melisa": "",
    "AI Summary": ""
  },
  {
    "ID": "seed-001-a",
    [PARENT_ID_KEY]: "seed-001",
    "Tipo de trabajo": "ON-DEMAND",
    "TASKS": "Pruebas regulares — Competencias 12 y 13",
    "Vertical": "School",
    "Brief Description": "Versiones desde 3GV2Ñ hasta 1ÑV5Ñ.",
    "Specialists": "Ailil Coutinho, Victor Colmenares",
    "Fecha de Inicio y Fin": "Apr 13, 2026 – Apr 17, 2026",
    "Estado": "Done",
    "Calidad": "",
    "Rondas de revisión": "",
    "Comments": "",
    "Deadline 1": "",
    "Deadline 2": "",
    "Deadline 3": "",
    "Deadline 4": "",
    "Noryley": "",
    "Roxangel": "",
    "Ailil": "",
    "Asdrubal": "",
    "Norilys": "",
    "Victor": "",
    "Melisa": "",
    "AI Summary": ""
  },
  {
    "ID": "seed-001-b",
    [PARENT_ID_KEY]: "seed-001",
    "Tipo de trabajo": "ON-DEMAND",
    "TASKS": "Pruebas regulares — Competencias 14 y 15",
    "Vertical": "School",
    "Brief Description": "Quizzes y versiones por grado.",
    "Specialists": "Ailil Coutinho, Victor Colmenares",
    "Fecha de Inicio y Fin": "Apr 20, 2026 – Apr 24, 2026",
    "Estado": "Delayed Done",
    "Calidad": "",
    "Rondas de revisión": "",
    "Comments": "",
    "Deadline 1": "",
    "Deadline 2": "",
    "Deadline 3": "",
    "Deadline 4": "",
    "Noryley": "",
    "Roxangel": "",
    "Ailil": "",
    "Asdrubal": "",
    "Norilys": "",
    "Victor": "",
    "Melisa": "",
    "AI Summary": ""
  },
  {
    "ID": "seed-002",
    [PARENT_ID_KEY]: "",
    "Tipo de trabajo": "PERPETUAL",
    "TASKS": "English For Teachers (EFT)",
    "Vertical": "School",
    "Brief Description": "Enseña inglés al equipo docente de MOA School. Cada docente recibe una sesión sincrónica semanal y, cada dos semanas, un paquete de actividades para trabajar de forma autónoma.",
    "Specialists": "Asdrubal Marquez",
    "Fecha de Inicio y Fin": "",
    "Estado": "In progress",
    "Calidad": "",
    "Rondas de revisión": "2",
    "Comments": "Cada unidad contiene video, audio, vocabulario, gramática, diálogo, juegos flash y proyecto.",
    "Deadline 1": "",
    "Deadline 2": "",
    "Deadline 3": "",
    "Deadline 4": "",
    "Noryley": "",
    "Roxangel": "",
    "Ailil": "",
    "Asdrubal": "Mis To-Dos · Mis fechas de entrega",
    "Norilys": "",
    "Victor": "",
    "Melisa": "",
    "AI Summary": ""
  }
];

// ─── State ──────────────────────────────────────────────────────────────────
let allData = [];
let filteredData = [];
let sortKey = null;
let sortDir = "asc";
let activeEditor = null;
let activeSubitemParentKey = null;
let currentSearchQuery = "";
let createSelectedSpecialists = new Set();
let createSelectedVerticals = new Set();
let openSubitems = loadOpenSubitems();
let selectedRowKeys = new Set();

// ─── Fetch from SheetDB ─────────────────────────────────────────────────────
async function fetchData() {
  const loading = document.getElementById("loading-state");
  const errorEl = document.getElementById("error-state");
  const table = document.getElementById("main-table");

  loading.style.display = "flex";
  errorEl.style.display = "none";
  table.style.display = "none";

  if (SHEETDB_URL.includes("YOUR_SHEETDB_ID_HERE")) {
    allData = normalizeRows(SEED_DATA);
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
    const rows = Array.isArray(json) ? json : json.data || [];

    allData = normalizeRows(rows);
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
  return rows
    .map(cleanSheetRow)
    .map(applyColumnAliases)
    .filter(row => hasVisibleRowData(row))
    .map((row, index) => {
      const normalized = {
        ...makeEmptySheetRow(),
        ...row,
        ID: row.ID || row.id || row.Id || "",
        [PARENT_ID_KEY]: row[PARENT_ID_KEY] || "",
        __localIndex: index,
        __originalTaskName: row["TASKS"] || ""
      };
      normalized.__clientKey = normalized.ID || `local-${index}-${slugify(normalized["TASKS"] || "row")}`;
      return normalized;
    });
}

function cleanSheetRow(row) {
  const clean = {};
  Object.entries(row || {}).forEach(([key, value]) => {
    clean[String(key).trim()] = value == null ? "" : String(value).trim();
  });
  return clean;
}

function applyColumnAliases(row) {
  const clean = { ...row };
  Object.entries(COLUMN_ALIASES).forEach(([canonical, aliases]) => {
    if (String(clean[canonical] || "").trim()) return;
    const found = aliases.find(alias => clean[alias] !== undefined && String(clean[alias] || "").trim() !== "");
    if (found) clean[canonical] = clean[found];
  });
  return clean;
}

function makeEmptySheetRow() {
  const row = {};
  ALL_SHEET_KEYS.forEach(key => { row[key] = ""; });
  return row;
}

function serializeForSheet(row) {
  const clean = {};
  ALL_SHEET_KEYS.forEach(key => {
    const value = row[key];
    clean[key] = value === undefined || value === null ? "" : String(value).trim();
  });
  return clean;
}

function hasVisibleRowData(row) {
  return COLUMNS.some(col => String(row[col.key] || "").trim() !== "");
}

// ─── POST new row to SheetDB ────────────────────────────────────────────────
async function postRow(rowData, options = {}) {
  const cleanRow = { ...makeEmptySheetRow(), ...rowData };
  const successMessage = options.successMessage || "Tarea guardada correctamente.";
  const errorMessage = options.errorMessage || "No se pudo guardar. Revisa SheetDB, permisos, encabezados y la columna Parent ID.";

  if (!cleanRow.ID) cleanRow.ID = createId();

  if (!String(cleanRow["TASKS"] || "").trim()) {
    showToast("La tarea necesita un nombre antes de guardarse.", "error");
    return false;
  }

  const sheetPayload = serializeForSheet(cleanRow);
  const localRow = normalizeRows([sheetPayload])[0];

  if (localRow) {
    allData.push(localRow);
    applyCurrentFiltersAndRender();
  }

  if (SHEETDB_URL.includes("YOUR_SHEETDB_ID_HERE")) {
    showToast(successMessage, "success");
    return true;
  }

  try {
    const res = await fetch(SHEETDB_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [sheetPayload] })
    });

    const responseText = await res.text();
    console.log("SheetDB POST response:", responseText);

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${responseText}`);

    showToast(successMessage, "success");
    return true;
  } catch (err) {
    console.error("POST error:", err);
    allData = allData.filter(row => row.ID !== cleanRow.ID);
    filteredData = filteredData.filter(row => row.ID !== cleanRow.ID);
    renderTable(filteredData);
    showToast(errorMessage, "error");
    return false;
  }
}

// ─── PATCH one cell to SheetDB ──────────────────────────────────────────────
async function patchCell(row, key, newValue, options = {}) {
  if (!row) return false;

  const oldValue = row[key] || "";
  const taskName = String(row["TASKS"] || row.__originalTaskName || "").trim();
  const idValue = String(row.ID || "").trim();

  if (!idValue && !taskName) {
    activeEditor = null;
    renderTable(filteredData);
    showToast("Esa fila está vacía. Crea una tarea con nombre primero.", "error");
    return false;
  }

  row[key] = newValue;
  if (key === "ID") row.__clientKey = row.__clientKey || newValue;
  applyCurrentFiltersAndRender();

  if (SHEETDB_URL.includes("YOUR_SHEETDB_ID_HERE")) {
    if (!options.silent) showToast("Guardado", "success");
    return true;
  }

  const matchColumn = idValue ? "ID" : "TASKS";
  const matchValue = idValue || row.__originalTaskName || taskName;

  try {
    const res = await fetch(`${SHEETDB_URL}/${encodeURIComponent(matchColumn)}/${encodeURIComponent(matchValue)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { [key]: newValue } })
    });

    const responseText = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${responseText}`);

    if (key === "TASKS") row.__originalTaskName = newValue;
    if (!options.silent) showToast("Guardado", "success");
    return true;
  } catch (err) {
    console.error("PATCH error:", err);
    row[key] = oldValue;
    applyCurrentFiltersAndRender();
    showToast("No se pudo guardar el cambio. Revisa SheetDB y la columna ID.", "error");
    return false;
  }
}

async function ensureRowId(row) {
  if (!row) return false;
  if (String(row.ID || "").trim()) return true;

  const newId = createId();
  const ok = await patchCell(row, "ID", newId, { silent: true });
  if (!ok) {
    showToast("No pude crear el sub-item porque la tarea principal no tiene ID guardado.", "error");
    return false;
  }
  row.ID = newId;
  return true;
}

function createId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ─── Sub-items helpers ──────────────────────────────────────────────────────
function isSubitem(row) {
  return Boolean(String(row && row[PARENT_ID_KEY] || "").trim());
}

function getRowByClientKey(clientKey) {
  return allData.find(row => row.__clientKey === clientKey || row.ID === clientKey);
}

function getRowKey(row) {
  return row.ID || row.__clientKey;
}

function getSubitemsForParent(parent) {
  const parentId = String(parent && parent.ID || "").trim();
  if (!parentId) return [];
  return allData.filter(row => String(row[PARENT_ID_KEY] || "").trim() === parentId);
}

function groupSubitems(rows) {
  const map = new Map();
  rows.forEach(row => {
    if (!isSubitem(row)) return;
    const parentId = String(row[PARENT_ID_KEY] || "").trim();
    if (!map.has(parentId)) map.set(parentId, []);
    map.get(parentId).push(row);
  });
  return map;
}

function isRowExpanded(row) {
  return openSubitems.has(row.ID) || openSubitems.has(row.__clientKey) || activeSubitemParentKey === getRowKey(row);
}

function toggleSubitems(row) {
  const key = getRowKey(row);
  if (!key) return;
  if (openSubitems.has(key)) {
    openSubitems.delete(key);
  } else {
    openSubitems.add(key);
  }
  saveOpenSubitems();
  renderTable(filteredData);
}

async function createSubitem(parent, title) {
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) {
    showToast("Escribe el nombre del sub-item.", "error");
    return false;
  }

  const hasParentId = await ensureRowId(parent);
  if (!hasParentId) return false;

  const subitem = makeEmptySheetRow();
  subitem.ID = createId();
  subitem[PARENT_ID_KEY] = parent.ID;
  subitem["TASKS"] = cleanTitle;
  subitem["Tipo de trabajo"] = parent["Tipo de trabajo"] || "ON-DEMAND";
  subitem["Vertical"] = parent["Vertical"] || "";
  subitem["Specialists"] = parent["Specialists"] || "";
  subitem["Estado"] = "Not started";

  openSubitems.add(parent.ID);
  saveOpenSubitems();
  activeSubitemParentKey = null;

  return postRow(subitem, {
    successMessage: "Sub-item guardado correctamente.",
    errorMessage: "No se pudo guardar el sub-item. Asegúrate de agregar la columna Parent ID en Google Sheets."
  });
}

function loadOpenSubitems() {
  try {
    const raw = localStorage.getItem(OPEN_SUBITEMS_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (_) {
    return new Set();
  }
}

function saveOpenSubitems() {
  try {
    localStorage.setItem(OPEN_SUBITEMS_STORAGE_KEY, JSON.stringify(Array.from(openSubitems)));
  } catch (_) {}
}

// ─── Row selection + Notion-like trash action ───────────────────────────────
function syncSelectedRowsWithData() {
  const existingKeys = new Set(allData.map(row => getRowKey(row)));
  selectedRowKeys = new Set(Array.from(selectedRowKeys).filter(key => existingKeys.has(key)));
}

function getSelectedRows() {
  return allData.filter(row => selectedRowKeys.has(getRowKey(row)));
}

function updateSelectionToolbar() {
  const bar = document.getElementById("selection-toolbar");
  const countEl = document.getElementById("selected-count");
  if (!bar || !countEl) return;

  const count = getSelectedRows().length;
  countEl.textContent = `${count} selected`;
  bar.hidden = count === 0;
}

function toggleRowSelection(row) {
  const key = getRowKey(row);
  if (!key) return;

  if (selectedRowKeys.has(key)) {
    selectedRowKeys.delete(key);
  } else {
    selectedRowKeys.add(key);
  }

  if (activeEditor) activeEditor = null;
  renderTable(filteredData);
}

function getRowsToDeleteFromSelection() {
  const map = new Map();

  getSelectedRows().forEach(row => {
    const rowKey = getRowKey(row);
    map.set(rowKey, row);

    if (!isSubitem(row)) {
      getSubitemsForParent(row).forEach(child => {
        map.set(getRowKey(child), child);
      });
    }
  });

  return Array.from(map.values());
}

async function deleteSelectedRows() {
  const selectedRows = getSelectedRows();
  const rowsToDelete = getRowsToDeleteFromSelection();

  if (!rowsToDelete.length) return;

  const extraChildren = rowsToDelete.length - selectedRows.length;
  const message = extraChildren > 0
    ? `¿Mover ${selectedRows.length} tarea(s) y ${extraChildren} sub-item(s) a la papelera?`
    : `¿Mover ${rowsToDelete.length} tarea(s) a la papelera?`;

  if (!window.confirm(message)) return;

  const previousData = [...allData];
  const deleteKeys = new Set(rowsToDelete.map(row => getRowKey(row)));

  allData = allData.filter(row => !deleteKeys.has(getRowKey(row)));
  filteredData = filteredData.filter(row => !deleteKeys.has(getRowKey(row)));
  selectedRowKeys.clear();
  activeEditor = null;
  activeSubitemParentKey = null;
  applyCurrentFiltersAndRender();

  if (SHEETDB_URL.includes("YOUR_SHEETDB_ID_HERE")) {
    showToast("Tarea movida a la papelera.", "success");
    return;
  }

  try {
    for (const row of rowsToDelete) {
      await deleteRowFromSheet(row);
    }
    showToast(rowsToDelete.length === 1 ? "Tarea movida a la papelera." : "Tareas movidas a la papelera.", "success");
  } catch (err) {
    console.error("DELETE error:", err);
    allData = previousData;
    selectedRowKeys.clear();
    applyCurrentFiltersAndRender();
    showToast("No se pudo borrar. Revisa SheetDB, permisos y la columna ID.", "error");
  }
}

async function deleteRowFromSheet(row) {
  const idValue = String(row.ID || "").trim();
  const taskName = String(row["TASKS"] || row.__originalTaskName || "").trim();
  const matchColumn = idValue ? "ID" : "TASKS";
  const matchValue = idValue || taskName;

  if (!matchValue) return;

  const res = await fetch(`${SHEETDB_URL}/${encodeURIComponent(matchColumn)}/${encodeURIComponent(matchValue)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  });

  const responseText = await res.text();
  console.log("SheetDB DELETE response:", responseText);

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${responseText}`);
}

function initSelectionInteractions() {
  const tbody = document.getElementById("table-body");
  const deleteButton = document.getElementById("btn-delete-selected");

  if (tbody) {
    tbody.addEventListener("click", e => {
      const selector = e.target.closest("[data-row-select]");
      if (!selector) return;

      e.preventDefault();
      e.stopPropagation();

      const row = getRowByClientKey(selector.dataset.rowSelect);
      if (row) toggleRowSelection(row);
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener("click", async e => {
      e.preventDefault();
      e.stopPropagation();
      await deleteSelectedRows();
    });
  }
}

// ─── Render Table ───────────────────────────────────────────────────────────
function renderTable(data) {
  const table = document.getElementById("main-table");
  const thead = document.getElementById("table-head-row");
  const tbody = document.getElementById("table-body");

  thead.innerHTML = "";

  const selectorTh = document.createElement("th");
  selectorTh.className = "row-selector-head";
  selectorTh.innerHTML = `<span class="row-selector-head__dot" aria-hidden="true"></span>`;
  thead.appendChild(selectorTh);

  COLUMNS.forEach(col => {
    const th = document.createElement("th");
    th.innerHTML = `<div class="th-inner"><span class="th-icon">${col.icon}</span>${col.label}</div>`;
    th.dataset.key = col.key;
    th.title = `Sort by ${col.label}`;
    th.addEventListener("click", () => handleSort(col.key));
    thead.appendChild(th);
  });

  tbody.innerHTML = "";

  const subitemsByParent = groupSubitems(allData);
  const visibleParents = data.filter(row => !isSubitem(row));

  if (visibleParents.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = COLUMNS.length + 1;
    td.style.textAlign = "center";
    td.style.padding = "40px";
    td.style.color = "#787774";
    td.textContent = "No hay tareas para mostrar.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    visibleParents.forEach(parent => {
      tbody.appendChild(createTableRow(parent, { isSubitem: false }));

      const children = subitemsByParent.get(parent.ID) || [];
      const shouldShowChildren = currentSearchQuery || isRowExpanded(parent);

      if (shouldShowChildren) {
        const visibleChildren = currentSearchQuery
          ? children.filter(child => data.includes(child))
          : children;

        visibleChildren.forEach(child => {
          tbody.appendChild(createTableRow(child, { isSubitem: true }));
        });

        if (!currentSearchQuery) {
          tbody.appendChild(createSubitemCreateRow(parent));
        }
      }
    });
  }

  table.style.display = "table";
  syncSelectedRowsWithData();
  updateSelectionToolbar();
}

function createTableRow(row, meta) {
  const tr = document.createElement("tr");
  const rowKey = getRowKey(row);
  const selected = selectedRowKeys.has(rowKey);

  tr.className = `${meta.isSubitem ? "subitem-row" : "task-parent-row"} ${selected ? "selected-row" : ""}`.trim();
  tr.dataset.rowKey = row.__clientKey;

  const selectorTd = document.createElement("td");
  selectorTd.className = `row-selector-cell ${meta.isSubitem ? "row-selector-cell--subitem" : ""}`.trim();
  selectorTd.innerHTML = `
    <button
      type="button"
      class="row-selector ${selected ? "is-selected" : ""}"
      data-row-select="${esc(row.__clientKey)}"
      aria-label="${selected ? "Unselect" : "Select"} ${esc(row["TASKS"] || "task")}" 
      title="Select row"
    >
      <span>${selected ? "✓" : ""}</span>
    </button>
  `;
  tr.appendChild(selectorTd);

  COLUMNS.forEach(col => {
    const td = document.createElement("td");
    td.innerHTML = renderCell(row[col.key] || "", col.type, col.key, row, meta);
    td.dataset.rowKey = row.__clientKey;
    td.dataset.key = col.key;
    td.dataset.type = col.type;

    if (meta.isSubitem) td.classList.add("subitem-cell");
    if (col.editable) {
      td.classList.add("editable-cell");
      td.title = "Click to edit";
    }

    tr.appendChild(td);
  });

  return tr;
}

function createSubitemCreateRow(parent) {
  const tr = document.createElement("tr");
  const parentKey = getRowKey(parent);
  const isActive = activeSubitemParentKey === parentKey;
  tr.className = `subitem-create-row ${isActive ? "subitem-create-row--active" : ""}`;

  const td = document.createElement("td");
  td.colSpan = COLUMNS.length + 1;

  if (isActive) {
    td.innerHTML = `
      <div class="subitem-create-box">
        <span class="subitem-create-box__branch">↳</span>
        <input class="subitem-create-input" type="text" placeholder="Nombre del sub-item…" autocomplete="off" />
        <button type="button" class="subitem-create-save" data-save-subitem="${esc(parent.__clientKey)}">Save</button>
        <button type="button" class="subitem-create-cancel" data-cancel-subitem>Cancel</button>
      </div>
    `;
  } else {
    td.innerHTML = `
      <button type="button" class="subitem-new-button" data-start-subitem="${esc(parent.__clientKey)}">
        <span>＋</span> New sub-item
      </button>
    `;
  }

  tr.appendChild(td);
  return tr;
}

// ─── Cell Renderers ─────────────────────────────────────────────────────────
function renderCell(value, type, key, row, meta = {}) {
  if (type === "title") return renderTitleCell(value, row, meta);

  if (!value && value !== 0) return `<span class="cell-empty"></span>`;

  switch (type) {
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

function renderTitleCell(value, row, meta) {
  const safeTitle = esc(value || "Untitled");

  if (meta.isSubitem) {
    return `
      <div class="task-title-wrap task-title-wrap--subitem">
        <span class="subitem-branch">↳</span>
        <div class="task-title task-title--subitem" title="${safeTitle}">${safeTitle}</div>
      </div>
    `;
  }

  const children = getSubitemsForParent(row);
  const expanded = isRowExpanded(row);
  const toggleLabel = expanded ? "Hide sub-items" : "Show sub-items";

  return `
    <div class="task-title-wrap">
      <button type="button" class="subitem-toggle ${expanded ? "is-open" : ""}" data-toggle-subitems="${esc(row.__clientKey)}" aria-label="${toggleLabel}" title="${toggleLabel}">
        ${expanded ? "▾" : "▸"}
      </button>
      <div class="task-title" title="${safeTitle}">${safeTitle}</div>
      ${children.length ? `<span class="subitem-count" title="${children.length} sub-items">${children.length}</span>` : ""}
      <button type="button" class="subitem-mini-add" data-start-subitem="${esc(row.__clientKey)}" title="Add sub-item">＋</button>
    </div>
  `;
}

function renderTipoBadge(val) {
  const map = {
    "PROJECT": "badge--project",
    "PERPETUAL": "badge--perpetual",
    "ON-DEMAND": "badge--ondemand"
  };
  const cls = map[String(val).toUpperCase()] || "badge--notstarted";
  return `<span class="badge ${cls}">${esc(val)}</span>`;
}

function renderVerticalBadge(val) {
  const map = {
    "academy": "badge--academy",
    "school": "badge--school",
    "e-moa": "badge--emoa",
    "afterschool": "badge--afterschool",
    "in-company": "badge--incompany"
  };
  const key = String(val).toLowerCase().replace(/\s+/g, "-");
  const cls = map[key] || "badge--academy";
  return `<span class="badge ${cls}">${esc(val)}</span>`;
}

function renderAvatarChip(name, idx) {
  const initials = getInitials(name);
  const colorClass = `avatar-${idx % 7}`;
  return `
    <span class="avatar-chip">
      <span class="avatar-initials ${colorClass}">${esc(initials)}</span>
      ${esc(name)}
    </span>
  `;
}

function renderEstado(val) {
  const key = String(val).toLowerCase().replace(/\s+/g, "");
  const map = {
    "notstarted": "notstarted",
    "inprogress": "inprogress",
    "standby": "standby",
    "blocked": "blocked",
    "done": "done",
    "delayeddone": "delayeddone"
  };
  const slug = map[key] || "notstarted";
  return `
    <span class="status-pill status-pill--${slug}">
      <span class="status-dot status-dot--${slug}"></span>
      ${esc(val)}
    </span>
  `;
}

function renderCalidad(val) {
  const lower = String(val).toLowerCase();
  let cls = "badge--calidad-pending";
  if (lower.includes("aprobado") || lower.includes("approved")) {
    cls = "badge--calidad-approved";
  } else if (lower.includes("revisión por") || lower.includes("revision por")) {
    cls = "badge--calidad-review";
  } else if (lower.includes("sin revisión") || lower.includes("sin revision")) {
    cls = "badge--calidad-norev";
  }
  return `<span class="badge ${cls}">${esc(val)}</span>`;
}

function splitMulti(value) {
  return String(value || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "row";
}

// ─── Inline editing ─────────────────────────────────────────────────────────
function initInlineEditing() {
  const tbody = document.getElementById("table-body");

  tbody.addEventListener("pointerdown", e => {
    if (e.target.closest("[data-row-select], [data-toggle-subitems], [data-start-subitem], [data-save-subitem], [data-cancel-subitem], .subitem-create-input")) return;

    const td = e.target.closest("td.editable-cell");
    if (!td || e.target.closest(".inline-editor")) return;

    e.preventDefault();
    e.stopPropagation();

    const row = getRowByClientKey(td.dataset.rowKey);
    if (!row) return;
    openEditor(td, row, td.dataset.key, td.dataset.type);
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && activeEditor) {
      activeEditor = null;
      renderTable(filteredData);
    }
  });
}

function initSubitemInteractions() {
  const tbody = document.getElementById("table-body");

  tbody.addEventListener("click", async e => {
    const toggle = e.target.closest("[data-toggle-subitems]");
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      const row = getRowByClientKey(toggle.dataset.toggleSubitems);
      if (row) toggleSubitems(row);
      return;
    }

    const start = e.target.closest("[data-start-subitem]");
    if (start) {
      e.preventDefault();
      e.stopPropagation();
      const row = getRowByClientKey(start.dataset.startSubitem);
      if (!row) return;
      activeSubitemParentKey = getRowKey(row);
      openSubitems.add(getRowKey(row));
      saveOpenSubitems();
      renderTable(filteredData);
      setTimeout(() => {
        const input = document.querySelector(".subitem-create-input");
        if (input) input.focus();
      }, 0);
      return;
    }

    const save = e.target.closest("[data-save-subitem]");
    if (save) {
      e.preventDefault();
      e.stopPropagation();
      const parent = getRowByClientKey(save.dataset.saveSubitem);
      const box = save.closest(".subitem-create-box");
      const input = box ? box.querySelector(".subitem-create-input") : null;
      if (parent && input) await createSubitem(parent, input.value);
      return;
    }

    const cancel = e.target.closest("[data-cancel-subitem]");
    if (cancel) {
      e.preventDefault();
      e.stopPropagation();
      activeSubitemParentKey = null;
      renderTable(filteredData);
    }
  });

  tbody.addEventListener("keydown", async e => {
    const input = e.target.closest(".subitem-create-input");
    if (!input) return;

    if (e.key === "Enter") {
      e.preventDefault();
      const save = input.closest(".subitem-create-box")?.querySelector("[data-save-subitem]");
      const parent = save ? getRowByClientKey(save.dataset.saveSubitem) : null;
      if (parent) await createSubitem(parent, input.value);
    }

    if (e.key === "Escape") {
      activeSubitemParentKey = null;
      renderTable(filteredData);
    }
  });
}

function openEditor(td, row, key, type) {
  if (activeEditor) renderTable(filteredData);

  activeEditor = { td, row, key };
  const value = row[key] || "";
  td.classList.add("editing");
  td.innerHTML = getEditorHTML(value, type, key);

  if (["tipo", "estado", "calidad"].includes(type)) {
    td.querySelectorAll(".quick-option").forEach(button => {
      button.addEventListener("click", async e => {
        e.preventDefault();
        e.stopPropagation();
        const newValue = button.dataset.value || "";
        activeEditor = null;
        await patchCell(row, key, newValue);
      });
    });

    const cancel = td.querySelector(".quick-cancel");
    if (cancel) {
      cancel.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        activeEditor = null;
        renderTable(filteredData);
      });
    }
    return;
  }

  const firstInput = td.querySelector("input, textarea");
  if (firstInput) {
    firstInput.focus();
    if (firstInput.select) firstInput.select();
  }

  const saveButton = td.querySelector(".inline-save");
  const cancelButton = td.querySelector(".inline-cancel");

  if (saveButton) {
    saveButton.addEventListener("click", async e => {
      e.preventDefault();
      e.stopPropagation();
      const newValue = getEditorValue(td, type);
      activeEditor = null;
      await patchCell(row, key, newValue);
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      activeEditor = null;
      renderTable(filteredData);
    });
  }

  td.querySelectorAll("input, textarea").forEach(input => {
    input.addEventListener("keydown", async e => {
      const isTextArea = input.tagName === "TEXTAREA";
      if (
        (e.key === "Enter" && !e.shiftKey && !isTextArea) ||
        (e.key === "Enter" && (e.ctrlKey || e.metaKey))
      ) {
        e.preventDefault();
        const newValue = getEditorValue(td, type);
        activeEditor = null;
        await patchCell(row, key, newValue);
      }
    });
  });
}

function getEditorHTML(value, type, key) {
  if (["tipo", "estado", "calidad"].includes(type)) {
    const list = OPTIONS[type] || [];
    return `
      <div class="inline-editor inline-editor--quick-select" role="listbox">
        <div class="quick-select-head">
          <span>Choose an option</span>
          <button type="button" class="quick-cancel" aria-label="Cancel">×</button>
        </div>
        <div class="quick-options">
          ${list.map(opt => `
            <button 
              type="button" 
              class="quick-option ${opt === value ? "is-selected" : ""}" 
              data-value="${esc(opt)}" 
              role="option" 
              aria-selected="${opt === value}"
            >
              <span>${renderOptionPreview(opt, type)}</span>
              <strong>${esc(opt)}</strong>
              <em>✓</em>
            </button>
          `).join("")}
        </div>
      </div>
    `;
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
              <span>
                ${type === "specialists" ? `<span class="mini-avatar">${esc(getInitials(opt))}</span>` : ""}
                ${esc(opt)}
              </span>
            </label>
          `).join("")}
        </div>
        ${editorActions()}
      </div>
    `;
  }

  if (type === "date") {
    return `
      <div class="inline-editor inline-editor--date">
        <input class="inline-input" type="date" value="${esc(parseDateToInput(value))}" />
        ${editorActions()}
      </div>
    `;
  }

  if (type === "daterange") {
    const [start, end] = parseDateRange(value);
    return `
      <div class="inline-editor inline-editor--date-range">
        <input class="inline-input" data-range="start" type="date" value="${esc(parseDateToInput(start))}" />
        <input class="inline-input" data-range="end" type="date" value="${esc(parseDateToInput(end))}" />
        ${editorActions()}
      </div>
    `;
  }

  const isLongText =
    ["Brief Description", "Comments", "AI Summary"].includes(key) ||
    type === "specialist-note";

  if (isLongText) {
    return `
      <div class="inline-editor inline-editor--text">
        <textarea class="inline-input" rows="4">${esc(value)}</textarea>
        ${editorActions()}
      </div>
    `;
  }

  return `
    <div class="inline-editor inline-editor--text">
      <input class="inline-input" type="text" value="${esc(value)}" />
      ${editorActions()}
    </div>
  `;
}

function renderOptionPreview(opt, type) {
  if (type === "tipo") return renderTipoBadge(opt);
  if (type === "estado") return renderEstado(opt);
  if (type === "calidad") return renderCalidad(opt);
  return esc(opt);
}

function editorActions() {
  return `
    <div class="inline-actions">
      <button type="button" class="inline-save">Save</button>
      <button type="button" class="inline-cancel">Cancel</button>
    </div>
  `;
}

function getEditorValue(td, type) {
  if (["vertical", "specialists"].includes(type)) {
    return Array.from(td.querySelectorAll(".multi-option input:checked"))
      .map(input => input.value)
      .join(", ");
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

  const input = td.querySelector("input, textarea");
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
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// ─── Sort ───────────────────────────────────────────────────────────────────
function handleSort(key) {
  if (activeEditor) activeEditor = null;

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

// ─── Search ─────────────────────────────────────────────────────────────────
function handleSearch(query) {
  currentSearchQuery = query.toLowerCase().trim();
  applyCurrentFiltersAndRender();
}

function applyCurrentFiltersAndRender() {
  const q = currentSearchQuery;

  if (!q) {
    filteredData = [...allData];
    renderTable(filteredData);
    return;
  }

  const matchingParentIds = new Set();

  allData.forEach(row => {
    if (!rowMatchesSearch(row, q)) return;
    if (isSubitem(row)) {
      matchingParentIds.add(String(row[PARENT_ID_KEY] || "").trim());
    } else {
      matchingParentIds.add(String(row.ID || "").trim());
    }
  });

  filteredData = allData.filter(row => {
    if (rowMatchesSearch(row, q)) return true;
    if (isSubitem(row)) return matchingParentIds.has(String(row[PARENT_ID_KEY] || "").trim());
    return matchingParentIds.has(String(row.ID || "").trim());
  });

  renderTable(filteredData);
}

function rowMatchesSearch(row, q) {
  return COLUMNS.some(col => String(row[col.key] || "").toLowerCase().includes(q));
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
  const newBtn = document.getElementById("btn-new");

  if (searchBtn && searchBar && searchInput) {
    searchBtn.addEventListener("click", () => {
      const visible = searchBar.style.display !== "none";
      searchBar.style.display = visible ? "none" : "block";
      if (!visible) searchInput.focus();
    });
    searchInput.addEventListener("input", () => handleSearch(searchInput.value));
  }

  if (newBtn) {
    newBtn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("tab--active"));
      const submitTab = document.querySelector('[data-tab="submit"]');
      if (submitTab) submitTab.classList.add("tab--active");
      document.querySelectorAll(".view").forEach(v => v.classList.remove("view--active"));
      const submitView = document.getElementById("view-submit");
      if (submitView) submitView.classList.add("view--active");
    });
  }
}

// ─── Vertical multi-picker (form) ───────────────────────────────────────────
function initVerticalPicker() {
  const picker   = document.getElementById("vertical-picker");
  const trigger  = document.getElementById("vertical-trigger");
  const dropdown = document.getElementById("vertical-dropdown");
  const list     = document.getElementById("vertical-list");
  const selectedBox = document.getElementById("selected-verticals");
  if (!picker || !trigger || !dropdown || !list) return;

  function renderOptions() {
    list.innerHTML = OPTIONS.vertical.map(v => {
      const sel = createSelectedVerticals.has(v);
      return `<button type="button" class="people-option ${sel ? "is-selected" : ""}" data-vertical="${esc(v)}" role="option" aria-selected="${sel}">
        <span class="people-option__name">${esc(v)}</span>
        <span class="people-option__check">✓</span>
      </button>`;
    }).join("");

    list.querySelectorAll(".people-option").forEach(btn => {
      btn.addEventListener("click", () => {
        const v = btn.dataset.vertical;
        createSelectedVerticals.has(v)
          ? createSelectedVerticals.delete(v)
          : createSelectedVerticals.add(v);
        updateVerticalUI();
        renderOptions();
      });
    });
  }

  function updateVerticalUI() {
    const hidden = document.getElementById("vertical-hidden");
    const placeholder = trigger.querySelector(".people-picker__placeholder");
    const sel = Array.from(createSelectedVerticals);
    if (hidden) hidden.value = sel.join(", ");
    if (placeholder) {
      placeholder.textContent = sel.length ? sel.join(", ") : "Selecciona una o varias verticales";
      placeholder.style.color = sel.length ? "var(--moa-ink)" : "var(--text-secondary)";
    }
    if (selectedBox) {
      selectedBox.innerHTML = sel.map(v => `
        <span class="selected-person-chip selected-person-chip--vertical">
          <span>${esc(v)}</span>
          <button type="button" class="selected-person-chip__remove" data-remove-vertical="${esc(v)}" aria-label="Remove ${esc(v)}">×</button>
        </span>
      `).join("");
    }
  }

  trigger.addEventListener("click", () => {
    const isOpen = picker.classList.toggle("is-open");
    dropdown.hidden = !isOpen;
    trigger.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) renderOptions();
  });

  if (selectedBox) {
    selectedBox.addEventListener("click", e => {
      const btn = e.target.closest("[data-remove-vertical]");
      if (!btn) return;
      createSelectedVerticals.delete(btn.dataset.removeVertical);
      updateVerticalUI();
      renderOptions();
    });
  }

  document.addEventListener("click", e => {
    if (!picker.contains(e.target)) {
      picker.classList.remove("is-open");
      dropdown.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
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
  const selectedSpecialistsBox = document.getElementById("selected-specialists");

  if (!form) return;

  initVerticalPicker();

  if (picker && trigger && dropdown && search) {
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

    search.addEventListener("input", () => {
      renderCreateSpecialistOptions(search.value);
    });

    document.addEventListener("click", e => {
      if (!picker.contains(e.target)) closeCreateSpecialistPicker();
    });

    if (selectedSpecialistsBox) {
      selectedSpecialistsBox.addEventListener("click", e => {
        const removeButton = e.target.closest("[data-remove-specialist]");
        if (!removeButton) return;
        createSelectedSpecialists.delete(removeButton.dataset.removeSpecialist);
        updateCreateSpecialistsUI();
        renderCreateSpecialistOptions(search.value);
      });
    }
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();

    if (feedback) {
      feedback.textContent = "Submitting…";
      feedback.className = "form-feedback";
    }

    const formData = new FormData(form);
    const row = makeEmptySheetRow();

    row.ID = createId();
    row[PARENT_ID_KEY] = "";
    row["TASKS"] = String(formData.get("TASKS") || "").trim();
    row["Tipo de trabajo"] = String(formData.get("Tipo de trabajo") || "").trim();
    row["Vertical"] = String(formData.get("Vertical") || "").trim();
    row["Specialists"] =
      Array.from(createSelectedSpecialists).join(", ") ||
      String(formData.get("Specialists") || "").trim();
    row["Brief Description"] = String(formData.get("Brief Description") || "").trim();
    row["Estado"] = "Not started";

    const deadlineRaw = String(formData.get("Deadline 1") || "").trim();
    row["Deadline 1"] = deadlineRaw ? formatDateForDisplay(deadlineRaw) : "";

    const ok = await postRow(row);

    if (ok) {
      if (feedback) {
        feedback.textContent = "Tarea guardada correctamente.";
        feedback.className = "form-feedback form-feedback--success";
      }

      form.reset();
      resetFormPickers();

      document.querySelectorAll(".tab").forEach(t => t.classList.remove("tab--active"));
      const backlogTab = document.querySelector('[data-tab="backlog"]');
      if (backlogTab) backlogTab.classList.add("tab--active");

      document.querySelectorAll(".view").forEach(v => v.classList.remove("view--active"));
      const backlogView = document.getElementById("view-backlog");
      if (backlogView) backlogView.classList.add("view--active");
    } else {
      if (feedback) {
        feedback.textContent = "No se pudo guardar. Revisa SheetDB, el URL y que los encabezados de la hoja coincidan.";
        feedback.className = "form-feedback form-feedback--error";
      }
    }
  });
}

function resetFormPickers() {
  createSelectedSpecialists.clear();
  closeCreateSpecialistPicker();
  updateCreateSpecialistsUI();
  renderCreateSpecialistOptions();

  createSelectedVerticals.clear();
  const vHidden = document.getElementById("vertical-hidden");
  if (vHidden) vHidden.value = "";
  const vPlaceholder = document.querySelector("#vertical-trigger .people-picker__placeholder");
  if (vPlaceholder) {
    vPlaceholder.textContent = "Selecciona una o varias verticales";
    vPlaceholder.style.color = "var(--text-secondary)";
  }
  const vSelected = document.getElementById("selected-verticals");
  if (vSelected) vSelected.innerHTML = "";
  const vPicker = document.getElementById("vertical-picker");
  if (vPicker) vPicker.classList.remove("is-open");
  const vDropdown = document.getElementById("vertical-dropdown");
  if (vDropdown) vDropdown.hidden = true;
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
  const visibleSpecialists = OPTIONS.specialists.filter(name =>
    name.toLowerCase().includes(q)
  );

  if (visibleSpecialists.length === 0) {
    list.innerHTML = `<div class="empty-people-result">No specialist found.</div>`;
    return;
  }

  list.innerHTML = visibleSpecialists.map(name => {
    const selected = createSelectedSpecialists.has(name);
    return `
      <button 
        type="button" 
        class="people-option ${selected ? "is-selected" : ""}" 
        data-specialist="${esc(name)}" 
        role="option" 
        aria-selected="${selected}"
      >
        <span class="people-option__avatar">${esc(getInitials(name))}</span>
        <span class="people-option__name">${esc(name)}</span>
        <span class="people-option__check">✓</span>
      </button>
    `;
  }).join("");

  list.querySelectorAll(".people-option").forEach(button => {
    button.addEventListener("click", () => {
      const name = button.dataset.specialist;
      if (createSelectedSpecialists.has(name)) {
        createSelectedSpecialists.delete(name);
      } else {
        createSelectedSpecialists.add(name);
      }
      updateCreateSpecialistsUI();
      const searchInput = document.getElementById("specialists-search");
      renderCreateSpecialistOptions(searchInput ? searchInput.value : "");
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
      <button 
        type="button" 
        class="selected-person-chip__remove" 
        data-remove-specialist="${esc(name)}" 
        aria-label="Remove ${esc(name)}"
      >
        ×
      </button>
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
  showToast.timer = setTimeout(() => {
    toast.classList.remove("toast--show");
  }, 2800);
}

// ─── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initToolbar();
  initInlineEditing();
  initSubitemInteractions();
  initSelectionInteractions();
  initSubmitForm();
  fetchData();
});
