// api/auth/callback.js
// Handles the Google OAuth 2.0 callback, exchanges the code for tokens,
// validates the user belongs to MOA, assigns their role, and sets a signed
// session cookie.

import { createSigner } from "../../lib/session.js";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export default async function handler(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`/?auth_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect("/?auth_error=missing_code");
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
        grant_type: "authorization_code"
      })
    });

    if (!tokenRes.ok) {
      const errorBody = await tokenRes.text();
      console.error("Token exchange failed:", errorBody);
      return res.redirect("/?auth_error=token_exchange_failed");
    }

    const tokens = await tokenRes.json();

    // 2. Fetch user info from Google
    const userInfoRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    if (!userInfoRes.ok) {
      return res.redirect("/?auth_error=userinfo_failed");
    }

    const userInfo = await userInfoRes.json();
    const { email, name, picture, hd } = userInfo;

    // 3. Validate the user's Google Workspace domain
    const allowedDomain = process.env.GOOGLE_ALLOWED_DOMAIN;
    if (allowedDomain && hd !== allowedDomain) {
      return res.redirect(`/?auth_error=unauthorized_domain&email=${encodeURIComponent(email)}`);
    }

    // 4. Determine role based on email
    const role = getRoleForEmail(email);

    if (!role) {
      return res.redirect(`/?auth_error=not_in_team&email=${encodeURIComponent(email)}`);
    }

    // 5. Create a signed session token
    const sessionPayload = {
      email,
      name,
      picture,
      role,         // "admin" | "specialist"
      specialistKey: getSpecialistKey(email), // The column key in Google Sheets
      iat: Date.now()
    };

    const sessionToken = await createSigner(sessionPayload);

    // 6. Set a secure, HTTP-only cookie
    const isProd = process.env.NODE_ENV === "production";
    const maxAge = 60 * 60 * 8; // 8 hours

    res.setHeader("Set-Cookie", [
      `moa_session=${sessionToken}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Path=/${isProd ? "; Secure" : ""}`
    ]);

    return res.redirect("/");
  } catch (err) {
    console.error("Auth callback error:", err);
    return res.redirect("/?auth_error=server_error");
  }
}

/**
 * Returns the RBAC role for a given Google email.
 * Add or remove emails here as the team changes.
 */
function getRoleForEmail(email) {
  const admins = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const specialists = (process.env.SPECIALIST_EMAILS || "").split(",").map(e => e.trim().toLowerCase());

  const lc = email.toLowerCase();

  if (admins.includes(lc)) return "admin";
  if (specialists.includes(lc)) return "specialist";

  return null; // Not in team
}

/**
 * Maps a Google Workspace email to the corresponding column key in Google Sheets.
 * The key must exactly match the column header in the spreadsheet.
 */
function getSpecialistKey(email) {
  const map = {
    // Admins — map to their own columns too
    "victor.colmenares@moaeducation.com":  "Victor Colmenares",
    "luis.sumoza@moaeducation.com":        "Dirección Académica",
    // Specialists
    "roxangel.rodriguez@moaeducation.com": "Roxangel Rodriguez",
    "ailil.coutinho@moaeducation.com":     "Ailil Coutinho",
    "norilys.cermeno@moaeducation.com":    "Norilys Cermeño",
    "veronica.gonzales@moaeducation.com":  "Veronica Gonzales",
    "melisa.espinal@moaeducation.com":     "Melisa Espinal",
    "noryley.suescun@moaeducation.com":    "Noryley Suescun",
    "ninfa.vivas@moaeducation.com":        "Ninfa Vivas",
    "asdrubal.marquez@moaeducation.com":   "Asdrubal Marquez"
  };
  return map[email.toLowerCase()] || null;
}
