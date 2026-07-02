/**
 * MOA Specialists Dashboard — Google Sheets Apps Script API
 *
 * Deploy this file as a Web App from the Google Sheet used as the database.
 * The Vercel API routes call this Web App, so the browser never receives the token.
 */

const MOA_DEFAULT_SHEET_NAME = "Sheet1";
const MOA_TOKEN_PROPERTY = "MOA_DASHBOARD_TOKEN";
const MOA_SHEET_NAME_PROPERTY = "MOA_DASHBOARD_SHEET_NAME";

const MOA_DASHBOARD_HEADERS = [
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
  "Fase",
  "Parent ID",
  "CreatedBy"
];

/**
 * Optional helper: edit the token below, run this once, then deploy.
 * The same token must be saved in Vercel as GOOGLE_APPS_SCRIPT_TOKEN.
 */
function setupMoaDashboardToken() {
  PropertiesService.getScriptProperties().setProperty(
    MOA_TOKEN_PROPERTY,
    "PASTE_THE_SAME_LONG_RANDOM_TOKEN_HERE"
  );

  // Leave this as Sheet1 unless your tab has another exact name.
  PropertiesService.getScriptProperties().setProperty(
    MOA_SHEET_NAME_PROPERTY,
    MOA_DEFAULT_SHEET_NAME
  );
}

function doGet() {
  return json_({
    ok: true,
    service: "MOA Specialists Dashboard Apps Script API",
    message: "Use POST from the Vercel server API routes."
  });
}

function doPost(e) {
  try {
    const body = parseBody_(e);
    assertToken_(body.token);

    const action = String(body.action || "").trim();

    if (action === "ping") {
      return json_({ ok: true, message: "pong" });
    }

    if (action === "list") {
      return json_({ ok: true, data: listRows_() });
    }

    if (action === "getByMatch") {
      return json_({ ok: true, row: getRowByMatch_(body.matchColumn, body.matchValue) });
    }

    if (action === "create") {
      return json_(withLock_(function () {
        return createRow_(body.data || {});
      }));
    }

    if (action === "update") {
      return json_(withLock_(function () {
        return updateCell_(body.matchColumn, body.matchValue, body.key, body.value);
      }));
    }

    if (action === "delete") {
      return json_(withLock_(function () {
        return deleteRow_(body.matchColumn, body.matchValue);
      }));
    }

    throw httpError_("Unknown action: " + action, 400);
  } catch (err) {
    return json_({
      ok: false,
      status: err.status || 500,
      error: err.message || String(err)
    });
  }
}

function parseBody_(e) {
  const raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";

  try {
    return JSON.parse(raw);
  } catch (_) {
    throw httpError_("Invalid JSON body.", 400);
  }
}

function assertToken_(receivedToken) {
  const expectedToken = PropertiesService.getScriptProperties().getProperty(MOA_TOKEN_PROPERTY);

  if (!expectedToken || expectedToken === "PASTE_THE_SAME_LONG_RANDOM_TOKEN_HERE") {
    throw httpError_("MOA_DASHBOARD_TOKEN is not configured in Apps Script Script Properties.", 500);
  }

  if (String(receivedToken || "") !== expectedToken) {
    throw httpError_("Unauthorized Apps Script request.", 401);
  }
}

function listRows_() {
  const sheet = getSheet_();
  ensureDashboardHeaders_(sheet);

  const headers = getHeaders_(sheet);
  const lastRow = sheet.getLastRow();
  const lastColumn = headers.length;

  if (lastRow < 2 || lastColumn < 1) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, lastColumn).getDisplayValues();

  return values
    .map(function (rowValues) {
      return rowObjectFromValues_(headers, rowValues);
    })
    .filter(hasAnyValue_);
}

function getRowByMatch_(matchColumn, matchValue) {
  const sheet = getSheet_();
  ensureDashboardHeaders_(sheet);

  const headers = getHeaders_(sheet);
  const rowNumber = findRowNumberByMatch_(sheet, headers, matchColumn, matchValue);

  if (!rowNumber) return null;

  const values = sheet.getRange(rowNumber, 1, 1, headers.length).getDisplayValues()[0];
  return rowObjectFromValues_(headers, values);
}

function createRow_(data) {
  if (!data || typeof data !== "object") {
    throw httpError_("Missing or invalid data object.", 400);
  }

  const sheet = getSheet_();
  const headers = ensureDashboardHeaders_(sheet);
  const rowValues = headers.map(function (header) {
    return getDataValueForHeader_(data, header);
  });

  sheet.appendRow(rowValues);
  SpreadsheetApp.flush();

  return {
    ok: true,
    created: true,
    rowNumber: sheet.getLastRow()
  };
}

