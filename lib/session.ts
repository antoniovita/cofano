import crypto from "node:crypto";

export type SessionUser = {
  id: string;
  username: string;
};

function base64UrlEncode(input: string | Buffer): string {
  const buffer = typeof input === "string" ? Buffer.from(input) : input;
  return buffer
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecodeToString(input: string): string {
  const padded = input.replaceAll("-", "+").replaceAll("_", "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const finalInput = padded + "=".repeat(padLength);
  return Buffer.from(finalInput, "base64").toString("utf8");
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing SESSION_SECRET env var");
  }
  return secret;
}

function sign(data: string): string {
  const secret = getSessionSecret();
  return base64UrlEncode(crypto.createHmac("sha256", secret).update(data).digest());
}

type JwtHeader = {
  alg: "HS256";
  typ: "JWT";
};

type JwtPayload = {
  sub: string;
  username: string;
  iat: number;
  exp: number;
};

export function createSessionToken(
  user: SessionUser,
  options?: { ttlSeconds?: number; nowMs?: number }
): string {
  const ttlSeconds = options?.ttlSeconds ?? 60 * 60 * 24 * 7; // 7 days
  const nowMs = options?.nowMs ?? Date.now();
  const iat = Math.floor(nowMs / 1000);
  const exp = Math.floor((nowMs + ttlSeconds * 1000) / 1000);

  const header: JwtHeader = { alg: "HS256", typ: "JWT" };
  const payload: JwtPayload = {
    sub: user.id,
    username: user.username,
    iat,
    exp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = sign(signingInput);
  return `${signingInput}.${signature}`;
}

export function verifySessionToken(
  token: string,
  options?: { nowMs?: number }
): { ok: true; user: SessionUser } | { ok: false; reason: string } {
  const [encodedHeader, encodedPayload, signature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature) {
    return { ok: false, reason: "malformed" };
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = sign(signingInput);
  if (!timingSafeEqual(signature, expectedSignature)) {
    return { ok: false, reason: "bad_signature" };
  }

  let header: JwtHeader;
  try {
    header = JSON.parse(base64UrlDecodeToString(encodedHeader)) as JwtHeader;
  } catch {
    return { ok: false, reason: "bad_header" };
  }
  if (!header || header.alg !== "HS256" || header.typ !== "JWT") {
    return { ok: false, reason: "bad_header" };
  }

  let payload: JwtPayload;
  try {
    payload = JSON.parse(base64UrlDecodeToString(encodedPayload)) as JwtPayload;
  } catch {
    return { ok: false, reason: "bad_payload" };
  }

  if (!payload?.sub || !payload.username || !payload.exp || !payload.iat) {
    return { ok: false, reason: "missing_fields" };
  }

  const nowMs = options?.nowMs ?? Date.now();
  const nowSeconds = Math.floor(nowMs / 1000);
  if (payload.exp <= nowSeconds) return { ok: false, reason: "expired" };

  return {
    ok: true,
    user: { id: payload.sub, username: payload.username },
  };
}
