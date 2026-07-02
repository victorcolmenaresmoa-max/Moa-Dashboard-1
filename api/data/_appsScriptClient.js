// api/data/_appsScriptClient.js
// Server-side helper for the MOA Dashboard Google Sheets Apps Script API.
// This replaces SheetDB. Credentials stay in Vercel environment variables.

class AppsScriptError extends Error {
  constructor(message, status = 502, detail = null) {
    super(message);
    this.name = "AppsScriptError";
    this.status = status;
    this.detail = detail;
  }
}

function getConfig() {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL;
  const token = process.env.GOOGLE_APPS_SCRIPT_TOKEN;

  if (!url) {
    throw new AppsScriptError("GOOGLE_APPS_SCRIPT_URL environment variable is not set.", 500);
  }

  if (!token) {
    throw new AppsScriptError("GOOGLE_APPS_SCRIPT_TOKEN environment variable is not set.", 500);
  }

  return { url, token };
}

async function callAppsScript(action, payload = {}) {
  const { url, token } = getConfig();

  let response;
  let text;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        // Apps Script receives this through e.postData.contents.
        // text/plain avoids unnecessary browser preflight if this is ever reused client-side.
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({ token, action, ...payload })
    });

    text = await response.text();
  } catch (err) {
    throw new AppsScriptError("Could not reach Google Apps Script.", 502, err.message);
  }

  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (_) {
    throw new AppsScriptError("Google Apps Script returned a non-JSON response.", 502, text);
  }

  if (!response.ok) {
    throw new AppsScriptError("Google Apps Script HTTP error.", response.status, json);
  }

  if (json && json.ok === false) {
    throw new AppsScriptError(json.error || "Google Apps Script API error.", json.status || 502, json);
  }

  return json;
}

function sendAppsScriptError(res, err, fallbackMessage = "Google Sheets API error") {
  const status = Number(err && err.status) || 500;
  return res.status(status >= 400 && status < 600 ? status : 500).json({
    error: err && err.message ? err.message : fallbackMessage,
    detail: err && err.detail ? err.detail : undefined
  });
}

module.exports = { callAppsScript, sendAppsScriptError, AppsScriptError };
