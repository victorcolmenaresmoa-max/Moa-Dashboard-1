// api/data/delete.js  —  DELETE a row (admins only)
const { verifySession } = require("../../lib/session");

module.exports = async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  if (session.role !== "admin") {
    return res.status(403).json({ error: "Solo los administradores pueden eliminar tareas." });
  }

  const { matchColumn, matchValue } = req.body || {};
  if (!matchColumn || !matchValue) {
    return res.status(400).json({ error: "Missing matchColumn or matchValue" });
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
