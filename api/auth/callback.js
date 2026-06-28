// api/auth/callback.js
// Handles the Google OAuth 2.0 callback, exchanges the code for tokens,
// validates the user, assigns their role, and sets a signed session cookie.

const { createSigner } = require("../../lib/session");

const GOOGLE_TOKEN_URL   = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

// Map Google Workspace email → exact column key in Google Sheets.
// ⚠️  Update these with the real emails of your team.
const EMAIL_TO_SPECIALIST_KEY = {
  "victor.colmenares@moaeducation.com":  "Victor Colmenares",
  "luis.sumoza@moaeducation.com":        "Dirección Académica",
  "roxangel.rodriguez@moaeducation.com": "Roxangel Rodriguez",
  "ailil.coutinho@moaeducation.com":     "Ailil Coutinho",
  "norilys.cermeno@moaeducation.com":    "Norilys Cermeño",
  "veronica.gonzales@moaeducation.com":  "Veronica Gonzales",
  "melisa.espinal@moaeducation.com":     "Melisa Espinal",
  "noryley.suescun@moaeducation.com":    "Noryley Suescun",
  "ninfa.vivas@moaeducation.com":        "Ninfa Vivas",
  "asdrubal.marquez@moaeducation.com":   "Asdrubal Marquez"
};

function getRoleForEmail(email) {
  const admins     = (process.env.ADMIN_EMAILS      || "").split(",").map(e => e.trim().toLowerCase());
  const specialists = (process.env.SPECIALIST_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const lc = email.toLowerCase();
  if (admins.includes(lc))      return "admin";
  if (specialists.includes(lc)) return "specialist";
  return null;
}

function getSpecialistKey(email) {
  return EMAIL_TO_SPECIALIST_KEY[email.toLowerCase()] || null;
}

module.exports = async function handler(req, res) {
  const { code, error } = req.query;

  if (error) return res.redirect(`/?auth_error=${encodeURIComponent(error)}`);
  if (!code)  return res.redirect("/?auth_error=missing_code");

  try {
    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
        grant_type:    "authorization_code"
      }).toString()
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      console.error("Token exchange failed:", body);
      return res.redirect("/?auth_error=token_exchange_failed");
    }

    const tokens = await tokenRes.json();

    // 2. Fetch user info
    const userInfoRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    if (!userInfoRes.ok) return res.redirect("/?auth_error=userinfo_failed");

    const { email, name, picture, hd } = await userInfoRes.json();

    // 3. Validate domain (optional)
    const allowedDomain = process.env.GOOGLE_ALLOWED_DOMAIN;
    if (allowedDomain && hd !== allowedDomain) {
      return res.redirect(`/?auth_error=unauthorized_domain&email=${encodeURIComponent(email)}`);
    }

    // 4. Determine role
    const role = getRoleForEmail(email);
    if (!role) {
      return res.redirect(`/?auth_error=not_in_team&email=${encodeURIComponent(email)}`);
    }

    // 5. Create signed session token
    const sessionToken = createSigner({
      email,
      name,
      picture,
      role,
      specialistKey: getSpecialistKey(email),
      iat: Date.now()
    });

    // 6. Set HTTP-only cookie
    const isProd  = process.env.NODE_ENV === "production";
    const maxAge  = 60 * 60 * 8; // 8 hours
    res.setHeader("Set-Cookie",
      `moa_session=${sessionToken}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Path=/${isProd ? "; Secure" : ""}`
    );

    return res.redirect("/");
  } catch (err) {
    console.error("Auth callback error:", err);
    return res.redirect("/?auth_error=server_error");
  }
};
