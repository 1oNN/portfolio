import fs from "fs";
import path from "path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import type { BlogPost } from "@/types";

// ── Storage mode ──────────────────────────────────────────────────
// If AWS credentials are present → DynamoDB
// Otherwise → local JSON file (dev fallback)

const TABLE_NAME = process.env.DYNAMODB_BLOG_TABLE ?? "portfolio-blog";
const LOCAL_FILE = path.join(process.cwd(), "data", "blog-posts.json");

function isDynamoConfigured(): boolean {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

function isAuthError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const name = (err as { name?: string; __type?: string }).__type ?? (err as { name?: string }).name ?? "";
  return name.includes("UnrecognizedClientException") ||
    name.includes("InvalidSignatureException") ||
    name.includes("AuthFailure") ||
    name.includes("AccessDenied");
}

function getDynamo(): DynamoDBDocumentClient {
  const dynamo = new DynamoDBClient({
    region: process.env.AWS_REGION ?? "eu-west-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  return DynamoDBDocumentClient.from(dynamo);
}

// ── Local JSON helpers ────────────────────────────────────────────
function readLocal(): BlogPost[] {
  try {
    const dir = path.dirname(LOCAL_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(LOCAL_FILE)) return [];
    return JSON.parse(fs.readFileSync(LOCAL_FILE, "utf-8")) as BlogPost[];
  } catch {
    return [];
  }
}

function writeLocal(posts: BlogPost[]): void {
  const dir = path.dirname(LOCAL_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(posts, null, 2), "utf-8");
}

// ── Public API ────────────────────────────────────────────────────

export async function getAllPosts(publishedOnly = false): Promise<BlogPost[]> {
  if (!isDynamoConfigured()) {
    const posts = readLocal();
    const filtered = publishedOnly ? posts.filter((p) => p.published) : posts;
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  try {
    const result = await getDynamo().send(
      new ScanCommand({
        TableName: TABLE_NAME,
        ...(publishedOnly
          ? {
              FilterExpression: "#pub = :true",
              ExpressionAttributeNames: { "#pub": "published" },
              ExpressionAttributeValues: { ":true": true },
            }
          : {}),
      })
    );
    const items = (result.Items ?? []) as BlogPost[];
    return items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    if (isAuthError(err)) {
      console.warn("[blog-db] AWS credentials invalid — using local fallback");
      const posts = readLocal();
      const filtered = publishedOnly ? posts.filter((p) => p.published) : posts;
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    console.error("[blog-db] getAllPosts error:", err);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isDynamoConfigured()) {
    return readLocal().find((p) => p.slug === slug) ?? null;
  }

  try {
    const result = await getDynamo().send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "#slug = :slug",
        ExpressionAttributeNames: { "#slug": "slug" },
        ExpressionAttributeValues: { ":slug": slug },
      })
    );
    return ((result.Items ?? []) as BlogPost[])[0] ?? null;
  } catch (err) {
    if (isAuthError(err)) {
      console.warn("[blog-db] AWS credentials invalid — using local fallback");
      return readLocal().find((p) => p.slug === slug) ?? null;
    }
    console.error("[blog-db] getPostBySlug error:", err);
    return null;
  }
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  if (!isDynamoConfigured()) {
    return readLocal().find((p) => p.id === id) ?? null;
  }

  try {
    const result = await getDynamo().send(
      new GetCommand({ TableName: TABLE_NAME, Key: { id } })
    );
    return (result.Item as BlogPost) ?? null;
  } catch (err) {
    if (isAuthError(err)) {
      console.warn("[blog-db] AWS credentials invalid — using local fallback");
      return readLocal().find((p) => p.id === id) ?? null;
    }
    console.error("[blog-db] getPostById error:", err);
    return null;
  }
}

export async function createPost(
  data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">
): Promise<BlogPost> {
  const now = new Date().toISOString();
  const post: BlogPost = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };

  if (!isDynamoConfigured()) {
    const posts = readLocal();
    posts.unshift(post);
    writeLocal(posts);
    return post;
  }

  try {
    await getDynamo().send(new PutCommand({ TableName: TABLE_NAME, Item: post }));
  } catch (err) {
    if (isAuthError(err)) {
      console.warn("[blog-db] AWS credentials invalid — using local fallback");
      const posts = readLocal();
      posts.unshift(post);
      writeLocal(posts);
      return post;
    }
    throw err;
  }
  return post;
}

export async function updatePost(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
  const now = new Date().toISOString();

  if (!isDynamoConfigured()) {
    const posts = readLocal();
    const idx = posts.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Post not found");
    posts[idx] = { ...posts[idx], ...data, id, updatedAt: now };
    writeLocal(posts);
    return posts[idx];
  }

  const updates = { ...data, updatedAt: now };
  delete updates.id;

  const keys = Object.keys(updates);
  const ExpressionAttributeNames: Record<string, string> = {};
  const ExpressionAttributeValues: Record<string, unknown> = {};
  const setParts: string[] = [];

  for (const k of keys) {
    ExpressionAttributeNames[`#${k}`] = k;
    ExpressionAttributeValues[`:${k}`] = updates[k as keyof typeof updates];
    setParts.push(`#${k} = :${k}`);
  }

  try {
    const result = await getDynamo().send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${setParts.join(", ")}`,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
    );
    return result.Attributes as BlogPost;
  } catch (err) {
    if (isAuthError(err)) {
      console.warn("[blog-db] AWS credentials invalid — using local fallback");
      const posts = readLocal();
      const idx = posts.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("Post not found");
      posts[idx] = { ...posts[idx], ...data, id, updatedAt: now };
      writeLocal(posts);
      return posts[idx];
    }
    throw err;
  }
}

export async function deletePost(id: string): Promise<void> {
  if (!isDynamoConfigured()) {
    const posts = readLocal().filter((p) => p.id !== id);
    writeLocal(posts);
    return;
  }

  try {
    await getDynamo().send(
      new DeleteCommand({ TableName: TABLE_NAME, Key: { id } })
    );
  } catch (err) {
    if (isAuthError(err)) {
      console.warn("[blog-db] AWS credentials invalid — using local fallback");
      writeLocal(readLocal().filter((p) => p.id !== id));
      return;
    }
    throw err;
  }
}
