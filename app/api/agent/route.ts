import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { AGENT_SYSTEM_PROMPT } from "@/lib/agent-system-prompt";
import { GUARD_REFUSAL, isInjectionAttempt, leaksSystemPrompt } from "@/lib/agent-guard";
import { awsClientConfig, hasAwsCredentials } from "@/lib/aws";
import { bodyTooLarge, clientIp, createRateLimiter } from "@/lib/rate-limit";

/**
 * Groq retires models without notice: llama-3.1-8b-instant disappeared from the
 * account entirely, every request 404'd, and the route surfaced only a generic
 * "failed to get a response" while the real reason sat in CloudWatch. Reading
 * the name from the environment makes the next retirement a Console edit rather
 * than a deploy.
 *
 * gpt-oss-120b replaced it: same latency as the 20b on this workload, and the
 * larger model holds the guard rails better, which matters because the system
 * prompt is written for one that cannot be trusted to hold them alone.
 */
const GROQ_MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";

// Per-IP rate limit: 20 requests/hour. Resets on cold start - acceptable
// for a portfolio agent since abuse cost is primarily GROQ quota, not data.
const checkRateLimit = createRateLimiter({ limit: 20, windowMs: 60 * 60 * 1000 });

let dynamoClient: DynamoDBDocumentClient | null = null;
function getDynamoClient(): DynamoDBDocumentClient {
  if (!dynamoClient) {
    const dynamo = new DynamoDBClient(awsClientConfig());
    dynamoClient = DynamoDBDocumentClient.from(dynamo);
  }
  return dynamoClient;
}

export async function POST(req: NextRequest) {
  if (!checkRateLimit(clientIp(req))) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  if (bodyTooLarge(req)) {
    return NextResponse.json({ error: "Request body too large." }, { status: 413 });
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
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message is required." }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json(
      { error: "Message too long (max 2000 characters)." },
      { status: 400 }
    );
  }
  if (!Array.isArray(history)) history = [];
  history = history
    .filter(
      (m): m is { role: string; content: string } =>
        m != null &&
        typeof m === "object" &&
        typeof (m as { role?: unknown }).role === "string" &&
        typeof (m as { content?: unknown }).content === "string"
    )
    // User turns only. An assistant turn is client-supplied too, so accepting
    // one lets a caller put words in the model's own mouth, which steers an 8B
    // model far harder than any instruction phrased as a user turn.
    .filter((m) => m.role === "user")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-20);
  if (sessionId.length > 128) sessionId = sessionId.slice(0, 128);

  // Refuse known injection phrasings before spending a Groq call on them. The
  // model does not reliably hold the line on its own - see lib/agent-guard.ts.
  // History has to be checked as well as the new message, or the payload just
  // moves into a prior turn and rides through untouched.
  if (isInjectionAttempt(message) || history.some((m) => isInjectionAttempt(m.content))) {
    console.warn("[/api/agent] Blocked injection attempt:", message.slice(0, 120));
    return NextResponse.json({ response: GUARD_REFUSAL });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json(
      { error: "Agent not configured. Please contact Hammad directly." },
      { status: 503 }
    );
  }

  const groqMessages = [
    { role: "system", content: AGENT_SYSTEM_PROMPT },
    ...history,
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
        model: GROQ_MODEL,
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
        { status: 500 }
      );
    }

    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    text = data.choices?.[0]?.message?.content ?? "";

    // Last line of defence: a phrasing the input filter did not anticipate can
    // still walk the model into reciting its instructions. Drop the whole reply.
    if (leaksSystemPrompt(text)) {
      console.warn("[/api/agent] Response leaked system prompt; replaced with refusal.");
      text = GUARD_REFUSAL;
    }
  } catch (err) {
    console.error("[/api/agent] Fetch error:", err);
    return NextResponse.json(
      { error: "Failed to get a response. Please try again." },
      { status: 500 }
    );
  }

  const table = process.env.DYNAMODB_AGENT_TABLE;
  if (table && hasAwsCredentials()) {
    // Awaited, not detached: Lambda freezes the moment the response returns, so
    // a fire-and-forget write lands only by luck. Non-fatal - the user already
    // has their answer and this is analytics.
    try {
      await getDynamoClient().send(
        new PutCommand({
          TableName: table,
          Item: {
            id: uuidv4(),
            sessionId,
            timestamp: new Date().toISOString(),
            userQuestion: message,
            agentResponse: text.slice(0, 200),
          },
        })
      );
    } catch (e) {
      console.error("[/api/agent] DynamoDB log failed:", e);
    }
  }

  return NextResponse.json({ response: text });
}
