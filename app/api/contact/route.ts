import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import type { ApiResponse } from "@/types";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(str: string): string {
  return str.replace(/[<>"&]/g, (c) => {
    const map: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "&": "&amp;",
    };
    return map[c] ?? c;
  });
}

function getSESClient(): SESClient {
  return new SESClient({
    region: process.env.AWS_REGION ?? "eu-west-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
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

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { success: false, message: "Content-Type must be application/json." },
      { status: 415 }
    );
  }

  let body: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    honeypot?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  // Honeypot — bots fill this hidden field; real users don't
  if (body.honeypot) {
    // Return success to fool bots without processing
    return NextResponse.json({ success: true, message: "Message received." });
  }

  const { name, email, subject, message } = body;

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json(
      { success: false, message: "All fields are required." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { success: false, message: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  if (message.trim().length < 10) {
    return NextResponse.json(
      { success: false, message: "Message must be at least 10 characters." },
      { status: 400 }
    );
  }

  if (name.length > 100 || subject.length > 200 || message.length > 4000) {
    return NextResponse.json(
      { success: false, message: "One or more fields exceed the maximum allowed length." },
      { status: 400 }
    );
  }

  const safeName = sanitize(name);
  const safeSubject = sanitize(subject);
  const safeMessage = sanitize(message);

  // Send via SES if configured
  const awsConfigured =
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.SES_FROM_EMAIL;

  if (awsConfigured) {
    const ses = getSESClient();
    const toEmail = process.env.SES_FROM_EMAIL!;

    try {
      await ses.send(
        new SendEmailCommand({
          Source: toEmail,
          Destination: { ToAddresses: [toEmail] },
          ReplyToAddresses: [`${safeName} <${email}>`],
          Message: {
            Subject: {
              Data: `[Portfolio] ${safeSubject}`,
              Charset: "UTF-8",
            },
            Body: {
              Text: {
                Data: `From: ${name} <${email}>\n\nSubject: ${subject}\n\n${message}`,
                Charset: "UTF-8",
              },
              Html: {
                Data: `
                  <div style="font-family:system-ui,sans-serif;max-width:600px;padding:24px;">
                    <h2 style="color:#6366f1;margin:0 0 16px;">New portfolio message</h2>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                      <tr>
                        <td style="padding:6px 0;font-weight:600;width:80px;color:#475569;">From</td>
                        <td style="padding:6px 0;">${safeName} &lt;${email}&gt;</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-weight:600;color:#475569;">Subject</td>
                        <td style="padding:6px 0;">${safeSubject}</td>
                      </tr>
                    </table>
                    <div style="background:#f8fafc;border-radius:8px;padding:16px;color:#334155;line-height:1.6;">
                      ${safeMessage.replace(/\n/g, "<br/>")}
                    </div>
                  </div>
                `,
                Charset: "UTF-8",
              },
            },
          },
        })
      );
    } catch (err) {
      console.error("[/api/contact] SES send failed:", err);
      return NextResponse.json(
        { success: false, message: "Failed to send your message. Please try again later." },
        { status: 500 }
      );
    }

    // Log to DynamoDB — fire-and-forget
    const table = process.env.DYNAMODB_CONTACTS_TABLE;
    if (table) {
      const dynamo = getDynamoClient();
      dynamo
        .send(
          new PutCommand({
            TableName: table,
            Item: {
              id: uuidv4(),
              name,
              email,
              subject,
              message,
              timestamp: new Date().toISOString(),
            },
          })
        )
        .catch((e) => console.error("[/api/contact] DynamoDB log failed:", e));
    }
  } else {
    console.info("[/api/contact] AWS not configured — skipping email send.", {
      name,
      email,
      subject,
    });
  }

  return NextResponse.json({ success: true, message: "Message sent successfully." });
}
