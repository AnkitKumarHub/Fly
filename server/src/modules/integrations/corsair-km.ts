import { createAccountKeyManager, createIntegrationKeyManager } from "corsair/core";
import { createCorsairDatabase } from "corsair/db";

import { env } from "../../config/env.js";
import { pool } from "../../db/index.js";
import type { IntegrationPlugin } from "./types.js";

const GMAIL_ACCOUNT_FIELDS = ["gmail_watch_expiration"] as const;
const CALENDAR_ACCOUNT_FIELDS = [
  "calendar_watch_expiration",
  "calendar_watch_channel_id",
  "calendar_watch_resource_id",
] as const;

export function getCorsairDatabase() {
  return createCorsairDatabase(pool);
}

export function createPluginAccountKeyManager(tenantId: string, plugin: IntegrationPlugin) {
  const extraAccountFields =
    plugin === "gmail" ? GMAIL_ACCOUNT_FIELDS : CALENDAR_ACCOUNT_FIELDS;

  return createAccountKeyManager({
    authType: "oauth_2",
    integrationName: plugin,
    tenantId,
    kek: env.corsairKek,
    database: getCorsairDatabase(),
    extraAccountFields: [...extraAccountFields],
  });
}

export function createPluginIntegrationKeyManager(plugin: IntegrationPlugin) {
  const extraIntegrationFields = plugin === "gmail" ? (["topic_id"] as const) : undefined;

  return createIntegrationKeyManager({
    authType: "oauth_2",
    integrationName: plugin,
    kek: env.corsairKek,
    database: getCorsairDatabase(),
    ...(extraIntegrationFields ? { extraIntegrationFields: [...extraIntegrationFields] } : {}),
  });
}
