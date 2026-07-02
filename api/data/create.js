// api/data/create.js — POST new row through the MOA Google Sheets Apps Script proxy
const { verifySession } = require("../../lib/session");
const { callAppsScript, sendAppsScriptError } = require("./_appsScriptClient");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { data } = req.body || {};
  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "Missing or invalid data field" });
  }

  // Force ownership from the authenticated session, never from the browser payload.
  data["CreatedBy"] = session.email;

  try {
    const result = await callAppsScript("create", { data });
    return res.status(200).json(result);
  } catch (err) {
    console.error("Create row error:", err);
    return sendAppsScriptError(res, err, "Internal server error");
  }
};
