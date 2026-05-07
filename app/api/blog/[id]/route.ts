import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPostBySlug, getPostById, updatePost, deletePost } from "@/lib/blog-db";
import { isAdmin } from "@/lib/auth";
import type { BlogPost } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  let post = await getPostBySlug(id);
  if (!post) post = await getPostById(id);

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
    revalidatePath("/blog", "layout");
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
    revalidatePath("/blog", "layout");
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[/api/blog/[id]] DELETE error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete post." },
      { status: 500 }
    );
  }
}
