import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import type { ApiResponse } from "@/types";
import { awsClientConfig } from "@/lib/aws";

const contactAttempts = new Map<string, { count: number; resetAt: number }>();

function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = contactAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    contactAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count += 1;
  return true;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(str: string): string {
  return str.replace(/[<>"&']/g, (c) => {
    const map: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "&": "&amp;",
      "'": "&#x27;",
    };
    return map[c] ?? c;
  });
}

// Region and credentials both come from lib/aws.ts - see the note there.
function getSESClient(): SESClient {
  return new SESClient(awsClientConfig());
}

function getDynamoClient(): DynamoDBDocumentClient {
  const dynamo = new DynamoDBClient(awsClientConfig());
  return DynamoDBDocumentClient.from(dynamo);
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkContactRateLimit(ip)) {
    return NextResponse.json(
      { success: false, message: "Too many messages. Please try again later." },
      { status: 429 }
    );
  }

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

  if (body.honeypot) {
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
  const safeEmail = sanitize(email);
  const safeSubject = sanitize(subject);
  const safeMessage = sanitize(message);

  // Gate on the app's own config, not on AWS_ACCESS_KEY_ID. Credential
  // resolution is the SDK's job now, and the presence of that variable says
  // nothing about whether the resulting credentials can actually sign.
  const awsConfigured = !!process.env.SES_FROM_EMAIL;

  if (awsConfigured) {
    const ses = getSESClient();
    // Source must stay an SES-verified identity; delivery target can differ.
    const fromEmail = process.env.SES_FROM_EMAIL!;
    const toEmail = process.env.CONTACT_TO_EMAIL ?? fromEmail;

    try {
      await ses.send(
        new SendEmailCommand({
          Source: fromEmail,
          Destination: { ToAddresses: [toEmail] },
          ReplyToAddresses: [`${safeName} <${safeEmail}>`],
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
                    <h2 style="color:#1d4ed8;margin:0 0 16px;">New portfolio message</h2>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                      <tr>
                        <td style="padding:6px 0;font-weight:600;width:80px;color:#3f5473;">From</td>
                        <td style="padding:6px 0;">${safeName} &lt;${safeEmail}&gt;</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-weight:600;color:#3f5473;">Subject</td>
                        <td style="padding:6px 0;">${safeSubject}</td>
                      </tr>
                    </table>
                    <div style="background:#f9fafc;border-radius:8px;padding:16px;color:#0e1f38;line-height:1.6;">
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
      // `errName`, not `name` - the outer `name` is the sender's name and is
      // still needed below for the DynamoDB record. The name identifies the
      // failure mode: CredentialsProviderError means no credentials resolved,
      // AccessDenied means the IAM user lacks ses:SendEmail, and MessageRejected
      // means an address in the send is not a verified SES identity IN THE
      // REGION BEING CALLED - identities do not replicate across regions, and
      // in the SES sandbox the recipient must be verified as well as the sender.
      //
      // All of that detail stays in CloudWatch rather than the response body:
      // the exception name, the region and the refused address are useful to
      // the owner and to nobody else.
      const errName = (err as { name?: string })?.name ?? "Unknown";
      console.error(
        `[/api/contact] SES send failed [${errName}] in ${awsClientConfig().region}:`,
        err
      );
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            success: false,
            message: "Failed to send your message. Please try again later.",
          },
          { status: 500 }
        );
      }
      console.warn("[/api/contact] Dev mode: SES failure ignored; treating as success.");
    }

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
  } else if (process.env.NODE_ENV === "production") {
    // Never report success we cannot back. A production deploy missing its AWS
    // credentials used to return "Message sent successfully" while silently
    // dropping the message, which is the worst possible failure mode here: the
    // sender believes they have made contact and nobody ever sees it.
    console.error(
      `[/api/contact] SES_FROM_EMAIL unset in production (region ${awsClientConfig().region}) - message dropped.`
    );
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send your message. Please try again later.",
      },
      { status: 500 }
    );
  } else {
    console.info("[/api/contact] AWS not configured - email not sent (dev).");
  }

  return NextResponse.json({ success: true, message: "Message sent successfully." });
}
