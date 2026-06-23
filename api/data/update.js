// api/data/update.js
// Secure proxy: PATCH a cell in SheetDB.
// RBAC is enforced server-side — clients cannot bypass it.
//
// RBAC rules:
//   admin    → can edit any field except "Calidad" = "Revisado y aprobado"
//              which only admins can set; also only admins can change Deadline 1-4.
//   specialist → can only edit:
//                  (a) Their own specialist-note column (always)
//                  (b) "Estado" — only on tasks where they are listed in "Specialists"

import { verifySession } from "../../lib/session.js";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map(e => e.trim().toLowerCase());

const DEADLINE_KEYS = ["Deadline 1", "Deadline 2", "Deadline 3", "Deadline 4"];

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await verifySession(req);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { matchColumn, matchValue, key, value, taskSpecialists } = req.body;

  if (!matchColumn || !matchValue || !key || value === undefined) {
    return res.status(400).json({ error: "Missing required fields: matchColumn, matchValue, key, value" });
  }

  // ─── RBAC enforcement ──────────────────────────────────────────────────────
  const permission = checkPermission({
    session,
    key,
    value,
    taskSpecialists: taskSpecialists || ""
  });

  if (!permission.allowed) {
    return res.status(403).json({ error: permission.reason });
  }

  // ─── Forward to SheetDB ────────────────────────────────────────────────────
  try {
    const sheetRes = await fetch(
      `${process.env.SHEETDB_URL}/${encodeURIComponent(matchColumn)}/${encodeURIComponent(matchValue)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { [key]: value } })
      }
    );

    if (!sheetRes.ok) {
      const text = await sheetRes.text();
      return res.status(502).json({ error: "SheetDB error", detail: text });
    }

    const result = await sheetRes.json();
    return res.status(200).json(result);
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Core RBAC logic.
 * Returns { allowed: boolean, reason?: string }
 */
function checkPermission({ session, key, value, taskSpecialists }) {
  const { role, email, specialistKey } = session;

  // ── Admin rules ─────────────────────────────────────────────────────────
  if (role === "admin") {
    // Only admins can set Calidad to "Revisado y aprobado"
    if (key === "Calidad" && value === "Revisado y aprobado") {
      return { allowed: true };
    }

    // Only admins can modify Deadline columns
    if (DEADLINE_KEYS.includes(key)) {
      return { allowed: true };
    }

    // Admins can edit anything else
    return { allowed: true };
  }

  // ── Specialist rules ─────────────────────────────────────────────────────
  if (role === "specialist") {
    // Rule 1: Block setting Calidad to "Revisado y aprobado"
    if (key === "Calidad" && value === "Revisado y aprobado") {
      return {
        allowed: false,
        reason: "Solo los administradores pueden marcar una tarea como 'Revisado y aprobado'."
      };
    }

    // Rule 2: Block changing Deadline columns
    if (DEADLINE_KEYS.includes(key)) {
      return {
        allowed: false,
        reason: "Solo los administradores pueden modificar los Deadlines principales."
      };
    }

    // Rule 3: Specialist can always edit their own note column
    if (specialistKey && key === specialistKey) {
      return { allowed: true };
    }

    // Rule 4: Specialist can change Estado only on tasks they are assigned to
    if (key === "Estado") {
      const assignedNames = (taskSpecialists || "")
        .split(",")
        .map(s => s.trim().toLowerCase());

      const myName = (specialistKey || "").toLowerCase();
      const myEmail = (email || "").toLowerCase();

      if (assignedNames.includes(myName) || assignedNames.includes(myEmail)) {
        return { allowed: true };
      }

      return {
        allowed: false,
        reason: "Solo puedes cambiar el Estado de las tareas en las que estás asignado/a."
      };
    }

    // All other fields: not allowed for specialists
    return {
      allowed: false,
      reason: "No tienes permiso para editar este campo."
    };
  }

  return { allowed: false, reason: "Rol desconocido." };
}
