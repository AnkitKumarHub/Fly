import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import {
  corsairAccounts,
  corsairEntities,
  corsairEvents,
  corsairIntegrations,
} from "../../db/schema.js";
import { createPluginAccountKeyManager } from "./corsair-km.js";
import {
  getIntegrationLinkStatus,
  markIntegrationDisconnected,
} from "./connection-state.js";
import { clearAccountTokens } from "./tokens.js";
import { stopWatchForPlugin } from "./watches.js";
import type { IntegrationPlugin } from "./types.js";

async function findAccountId(
  tenantId: string,
  plugin: IntegrationPlugin,
): Promise<string | null> {
  const rows = await db
    .select({ id: corsairAccounts.id })
    .from(corsairAccounts)
    .innerJoin(corsairIntegrations, eq(corsairAccounts.integrationId, corsairIntegrations.id))
    .where(and(eq(corsairAccounts.tenantId, tenantId), eq(corsairIntegrations.name, plugin)))
    .limit(1);

  return rows[0]?.id ?? null;
}

async function accountHasTokens(tenantId: string, plugin: IntegrationPlugin): Promise<boolean> {
  try {
    const accountKm = createPluginAccountKeyManager(tenantId, plugin);
    const [refreshToken, accessToken] = await Promise.all([
      accountKm.get_refresh_token(),
      accountKm.get_access_token(),
    ]);

    return !!(refreshToken || accessToken);
  } catch {
    return false;
  }
}

export async function hasActiveConnection(
  tenantId: string,
  plugin: IntegrationPlugin,
): Promise<boolean> {
  const linkStatus = await getIntegrationLinkStatus(tenantId, plugin);
  if (linkStatus === "disconnected") return false;

  const accountId = await findAccountId(tenantId, plugin);
  if (!accountId) return false;

  return accountHasTokens(tenantId, plugin);
}

export async function getConnectionStatus(tenantId: string) {
  const [gmail, googlecalendar] = await Promise.all([
    hasActiveConnection(tenantId, "gmail"),
    hasActiveConnection(tenantId, "googlecalendar"),
  ]);

  return { gmail, googlecalendar };
}

export async function disconnectIntegration(tenantId: string, plugin: IntegrationPlugin) {
  const accountId = await findAccountId(tenantId, plugin);
  if (!accountId) {
    await markIntegrationDisconnected(tenantId, plugin);
    return getConnectionStatus(tenantId);
  }

  await stopWatchForPlugin(tenantId, plugin);
  await clearAccountTokens(tenantId, plugin);

  await db.delete(corsairEntities).where(eq(corsairEntities.accountId, accountId));
  await db.delete(corsairEvents).where(eq(corsairEvents.accountId, accountId));

  await markIntegrationDisconnected(tenantId, plugin);

  return getConnectionStatus(tenantId);
}
