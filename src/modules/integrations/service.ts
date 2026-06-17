import { and, eq, inArray } from "drizzle-orm";

import { db } from "../../db/index.js";
import { corsairAccounts, corsairIntegrations } from "../../db/schema.js";

export async function hasActiveConnection(tenantId: string, plugin: string): Promise<boolean> {
  const rows = await db
    .select({ id: corsairAccounts.id })
    .from(corsairAccounts)
    .innerJoin(corsairIntegrations, eq(corsairAccounts.integrationId, corsairIntegrations.id))
    .where(and(eq(corsairAccounts.tenantId, tenantId), eq(corsairIntegrations.name, plugin)))
    .limit(1);

  return rows.length > 0;
}

export async function getConnectionStatus(tenantId: string) {
  const rows = await db
    .select({ name: corsairIntegrations.name })
    .from(corsairAccounts)
    .innerJoin(corsairIntegrations, eq(corsairAccounts.integrationId, corsairIntegrations.id))
    .where(
      and(
        eq(corsairAccounts.tenantId, tenantId),
        inArray(corsairIntegrations.name, ["gmail", "googlecalendar"]),
      ),
    );

  const connected = new Set(rows.map((row) => row.name));

  return {
    gmail: connected.has("gmail"),
    googlecalendar: connected.has("googlecalendar"),
  };
}
