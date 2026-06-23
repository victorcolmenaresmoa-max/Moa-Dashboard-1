// api/data/create.js
// Secure proxy: POST a new row to SheetDB.
// Any authenticated user may create tasks.

import { verifySession } from "../../lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await verifySession(req);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { data } = req.body;

  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "Missing or invalid data field" });
  }

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

    const result = await sheetRes.json();
    return res.status(200).json(result);
  } catch (err) {
    console.error("Create row error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
