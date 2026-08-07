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
import { SEED_POSTS } from "./seed-posts";

const TABLE_NAME = process.env.DYNAMODB_BLOG_TABLE ?? "portfolio-blog";
const LOCAL_FILE = path.join(process.cwd(), "data", "blog-posts.json");

function byCreatedAtDesc(a: BlogPost, b: BlogPost): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

/**
 * Merge bundled seed posts into a PUBLISHED result. Only runs when
 * `publishedOnly` is true - the admin path (`publishedOnly === false`) is
 * returned untouched, so admin never sees seeds. A real DB/local post always
 * wins on a slug collision (that's the owner's override path).
 */
function withSeeds(posts: BlogPost[], publishedOnly: boolean): BlogPost[] {
  if (!publishedOnly) return posts;
  const dbSlugs = new Set(posts.map((p) => p.slug));
  const seeds = SEED_POSTS.filter((s) => s.published && !dbSlugs.has(s.slug));
  if (seeds.length === 0) return posts;
  return [...posts, ...seeds].sort(byCreatedAtDesc);
}

function isDynamoConfigured(): boolean {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function isAuthError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const name = (err as { name?: string; __type?: string }).__type ?? (err as { name?: string }).name ?? "";
  return (
    name.includes("UnrecognizedClientException") ||
    name.includes("InvalidSignatureException") ||
    name.includes("AuthFailure") ||
    name.includes("AccessDenied")
  );
}

let dynamoClient: DynamoDBDocumentClient | null = null;
function getDynamo(): DynamoDBDocumentClient {
  if (!dynamoClient) {
    // Credentials come from the SDK's default chain - see the note in
    // app/api/contact/route.ts on why the explicit key pair cannot work in the
    // Amplify SSR Lambda (temporary credentials need AWS_SESSION_TOKEN too).
    const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION ?? "eu-west-2" });
    dynamoClient = DynamoDBDocumentClient.from(dynamo);
  }
  return dynamoClient;
}

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

function shouldUseLocalFallback(operation: string): boolean {
  if (isProduction()) {
    console.error(
      `[blog-db] ${operation}: DynamoDB not configured in production - returning empty result`
    );
    return false;
  }
  return true;
}

export async function getAllPosts(publishedOnly = false): Promise<BlogPost[]> {
  if (!isDynamoConfigured()) {
    if (!shouldUseLocalFallback("getAllPosts")) return withSeeds([], publishedOnly);
    const posts = readLocal();
    const filtered = publishedOnly ? posts.filter((p) => p.published) : posts;
    return withSeeds(filtered.sort(byCreatedAtDesc), publishedOnly);
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
    return withSeeds(items.sort(byCreatedAtDesc), publishedOnly);
  } catch (err) {
    if (isAuthError(err)) {
      console.warn("[blog-db] AWS credentials invalid - using local fallback");
      if (isProduction()) return withSeeds([], publishedOnly);
      const posts = readLocal();
      const filtered = publishedOnly ? posts.filter((p) => p.published) : posts;
      return withSeeds(filtered.sort(byCreatedAtDesc), publishedOnly);
    }
    console.error("[blog-db] getAllPosts error:", err);
    return withSeeds([], publishedOnly);
  }
}

// Rule: an unpublished DB/local hit falls back to a same-slug published seed (so a listed seed link never 404s); a published hit still wins over the seed immediately.
function resolveSlugHit(hit: BlogPost | undefined, seed: () => BlogPost | null): BlogPost | null {
  if (hit && !hit.published) return seed() ?? hit;
  return hit ?? seed();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const seed = (): BlogPost | null => SEED_POSTS.find((p) => p.slug === slug) ?? null;

  if (!isDynamoConfigured()) {
    if (!shouldUseLocalFallback("getPostBySlug")) return seed();
    return resolveSlugHit(readLocal().find((p) => p.slug === slug), seed);
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
    return resolveSlugHit(((result.Items ?? []) as BlogPost[])[0], seed);
  } catch (err) {
    if (isAuthError(err)) {
      if (isProduction()) return seed();
      return readLocal().find((p) => p.slug === slug) ?? seed();
    }
    console.error("[blog-db] getPostBySlug error:", err);
    return seed();
  }
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  if (!isDynamoConfigured()) {
    if (!shouldUseLocalFallback("getPostById")) return null;
    return readLocal().find((p) => p.id === id) ?? null;
  }

  try {
    const result = await getDynamo().send(
      new GetCommand({ TableName: TABLE_NAME, Key: { id } })
    );
    return (result.Item as BlogPost) ?? null;
  } catch (err) {
    if (isAuthError(err)) {
      if (isProduction()) return null;
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
    if (isProduction()) throw new Error("DynamoDB is required to create posts in production");
    const posts = readLocal();
    posts.unshift(post);
    writeLocal(posts);
    return post;
  }

  try {
    await getDynamo().send(new PutCommand({ TableName: TABLE_NAME, Item: post }));
  } catch (err) {
    if (isAuthError(err)) {
      if (isProduction()) throw new Error("DynamoDB credentials invalid in production");
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
    if (isProduction()) throw new Error("DynamoDB is required to update posts in production");
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
      if (isProduction()) throw new Error("DynamoDB credentials invalid in production");
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
    if (isProduction()) throw new Error("DynamoDB is required to delete posts in production");
    writeLocal(readLocal().filter((p) => p.id !== id));
    return;
  }

  try {
    await getDynamo().send(
      new DeleteCommand({ TableName: TABLE_NAME, Key: { id } })
    );
  } catch (err) {
    if (isAuthError(err)) {
      if (isProduction()) throw new Error("DynamoDB credentials invalid in production");
      writeLocal(readLocal().filter((p) => p.id !== id));
      return;
    }
    throw err;
  }
}
