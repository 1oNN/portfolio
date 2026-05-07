import { NextRequest, NextResponse } from "next/server";

const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

async function sign(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function verifyToken(token: string, secret: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [issuedAt, nonce, sig] = parts;
  if (!/^\d+$/.test(issuedAt) || !/^[0-9a-f]+$/.test(nonce) || !/^[0-9a-f]+$/.test(sig)) {
    return false;
  }
  const expected = await sign(secret, `${issuedAt}.${nonce}`);
  if (!timingSafeEqualHex(sig, expected)) return false;
  const issuedAtMs = parseInt(issuedAt, 10);
  if (!Number.isFinite(issuedAtMs) || Date.now() - issuedAtMs > TOKEN_MAX_AGE_MS) {
    return false;
  }
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("admin-token")?.value;
    const secret = process.env.SESSION_SECRET;
    if (!token || !secret) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (!(await verifyToken(token, secret))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
