import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { integrationConnectionsTable } from "../../db/auth-schema.js";
import type { IntegrationPlugin } from "./types.js";

type ConnectionStatus = "active" | "disconnected";

export async function getIntegrationLinkStatus(
  userId: string,
  plugin: IntegrationPlugin,
): Promise<ConnectionStatus | null> {
  const [row] = await db
    .select({ status: integrationConnectionsTable.status })
    .from(integrationConnectionsTable)
    .where(
      and(
        eq(integrationConnectionsTable.userId, userId),
        eq(integrationConnectionsTable.plugin, plugin),
      ),
    )
    .limit(1);

  if (!row) return null;
  return row.status as ConnectionStatus;
}

export async function markIntegrationActive(userId: string, plugin: IntegrationPlugin) {
  await db
    .insert(integrationConnectionsTable)
    .values({
      userId,
      plugin,
      status: "active",
      disconnectedAt: null,
    })
    .onConflictDoUpdate({
      target: [integrationConnectionsTable.userId, integrationConnectionsTable.plugin],
      set: {
        status: "active",
        disconnectedAt: null,
        updatedAt: new Date(),
      },
    });
}

export async function markIntegrationDisconnected(userId: string, plugin: IntegrationPlugin) {
  await db
    .insert(integrationConnectionsTable)
    .values({
      userId,
      plugin,
      status: "disconnected",
      disconnectedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [integrationConnectionsTable.userId, integrationConnectionsTable.plugin],
      set: {
        status: "disconnected",
        disconnectedAt: new Date(),
        updatedAt: new Date(),
      },
    });
}
