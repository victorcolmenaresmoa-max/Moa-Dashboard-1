// api/data/index.js
// Secure proxy for SheetDB: GET all rows.
// The SHEETDB_URL is never exposed to the browser.

import { verifySession } from "../../lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await verifySession(req);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const sheetRes = await fetch(process.env.SHEETDB_URL, {
      headers: { "Content-Type": "application/json" }
    });

    if (!sheetRes.ok) {
      const text = await sheetRes.text();
      console.error("SheetDB GET error:", text);
      return res.status(502).json({ error: "SheetDB error", detail: text });
    }

    const data = await sheetRes.json();
    return res.status(200).json(Array.isArray(data) ? data : data.data || []);
  } catch (err) {
    console.error("Data fetch error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
