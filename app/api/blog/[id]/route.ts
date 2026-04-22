import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug, getPostById, updatePost, deletePost } from "@/lib/blog-db";
import type { BlogPost } from "@/types";

function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get("admin-token")?.value;
  const expected = btoa((process.env.ADMIN_PASSWORD ?? "admin123").trim());
  return token === expected;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  // Try slug first, then id
  let post = await getPostBySlug(id);
  if (!post) {
    post = await getPostById(id);
  }

  if (!post) {
    return NextResponse.json({ success: false, message: "Post not found." }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  let body: Partial<BlogPost>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON." }, { status: 400 });
  }

  try {
    const updated = await updatePost(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[/api/blog/[id]] PUT error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update post." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deletePost(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[/api/blog/[id]] DELETE error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete post." },
      { status: 500 }
    );
  }
}
