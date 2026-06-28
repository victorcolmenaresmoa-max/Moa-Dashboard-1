// api/auth/me.js
const { verifySession } = require("../../lib/session");

module.exports = async function handler(req, res) {
  const session = verifySession(req);

  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  return res.status(200).json({
    email:         session.email,
    name:          session.name,
    picture:       session.picture,
    role:          session.role,
    specialistKey: session.specialistKey
  });
};
