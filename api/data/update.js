// api/data/update.js
const { verifySession } = require("../../lib/session");

const DEADLINE_KEYS = ["Deadline 1", "Deadline 2", "Deadline 3", "Deadline 4"];

// Agregamos taskCreator a los parámetros
function checkPermission({ session, key, value, taskSpecialists, taskCreator }) {
  const { role, specialistKey, email } = session;

  if (role === "admin") return { allowed: true };

  if (role === "specialist") {
    // Verificamos si el usuario actual fue quien creó la tarea
    const isCreator = taskCreator === email;

    // Bloqueos universales para especialistas (incluso si la crearon)
    if (key === "Calidad" && value === "Revisado y aprobado") {
      return { allowed: false, reason: "Solo los administradores pueden marcar 'Revisado y aprobado'." };
    }
    if (key === "Fase" && value === "Aprobado / Finalizado") {
      return { allowed: false, reason: "Solo los administradores pueden marcar la fase 'Aprobado / Finalizado'." };
    }
    if (DEADLINE_KEYS.includes(key)) {
      return { allowed: false, reason: "Solo los administradores pueden modificar los Deadlines principales." };
    }

    // 👇 NUEVO: Si es el creador, tiene permiso para editar el resto de la tarea
    if (isCreator) return { allowed: true };

    // Lógica normal para tareas que NO creó:
    if (specialistKey && key === specialistKey) return { allowed: true };

    if (key === "Estado" || key === "Fase") {
      const assigned = (taskSpecialists || "").split(",").map(s => s.trim().toLowerCase());
      const myName   = (specialistKey || "").toLowerCase();
      const myEmail  = (email || "").toLowerCase();
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

  // 👇 Extraemos taskCreator del request
  const { matchColumn, matchValue, key, value, taskSpecialists, taskCreator } = req.body || {};
  if (!matchColumn || !matchValue || !key || value === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Pasamos taskCreator a la función de permisos
  const permission = checkPermission({ session, key, value, taskSpecialists: taskSpecialists || "", taskCreator });
  if (!permission.allowed) {
    return res.status(403).json({ error: permission.reason });
  }
// ... el resto sigue igual ...
  try {
    const url = `${process.env.SHEETDB_URL}/${encodeURIComponent(matchColumn)}/${encodeURIComponent(matchValue)}`;
    const sheetRes = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { [key]: value } })
    });
    if (!sheetRes.ok) {
      const text = await sheetRes.text();
      return res.status(502).json({ error: "SheetDB error", detail: text });
    }
    return res.status(200).json(await sheetRes.json());
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
