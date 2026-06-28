// api/auth/login.js
// Redirects the browser to Google's OAuth 2.0 consent screen.

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

module.exports = function handler(req, res) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    ...(process.env.GOOGLE_ALLOWED_DOMAIN
      ? { hd: process.env.GOOGLE_ALLOWED_DOMAIN }
      : {})
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
};
