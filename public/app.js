// ==============================================
//  SPECIALISTS DASHBOARD — app.js
//  Production build: Google OAuth + RBAC
//  All SheetDB calls go through /api/data/* (server-side proxy)
//  Authentication state is loaded from /api/auth/me on boot
// ==============================================

// API base paths — all server-side, credentials never reach the browser
const API_BASE    = "/api/data";
const API_CREATE  = "/api/data/create";
const API_UPDATE  = "/api/data/update";
const API_DELETE  = "/api/data/delete";

// ─── Auth state (populated by initAuth on boot) ──────────────────────────────
let currentUser = null;
// currentUser shape: { email, name, picture, role, specialistKey }
// role: "admin" | "specialist"

function isAdmin() { return currentUser?.role === "admin"; }
function isSpecialist() { return currentUser?.role === "specialist"; }
function getMySpecialistKey() { return currentUser?.specialistKey || null; }
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

// These are the visible columns in the table.
const SPECIALIST_NOTE_COLUMNS = [
  { key: "Victor Colmenares",     label: "Victor",             icon: "👤", type: "specialist-note", editable: true },
  { key: "Roxangel Rodriguez",    label: "Roxangel",           icon: "👤", type: "specialist-note", editable: true },
  { key: "Ailil Coutinho",        label: "Ailil",              icon: "👤", type: "specialist-note", editable: true },
  { key: "Norilys Cermeño",       label: "Norilys",            icon: "👤", type: "specialist-note", editable: true },
  { key: "Dirección Académica",   label: "Dirección Académica", icon: "👤", type: "specialist-note", editable: true },
  { key: "Veronica Gonzales",     label: "Veronica",           icon: "👤", type: "specialist-note", editable: true },
  { key: "Melisa Espinal",        label: "Melisa",             icon: "👤", type: "specialist-note", editable: true },
  { key: "Noryley Suescun",       label: "Noryley",            icon: "👤", type: "specialist-note", editable: true },
  { key: "Ninfa Vivas",           label: "Ninfa",              icon: "👤", type: "specialist-note", editable: true },
  { key: "Asdrubal Marquez",      label: "Asdrubal",           icon: "👤", type: "specialist-note", editable: true }
];

const ALL_TASKS_COLUMNS = [
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
  ...SPECIALIST_NOTE_COLUMNS
];

const BACKLOG_COLUMNS = [
  { key: "TASKS",                 label: "TASKS",             icon: "Aa", type: "title", editable: true },
  { key: "Specialists",           label: "Specialists",       icon: "👥", type: "specialists", editable: true },
  { key: "Tipo de trabajo",       label: "Tipo de trabajo",   icon: "◎", type: "tipo", editable: true },
  { key: "Vertical",              label: "Vertical",          icon: "☷", type: "vertical", editable: true },
  { key: "Deadline 1",            label: "Deadline 1",        icon: "📅", type: "date", editable: true },
  { key: "Brief Description",     label: "Brief Description", icon: "≡", type: "text", editable: true },
  { key: "Calidad",               label: "Calidad",           icon: "◎", type: "calidad", editable: true },
  { key: "Estado",                label: "Estado",            icon: "●", type: "estado", editable: true },
  { key: "Fecha de Inicio y Fin", label: "Fechas",            icon: "📅", type: "daterange", editable: true },
  { key: "Rondas de revisión",    label: "Rondas",            icon: "↻", type: "rounds", editable: true },
  { key: "Comments",              label: "Comments",          icon: "☰", type: "text", editable: true },
  { key: "Deadline 2",            label: "Deadline 2",        icon: "📅", type: "date", editable: true },
  { key: "Deadline 3",            label: "Deadline 3",        icon: "📅", type: "date", editable: true },
  { key: "Deadline 4",            label: "Deadline 4",        icon: "📅", type: "date", editable: true },
  ...SPECIALIST_NOTE_COLUMNS
];

const COLUMNS = [];
[...ALL_TASKS_COLUMNS, ...BACKLOG_COLUMNS].forEach(col => {
  if (!COLUMNS.some(existing => existing.key === col.key)) COLUMNS.push(col);
});

const COLUMN_ALIASES = {
  "Victor Colmenares": ["Victor"],
  "Roxangel Rodriguez": ["Roxangel"],
  "Ailil Coutinho": ["Ailil"],
  "Norilys Cermeño": ["Norilys", "Norilys Cermeno"],
  "Dirección Académica": ["Direccion Academica", "Dirección", "Direccion"],
  "Veronica Gonzales": ["Veronica", "Verónica Gonzales", "Verónica"],
  "Melisa Espinal": ["Melisa"],
  "Noryley Suescun": ["Noryley"],
  "Ninfa Vivas": ["Ninfa"],
  "Asdrubal Marquez": ["Asdrubal", "Asdrúbal Marquez", "Asdrúbal"],
  [PARENT_ID_KEY]: ["ParentID", "Parent Id", "Parent id", "Subitem Parent", "Parent Task ID"]
};

// IMPORTANTE: Added "CreatedBy" here so the app knows to save it
const ALL_SHEET_KEYS = [
  "ID",
  "Tipo de trabajo",
  "TASKS",
  "Vertical",
  "Brief Description",
  "Specialists",
  "Fecha de Inicio y Fin",
  "Estado",
  "Calidad",
  "Rondas de revisión",
  "Comments",
  "Deadline 1",
  "Deadline 2",
  "Deadline 3",
  "Deadline 4",
  "Victor Colmenares",
  "Roxangel Rodriguez",
  "Ailil Coutinho",
  "Norilys Cermeño",
  "Dirección Académica",
  "Veronica Gonzales",
  "Melisa Espinal",
  "Noryley Suescun",
  "Ninfa Vivas",
  "Asdrubal Marquez",
  PARENT_ID_KEY,
  "CreatedBy"
];

// ─── State ──────────────────────────────────────────────────────────────────
let allData = [];
let filteredData = [];
let sortKey = null;
let sortDir = "asc";
let activeEditor = null;
let activeSubitemParentKey = null;
let currentSearchQuery = "";
let activeToolbarPanel = null;
let activeFilters = createEmptyFilters();
let createSelectedSpecialists = new Set();
let createSelectedVerticals = new Set();
let openSubitems = loadOpenSubitems();
let selectedRowKeys = new Set();
let activeDashboardView = "all-tasks";
let calendarDate = new Date();
let calendarSpecialistFilter = "all";

const FILTER_CONFIG = {
  tipo: { key: "Tipo de trabajo", label: "Tipo de trabajo", options: OPTIONS.tipo, multiple: false },
  estado: { key: "Estado", label: "Estado", options: OPTIONS.estado, multiple: false },
  vertical: { key: "Vertical", label: "Vertical", options: OPTIONS.vertical, multiple: true },
  specialists: { key: "Specialists", label: "Specialists", options: OPTIONS.specialists, multiple: true },
  calidad: { key: "Calidad", label: "Calidad", options: OPTIONS.calidad, multiple: false }
};

const SORT_OPTIONS = [
  { key: "TASKS", label: "Task name" },
  { key: "Deadline 1", label: "Deadline 1" },
  { key: "__nextDeadline", label: "Next deadline" },
  { key: "Fecha de Inicio y Fin", label: "Workflow start" },
  { key: "Estado", label: "Estado" },
  { key: "Tipo de trabajo", label: "Tipo de trabajo" },
  { key: "Vertical", label: "Vertical" },
  { key: "Specialists", label: "Specialists" },
  { key: "Rondas de revisión", label: "Rondas de revisión" }
];

const DEADLINE_KEYS = ["Deadline 1", "Deadline 2", "Deadline 3", "Deadline 4"];

function createEmptyFilters() {
  return { tipo: new Set(), estado: new Set(), vertical: new Set(), specialists: new Set(), calidad: new Set(), deadlineMode: "all", dateFrom: "", dateTo: "" };
}

