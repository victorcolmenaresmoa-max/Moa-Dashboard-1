// api/data/update.js  —  PATCH a cell (RBAC enforced server-side)
const { verifySession } = require("../../lib/session");

const DEADLINE_KEYS = ["Deadline 1", "Deadline 2", "Deadline 3", "Deadline 4"];

function checkPermission({ session, key, value, taskSpecialists }) {
  const { role, specialistKey, email } = session;

  if (role === "admin") return { allowed: true };

  if (role === "specialist") {
    // Block "Revisado y aprobado" for specialists
    if (key === "Calidad" && value === "Revisado y aprobado") {
      return { allowed: false, reason: "Solo los administradores pueden marcar 'Revisado y aprobado'." };
    }
    // Block Deadline columns
    if (DEADLINE_KEYS.includes(key)) {
      return { allowed: false, reason: "Solo los administradores pueden modificar los Deadlines principales." };
    }
    // Allow editing own specialist note column
    if (specialistKey && key === specialistKey) return { allowed: true };

    // Allow changing Estado only on assigned tasks
    if (key === "Estado") {
      const assigned = (taskSpecialists || "").split(",").map(s => s.trim().toLowerCase());
      const myName   = (specialistKey || "").toLowerCase();
      const myEmail  = (email || "").toLowerCase();
      if (assigned.includes(myName) || assigned.includes(myEmail)) return { allowed: true };
      return { allowed: false, reason: "Solo puedes cambiar el Estado en tareas donde estás asignado/a." };
    }

    return { allowed: false, reason: "No tienes permiso para editar este campo." };
  }

  return { allowed: false, reason: "Rol desconocido." };
}

module.exports = async function handler(req, res) {
  if (req.method !== "PATCH") return res.status(405).json({ error: "Method not allowed" });

  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { matchColumn, matchValue, key, value, taskSpecialists } = req.body || {};
  if (!matchColumn || !matchValue || !key || value === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const permission = checkPermission({ session, key, value, taskSpecialists: taskSpecialists || "" });
  if (!permission.allowed) {
    return res.status(403).json({ error: permission.reason });
  }

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