function updateCell_(matchColumn, matchValue, key, value) {
  if (!matchColumn || !matchValue || !key) {
    throw httpError_("Missing matchColumn, matchValue, or key.", 400);
  }

  const sheet = getSheet_();
  let headers = ensureDashboardHeaders_(sheet);
  const rowNumber = findRowNumberByMatch_(sheet, headers, matchColumn, matchValue);

  if (!rowNumber) {
    throw httpError_("Row not found.", 404);
  }

  headers = ensureHeaders_(sheet, [key]);
  const columnIndex = findHeaderIndex_(headers, key);

  if (columnIndex === -1) {
    throw httpError_("Column not found: " + key, 404);
  }

  sheet.getRange(rowNumber, columnIndex + 1).setValue(value == null ? "" : String(value));
  SpreadsheetApp.flush();

  const rowValues = sheet.getRange(rowNumber, 1, 1, headers.length).getDisplayValues()[0];

  return {
    ok: true,
    updated: true,
    rowNumber: rowNumber,
    row: rowObjectFromValues_(headers, rowValues)
  };
}

function deleteRow_(matchColumn, matchValue) {
  if (!matchColumn || !matchValue) {
    throw httpError_("Missing matchColumn or matchValue.", 400);
  }

  const sheet = getSheet_();
  const headers = ensureDashboardHeaders_(sheet);
  const rowNumber = findRowNumberByMatch_(sheet, headers, matchColumn, matchValue);

  if (!rowNumber) {
    throw httpError_("Row not found.", 404);
  }

  sheet.deleteRow(rowNumber);
  SpreadsheetApp.flush();

  return {
    ok: true,
    deleted: true,
    rowNumber: rowNumber
  };
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw httpError_("No active spreadsheet found. Create this Apps Script from Extensions > Apps Script inside the Google Sheet.", 500);
  }

  const configuredName = PropertiesService.getScriptProperties().getProperty(MOA_SHEET_NAME_PROPERTY);
  const sheetName = configuredName || MOA_DEFAULT_SHEET_NAME;
  const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.getSheets()[0];

  if (!sheet) {
    throw httpError_("No sheet tab found in this spreadsheet.", 500);
  }

  return sheet;
}

function getHeaders_(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  return sheet
    .getRange(1, 1, 1, lastColumn)
    .getDisplayValues()[0]
    .map(function (header) {
      return String(header || "").trim();
    });
}

function ensureDashboardHeaders_(sheet) {
  return ensureHeaders_(sheet, MOA_DASHBOARD_HEADERS);
}

function ensureHeaders_(sheet, requiredHeaders) {
  let headers = getHeaders_(sheet);
  const normalizedExisting = headers.map(normalizeHeader_);
  const missing = [];

  requiredHeaders.forEach(function (header) {
    if (normalizedExisting.indexOf(normalizeHeader_(header)) === -1) {
      missing.push(header);
      normalizedExisting.push(normalizeHeader_(header));
    }
  });

  if (missing.length) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    SpreadsheetApp.flush();
    headers = getHeaders_(sheet);
  }

  return headers;
}

function findRowNumberByMatch_(sheet, headers, matchColumn, matchValue) {
  const columnIndex = findHeaderIndex_(headers, matchColumn);

  if (columnIndex === -1) {
    throw httpError_("Match column not found: " + matchColumn, 404);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const target = String(matchValue == null ? "" : matchValue).trim();
  const values = sheet.getRange(2, columnIndex + 1, lastRow - 1, 1).getDisplayValues();

  for (let i = 0; i < values.length; i += 1) {
    const current = String(values[i][0] == null ? "" : values[i][0]).trim();
    if (current === target) return i + 2;
  }

  return null;
}

function findHeaderIndex_(headers, wantedHeader) {
  const wanted = normalizeHeader_(wantedHeader);

  for (let i = 0; i < headers.length; i += 1) {
    if (normalizeHeader_(headers[i]) === wanted) return i;
  }

  return -1;
}

function rowObjectFromValues_(headers, rowValues) {
  const row = {};

  headers.forEach(function (header, index) {
    if (!header) return;
    row[header] = rowValues[index] == null ? "" : String(rowValues[index]).trim();
  });

  return row;
}

function getDataValueForHeader_(data, header) {
  if (Object.prototype.hasOwnProperty.call(data, header)) {
    return data[header] == null ? "" : String(data[header]);
  }

  const wanted = normalizeHeader_(header);
  const keys = Object.keys(data || {});

  for (let i = 0; i < keys.length; i += 1) {
    if (normalizeHeader_(keys[i]) === wanted) {
      return data[keys[i]] == null ? "" : String(data[keys[i]]);
    }
  }

  return "";
}

function hasAnyValue_(row) {
  return Object.keys(row || {}).some(function (key) {
    return String(row[key] || "").trim() !== "";
  });
}

function normalizeHeader_(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function withLock_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);

  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function httpError_(message, status) {
  const err = new Error(message);
  err.status = status || 500;
  return err;
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
