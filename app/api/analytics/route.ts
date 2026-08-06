import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

// Simple in-memory store - swap for a database or analytics service in production.
// This is intentionally minimal: for a real deployment use Plausible, Umami, or Vercel Analytics.
const pageViews = new Map<string, number>();
let totalViews = 0;

// The write path is deliberately unauthenticated. It is a browser beacon, so
// any secret it carried would be public anyway - and it used to gate on an
// x-analytics-secret header that AnalyticsBeacon never sends, meaning every
// page view 401'd whenever ANALYTICS_SECRET was set. Nothing identifying is
// stored: a path string and a counter, no IP, no cookie, no user agent.
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ views: number }>>> {
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

// The read path IS gated: it returns the whole traffic profile of the site,
// which is nobody's business but the owner's. Without ANALYTICS_SECRET set
// there is no way to authenticate the caller, so it stays closed.
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<{ total: number; pages: Record<string, number> }>>> {
  const secret = process.env.ANALYTICS_SECRET;
  if (!secret || req.headers.get("x-analytics-secret") !== secret) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: "OK",
    data: {
      total: totalViews,
      pages: Object.fromEntries(pageViews),
    },
  });
}
