import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { v4 as uuidv4 } from "uuid";

import { AVAILABLE_CVS, type CvEntry } from "@/lib/cv-config";

type CvType = CvEntry["cvType"];

const CV_LABELS: Record<CvType, string> = {
  "ai-ml": "AI/ML Engineer",
  "data-scientist": "Data Scientist",
  "research-phd": "Research / PhD",
};

const VALID_CV_TYPES = AVAILABLE_CVS.map((cv) => cv.cvType);

// Credentials come from the SDK's default chain - see the note in
// app/api/contact/route.ts on why the explicit key pair cannot work in the
// Amplify SSR Lambda (temporary credentials need AWS_SESSION_TOKEN too).
function getDynamoClient(): DynamoDBDocumentClient {
  const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION ?? "eu-west-2" });
  return DynamoDBDocumentClient.from(dynamo);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let cvType: CvType;

  try {
    const body = await req.json();
    cvType = body.cvType as CvType;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!VALID_CV_TYPES.includes(cvType)) {
    return NextResponse.json({ error: "Invalid cvType." }, { status: 400 });
  }

  const table = process.env.DYNAMODB_DOWNLOADS_TABLE;
  const awsConfigured = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

  if (awsConfigured && table) {
    const dynamo = getDynamoClient();
    const userAgent = req.headers.get("user-agent") ?? "";
    const referrer = req.headers.get("referer") ?? "";

    // Log download - fire-and-forget
    dynamo
      .send(
        new PutCommand({
          TableName: table,
          Item: {
            id: uuidv4(),
            cvType,
            timestamp: new Date().toISOString(),
            userAgent,
            referrer,
          },
        })
      )
      .catch((e) => console.error("[/api/track-download] DynamoDB log failed:", e));

    // Optional SES email notification - fire-and-forget
    const sesEmail = process.env.SES_FROM_EMAIL;
    if (sesEmail) {
      const ses = new SESClient({ region: process.env.AWS_REGION ?? "eu-west-2" });

      ses
        .send(
          new SendEmailCommand({
            Source: sesEmail,
            Destination: { ToAddresses: [process.env.CONTACT_TO_EMAIL ?? sesEmail] },
            Message: {
              Subject: {
                Data: `[Portfolio] CV downloaded: ${CV_LABELS[cvType]}`,
                Charset: "UTF-8",
              },
              Body: {
                Text: {
                  Data: `Someone downloaded your ${CV_LABELS[cvType]} CV.\n\nTimestamp: ${new Date().toISOString()}\nReferrer: ${referrer || "direct"}`,
                  Charset: "UTF-8",
                },
              },
            },
          })
        )
        .catch((e) => console.error("[/api/track-download] SES notify failed:", e));
    }
  }

  return NextResponse.json({ success: true });
}
