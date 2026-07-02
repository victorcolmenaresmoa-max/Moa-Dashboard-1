// api/data/update.js — PATCH one cell through the MOA Google Sheets Apps Script proxy
const { verifySession } = require("../../lib/session");
const { callAppsScript, sendAppsScriptError } = require("./_appsScriptClient");

const DEADLINE_KEYS = ["Deadline 1", "Deadline 2", "Deadline 3", "Deadline 4"];

function checkPermission({ session, key, value, taskSpecialists, taskCreator }) {
  const { role, specialistKey, email } = session;

  if (role === "admin") return { allowed: true };

  if (role === "specialist") {
    const isCreator = taskCreator === email;

    // Universal blocks for specialists, even on tasks they created.
    if (key === "Calidad" && value === "Revisado y aprobado") {
      return { allowed: false, reason: "Solo los administradores pueden marcar 'Revisado y aprobado'." };
    }
    if (key === "Fase" && value === "Aprobado / Finalizado") {
      return { allowed: false, reason: "Solo los administradores pueden marcar la fase 'Aprobado / Finalizado'." };
    }
    if (DEADLINE_KEYS.includes(key)) {
      return { allowed: false, reason: "Solo los administradores pueden modificar los Deadlines principales." };
    }

    // The creator may edit the rest of the task.
    if (isCreator) return { allowed: true };

    // Normal specialist permissions for tasks they did not create.
    if (specialistKey && key === specialistKey) return { allowed: true };

    if (key === "Estado" || key === "Fase") {
      const assigned = (taskSpecialists || "").split(",").map(s => s.trim().toLowerCase());
      const myName = (specialistKey || "").toLowerCase();
      const myEmail = (email || "").toLowerCase();

      if (assigned.includes(myName) || assigned.includes(myEmail)) return { allowed: true };

      const fieldLabel = key === "Fase" ? "el Timeline" : "el Estado";
      return { allowed: false, reason: `Solo puedes cambiar ${fieldLabel} en tareas donde estás asignado/a.` };
    }

    return { allowed: false, reason: "No puedes editar esta tarea porque no la creaste ni estás asignado." };
  }

  return { allowed: false, reason: "Rol desconocido." };
}

module.exports = async function handler(req, res) {
  if (req.method !== "PATCH") return res.status(405).json({ error: "Method not allowed" });

  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { matchColumn, matchValue, key, value } = req.body || {};
  if (!matchColumn || !matchValue || !key || value === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Never trust taskCreator/taskSpecialists from the browser. Read the current row from the sheet.
    const existing = await callAppsScript("getByMatch", { matchColumn, matchValue });
    const row = existing.row;

    if (!row) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    const permission = checkPermission({
      session,
      key,
      value,
      taskSpecialists: row["Specialists"] || "",
      taskCreator: row["CreatedBy"] || ""
    });

    if (!permission.allowed) {
      return res.status(403).json({ error: permission.reason });
    }

    const result = await callAppsScript("update", { matchColumn, matchValue, key, value });
    return res.status(200).json(result);
  } catch (err) {
    console.error("Update error:", err);
    return sendAppsScriptError(res, err, "Internal server error");
  }
};
