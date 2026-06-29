// api/data/create.js  —  POST new row (any authenticated user)
const { verifySession } = require("../../lib/session");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

// api/data/create.js
  const { data } = req.body || {};
  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "Missing or invalid data field" });
  }

  // 👇 NUEVO: Forzamos que el creador sea el email de la sesión actual
  data["CreatedBy"] = session.email;
  
  try {
    const sheetRes = await fetch(process.env.SHEETDB_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [data] })
    });
    if (!sheetRes.ok) {
      const text = await sheetRes.text();
      return res.status(502).json({ error: "SheetDB error", detail: text });
    }
    return res.status(200).json(await sheetRes.json());
  } catch (err) {
    console.error("Create row error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
