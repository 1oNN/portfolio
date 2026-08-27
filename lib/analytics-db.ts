import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { awsClientConfig, hasAwsCredentials } from "./aws";

/**
 * Client construction and the configured check for the analytics table.
 *
 * Kept apart from analytics-read.ts and analytics-write.ts so that the pure
 * modules (schema, normalize, stats, select) never transitively import the AWS
 * SDK and stay testable without it.
 */

/**
 * No default table name, unlike DYNAMODB_BLOG_TABLE.
 *
 * A default silently writes to a table that does not exist and throws on every
 * beacon. Unset meaning "the subsystem is off" fails visibly in one place
 * instead of noisily on every request.
 *
 * Remember this name also has to appear in the env grep in amplify.yml. Amplify
 * Console variables exist at build time only and the SSR Lambda does not
 * inherit them, so a variable set in the Console but missing from that grep
 * reads as undefined in production while looking perfectly correct.
 */
export const ANALYTICS_TABLE = process.env.DYNAMODB_ANALYTICS_TABLE;

export function isAnalyticsConfigured(): boolean {
  return hasAwsCredentials() && !!ANALYTICS_TABLE;
}

/**
 * The table name, for the call sites that have already checked configuration.
 * Throws rather than returning a placeholder, because a placeholder would turn
 * a configuration mistake into a silent write to nowhere.
 */
export function analyticsTable(): string {
  if (!ANALYTICS_TABLE) throw new Error("DYNAMODB_ANALYTICS_TABLE is not set");
  return ANALYTICS_TABLE;
}

let documentClient: DynamoDBDocumentClient | null = null;

export function getAnalyticsDoc(): DynamoDBDocumentClient {
  if (!documentClient) {
    const dynamo = new DynamoDBClient(awsClientConfig());
    documentClient = DynamoDBDocumentClient.from(dynamo, {
      // Undefined attributes are dropped rather than rejected, so an optional
      // field like referrerHost can simply be absent on an event row.
      marshallOptions: { removeUndefinedValues: true },
    });
  }
  return documentClient;
}

export function errName(err: unknown): string {
  if (!err || typeof err !== "object") return "";
  const e = err as { name?: string; __type?: string };
  return e.__type ?? e.name ?? "";
}

export function isConditionalCheckFailed(err: unknown): boolean {
  return errName(err).includes("ConditionalCheckFailedException");
}

export function isAuthError(err: unknown): boolean {
  const name = errName(err);
  return (
    name.includes("UnrecognizedClientException") ||
    name.includes("InvalidSignatureException") ||
    name.includes("AuthFailure") ||
    name.includes("AccessDenied")
  );
}

/**
 * Analytics deliberately has no local JSON fallback, unlike lib/blog-db.ts.
 *
 * An append-only log with atomic counters and conditional writes has no honest
 * file-backed equivalent. A fallback would be a second code path with different
 * semantics that silently diverges from the real one and is never exercised in
 * production. Unconfigured means no-op, logged once, and the dashboard says so.
 * To develop against real data, point DYNAMODB_ANALYTICS_TABLE at a scratch
 * table.
 */
let warnedUnconfigured = false;

export function warnUnconfiguredOnce(where: string): void {
  if (warnedUnconfigured) return;
  warnedUnconfigured = true;
  console.info(
    `[${where}] analytics is not configured (DYNAMODB_ANALYTICS_TABLE or AWS credentials missing); skipping.`
  );
}
