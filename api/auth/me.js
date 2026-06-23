// api/auth/me.js
// Returns the authenticated user's profile and role.
// Called by the frontend on page load to hydrate auth state.

import { verifySession } from "../../lib/session.js";

export default async function handler(req, res) {
  const session = await verifySession(req);

  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Return only the fields the client needs — never expose raw tokens
  return res.status(200).json({
    email:         session.email,
    name:          session.name,
    picture:       session.picture,
    role:          session.role,          // "admin" | "specialist"
    specialistKey: session.specialistKey  // e.g. "Victor Colmenares"
  });
}
