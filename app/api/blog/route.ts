import { NextRequest, NextResponse } from "next/server";
import { getAllPosts, createPost } from "@/lib/blog-db";
import type { BlogPost } from "@/types";

function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get("admin-token")?.value;
  const expected = btoa((process.env.ADMIN_PASSWORD ?? "admin123").trim());
  return token === expected;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const all = searchParams.get("all") === "1";

  if (all && !isAdmin(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const posts = await getAllPosts(all ? false : true);
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  let body: Omit<BlogPost, "id" | "createdAt" | "updatedAt">;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 });
  }

  if (!body.title || !body.slug || !body.type) {
    return NextResponse.json(
      { success: false, message: "title, slug, and type are required." },
      { status: 400 }
    );
  }

  try {
    const post = await createPost(body);
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("[/api/blog] POST error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create post." },
      { status: 500 }
    );
  }
}