// ─── Fetch from server proxy ─────────────────────────────────────────────────
async function fetchData() {
  const loading = document.getElementById("loading-state");
  const errorEl = document.getElementById("error-state");
  const table = document.getElementById("main-table");

  loading.style.display = "flex";
  errorEl.style.display = "none";
  table.style.display = "none";

  try {
    const res = await fetch(API_BASE, { credentials: "same-origin" });
    if (res.status === 401) { window.location.href = "/api/auth/login"; return; }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const rows = Array.isArray(json) ? json : json.data || [];

    allData = normalizeRows(rows);
    filteredData = [...allData];

    loading.style.display = "none";
    applyCurrentFiltersAndRender();
  } catch (err) {
    console.error("Data fetch error:", err);
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

// ─── POST new row via server proxy ──────────────────────────────────────────
async function postRow(rowData, options = {}) {
  const cleanRow = { ...makeEmptySheetRow(), ...rowData };
  const successMessage = options.successMessage || "Tarea guardada correctamente.";
  const errorMessage = options.errorMessage || "No se pudo guardar. Revisa los encabezados y la columna Parent ID.";

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

  try {
    const res = await fetch(API_CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ data: sheetPayload })
    });

    if (res.status === 401) { window.location.href = "/api/auth/login"; return false; }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

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

// ─── PATCH one cell via server proxy (RBAC enforced server-side) ────────────
async function patchCell(row, key, newValue, options = {}) {
  if (!row) return false;

  const clientCheck = clientCanEdit(row, key, newValue);
  if (!clientCheck.allowed) {
    showToast(clientCheck.reason, "error");
    return false;
  }

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

  const matchColumn = idValue ? "ID" : "TASKS";
  const matchValue = idValue || row.__originalTaskName || taskName;

  try {
    const res = await fetch(API_UPDATE, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        matchColumn,
        matchValue,
        key,
        value: newValue,
        taskSpecialists: row["Specialists"] || "", // Comma fixed here
        taskCreator: row["CreatedBy"] || "" 
      })
    });

    if (res.status === 401) { window.location.href = "/api/auth/login"; return false; }

    if (res.status === 403) {
      const body = await res.json();
      row[key] = oldValue;
      applyCurrentFiltersAndRender();
      showToast(body.error || "No tienes permiso para editar este campo.", "error");
      return false;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    if (key === "TASKS") row.__originalTaskName = newValue;
    if (!options.silent) showToast("Guardado", "success");
    return true;
  } catch (err) {
    console.error("PATCH error:", err);
    row[key] = oldValue;
    applyCurrentFiltersAndRender();
    showToast("No se pudo guardar el cambio.", "error");
    return false;
  }
}

/**
 * Client-side RBAC pre-check
 */
function clientCanEdit(row, key, newValue) {
  if (!currentUser) return { allowed: false, reason: "No autenticado." };

  const DEADLINE_KEYS = ["Deadline 1", "Deadline 2", "Deadline 3", "Deadline 4"];
  const isCreator = row["CreatedBy"] === currentUser.email;

  if (isAdmin()) return { allowed: true };

  // Block "Revisado y aprobado" for all specialists (even creators)
  if (key === "Calidad" && newValue === "Revisado y aprobado") {
    return { allowed: false, reason: "Solo los administradores pueden marcar 'Revisado y aprobado'." };
  }
  
  // Block Deadline columns for all specialists
  if (DEADLINE_KEYS.includes(key)) {
    return { allowed: false, reason: "Solo los administradores pueden modificar los Deadlines principales." };
  }

  // If specialist is the creator, they can edit anything else
  if (isCreator) return { allowed: true };

  const myKey = getMySpecialistKey();
  if (myKey && key === myKey) return { allowed: true }; // own note column

  if (key === "Estado") {
    const assigned = (row["Specialists"] || "").split(",").map(s => s.trim().toLowerCase());
    if (myKey && assigned.includes(myKey.toLowerCase())) return { allowed: true };
    return { allowed: false, reason: "Solo puedes cambiar el Estado en las tareas en las que estás asignado/a." };
  }

  return { allowed: false, reason: "No tienes permiso para editar este campo porque no creaste la tarea." };
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
  subitem["CreatedBy"] = currentUser.email; // INSTANT OWNERSHIP

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

function isBacklogView() {
  return activeDashboardView === "backlog";
}

function isCalendarView() {
  return activeDashboardView === "calendar";
}

function getVisibleColumns() {
  return isBacklogView() ? BACKLOG_COLUMNS : ALL_TASKS_COLUMNS;
}

function updateTableModeClasses() {
  const table = document.getElementById("main-table");
  const wrapper = document.querySelector("#view-all-tasks .table-wrapper");
  if (table) {
    table.classList.toggle("notion-table--backlog", isBacklogView());
    table.classList.toggle("notion-table--all-tasks", !isBacklogView());
  }
  if (wrapper) {
    wrapper.classList.toggle("table-wrapper--backlog", isBacklogView());
    wrapper.classList.toggle("table-wrapper--all-tasks", !isBacklogView());
  }
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

  if (!isBacklogView()) {
    bar.hidden = true;
    return;
  }

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

  // Si no es admin, validar que sea el creador de TODAS las tareas que intentará borrar
  if (!isAdmin()) {
    const unauthorized = rowsToDelete.some(r => r["CreatedBy"] !== currentUser.email);
    if (unauthorized) {
      showToast("Solo puedes eliminar tareas que tú creaste.", "error");
      return;
    }
  }

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

  const res = await fetch(API_DELETE, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ matchColumn, matchValue })
  });

  if (res.status === 401) { window.location.href = "/api/auth/login"; return; }
  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Sin permiso para eliminar.");
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
  const visibleColumns = getVisibleColumns();
  const showSelector = isBacklogView();

  if (!table || !thead || !tbody) return;

  updateTableModeClasses();
  thead.innerHTML = "";

  if (showSelector) {
    const selectorTh = document.createElement("th");
    selectorTh.className = "row-selector-head";
    selectorTh.innerHTML = `<span class="row-selector-head__dot" aria-hidden="true"></span>`;
    thead.appendChild(selectorTh);
  }

  visibleColumns.forEach(col => {
    const th = document.createElement("th");
    const isSorted = sortKey === col.key;
    th.classList.toggle("th--sorted", isSorted);
    th.innerHTML = `
      <div class="th-inner">
        <span class="th-icon">${col.icon}</span>
        <span>${col.label}</span>
        ${isSorted ? `<span class="th-sort-indicator">${sortDir === "asc" ? "↑" : "↓"}</span>` : ""}
      </div>
    `;
    th.dataset.key = col.key;
    th.title = `Sort by ${col.label}`;
    th.addEventListener("click", () => handleSort(col.key));
    thead.appendChild(th);
  });

  tbody.innerHTML = "";

  const hasRefinement = Boolean(currentSearchQuery) || hasActiveFilters();
  const subitemsByParent = groupSubitems(data);
  const visibleParents = data.filter(row => !isSubitem(row));
  const colSpan = visibleColumns.length + (showSelector ? 1 : 0);

  if (visibleParents.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = colSpan;
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
      const shouldShowChildren = hasRefinement || isRowExpanded(parent);

      if (shouldShowChildren) {
        children.forEach(child => {
          tbody.appendChild(createTableRow(child, { isSubitem: true }));
        });

        if (!hasRefinement) {
          tbody.appendChild(createSubitemCreateRow(parent));
        }
      }
    });
  }

  table.style.display = "table";
  syncSelectedRowsWithData();
  updateSelectionToolbar();
  applyRbacToTable();
}

