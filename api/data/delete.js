// api/data/delete.js
const { verifySession } = require("../../lib/session");

module.exports = async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { matchColumn, matchValue } = req.body || {};
  if (!matchColumn || !matchValue) {
    return res.status(400).json({ error: "Missing matchColumn or matchValue" });
  }

  // 👇 NUEVO: Validar propiedad para los especialistas
  if (session.role !== "admin") {
    try {
      const checkUrl = `${process.env.SHEETDB_URL}/search?${encodeURIComponent(matchColumn)}=${encodeURIComponent(matchValue)}`;
      const checkRes = await fetch(checkUrl);
      const checkData = await checkRes.json();

      if (!checkData || checkData.length === 0) {
        return res.status(404).json({ error: "Tarea no encontrada." });
      }

      const taskCreator = checkData[0]["CreatedBy"];
      if (taskCreator !== session.email) {
        return res.status(403).json({ error: "Solo puedes eliminar las tareas que tú creaste." });
      }
    } catch (err) {
      return res.status(500).json({ error: "Error validando permisos de eliminación." });
    }
  }

  try {
    const url = `${process.env.SHEETDB_URL}/${encodeURIComponent(matchColumn)}/${encodeURIComponent(matchValue)}`;
    const sheetRes = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });
    if (!sheetRes.ok) {
      const text = await sheetRes.text();
      return res.status(502).json({ error: "SheetDB error", detail: text });
    }
    return res.status(200).json({ deleted: true });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
