// api/auth/logout.js
// Clears the session cookie and redirects to the login screen.

export default function handler(req, res) {
  res.setHeader("Set-Cookie", "moa_session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/");
  res.redirect("/?logged_out=1");
}
