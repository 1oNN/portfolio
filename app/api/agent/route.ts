import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { AGENT_SYSTEM_PROMPT } from "@/lib/agent-system-prompt";

// Simple in-memory rate limiter: max 20 requests per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 20) return false;
  entry.count += 1;
  return true;
}

function getDynamoClient(): DynamoDBDocumentClient {
  const dynamo = new DynamoDBClient({
    region: process.env.AWS_REGION ?? "eu-west-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  return DynamoDBDocumentClient.from(dynamo);
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 },
    );
  }

  let message: string;
  let history: { role: string; content: string }[];
  let sessionId: string;

  try {
    const body = await req.json();
    message = body.message;
    history = body.history ?? [];
    sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { error: "message is required." },
      { status: 400 },
    );
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json(
      { error: "Agent not configured. Please contact Hammad directly." },
      { status: 503 },
    );
  }

  const groqMessages = [
    { role: "system", content: AGENT_SYSTEM_PROMPT },
    ...history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  let text = "";

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 500,
        temperature: 0.3,
        messages: groqMessages,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[/api/agent] Groq error:", res.status, errBody);
      return NextResponse.json(
        { error: "Failed to get a response. Please try again." },
        { status: 500 },
      );
    }

    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    text = data.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    console.error("[/api/agent] Fetch error:", err);
    return NextResponse.json(
      { error: "Failed to get a response. Please try again." },
      { status: 500 },
    );
  }

  // Log to DynamoDB — fire-and-forget
  const table = process.env.DYNAMODB_AGENT_TABLE;
  if (
    table &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  ) {
    getDynamoClient()
      .send(
        new PutCommand({
          TableName: table,
          Item: {
            id: uuidv4(),
            sessionId,
            timestamp: new Date().toISOString(),
            userQuestion: message,
            agentResponse: text.slice(0, 200),
          },
        }),
      )
      .catch((e) => console.error("[/api/agent] DynamoDB log failed:", e));
  }

  return NextResponse.json({ response: text });
}