function createTableRow(row, meta) {
  const tr = document.createElement("tr");
  const rowKey = getRowKey(row);
  const selected = selectedRowKeys.has(rowKey);
  const showSelector = isBacklogView();
  const visibleColumns = getVisibleColumns();
  
  const isCreator = row["CreatedBy"] === currentUser?.email;
  const canDelete = isAdmin() || isCreator;

  tr.className = `${meta.isSubitem ? "subitem-row" : "task-parent-row"} ${selected && showSelector ? "selected-row" : ""}`.trim();
  tr.dataset.rowKey = row.__clientKey;

  if (showSelector) {
    const selectorTd = document.createElement("td");
    selectorTd.className = `row-selector-cell ${meta.isSubitem ? "row-selector-cell--subitem" : ""}`.trim();
    
    if (canDelete) {
      selectorTd.innerHTML = `
        <button
          type="button"
          class="row-selector ${selected ? "is-selected" : ""}"
          data-row-select="${esc(row.__clientKey)}"
          aria-label="${selected ? "Unselect" : "Select"} ${esc(row["TASKS"] || "task")}" 
          title="Move to Trash"
        >
          <span>${selected ? "✓" : ""}</span>
        </button>
      `;
    }
    tr.appendChild(selectorTd);
  }

  visibleColumns.forEach(col => {
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
  
  // Ocultar fila de creación si no es Admin ni Creador
  const isCreator = parent["CreatedBy"] === currentUser?.email;
  if (!isAdmin() && !isCreator) {
    tr.style.display = "none";
    return tr;
  }

  const parentKey = getRowKey(parent);
  const isActive = activeSubitemParentKey === parentKey;
  tr.className = `subitem-create-row ${isActive ? "subitem-create-row--active" : ""}`;

  const td = document.createElement("td");
  td.colSpan = getVisibleColumns().length + (isBacklogView() ? 1 : 0);

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
    case "tipo": return renderTipoBadge(value);
    case "vertical": {
      const parts = splitMulti(value);
      return `<div class="badges-col">${parts.map(p => renderVerticalBadge(p)).join("")}</div>`;
    }
    case "specialists": {
      const names = splitMulti(value);
      return `<div class="specialists-col">${names.map((n, i) => renderAvatarChip(n, i)).join("")}</div>`;
    }
    case "daterange": return `<span class="date-range">📅 ${esc(value)}</span>`;
    case "date": return `<span class="date-range">${esc(value)}</span>`;
    case "estado": return renderEstado(value);
    case "calidad": return renderCalidad(value);
    case "rounds": return `<span class="rounds-badge">${esc(value)}</span>`;
    case "specialist-note": return `<div class="text-truncate text-small" title="${esc(value)}">${esc(value)}</div>`;
    case "text":
    default: return `<div class="text-truncate" title="${esc(value)}">${esc(value)}</div>`;
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
  
  const isCreator = row["CreatedBy"] === currentUser?.email;
  const canAddSubitem = isAdmin() || isCreator;

  return `
    <div class="task-title-wrap">
      <button type="button" class="subitem-toggle ${expanded ? "is-open" : ""}" data-toggle-subitems="${esc(row.__clientKey)}" aria-label="${toggleLabel}" title="${toggleLabel}">
        ${expanded ? "▾" : "▸"}
      </button>
      <div class="task-title" title="${safeTitle}">${safeTitle}</div>
      ${children.length ? `<span class="subitem-count" title="${children.length} sub-items">${children.length}</span>` : ""}
      ${canAddSubitem ? `<button type="button" class="subitem-mini-add" data-start-subitem="${esc(row.__clientKey)}" title="Add sub-item">＋</button>` : ""}
    </div>
  `;
}

function renderTipoBadge(val) {
  const map = { "PROJECT": "badge--project", "PERPETUAL": "badge--perpetual", "ON-DEMAND": "badge--ondemand" };
  const cls = map[String(val).toUpperCase()] || "badge--notstarted";
  return `<span class="badge ${cls}">${esc(val)}</span>`;
}

function renderVerticalBadge(val) {
  const map = { "academy": "badge--academy", "school": "badge--school", "e-moa": "badge--emoa", "afterschool": "badge--afterschool", "in-company": "badge--incompany" };
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
  const map = { "notstarted": "notstarted", "inprogress": "inprogress", "standby": "standby", "blocked": "blocked", "done": "done", "delayeddone": "delayeddone" };
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
  return String(value || "").split(",").map(s => s.trim()).filter(Boolean);
}

function esc(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function slugify(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "row";
}

// ─── Inline editing ─────────────────────────────────────────────────────────
function initInlineEditing() {
  const tbody = document.getElementById("table-body");

  tbody.addEventListener("click", e => {
    if (e.target.closest("[data-row-select], [data-toggle-subitems], [data-start-subitem], [data-save-subitem], [data-cancel-subitem], .subitem-create-input")) return;

    const td = e.target.closest("td.editable-cell");
    if (!td) return;
    if (td.classList.contains("editing") || e.target.closest(".inline-editor")) return;

    openEditor(td.dataset.rowKey, td.dataset.key, td.dataset.type);
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

function openEditor(rowKey, key, type) {
  if (activeEditor) {
    activeEditor = null;
    renderTable(filteredData);
  }

  const row = getRowByClientKey(rowKey);
  if (!row) return;

  const td = document.querySelector(
    `td.editable-cell[data-row-key="${cssEscape(rowKey)}"][data-key="${cssEscape(key)}"]`
  );
  if (!td) return;

  activeEditor = { rowKey, key };
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

function cssEscape(value) {
  if (window.CSS && typeof CSS.escape === "function") return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
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

  const isLongText = ["Brief Description", "Comments"].includes(key) || type === "specialist-note";

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
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Sort + Filter + Search ───────────────────────────────────────────────
function handleSort(key) {
  if (activeEditor) activeEditor = null;
  if (sortKey === key) {
    sortDir = sortDir === "asc" ? "desc" : "asc";
  } else {
    sortKey = key;
    sortDir = "asc";
  }
  applyCurrentFiltersAndRender();
  renderSortPanel();
  updateToolbarButtons();
}

function setSort(key, direction = sortDir) {
  sortKey = key || null;
  sortDir = direction === "desc" ? "desc" : "asc";
  applyCurrentFiltersAndRender();
  renderSortPanel();
  updateToolbarButtons();
}

function clearSort() {
  sortKey = null;
  sortDir = "asc";
  applyCurrentFiltersAndRender();
  renderSortPanel();
  updateToolbarButtons();
}

function applySortToRows(rows) {
  const list = [...rows];
  if (!sortKey) return list.sort((a, b) => (a.__localIndex || 0) - (b.__localIndex || 0));

  const direction = sortDir === "desc" ? -1 : 1;

  return list
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const av = getComparableSortValue(a.row, sortKey);
      const bv = getComparableSortValue(b.row, sortKey);

      if (av.empty && bv.empty) return a.index - b.index;
      if (av.empty) return 1;
      if (bv.empty) return -1;

      let result = 0;
      if (av.type === "number" || bv.type === "number") {
        result = Number(av.value) - Number(bv.value);
      } else {
        result = String(av.value).localeCompare(String(bv.value), undefined, { numeric: true, sensitivity: "base" });
      }

      if (result === 0) return a.index - b.index;
      return result * direction;
    })
    .map(item => item.row);
}

function getComparableSortValue(row, key) {
  if (key === "__nextDeadline") {
    const nextDate = getNextDeadlineDate(row);
    return nextDate ? { value: nextDate.getTime(), type: "number", empty: false } : { value: "", type: "text", empty: true };
  }

  if (DEADLINE_KEYS.includes(key) || key === "Fecha de Inicio y Fin") {
    const raw = key === "Fecha de Inicio y Fin" ? parseDateRange(row[key] || "")[0] : row[key];
    const date = parseFlexibleDate(raw);
    return date ? { value: date.getTime(), type: "number", empty: false } : { value: "", type: "text", empty: true };
  }

  if (key === "Estado") {
    const value = String(row[key] || "").trim();
    const index = OPTIONS.estado.findIndex(option => normalizeText(option) === normalizeText(value));
    return value ? { value: index === -1 ? 999 : index, type: "number", empty: false } : { value: "", type: "text", empty: true };
  }

  if (key === "Tipo de trabajo") {
    const value = String(row[key] || "").trim();
    const index = OPTIONS.tipo.findIndex(option => normalizeText(option) === normalizeText(value));
    return value ? { value: index === -1 ? value : index, type: index === -1 ? "text" : "number", empty: false } : { value: "", type: "text", empty: true };
  }

  if (key === "Rondas de revisión") {
    const raw = String(row[key] || "").trim();
    const number = Number(raw.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(number) && raw ? { value: number, type: "number", empty: false } : { value: "", type: "text", empty: true };
  }

  const value = String(row[key] || "").trim();
  return value ? { value: normalizeText(value), type: "text", empty: false } : { value: "", type: "text", empty: true };
}

function handleSearch(query) {
  currentSearchQuery = query.toLowerCase().trim();
  applyCurrentFiltersAndRender();
}

function applyCurrentFiltersAndRender() {
  const q = currentSearchQuery;
  const hasRefinement = Boolean(q) || hasActiveFilters();

  if (isCalendarView()) {
    renderCalendar();
    updateToolbarButtons();
    return;
  }

  let nextData;

  if (!hasRefinement) {
    nextData = [...allData];
  } else {
    const matchingParentIds = new Set();
    const matchingRowKeys = new Set();

    allData.forEach(row => {
      if (!rowMatchesCurrentRefinements(row, q)) return;

      matchingRowKeys.add(getRowKey(row));
      if (isSubitem(row)) {
        matchingParentIds.add(String(row[PARENT_ID_KEY] || "").trim());
      } else {
        matchingParentIds.add(String(row.ID || "").trim());
      }
    });

    nextData = allData.filter(row => {
      if (matchingRowKeys.has(getRowKey(row))) return true;
      if (isSubitem(row)) return false;
      return matchingParentIds.has(String(row.ID || "").trim());
    });
  }

  filteredData = applySortToRows(nextData);
  renderTable(filteredData);
  updateToolbarButtons();
}

function rowMatchesCurrentRefinements(row, q = currentSearchQuery) {
  if (q && !rowMatchesSearch(row, q)) return false;
  return rowMatchesActiveFilters(row);
}

function rowMatchesSearch(row, q) {
  return COLUMNS.some(col => String(row[col.key] || "").toLowerCase().includes(q));
}

function rowMatchesActiveFilters(row) {
  if (!matchesFilterSet(row, "tipo")) return false;
  if (!matchesFilterSet(row, "estado")) return false;
  if (!matchesFilterSet(row, "vertical")) return false;
  if (!matchesFilterSet(row, "specialists")) return false;
  if (!matchesFilterSet(row, "calidad")) return false;
  if (!matchesDeadlineFilters(row)) return false;
  return true;
}

function matchesFilterSet(row, filterName) {
  const selected = activeFilters[filterName];
  if (!selected || selected.size === 0) return true;

  const config = FILTER_CONFIG[filterName];
  const raw = String(row[config.key] || "").trim();
  if (!raw) return false;

  if (config.multiple) {
    const values = splitMulti(raw).map(normalizeText);
    return Array.from(selected).some(option => values.includes(normalizeText(option)));
  }

  return selected.has(raw) || Array.from(selected).some(option => normalizeText(option) === normalizeText(raw));
}

function matchesDeadlineFilters(row) {
  const dates = getRowDeadlineDates(row);
  const mode = activeFilters.deadlineMode;
  const today = stripTime(new Date());
  const sevenDays = addDays(today, 7);
  const thirtyDays = addDays(today, 30);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const isComplete = isRowComplete(row);

  if (mode === "has_deadline" && dates.length === 0) return false;
  if (mode === "no_deadline" && dates.length > 0) return false;
  if (mode === "overdue" && (isComplete || !dates.some(date => date < today))) return false;
  if (mode === "due_7" && !dates.some(date => date >= today && date <= sevenDays)) return false;
  if (mode === "due_30" && !dates.some(date => date >= today && date <= thirtyDays)) return false;
  if (mode === "this_month" && !dates.some(date => date >= monthStart && date <= monthEnd)) return false;

  const from = activeFilters.dateFrom ? parseFlexibleDate(activeFilters.dateFrom) : null;
  const to = activeFilters.dateTo ? parseFlexibleDate(activeFilters.dateTo) : null;

  if (from && !dates.some(date => date >= from)) return false;
  if (to && !dates.some(date => date <= to)) return false;
  if ((from || to) && dates.length === 0) return false;

  return true;
}

function getRowDeadlineDates(row) {
  return DEADLINE_KEYS.map(key => parseFlexibleDate(row[key])).filter(Boolean).sort((a, b) => a - b);
}

function getNextDeadlineDate(row) {
  const today = stripTime(new Date());
  const future = getRowDeadlineDates(row).filter(date => date >= today);
  return future[0] || getRowDeadlineDates(row)[0] || null;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function isRowComplete(row) {
  const status = normalizeText(row["Estado"] || "");
  return status === "done" || status === "delayeddone";
}

function normalizeText(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
}

function hasActiveFilters() { return countActiveFilters() > 0; }

function countActiveFilters() {
  const setCount = ["tipo", "estado", "vertical", "specialists", "calidad"].reduce((total, key) => total + activeFilters[key].size, 0);
  const deadlineCount = activeFilters.deadlineMode !== "all" ? 1 : 0;
  const dateCount = (activeFilters.dateFrom ? 1 : 0) + (activeFilters.dateTo ? 1 : 0);
  return setCount + deadlineCount + dateCount;
}

function clearFilters() {
  activeFilters = createEmptyFilters();
  applyCurrentFiltersAndRender();
  renderFilterPanel();
  updateToolbarButtons();
}

function getAvailableFilterOptions(filterName) {
  const config = FILTER_CONFIG[filterName];
  const values = new Map();
  (config.options || []).forEach(option => { values.set(normalizeText(option), option); });

  allData.forEach(row => {
    const raw = String(row[config.key] || "").trim();
    const parts = config.multiple ? splitMulti(raw) : [raw];
    parts.filter(Boolean).forEach(part => {
      const normalized = normalizeText(part);
      if (!values.has(normalized)) values.set(normalized, part);
    });
  });

  return Array.from(values.values()).filter(Boolean);
}

function getFilterOptionCount(filterName, option) {
  const config = FILTER_CONFIG[filterName];
  return allData.filter(row => {
    const raw = String(row[config.key] || "").trim();
    if (!raw) return false;
    if (config.multiple) return splitMulti(raw).some(value => normalizeText(value) === normalizeText(option));
    return normalizeText(raw) === normalizeText(option);
  }).length;
}

function getSortedResultCount() {
  return filteredData.filter(row => !isSubitem(row)).length;
}

function renderFilterPanel() {
  const panel = document.getElementById("filter-panel");
  if (!panel) return;

  panel.innerHTML = `
    <div class="toolbar-panel__header">
      <div>
        <strong>Filter tasks</strong>
        <span>${getSortedResultCount()} visible parent task${getSortedResultCount() === 1 ? "" : "s"}</span>
      </div>
      <button type="button" class="toolbar-panel__x" data-close-toolbar aria-label="Close filter panel">×</button>
    </div>
    <div class="toolbar-panel__body toolbar-panel__body--filters">
      ${renderFilterSummary()}
      <div class="filter-grid">
        ${renderFilterGroup("estado")}
        ${renderFilterGroup("tipo")}
        ${renderFilterGroup("vertical")}
        ${renderFilterGroup("specialists")}
        ${renderFilterGroup("calidad")}
      </div>
      <div class="filter-section filter-section--deadline">
        <div class="filter-section__title">Deadline intelligence</div>
        <div class="deadline-filter-grid">
          <label class="toolbar-field">
            <span>Deadline status</span>
            <select id="filter-deadline-mode">
              ${renderDeadlineModeOption("all", "All deadlines")}
              ${renderDeadlineModeOption("has_deadline", "Has any deadline")}
              ${renderDeadlineModeOption("no_deadline", "No deadline")}
              ${renderDeadlineModeOption("overdue", "Overdue and not done")}
              ${renderDeadlineModeOption("due_7", "Due in the next 7 days")}
              ${renderDeadlineModeOption("due_30", "Due in the next 30 days")}
              ${renderDeadlineModeOption("this_month", "Due this month")}
            </select>
          </label>
          <label class="toolbar-field">
            <span>From</span>
            <input type="date" id="filter-date-from" value="${esc(activeFilters.dateFrom)}" />
          </label>
          <label class="toolbar-field">
            <span>To</span>
            <input type="date" id="filter-date-to" value="${esc(activeFilters.dateTo)}" />
          </label>
        </div>
      </div>
      <div class="toolbar-panel__actions">
        <button type="button" class="toolbar-secondary-btn" data-clear-filters>Clear filters</button>
        <button type="button" class="toolbar-primary-btn" data-close-toolbar>Done</button>
      </div>
    </div>
  `;
}

function renderFilterSummary() {
  const chips = [];

  Object.keys(FILTER_CONFIG).forEach(filterName => {
    activeFilters[filterName].forEach(value => {
      chips.push(`<button type="button" class="filter-chip" data-remove-filter="${esc(filterName)}" data-value="${esc(value)}">${esc(value)} <span>×</span></button>`);
    });
  });

  if (activeFilters.deadlineMode !== "all") chips.push(`<button type="button" class="filter-chip" data-deadline-mode="all">${esc(getDeadlineModeLabel(activeFilters.deadlineMode))} <span>×</span></button>`);
  if (activeFilters.dateFrom) chips.push(`<button type="button" class="filter-chip" data-clear-date="from">From ${esc(activeFilters.dateFrom)} <span>×</span></button>`);
  if (activeFilters.dateTo) chips.push(`<button type="button" class="filter-chip" data-clear-date="to">To ${esc(activeFilters.dateTo)} <span>×</span></button>`);

  if (!chips.length) return `<div class="filter-summary filter-summary--empty">No active filters. Add one to narrow the table or calendar.</div>`;
  return `<div class="filter-summary">${chips.join("")}</div>`;
}

function renderFilterGroup(filterName) {
  const config = FILTER_CONFIG[filterName];
  const selected = activeFilters[filterName];
  const options = getAvailableFilterOptions(filterName);

  return `
    <div class="filter-section">
      <div class="filter-section__title">${esc(config.label)}</div>
      <div class="filter-options">
        ${options.map(option => {
          const count = getFilterOptionCount(filterName, option);
          const isChecked = selected.has(option) || Array.from(selected).some(item => normalizeText(item) === normalizeText(option));
          return `
            <label class="filter-option ${isChecked ? "is-selected" : ""}">
              <input type="checkbox" data-filter-name="${esc(filterName)}" value="${esc(option)}" ${isChecked ? "checked" : ""} />
              <span>${esc(option)}</span>
              <em>${count}</em>
            </label>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderDeadlineModeOption(value, label) {
  return `<option value="${esc(value)}" ${activeFilters.deadlineMode === value ? "selected" : ""}>${esc(label)}</option>`;
}

function getDeadlineModeLabel(value) {
  const map = { all: "All deadlines", has_deadline: "Has any deadline", no_deadline: "No deadline", overdue: "Overdue", due_7: "Due in 7 days", due_30: "Due in 30 days", this_month: "Due this month" };
  return map[value] || value;
}

function renderSortPanel() {
  const panel = document.getElementById("sort-panel");
  if (!panel) return;

  panel.innerHTML = `
    <div class="toolbar-panel__header">
      <div>
        <strong>Sort tasks</strong>
        <span>${sortKey ? `Sorted by ${esc(getSortLabel(sortKey))}` : "Using original sheet order"}</span>
      </div>
      <button type="button" class="toolbar-panel__x" data-close-toolbar aria-label="Close sort panel">×</button>
    </div>
    <div class="toolbar-panel__body">
      <label class="toolbar-field">
        <span>Sort by</span>
        <select id="sort-field">
          <option value="" ${!sortKey ? "selected" : ""}>Original sheet order</option>
          ${SORT_OPTIONS.map(option => `<option value="${esc(option.key)}" ${sortKey === option.key ? "selected" : ""}>${esc(option.label)}</option>`).join("")}
        </select>
      </label>
      <div class="sort-direction-group" role="radiogroup" aria-label="Sort direction">
        <label class="sort-direction ${sortDir === "asc" ? "is-selected" : ""}">
          <input type="radio" name="sort-direction" value="asc" ${sortDir === "asc" ? "checked" : ""} />
          <span>Ascending</span>
          <em>↑</em>
        </label>
        <label class="sort-direction ${sortDir === "desc" ? "is-selected" : ""}">
          <input type="radio" name="sort-direction" value="desc" ${sortDir === "desc" ? "checked" : ""} />
          <span>Descending</span>
          <em>↓</em>
        </label>
      </div>
      <div class="toolbar-panel__actions">
        <button type="button" class="toolbar-secondary-btn" data-clear-sort>Clear sort</button>
        <button type="button" class="toolbar-primary-btn" data-close-toolbar>Done</button>
      </div>
    </div>
  `;
}

function getSortLabel(key) {
  const option = SORT_OPTIONS.find(item => item.key === key);
  if (option) return option.label;
  const column = COLUMNS.find(col => col.key === key);
  return column ? column.label : key;
}

function toggleToolbarPanel(panelName) {
  activeToolbarPanel = activeToolbarPanel === panelName ? null : panelName;
  renderToolbarPanels();
}

function closeToolbarPanels() {
  activeToolbarPanel = null;
  renderToolbarPanels();
}

function renderToolbarPanels() {
  renderFilterPanel();
  renderSortPanel();

  const filterPanel = document.getElementById("filter-panel");
  const sortPanel = document.getElementById("sort-panel");

  if (filterPanel) filterPanel.hidden = activeToolbarPanel !== "filter";
  if (sortPanel) sortPanel.hidden = activeToolbarPanel !== "sort";

  updateToolbarButtons();
}

function updateToolbarButtons() {
  const filterBtn = document.getElementById("btn-filter");
  const sortBtn = document.getElementById("btn-sort");
  const activeFilterCount = countActiveFilters();

  if (filterBtn) {
    filterBtn.classList.toggle("is-active", activeFilterCount > 0 || activeToolbarPanel === "filter");
    filterBtn.dataset.count = activeFilterCount > 0 ? String(activeFilterCount) : "";
    filterBtn.setAttribute("aria-expanded", String(activeToolbarPanel === "filter"));
  }

  if (sortBtn) {
    sortBtn.classList.toggle("is-active", Boolean(sortKey) || activeToolbarPanel === "sort");
    sortBtn.dataset.count = sortKey ? (sortDir === "asc" ? "↑" : "↓") : "";
    sortBtn.setAttribute("aria-expanded", String(activeToolbarPanel === "sort"));
  }
}

function initToolbarPanels() {
  const filterBtn = document.getElementById("btn-filter");
  const sortBtn = document.getElementById("btn-sort");
  const filterPanel = document.getElementById("filter-panel");
  const sortPanel = document.getElementById("sort-panel");

  if (filterBtn) filterBtn.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); toggleToolbarPanel("filter"); });
  if (sortBtn) sortBtn.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); toggleToolbarPanel("sort"); });

  if (filterPanel) {
    filterPanel.addEventListener("change", e => {
      const checkbox = e.target.closest("input[data-filter-name]");
      if (checkbox) {
        const filterName = checkbox.dataset.filterName;
        const value = checkbox.value;
        checkbox.checked ? activeFilters[filterName].add(value) : activeFilters[filterName].delete(value);
        applyCurrentFiltersAndRender();
        renderFilterPanel();
        return;
      }

      if (e.target.id === "filter-deadline-mode") {
        activeFilters.deadlineMode = e.target.value || "all";
        applyCurrentFiltersAndRender();
        renderFilterPanel();
        return;
      }

      if (e.target.id === "filter-date-from") {
        activeFilters.dateFrom = e.target.value || "";
        applyCurrentFiltersAndRender();
        renderFilterPanel();
        return;
      }

      if (e.target.id === "filter-date-to") {
        activeFilters.dateTo = e.target.value || "";
        applyCurrentFiltersAndRender();
        renderFilterPanel();
      }
    });

    filterPanel.addEventListener("click", e => {
      const remove = e.target.closest("[data-remove-filter]");
      if (remove) {
        e.preventDefault();
        const filterName = remove.dataset.removeFilter;
        const value = remove.dataset.value;
        if (activeFilters[filterName]) activeFilters[filterName].delete(value);
        applyCurrentFiltersAndRender();
        renderFilterPanel();
        return;
      }

      const deadlineMode = e.target.closest("[data-deadline-mode]");
      if (deadlineMode) {
        e.preventDefault();
        activeFilters.deadlineMode = deadlineMode.dataset.deadlineMode || "all";
        applyCurrentFiltersAndRender();
        renderFilterPanel();
        return;
      }

      const clearDate = e.target.closest("[data-clear-date]");
      if (clearDate) {
        e.preventDefault();
        if (clearDate.dataset.clearDate === "from") activeFilters.dateFrom = "";
        if (clearDate.dataset.clearDate === "to") activeFilters.dateTo = "";
        applyCurrentFiltersAndRender();
        renderFilterPanel();
        return;
      }

      if (e.target.closest("[data-clear-filters]")) {
        e.preventDefault();
        clearFilters();
        return;
      }

      if (e.target.closest("[data-close-toolbar]")) {
        e.preventDefault();
        closeToolbarPanels();
      }
    });
  }

  if (sortPanel) {
    sortPanel.addEventListener("change", e => {
      if (e.target.id === "sort-field") { setSort(e.target.value, sortDir); return; }
      if (e.target.name === "sort-direction") { setSort(sortKey, e.target.value); }
    });

    sortPanel.addEventListener("click", e => {
      if (e.target.closest("[data-clear-sort]")) { e.preventDefault(); clearSort(); return; }
      if (e.target.closest("[data-close-toolbar]")) { e.preventDefault(); closeToolbarPanels(); }
    });
  }

  document.addEventListener("click", e => {
    if (!activeToolbarPanel) return;
    if (e.target.closest("#filter-panel, #sort-panel, #btn-filter, #btn-sort")) return;
    closeToolbarPanels();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && activeToolbarPanel) closeToolbarPanels();
  });

  renderToolbarPanels();
}

// ─── Calendar View ─────────────────────────────────────────────────────────
function initCalendarView() {
  const prev = document.getElementById("calendar-prev");
  const next = document.getElementById("calendar-next");
  const today = document.getElementById("calendar-today");
  const specialistFilter = document.getElementById("calendar-specialist-filter");
  const board = document.getElementById("calendar-board");
  const sidebar = document.getElementById("calendar-active-deadlines");

  populateCalendarSpecialistFilter();

  if (prev) prev.addEventListener("click", () => { calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1); renderCalendar(); });
  if (next) next.addEventListener("click", () => { calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1); renderCalendar(); });
  if (today) today.addEventListener("click", () => { calendarDate = new Date(); renderCalendar(); });
  if (specialistFilter) specialistFilter.addEventListener("change", () => { calendarSpecialistFilter = specialistFilter.value || "all"; renderCalendar(); });

  [board, sidebar].forEach(target => {
    if (!target) return;
    target.addEventListener("click", e => {
      const card = e.target.closest("[data-calendar-row]");
      if (!card) return;
      const row = getRowByClientKey(card.dataset.calendarRow);
      if (row) openCalendarTaskInTable(row);
    });
  });
}

