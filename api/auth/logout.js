// api/auth/logout.js
module.exports = function handler(req, res) {
  res.setHeader("Set-Cookie", "moa_session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/");
  res.redirect("/?logged_out=1");
};
