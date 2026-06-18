import { createPluginAccountKeyManager } from "./corsair-km.js";
import type { IntegrationPlugin } from "./types.js";

type TokenKeyManager = {
  set_refresh_token: (value: string) => Promise<void>;
  set_access_token: (value: string) => Promise<void>;
  set_gmail_watch_expiration?: (value: string) => Promise<void>;
  set_calendar_watch_expiration?: (value: string) => Promise<void>;
  set_calendar_watch_channel_id?: (value: string) => Promise<void>;
  set_calendar_watch_resource_id?: (value: string) => Promise<void>;
};

export async function clearAccountTokens(tenantId: string, plugin: IntegrationPlugin) {
  const accountKm = createPluginAccountKeyManager(tenantId, plugin) as TokenKeyManager;

  await accountKm.set_refresh_token("");
  await accountKm.set_access_token("");

  if (plugin === "gmail") {
    await accountKm.set_gmail_watch_expiration?.("");
    return;
  }

  await accountKm.set_calendar_watch_expiration?.("");
  await accountKm.set_calendar_watch_channel_id?.("");
  await accountKm.set_calendar_watch_resource_id?.("");
}