function populateCalendarSpecialistFilter() {
  const select = document.getElementById("calendar-specialist-filter");
  if (!select) return;

  const options = [
    `<option value="all">All specialists</option>`,
    ...OPTIONS.specialists.map(name => `<option value="${esc(name)}">${esc(name)}</option>`)
  ];

  select.innerHTML = options.join("");
  select.value = calendarSpecialistFilter;
}

function renderCalendar() {
  const board = document.getElementById("calendar-board");
  const title = document.getElementById("calendar-title");
  const subtitle = document.getElementById("calendar-subtitle");
  const deadlines = document.getElementById("calendar-active-deadlines");
  const lanes = document.getElementById("calendar-specialist-lanes");
  const select = document.getElementById("calendar-specialist-filter");

  if (!board || !title || !deadlines) return;

  if (select && select.value !== calendarSpecialistFilter) select.value = calendarSpecialistFilter;

  title.textContent = calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  if (subtitle) {
    const filterText = calendarSpecialistFilter === "all" ? "all specialists" : calendarSpecialistFilter;
    subtitle.textContent = `Clear monthly view of deadlines and workflow starts for ${filterText}.`;
  }

  const days = getCalendarMonthDays(calendarDate);
  const items = getCalendarItems();
  const itemsByDay = groupCalendarItemsByDay(items);

  board.innerHTML = `
    <div class="calendar-weekdays">
      ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => `<div>${day}</div>`).join("")}
    </div>
    <div class="calendar-days">
      ${days.map(day => renderCalendarDay(day, itemsByDay.get(dateToISO(day)) || [])).join("")}
    </div>
  `;

  deadlines.innerHTML = renderActiveDeadlines(items);
  if (lanes) lanes.innerHTML = renderSpecialistLanes(items);
}

