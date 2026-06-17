import crypto from "node:crypto";

import { env } from "../../config/env.js";
import {
  createPluginAccountKeyManager,
  createPluginIntegrationKeyManager,
} from "./corsair-km.js";
import type { IntegrationPlugin } from "./types.js";

const WATCH_RENEWAL_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

type ExtraAccountKm = {
  get_gmail_watch_expiration?: () => Promise<string | undefined>;
  set_gmail_watch_expiration?: (value: string) => Promise<void>;
  get_calendar_watch_expiration?: () => Promise<string | undefined>;
  set_calendar_watch_expiration?: (value: string) => Promise<void>;
  get_calendar_watch_channel_id?: () => Promise<string | undefined>;
  set_calendar_watch_channel_id?: (value: string) => Promise<void>;
  get_calendar_watch_resource_id?: () => Promise<string | undefined>;
  set_calendar_watch_resource_id?: (value: string) => Promise<void>;
};

type ExtraIntegrationKm = {
  get_topic_id?: () => Promise<string | undefined>;
};

async function fetchGoogleAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<string | null> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    throw new Error(`Google token refresh failed: ${body}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  return tokenData.access_token ?? null;
}

function shouldRenewWatch(expiration: string | undefined): boolean {
  if (!expiration) return true;
  return Number(expiration) - Date.now() < WATCH_RENEWAL_WINDOW_MS;
}

async function registerGmailWatch(tenantId: string) {
  const topicName = env.gmailPubsubTopic;
  if (!topicName) {
    console.warn("[watches] GMAIL_PUBSUB_TOPIC not set — skipping Gmail watch registration");
    return;
  }

  const accountKm = createPluginAccountKeyManager(tenantId, "gmail") as ExtraAccountKm & {
    get_refresh_token: () => Promise<string | undefined>;
  };
  const integrationKm = createPluginIntegrationKeyManager("gmail") as ExtraIntegrationKm & {
    get_client_id: () => Promise<string | undefined>;
    get_client_secret: () => Promise<string | undefined>;
  };

  const [clientId, clientSecret, refreshToken, topicId] = await Promise.all([
    integrationKm.get_client_id(),
    integrationKm.get_client_secret(),
    accountKm.get_refresh_token(),
    integrationKm.get_topic_id?.(),
  ]);

  const resolvedTopic = topicId ?? topicName;
  if (!clientId || !clientSecret || !refreshToken) return;

  const accessToken = await fetchGoogleAccessToken(clientId, clientSecret, refreshToken);
  if (!accessToken) return;

  const watchRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/watch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topicName: resolvedTopic,
      labelIds: ["INBOX"],
    }),
  });

  if (!watchRes.ok) {
    const body = await watchRes.text();
    throw new Error(`Gmail watch registration failed: ${body}`);
  }

  const watchData = (await watchRes.json()) as { expiration?: string };
  if (watchData.expiration) {
    await accountKm.set_gmail_watch_expiration?.(String(watchData.expiration));
  }

  console.log(`[watches] Gmail watch registered for tenant ${tenantId}`);
}

async function registerCalendarWatch(tenantId: string) {
  const accountKm = createPluginAccountKeyManager(tenantId, "googlecalendar") as ExtraAccountKm & {
    get_refresh_token: () => Promise<string | undefined>;
  };
  const integrationKm = createPluginIntegrationKeyManager("googlecalendar") as {
    get_client_id: () => Promise<string | undefined>;
    get_client_secret: () => Promise<string | undefined>;
  };

  const [clientId, clientSecret, refreshToken] = await Promise.all([
    integrationKm.get_client_id(),
    integrationKm.get_client_secret(),
    accountKm.get_refresh_token(),
  ]);

  if (!clientId || !clientSecret || !refreshToken) return;

  const accessToken = await fetchGoogleAccessToken(clientId, clientSecret, refreshToken);
  if (!accessToken) return;

  const channelId = crypto.randomUUID();
  const webhookUrl = `${env.appUrl}/webhooks?tenantId=${tenantId}`;

  const watchRes = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events/watch",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: channelId,
        type: "web_hook",
        address: webhookUrl,
      }),
    },
  );

  if (!watchRes.ok) {
    const body = await watchRes.text();
    throw new Error(`Calendar watch registration failed: ${body}`);
  }

  const watchData = (await watchRes.json()) as { expiration?: string; resourceId?: string };
  if (watchData.expiration) {
    await accountKm.set_calendar_watch_expiration?.(String(watchData.expiration));
  }
  await accountKm.set_calendar_watch_channel_id?.(channelId);
  if (watchData.resourceId) {
    await accountKm.set_calendar_watch_resource_id?.(watchData.resourceId);
  }

  console.log(`[watches] Calendar watch registered for tenant ${tenantId}`);
}

async function stopGmailWatch(tenantId: string) {
  const accountKm = createPluginAccountKeyManager(tenantId, "gmail") as {
    get_refresh_token: () => Promise<string | undefined>;
  };
  const integrationKm = createPluginIntegrationKeyManager("gmail") as {
    get_client_id: () => Promise<string | undefined>;
    get_client_secret: () => Promise<string | undefined>;
  };

  const [clientId, clientSecret, refreshToken] = await Promise.all([
    integrationKm.get_client_id(),
    integrationKm.get_client_secret(),
    accountKm.get_refresh_token(),
  ]);

  if (!clientId || !clientSecret || !refreshToken) return;

  const accessToken = await fetchGoogleAccessToken(clientId, clientSecret, refreshToken);
  if (!accessToken) return;

  const stopRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/stop", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!stopRes.ok) {
    const body = await stopRes.text();
    console.error(`[watches] Gmail watch stop failed for tenant ${tenantId}: ${body}`);
    return;
  }

  console.log(`[watches] Gmail watch stopped for tenant ${tenantId}`);
}

async function stopCalendarWatch(tenantId: string) {
  const accountKm = createPluginAccountKeyManager(
    tenantId,
    "googlecalendar",
  ) as ExtraAccountKm & {
    get_refresh_token: () => Promise<string | undefined>;
  };
  const integrationKm = createPluginIntegrationKeyManager("googlecalendar") as {
    get_client_id: () => Promise<string | undefined>;
    get_client_secret: () => Promise<string | undefined>;
  };

  const [clientId, clientSecret, refreshToken, channelId, resourceId] = await Promise.all([
    integrationKm.get_client_id(),
    integrationKm.get_client_secret(),
    accountKm.get_refresh_token(),
    accountKm.get_calendar_watch_channel_id?.(),
    accountKm.get_calendar_watch_resource_id?.(),
  ]);

  if (!clientId || !clientSecret || !refreshToken || !channelId || !resourceId) return;

  const accessToken = await fetchGoogleAccessToken(clientId, clientSecret, refreshToken);
  if (!accessToken) return;

  const stopRes = await fetch("https://www.googleapis.com/calendar/v3/channels/stop", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: channelId, resourceId }),
  });

  if (!stopRes.ok) {
    const body = await stopRes.text();
    console.error(`[watches] Calendar watch stop failed for tenant ${tenantId}: ${body}`);
    return;
  }

  console.log(`[watches] Calendar watch stopped for tenant ${tenantId}`);
}

async function tenantHasTokens(tenantId: string, plugin: IntegrationPlugin): Promise<boolean> {
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

export async function renewWatchIfNeeded(tenantId: string, plugin: IntegrationPlugin) {
  const connected = await tenantHasTokens(tenantId, plugin);
  if (!connected) return;

  try {
    if (plugin === "gmail") {
      const accountKm = createPluginAccountKeyManager(tenantId, "gmail") as ExtraAccountKm;
      const expiration = await accountKm.get_gmail_watch_expiration?.();
      if (!shouldRenewWatch(expiration)) return;
      await registerGmailWatch(tenantId);
      return;
    }

    const accountKm = createPluginAccountKeyManager(tenantId, "googlecalendar") as ExtraAccountKm;
    const expiration = await accountKm.get_calendar_watch_expiration?.();
    if (!shouldRenewWatch(expiration)) return;
    await registerCalendarWatch(tenantId);
  } catch (error) {
    console.error(`[watches] Failed to renew ${plugin} watch for tenant ${tenantId}:`, error);
  }
}

export async function renewWatchesIfNeeded(tenantId: string) {
  await Promise.all([
    renewWatchIfNeeded(tenantId, "gmail"),
    renewWatchIfNeeded(tenantId, "googlecalendar"),
  ]);
}

export async function stopWatchForPlugin(tenantId: string, plugin: IntegrationPlugin) {
  try {
    if (plugin === "gmail") {
      await stopGmailWatch(tenantId);
      return;
    }

    await stopCalendarWatch(tenantId);
  } catch (error) {
    console.error(`[watches] Failed to stop ${plugin} watch for tenant ${tenantId}:`, error);
  }
}
