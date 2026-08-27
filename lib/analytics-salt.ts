import { createHash, randomBytes } from "node:crypto";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { analyticsTable, getAnalyticsDoc, isConditionalCheckFailed } from "./analytics-db";
import { MARKER_TTL_DAYS, saltKey, ttlAtMidnightPlusDays } from "./analytics-schema";

/**
 * The daily visitor salt.
 *
 * A visitor id is SHA-256(salt + ip + user agent). Two properties make that a
 * counting mechanism rather than a tracking one: the hash cannot be reversed
 * into an IP, and today's id cannot be joined to yesterday's because the salt
 * is replaced every day and the old one is deleted.
 *
 * The salt is RANDOM AND STORED, never derived from SESSION_SECRET. A derived
 * salt is never discarded, so anyone holding the secret could recompute any
 * past day's salt and re-identify the entire ninety-day event log from a list
 * of IP addresses; the IP-plus-user-agent search space is small enough to walk
 * exhaustively once the salt is known. Random-and-discarded is the whole reason
 * this can be done server side without a consent banner, which is why the salt
 * is worth a table item rather than a one-line HMAC.
 */

/**
 * Rotation is aligned to UTC midnight so it matches the rollup day boundary.
 * A salt rotating at any other hour would give one person two visitor ids
 * inside a single calendar day and inflate that day's unique count.
 */
const MAX_CACHED_DAYS = 3;

const cache = new Map<string, string>();

function remember(date: string, salt: string): string {
  cache.set(date, salt);
  // A warm Lambda holds the day's salt for the whole day, so steady-state salt
  // reads are roughly one round trip per instance per day.
  while (cache.size > MAX_CACHED_DAYS) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
  return salt;
}

async function readSalt(date: string): Promise<string | undefined> {
  const result = await getAnalyticsDoc().send(
    new GetCommand({
      TableName: analyticsTable(),
      Key: saltKey(date),
      // Load bearing. An eventually consistent read can miss a salt that was
      // just minted, which would cause a pointless losing mint on the first
      // path and can return undefined on the post-race path.
      ConsistentRead: true,
    })
  );
  const salt = result.Item?.salt;
  return typeof salt === "string" && salt.length > 0 ? salt : undefined;
}

/**
 * Lazy rotation, on the first write of a new day. There is no scheduler in this
 * stack and adding one for a single daily row would be disproportionate.
 *
 * Concurrency: a conditional PutItem is a single-item conditional write, which
 * DynamoDB serialises on the partition. Under N simultaneously cold Lambdas at
 * 00:00:00 exactly one Put succeeds and the rest read the winner's value. No
 * lock, no leader election, and no way to end up with two salts for one day.
 */
export async function getVisitorSalt(date: string): Promise<string> {
  const cached = cache.get(date);
  if (cached) return cached;

  const existing = await readSalt(date);
  if (existing) return remember(date, existing);

  const minted = randomBytes(32).toString("hex");
  try {
    await getAnalyticsDoc().send(
      new PutCommand({
        TableName: analyticsTable(),
        Item: {
          ...saltKey(date),
          salt: minted,
          createdAt: new Date().toISOString(),
          ttl: ttlAtMidnightPlusDays(date, MARKER_TTL_DAYS),
        },
        ConditionExpression: "attribute_not_exists(#pk)",
        ExpressionAttributeNames: { "#pk": "pk" },
      })
    );
    return remember(date, minted);
  } catch (err) {
    if (!isConditionalCheckFailed(err)) throw err;
    const winner = await readSalt(date);
    if (!winner) {
      // Only reachable if the winning item was deleted between the failed
      // condition and this read, which in practice means the table is being
      // tampered with. Failing loudly beats hashing with a salt nobody else used.
      throw new Error(`analytics salt for ${date} vanished after a lost mint race`);
    }
    return remember(date, winner);
  }
}

/**
 * 128 bits, which is collision free by orders of magnitude at any volume this
 * site will see, and saves 32 bytes on every event row.
 *
 * The IP and user agent are used here and then discarded. Neither is stored on
 * any row, so the hash has no preimage anywhere in the table.
 */
export function computeVisitorId(ip: string, userAgent: string, salt: string): string {
  return createHash("sha256").update(`${salt}|${ip}|${userAgent}`).digest("hex").slice(0, 32);
}

/** Test seam. Not used by application code. */
export function __resetSaltCache(): void {
  cache.clear();
}
