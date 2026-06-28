// lib/session.js
// Stateless signed-session helpers using HMAC-SHA256 (built-in Node crypto).
// CommonJS — no external dependencies.

const crypto = require("crypto");

const SESSION_COOKIE = "moa_session";
const MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is not set.");
  return secret;
}

function b64Encode(str) {
  return Buffer.from(str, "utf8").toString("base64url");
}

function b64Decode(str) {
  return Buffer.from(str, "base64url").toString("utf8");
}

function sign(payload) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

/**
 * Serialises a plain object into a signed token string.
 * @param {object} data
 * @returns {string}
 */
function createSigner(data) {
  const payload = b64Encode(JSON.stringify(data));
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

/**
 * Parses and verifies a token string.
 * Returns the payload object on success, null on any failure.
 * @param {string} token
 * @returns {object|null}
 */
function verify(token) {
  if (!token || typeof token !== "string") return null;

  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const payload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  // Constant-time comparison to prevent timing attacks
  const expected = sign(payload);
  if (expected.length !== signature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;

  try {
    const data = JSON.parse(b64Decode(payload));
    if (data.iat && Date.now() - data.iat > MAX_AGE_MS) return null;
    return data;
  } catch (_) {
    return null;
  }
}

/**
 * Extracts and verifies the session from an incoming Vercel request.
 * @param {import('@vercel/node').VercelRequest} req
 * @returns {object|null}
 */
function verifySession(req) {
  const cookieHeader = req.headers?.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map(c => {
      const [k, ...v] = c.trim().split("=");
      return [k.trim(), v.join("=").trim()];
    })
  );
  const token = cookies[SESSION_COOKIE] || (req.cookies && req.cookies[SESSION_COOKIE]);
  return verify(token);
}

module.exports = { createSigner, verify, verifySession };
