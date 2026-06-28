// api/data/index.js  —  GET all rows (secure SheetDB proxy)
const { verifySession } = require("../../lib/session");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  try {
    const sheetRes = await fetch(process.env.SHEETDB_URL, {
      headers: { "Content-Type": "application/json" }
    });
    if (!sheetRes.ok) {
      const text = await sheetRes.text();
      return res.status(502).json({ error: "SheetDB error", detail: text });
    }
    const data = await sheetRes.json();
    return res.status(200).json(Array.isArray(data) ? data : data.data || []);
  } catch (err) {
    console.error("Data fetch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
