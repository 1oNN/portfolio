import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 });
  }

  const expected = (process.env.ADMIN_PASSWORD ?? "admin123").trim();
  if (body.password?.trim() !== expected) {
    return NextResponse.json({ success: false, message: "Invalid password." }, { status: 401 });
  }

  const token = btoa(expected); // expected is already trimmed above
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin-token", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 86400 * 7,
    path: "/",
  });
  return response;
}

export async function DELETE(_req: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin-token", "", {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return response;
}
