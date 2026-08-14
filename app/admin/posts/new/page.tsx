"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import type { BlogPost } from "@/types";

function NewPostForm() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") ?? "blog") as BlogPost["type"];

  return (
    <PostEditor
      heading="New Post"
      saveUrl="/api/blog"
      saveMethod="POST"
      initial={{
        title: "",
        slug: "",
        type: initialType,
        tags: "",
        excerpt: "",
        content: "",
        published: false,
      }}
    />
  );
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "var(--text-muted)" }}>Loading…</div>}>
      <NewPostForm />
    </Suspense>
  );
}
