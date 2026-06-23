// lib/session.js
// Stateless signed-session helpers using HMAC-SHA256 (Web Crypto API).
// No JWT library needed — runs in the Vercel Edge / Node runtime.
//
// Cookie format: base64url(payload) . base64url(HMAC-SHA256(base64url(payload)))

const SESSION_COOKIE = "moa_session";

// ─── Encoding helpers ────────────────────────────────────────────────────────
function b64Encode(str) {
  return Buffer.from(str).toString("base64url");
}

function b64Decode(str) {
  return Buffer.from(str, "base64url").toString("utf-8");
}

// ─── HMAC helpers ────────────────────────────────────────────────────────────
async function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is not set.");

  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signPayload(payload) {
  const key = await getKey();
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Buffer.from(sig).toString("base64url");
}

async function verifyPayload(payload, signature) {
  try {
    const key = await getKey();
    const enc = new TextEncoder();
    const sigBytes = Buffer.from(signature, "base64url");
    return await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
  } catch (_) {
    return false;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Serialises a plain object into a signed token string.
 * @param {object} data
 * @returns {Promise<string>}
 */
export async function createSigner(data) {
  const payload = b64Encode(JSON.stringify(data));
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
}

/**
 * Parses and verifies a token string.
 * Returns the payload object on success, null on any failure.
 * @param {string} token
 * @returns {Promise<object|null>}
 */
export async function verify(token) {
  if (!token || typeof token !== "string") return null;

  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const payload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  const valid = await verifyPayload(payload, signature);
  if (!valid) return null;

  try {
    const data = JSON.parse(b64Decode(payload));

    // Reject sessions older than 8 hours
    if (data.iat && Date.now() - data.iat > 8 * 60 * 60 * 1000) return null;

    return data;
  } catch (_) {
    return null;
  }
}

/**
 * Extracts and verifies the session from an incoming Vercel request.
 * Reads the HTTP-only cookie set during the OAuth callback.
 * @param {import('@vercel/node').VercelRequest} req
 * @returns {Promise<object|null>}
 */
export async function verifySession(req) {
  // Support both plain Node req (cookie header) and Vercel cookie parsing
  const cookieHeader = req.headers?.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map(c => {
      const [k, ...v] = c.trim().split("=");
      return [k.trim(), v.join("=").trim()];
    })
  );

  const token = cookies[SESSION_COOKIE] || req.cookies?.[SESSION_COOKIE];
  return verify(token);
}
