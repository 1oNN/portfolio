import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

// Simple in-memory store — swap for a database or analytics service in production.
// This is intentionally minimal: for a real deployment use Plausible, Umami, or Vercel Analytics.
const pageViews = new Map<string, number>();
let totalViews = 0;

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ views: number }>>> {
  const secret = req.headers.get("x-analytics-secret");
  if (process.env.ANALYTICS_SECRET && secret !== process.env.ANALYTICS_SECRET) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  let page = "/";
  try {
    const body = await req.json();
    page = typeof body.page === "string" ? body.page : "/";
  } catch {
    // Default to root if body is unparseable
  }

  const current = pageViews.get(page) ?? 0;
  pageViews.set(page, current + 1);
  totalViews++;

  return NextResponse.json({
    success: true,
    message: "Tracked.",
    data: { views: pageViews.get(page) ?? 1 },
  });
}

export async function GET(): Promise<NextResponse<ApiResponse<{ total: number; pages: Record<string, number> }>>> {
  return NextResponse.json({
    success: true,
    message: "OK",
    data: {
      total: totalViews,
      pages: Object.fromEntries(pageViews),
    },
  });
}
