import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, verifyPassword, TOKEN_MAX_AGE_SECONDS } from "@/lib/auth";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkLoginRateLimit(ip)) {
    return NextResponse.json(
      { success: false, message: "Too many attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 });
  }

  const input = body.password?.trim() ?? "";
  let valid = false;
  try {
    valid = verifyPassword(input);
  } catch {
    return NextResponse.json(
      { success: false, message: "Server misconfiguration." },
      { status: 503 }
    );
  }

  if (!valid) {
    return NextResponse.json({ success: false, message: "Invalid password." }, { status: 401 });
  }

  let token: string;
  try {
    token = createAdminToken();
  } catch {
    return NextResponse.json(
      { success: false, message: "Server misconfiguration." },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: TOKEN_MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}

export async function DELETE(_req: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return response;
}