function getCalendarItems() {
  const q = currentSearchQuery;
  const monthStart = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
  const monthEnd = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
  const visibleStart = new Date(monthStart);
  visibleStart.setDate(visibleStart.getDate() - visibleStart.getDay());
  const visibleEnd = new Date(monthEnd);
  visibleEnd.setDate(visibleEnd.getDate() + (6 - visibleEnd.getDay()));

  const items = [];

  allData.forEach(row => {
    if (!rowMatchesCalendarFilters(row, q)) return;

    const title = String(row["TASKS"] || "Untitled").trim();
    if (!title) return;

    if (!isSubitem(row) && getSubitemsForParent(row).length > 0) return;

    ["Deadline 1", "Deadline 2", "Deadline 3", "Deadline 4"].forEach((key, index) => {
      const date = parseFlexibleDate(row[key]);
      if (!date) return;
      if (date < visibleStart || date > visibleEnd) return;
      items.push({
        row,
        date,
        endDate: null,
        type: "deadline",
        dateKey: key,
        label: `Deadline ${index + 1}`,
        title,
        specialists: splitMulti(row["Specialists"]),
        status: row["Estado"] || "Not started"
      });
    });

    const [startText, endText] = parseDateRange(row["Fecha de Inicio y Fin"] || "");
    const startDate = parseFlexibleDate(startText);
    const endDate = parseFlexibleDate(endText);

    if (startDate && startDate >= visibleStart && startDate <= visibleEnd) {
      items.push({
        row, date: startDate, endDate: null, type: "workflow", dateKey: "Fecha de Inicio y Fin", label: "Inicio",
        title, specialists: splitMulti(row["Specialists"]), status: row["Estado"] || "Not started"
      });
    }

    if (endDate && endDate >= visibleStart && endDate <= visibleEnd) {
      items.push({
        row, date: endDate, endDate: null, type: "workflow", dateKey: "Fecha de Inicio y Fin", label: "Fin",
        title, specialists: splitMulti(row["Specialists"]), status: row["Estado"] || "Not started"
      });
    }
  });

  return items.sort((a, b) => {
    const diff = a.date - b.date;
    if (diff !== 0) return diff;
    return a.title.localeCompare(b.title);
  });
}

