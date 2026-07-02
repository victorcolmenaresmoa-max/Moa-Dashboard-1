// api/data/index.js — GET all rows through the MOA Google Sheets Apps Script proxy
const { verifySession } = require("../../lib/session");
const { callAppsScript, sendAppsScriptError } = require("./_appsScriptClient");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await callAppsScript("list");
    return res.status(200).json(Array.isArray(result.data) ? result.data : []);
  } catch (err) {
    console.error("Data fetch error:", err);
    return sendAppsScriptError(res, err, "Internal server error");
  }
};
