import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { env } from "./config/env.js";
import { pool } from "./db/index.js";
import { publishRealtimeEvent } from "./notifications/pg-bus.js";
import type { RealtimeAction } from "./notifications/types.js";

function tenantIdFromCtx(ctx: unknown): string | undefined {
  if (ctx && typeof ctx === "object" && "tenantId" in ctx) {
    const { tenantId } = ctx as { tenantId?: unknown };
    return typeof tenantId === "string" ? tenantId : undefined;
  }
  return undefined;
}

function publishEmailEvent(tenantId: string, id: string, action: RealtimeAction) {
  return publishRealtimeEvent({ tenantId, type: "email", action, id });
}

function publishCalendarEvent(tenantId: string, id: string, action: RealtimeAction) {
  return publishRealtimeEvent({ tenantId, type: "calendar", action, id });
}

export const corsair = createCorsair({
  plugins: [gmail({
    webhookHooks: {
      messageChanged: {
        before(ctx, args) {
          return { ctx, args };
        },
        after: async (ctx, response) => {
          const tenantId = tenantIdFromCtx(ctx);
          if (!tenantId || !response?.success) return;

          const data = response.data as { type?: string; message?: { id?: string } } | undefined;
          if (!data?.message?.id) return;

          if (data.type === "messageReceived") {
            await publishEmailEvent(tenantId, data.message.id, "created");
            return;
          }

          if (data.type === "messageLabelChanged") {
            await publishEmailEvent(tenantId, data.message.id, "updated");
          }
        },
      },
    },
  }), googlecalendar({
    webhookHooks: {
      onEventChanged: {
        before(ctx, args) {
          return { ctx, args };
        },
        after: async (ctx, response) => {
          const tenantId = tenantIdFromCtx(ctx);
          if (!tenantId || !response?.success) return;

          const data = response.data as {
            type?: string;
            event?: { id?: string };
            eventId?: string;
          } | undefined;

          if (!data?.type) return;

          if (data.type === "eventCreated" && data.event?.id) {
            await publishCalendarEvent(tenantId, data.event.id, "created");
            return;
          }

          if (data.type === "eventUpdated" && data.event?.id) {
            await publishCalendarEvent(tenantId, data.event.id, "updated");
            return;
          }

          if (data.type === "eventDeleted" && data.eventId) {
            await publishCalendarEvent(tenantId, data.eventId, "deleted");
          }
        },
      },
    },
  })],
  database: pool,
  kek: env.corsairKek,
  multiTenancy: true,
});
