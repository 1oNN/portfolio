import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllPosts, createPost } from "@/lib/blog-db";
import { isAdmin } from "@/lib/auth";
import { bodyTooLarge } from "@/lib/rate-limit";
import type { BlogPost } from "@/types";

// Generous next to the other routes: the body carries a whole post's markdown.
const MAX_POST_BYTES = 256 * 1024;

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

  if (bodyTooLarge(request, MAX_POST_BYTES)) {
    return NextResponse.json(
      { success: false, message: "Request body too large." },
      { status: 413 }
    );
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
    revalidatePath("/blog", "layout");
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("[/api/blog] POST error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create post." },
      { status: 500 }
    );
  }
}
