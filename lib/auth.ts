import { createHmac, timingSafeEqual, randomBytes } from "crypto";
import type { NextRequest } from "next/server";

const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const TOKEN_MAX_AGE_SECONDS = TOKEN_MAX_AGE_MS / 1000;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createAdminToken(): string {
  const issuedAt = Date.now().toString();
  const nonce = randomBytes(16).toString("hex");
  const payload = `${issuedAt}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [issuedAt, nonce, sig] = parts;
    if (!/^\d+$/.test(issuedAt) || !/^[0-9a-f]+$/.test(nonce) || !/^[0-9a-f]+$/.test(sig)) {
      return false;
    }
    const expected = sign(`${issuedAt}.${nonce}`);
    if (sig.length !== expected.length) return false;
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expectedBuf.length) return false;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return false;
    const issuedAtMs = parseInt(issuedAt, 10);
    if (!Number.isFinite(issuedAtMs) || Date.now() - issuedAtMs > TOKEN_MAX_AGE_MS) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get("admin-token")?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD is not set");
  const a = Buffer.from(input.trim());
  const b = Buffer.from(expected.trim());
  if (a.length !== b.length) {
    const dummy = Buffer.alloc(b.length);
    timingSafeEqual(dummy, dummy);
    return false;
  }
  return timingSafeEqual(a, b);
}
