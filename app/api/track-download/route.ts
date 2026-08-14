import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { v4 as uuidv4 } from "uuid";

import { AVAILABLE_CVS, type CvEntry } from "@/lib/cv-config";
import { awsClientConfig, hasAwsCredentials } from "@/lib/aws";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

// This route is unauthenticated and every accepted call sends the owner an
// email, so without a limit it is a mail bomb and an unbounded write bill.
// Ten an hour is far above any real download pattern.
const checkDownloadRateLimit = createRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 });

type CvType = CvEntry["cvType"];

const CV_LABELS: Record<CvType, string> = {
  "ai-ml": "AI/ML Engineer",
  "data-scientist": "Data Scientist",
  "research-phd": "Research / PhD",
};

const VALID_CV_TYPES = AVAILABLE_CVS.map((cv) => cv.cvType);

function getDynamoClient(): DynamoDBDocumentClient {
  const dynamo = new DynamoDBClient(awsClientConfig());
  return DynamoDBDocumentClient.from(dynamo);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!checkDownloadRateLimit(clientIp(req))) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

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
  const awsConfigured = hasAwsCredentials();

  if (awsConfigured && table) {
    const dynamo = getDynamoClient();
    const userAgent = req.headers.get("user-agent") ?? "";
    const referrer = req.headers.get("referer") ?? "";

    const tasks: Promise<unknown>[] = [
      dynamo.send(
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
      ),
    ];

    // Optional SES email notification
    const sesEmail = process.env.SES_FROM_EMAIL;
    if (sesEmail) {
      const ses = new SESClient(awsClientConfig());
      tasks.push(
        ses.send(
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
      );
    }

    // Awaited rather than detached. Lambda freezes the execution environment the
    // moment the response is returned, so a fire-and-forget promise only lands by
    // luck - the notification mail was being lost. Failures stay non-fatal here:
    // the CV itself is a static file and the download must not depend on logging.
    for (const result of await Promise.allSettled(tasks)) {
      if (result.status === "rejected") {
        console.error("[/api/track-download] logging failed:", result.reason);
      }
    }
  }

  return NextResponse.json({ success: true });
}