function rowMatchesCalendarFilters(row, q) {
  if (q && !rowMatchesSearch(row, q)) return false;
  if (!rowMatchesActiveFilters(row)) return false;
  if (calendarSpecialistFilter === "all") return true;
  return splitMulti(row["Specialists"]).some(name => name === calendarSpecialistFilter);
}

function groupCalendarItemsByDay(items) {
  const map = new Map();
  items.forEach(item => {
    const key = dateToISO(item.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return map;
}

function renderCalendarDay(day, items) {
  const isOutside = day.getMonth() !== calendarDate.getMonth();
  const isToday = dateToISO(day) === dateToISO(new Date());
  const visibleItems = items.slice(0, 4);
  const overflow = Math.max(items.length - visibleItems.length, 0);

  return `
    <div class="calendar-day ${isOutside ? "calendar-day--outside" : ""} ${isToday ? "calendar-day--today" : ""}">
      <div class="calendar-day__head">
        <span>${day.getDate()}</span>
        ${isToday ? `<strong>Today</strong>` : ""}
      </div>
      <div class="calendar-day__items">
        ${visibleItems.map(item => renderCalendarCard(item)).join("")}
        ${overflow ? `<div class="calendar-more">+${overflow} more</div>` : ""}
      </div>
    </div>
  `;
}

function renderCalendarCard(item) {
  const status = getEstadoSlug(item.status);
  const dateText = formatCalendarDate(item.date);
  const people = item.specialists.length ? item.specialists.join(", ") : "No specialist assigned";
  const isSub = isSubitem(item.row);

  return `
    <button type="button" class="calendar-card calendar-card--${status} ${isSub ? "calendar-card--subitem" : ""}" data-calendar-row="${esc(item.row.__clientKey)}" title="${esc(item.title)} · ${esc(people)} · ${esc(item.label)} · ${esc(dateText)}">
      <span class="calendar-card__meta"><b>${esc(item.label)}</b><span>${esc(dateText)}</span></span>
      <span class="calendar-card__title">${isSub ? "↳ " : ""}${esc(item.title)}</span>
      <span class="calendar-card__people">${esc(people)}</span>
    </button>
  `;
}

function renderActiveDeadlines(items) {
  const today = stripTime(new Date());
  const monthStart = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
  const monthEnd = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);

  let deadlines = items
    .filter(item => item.type === "deadline")
    .filter(item => item.date >= today || (item.date >= monthStart && item.date <= monthEnd))
    .sort((a, b) => a.date - b.date)
    .slice(0, 14);

  if (!deadlines.length) {
    deadlines = items.filter(item => item.type === "deadline").sort((a, b) => a.date - b.date).slice(0, 10);
  }

  if (!deadlines.length) {
    return `
      <div class="calendar-empty-state">
        <strong>No deadlines found</strong>
        <span>Add dates in Deadline 1–4 or adjust your filter.</span>
      </div>
    `;
  }

  return deadlines.map(item => {
    const status = getEstadoSlug(item.status);
    const people = item.specialists.length ? item.specialists.join(", ") : "No specialist assigned";
    return `
      <button type="button" class="deadline-card deadline-card--${status}" data-calendar-row="${esc(item.row.__clientKey)}">
        <div class="deadline-card__date">
          <strong>${esc(formatCalendarDate(item.date))}</strong>
          <span>${esc(item.label)}</span>
        </div>
        <div class="deadline-card__body">
          <strong>${esc(item.title)}</strong>
          <span>${esc(people)}</span>
          <em>${esc(item.status)}</em>
        </div>
      </button>
    `;
  }).join("");
}

function renderSpecialistLanes(items) {
  const specialists = calendarSpecialistFilter === "all" ? OPTIONS.specialists : [calendarSpecialistFilter];
  const monthItems = items.filter(item => item.date.getMonth() === calendarDate.getMonth());
  
  const lanes = specialists.map(name => {
    const assigned = monthItems.filter(item => item.specialists.includes(name));
    if (!assigned.length && calendarSpecialistFilter !== name) return "";
    const visible = assigned.slice(0, 5);
    return `
      <div class="specialist-lane">
        <div class="specialist-lane__person">
          <span>${esc(getInitials(name))}</span>
          <strong>${esc(name)}</strong>
          <em>${assigned.length} item${assigned.length === 1 ? "" : "s"}</em>
        </div>
        <div class="specialist-lane__items">
          ${visible.length ? visible.map(item => renderLaneChip(item)).join("") : `<span class="lane-empty">No scheduled items this month</span>`}
          ${assigned.length > visible.length ? `<span class="lane-more">+${assigned.length - visible.length} more</span>` : ""}
        </div>
      </div>
    `;
  }).filter(Boolean).join("");

  if (!lanes) {
    return `
      <div class="calendar-empty-state calendar-empty-state--lanes">
        <strong>No workflow items for this specialist</strong>
        <span>Try another month or use Deadline 1–4 / Fecha de Inicio y Fin.</span>
      </div>
    `;
  }

  return lanes;
}

function renderLaneChip(item) {
  const status = getEstadoSlug(item.status);
  return `
    <button type="button" class="lane-chip lane-chip--${status}" data-calendar-row="${esc(item.row.__clientKey)}">
      <span>${esc(formatCalendarDate(item.date))}</span>
      <strong>${esc(item.title)}</strong>
      <em>${esc(item.label)}</em>
    </button>
  `;
}

function openCalendarTaskInTable(row) {
  const input = document.getElementById("search-input");
  const searchBar = document.getElementById("search-bar");
  const title = String(row["TASKS"] || "").trim();

  if (input && searchBar && title) {
    searchBar.style.display = "block";
    input.value = title;
    currentSearchQuery = title.toLowerCase();
  }
  setActiveTab("all-tasks");
}

function getCalendarMonthDays(baseDate) {
  const first = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function parseFlexibleDate(value) {
  const clean = String(value || "").trim();
  if (!clean) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const parsed = new Date(`${clean}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : stripTime(parsed);
  }

  const parsed = new Date(clean);
  if (Number.isNaN(parsed.getTime())) return null;
  return stripTime(parsed);
}

function stripTime(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }

function dateToISO(date) {
  const d = stripTime(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatCalendarDate(date) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getEstadoSlug(val) {
  const key = String(val || "").toLowerCase().replace(/\s+/g, "");
  const map = { "notstarted": "notstarted", "inprogress": "inprogress", "standby": "standby", "blocked": "blocked", "done": "done", "delayeddone": "delayeddone" };
  return map[key] || "notstarted";
}

// ─── Tabs ───────────────────────────────────────────────────────────────────
function setActiveTab(tabName) {
  const targetTab = tabName || "all-tasks";

  document.querySelectorAll(".tab").forEach(tab => {
    const isActive = tab.dataset.tab === targetTab;
    tab.classList.toggle("tab--active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll(".view").forEach(view => view.classList.remove("view--active"));

  if (targetTab === "submit") {
    activeDashboardView = "submit";
    const submitView = document.getElementById("view-submit");
    if (submitView) submitView.classList.add("view--active");
    updateSelectionToolbar();
    return;
  }

  if (targetTab === "calendar") {
    activeDashboardView = "calendar";
    const calendarView = document.getElementById("view-calendar");
    if (calendarView) calendarView.classList.add("view--active");
    updateSelectionToolbar();
    renderCalendar();
    return;
  }

  activeDashboardView = targetTab === "backlog" ? "backlog" : "all-tasks";
  const tableView = document.getElementById("view-all-tasks");
  if (tableView) tableView.classList.add("view--active");
  applyCurrentFiltersAndRender();
}

function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => { tab.addEventListener("click", () => setActiveTab(tab.dataset.tab)); });
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

  if (newBtn) newBtn.addEventListener("click", () => setActiveTab("submit"));
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
        createSelectedVerticals.has(v) ? createSelectedVerticals.delete(v) : createSelectedVerticals.add(v);
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
    row["Specialists"] = Array.from(createSelectedSpecialists).join(", ") || String(formData.get("Specialists") || "").trim();
    row["Brief Description"] = String(formData.get("Brief Description") || "").trim();
    row["Estado"] = "Not started";
    row["CreatedBy"] = currentUser.email; // INSTANT OWNERSHIP

    const startRaw = String(formData.get("Fecha de inicio") || "").trim();
    const endRaw = String(formData.get("Fecha final") || "").trim();
    if (startRaw && endRaw) {
      row["Fecha de Inicio y Fin"] = `${formatDateForDisplay(startRaw)} – ${formatDateForDisplay(endRaw)}`;
    } else if (startRaw) {
      row["Fecha de Inicio y Fin"] = formatDateForDisplay(startRaw);
    } else {
      row["Fecha de Inicio y Fin"] = "";
    }

    ["Deadline 1", "Deadline 2", "Deadline 3", "Deadline 4"].forEach(key => {
      const raw = String(formData.get(key) || "").trim();
      row[key] = raw ? formatDateForDisplay(raw) : "";
    });

    const ok = await postRow(row);

    if (ok) {
      if (feedback) {
        feedback.textContent = "Tarea guardada correctamente.";
        feedback.className = "form-feedback form-feedback--success";
      }

      form.reset();
      resetFormPickers();

      setActiveTab("all-tasks");
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
  return String(name).replace(/^MOA\s*-\s*/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0] || "").join("").toUpperCase();
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

// ─── Auth init ───────────────────────────────────────────────────────────────
async function initAuth() {
  try {
    const res = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (res.status === 401) {
      renderLoginScreen();
      return false;
    }
    if (!res.ok) throw new Error(`Auth check failed: ${res.status}`);

    currentUser = await res.json();
    renderUserBadge(currentUser);
    return true;
  } catch (err) {
    console.error("Auth init error:", err);
    renderLoginScreen();
    return false;
  }
}

function renderLoginScreen() {
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f7f6f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="background:#fff;border:1px solid #e9e9e7;border-radius:12px;padding:48px 40px;max-width:380px;width:100%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <div style="font-size:36px;margin-bottom:16px;">🎓</div>
        <h1 style="font-size:22px;font-weight:700;color:#37352f;margin-bottom:6px;">Specialists Dashboard</h1>
        <p style="color:#787774;font-size:14px;margin-bottom:32px;">MOA Education · Acceso restringido al equipo</p>
        <a href="/api/auth/login" style="display:inline-flex;align-items:center;gap:10px;padding:12px 24px;border-radius:8px;text-decoration:none;background:#4285f4;color:#fff;font-size:14px;font-weight:600;box-shadow:0 2px 8px rgba(66,133,244,0.3);transition:background 0.15s;">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFF" d="M43.6 20H24v8.4h11.1C33.8 33.7 29.4 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.1-6.1C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.9 0 20-7.9 20-21 0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Iniciar sesión con Google
        </a>
        ${getAuthErrorMessage()}
      </div>
    </div>
  `;
}

function getAuthErrorMessage() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("auth_error");
  const email = params.get("email");

  const messages = {
    unauthorized_domain: `La cuenta ${email ? `<strong>${email}</strong>` : ""} no pertenece al dominio de MOA Education.`,
    not_in_team: `La cuenta ${email ? `<strong>${email}</strong>` : ""} no está registrada en el equipo.`,
    token_exchange_failed: "Error al comunicarse con Google. Intenta de nuevo.",
    server_error: "Error interno. Contacta al administrador.",
    missing_code: "Flujo de autenticación interrumpido. Intenta de nuevo."
  };

  if (!error) return "";
  const msg = messages[error] || `Error: ${error}`;
  return `<p style="margin-top:20px;padding:12px;background:#fee2e2;color:#991b1b;border-radius:8px;font-size:13px;">${msg}</p>`;
}

function renderUserBadge(user) {
  const header = document.querySelector(".page-header");
  if (!header) return;

  header.querySelector(".user-badge")?.remove();

  const initials = (user.name || user.email || "?").split(/\s+/).slice(0, 2).map(p => p[0] || "").join("").toUpperCase();

  const badge = document.createElement("div");
  badge.className = "user-badge";
  badge.style.cssText = `margin-left:auto;display:flex;align-items:center;gap:8px;padding:4px 12px 4px 4px;border:1px solid #e9e9e7;border-radius:999px;background:#fff;cursor:pointer;font-size:13px;color:#37352f;transition:background 0.1s;`;
  badge.title = `${user.name} (${user.role === "admin" ? "Administrador" : "Especialista"}) — Cerrar sesión`;
  badge.innerHTML = `
    ${user.picture ? `<img src="${user.picture}" style="width:24px;height:24px;border-radius:50%;flex-shrink:0;" referrerpolicy="no-referrer">` : `<div style="width:24px;height:24px;border-radius:50%;background:#007aff;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">${initials}</div>`}
    <span>${user.name || user.email}</span>
    <span style="background:${user.role === "admin" ? "#007aff" : "#10b981"};color:#fff;font-size:10px;font-weight:600;padding:1px 7px;border-radius:999px;">${user.role === "admin" ? "Admin" : "Especialista"}</span>
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style="opacity:0.5"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
  `;

  let menu = null;
  badge.addEventListener("click", (e) => {
    e.stopPropagation();
    if (menu) { menu.remove(); menu = null; return; }

    menu = document.createElement("div");
    menu.style.cssText = `position:fixed;top:${badge.getBoundingClientRect().bottom + 6}px;right:24px;background:#fff;border:1px solid #e9e9e7;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.1);z-index:1000;min-width:180px;padding:4px 0;font-size:13px;`;
    menu.innerHTML = `<div style="padding:10px 14px;border-bottom:1px solid #f0f0ef;color:#787774;font-size:12px;">${user.email}</div><a href="/api/auth/logout" style="display:block;padding:10px 14px;color:#c0392b;text-decoration:none;">Cerrar sesión</a>`;
    document.body.appendChild(menu);

    const closeMenu = () => { menu?.remove(); menu = null; document.removeEventListener("click", closeMenu); };
    setTimeout(() => document.addEventListener("click", closeMenu), 0);
  });

  header.appendChild(badge);
}

// ─── Apply RBAC to the rendered table UI ─────────────────────────────────────
function applyRbacToTable() {
  if (!currentUser) return;
  if (isAdmin()) return; 

  const DEADLINE_KEYS = ["Deadline 1", "Deadline 2", "Deadline 3", "Deadline 4"];
  const myKey = getMySpecialistKey();

  document.querySelectorAll(".editable-cell").forEach(td => {
    const colKey = td.dataset.key;
    const rowKey = td.dataset.rowKey;
    const row = getRowByClientKey(rowKey);
    const assignedSpecialists = (row?.["Specialists"] || "").toLowerCase();
    const isCreator = row?.["CreatedBy"] === currentUser.email;

    let canEdit = false;

    if (isAdmin() || isCreator) {
      if (!isAdmin() && DEADLINE_KEYS.includes(colKey)) {
        canEdit = false;
      } else if (!isAdmin() && colKey === "Calidad") {
        canEdit = false;
      } else {
        canEdit = true;
      }
    } else {
      if (colKey === "Estado") {
        canEdit = myKey && assignedSpecialists.includes(myKey.toLowerCase());
      } else if (myKey && colKey === myKey) {
        canEdit = true;
      } else {
        canEdit = false;
      }
    }

    if (!canEdit) {
      td.classList.remove("editable-cell");
      td.title = "";
      td.style.cursor = "default";
    }
  });
}

// ─── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  const authenticated = await initAuth();
  if (!authenticated) return;

  initTabs();
  initToolbar();
  initToolbarPanels();
  initInlineEditing();
  initSubitemInteractions();
  initSelectionInteractions();
  initCalendarView();
  initSubmitForm();
  await fetchData();
});
