import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPostBySlug, getPostById, updatePost, deletePost } from "@/lib/blog-db";
import { isAdmin } from "@/lib/auth";
import { bodyTooLarge } from "@/lib/rate-limit";
import type { BlogPost } from "@/types";

// Generous next to the other routes: the body carries a whole post's markdown.
const MAX_POST_BYTES = 256 * 1024;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const admin = isAdmin(request);

  const postNotFound = () =>
    NextResponse.json({ success: false, message: "Post not found." }, { status: 404 });

  // Admin edits real rows, so resolve by id first; getPostBySlug would hand back
  // a bundled seed, and PUTting that back upserts a phantom row.
  let post = admin ? await getPostById(id) : null;
  if (!post) post = await getPostBySlug(id);

  if (!post) return postNotFound();
  if (admin && post.id.startsWith("seed-")) return postNotFound();
  // Drafts are admin-only, same rule the page route applies.
  if (!post.published && !admin) return postNotFound();

  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  if (bodyTooLarge(request, MAX_POST_BYTES)) {
    return NextResponse.json(
      { success: false, message: "Request body too large." },
      { status: 413 }
    );
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
