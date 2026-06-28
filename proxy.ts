import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function base64UrlEncode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const base64 = btoa(binary);
  return base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecodeToString(input: string) {
  const padded = input.replaceAll("-", "+").replaceAll("_", "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const finalInput = padded + "=".repeat(padLength);
  const binary = atob(finalInput);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function timingSafeEqualString(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function signHS256(signingInput: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signingInput)
  );
  return base64UrlEncode(sig);
}

async function verifySessionTokenEdge(token: string, secret: string) {
  const [encodedHeader, encodedPayload, signature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature) return { ok: false as const };

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expected = await signHS256(signingInput, secret);
  if (!timingSafeEqualString(signature, expected)) return { ok: false as const };

  let payload: { exp?: number } | null = null;
  try {
    payload = JSON.parse(base64UrlDecodeToString(encodedPayload)) as { exp?: number };
  } catch {
    return { ok: false as const };
  }

  if (!payload?.exp) return { ok: false as const };
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp <= nowSeconds) return { ok: false as const };

  return { ok: true as const };
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const cookieName = process.env.SESSION_COOKIE_NAME ?? "session";
  const secret = process.env.SESSION_SECRET ?? "";
  const token = req.cookies.get(cookieName)?.value ?? "";

  const valid =
    secret && token ? await verifySessionTokenEdge(token, secret) : { ok: false as const };

  if (valid.ok) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const next = `${pathname}${req.nextUrl.search}`;
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/console", "/console/:path*", "/api/admin/:path*", "/account", "/account/:path*", "/portfolio", "/portfolio/:path*"],
};

