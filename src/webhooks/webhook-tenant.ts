import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { usersTable } from "../db/auth-schema.js";

export function gmailPubSubEmailFromBody(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;

  const data = (body as { message?: { data?: string } }).message?.data;
  if (!data) return undefined;

  try {
    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf8")) as {
      emailAddress?: string;
    };
    return decoded.emailAddress;
  } catch {
    return undefined;
  }
}

/** Gmail Pub/Sub has no ?tenantId=; Calendar pushes include it in the watch URL. */
export async function resolveWebhookTenantId(
  queryTenantId: string | undefined,
  body: unknown,
): Promise<string | undefined> {
  if (queryTenantId) return queryTenantId;

  const email = gmailPubSubEmailFromBody(body);
  if (!email) return undefined;

  const [user] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  return user?.id;
}
