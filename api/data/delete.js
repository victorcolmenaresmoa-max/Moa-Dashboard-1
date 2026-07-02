// api/data/delete.js — DELETE row through the MOA Google Sheets Apps Script proxy
const { verifySession } = require("../../lib/session");
const { callAppsScript, sendAppsScriptError } = require("./_appsScriptClient");

module.exports = async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { matchColumn, matchValue } = req.body || {};
  if (!matchColumn || !matchValue) {
    return res.status(400).json({ error: "Missing matchColumn or matchValue" });
  }

  // Specialists may delete only tasks they created. Admins may delete any task.
  if (session.role !== "admin") {
    try {
      const check = await callAppsScript("getByMatch", { matchColumn, matchValue });
      const row = check.row;

      if (!row) {
        return res.status(404).json({ error: "Tarea no encontrada." });
      }

      const taskCreator = row["CreatedBy"];
      if (taskCreator !== session.email) {
        return res.status(403).json({ error: "Solo puedes eliminar las tareas que tú creaste." });
      }
    } catch (err) {
      console.error("Delete permission validation error:", err);
      return sendAppsScriptError(res, err, "Error validando permisos de eliminación.");
    }
  }

  try {
    const result = await callAppsScript("delete", { matchColumn, matchValue });
    return res.status(200).json({ deleted: true, ...result });
  } catch (err) {
    console.error("Delete error:", err);
    return sendAppsScriptError(res, err, "Internal server error");
  }
};
