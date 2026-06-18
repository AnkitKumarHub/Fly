import { tool } from "ai";
import { z } from "zod";
import { searchEmails, listEmails } from "../emails/service.js";
import { listEvents, searchEvents } from "../events/service.js";

/** All tools are closed over tenantId — the LLM CANNOT specify a different tenant.
 *  Read tools call Corsair DB directly (fast, no API rate limits).
 *  Write tools use the propose pattern — they return a preview for UI confirmation.
 *  The actual write (POST /emails/send, POST /events) is done by the frontend
 *  after the user clicks "Confirm". */
export function buildTools(tenantId: string) {
  // ── READ TOOLS ────────────────────────────────────────────────────────────

  const search_emails = tool({
    description:
      "Search the user's Gmail inbox by keyword. Use for questions like 'show emails from Rahul' or 'find invoice from last month'.",
    inputSchema: z.object({
      query: z.string().max(200).describe("Search keyword or phrase"),
      limit: z.number().int().min(1).max(10).default(5),
    }),
    execute: async ({ query, limit }) => {
      const results = await searchEmails(tenantId, query, limit, 0);
      return results.map((e) => ({
        id: e.id,
        from: e.from,
        subject: e.subject,
        snippet: e.snippet,
        isUnread: e.isUnread,
      }));
    },
  });

  const list_emails = tool({
    description: "List the most recent emails in the user's inbox.",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(10).default(5),
    }),
    execute: async ({ limit }) => {
      const results = await listEmails(tenantId, limit, 0);
      return results.map((e) => ({
        id: e.id,
        from: e.from,
        subject: e.subject,
        snippet: e.snippet,
        isUnread: e.isUnread,
      }));
    },
  });

  const list_events = tool({
    description:
      "List the user's upcoming Google Calendar events. Use for questions like 'what do I have this week' or 'show my schedule'.",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(10).default(5),
    }),
    execute: async ({ limit }) => {
      const events = await listEvents(tenantId, limit, 0);
      return events.map((e) => ({
        id: e.id,
        title: e.summary,
        start: e.start,
        end: e.end,
        attendees: e.attendees,
      }));
    },
  });

  const search_events = tool({
    description: "Search the user's Google Calendar events by keyword.",
    inputSchema: z.object({
      query: z.string().max(200).describe("Search keyword, e.g. event title or attendee name"),
      limit: z.number().int().min(1).max(10).default(5),
    }),
    execute: async ({ query, limit }) => {
      const events = await searchEvents(tenantId, query, limit, 0);
      return events.map((e) => ({
        id: e.id,
        title: e.summary,
        start: e.start,
        end: e.end,
      }));
    },
  });

  // ── PROPOSE / WRITE TOOLS ─────────────────────────────────────────────────
  // These NEVER directly write. They return a preview for UI confirmation.
  // The actual write is done by the frontend calling existing REST routes.

  const propose_send_email = tool({
    description:
      "PROPOSE sending an email. IMPORTANT: Always summarise what you will send first, then call this tool. It returns a preview for user confirmation — it does NOT send the email.",
    inputSchema: z.object({
      to: z.string().email().describe("Recipient email address"),
      subject: z.string().max(500),
      body: z.string().max(5000),
    }),
    execute: async ({ to, subject, body }) => ({
      confirmationRequired: true,
      type: "send_email" as const,
      preview: { to, subject, bodyPreview: body.slice(0, 300), bodyFull: body },
    }),
  });

  const propose_create_event = tool({
    description:
      "PROPOSE creating a calendar event. IMPORTANT: Summarise the event details and get user confirmation BEFORE calling this. Returns a preview — does NOT create the event.",
    inputSchema: z.object({
      title: z.string().max(200),
      startDateTime: z.string().describe("ISO 8601 datetime e.g. 2026-06-20T09:00:00+05:30"),
      endDateTime: z.string().describe("ISO 8601 datetime"),
      attendees: z.array(z.string().email()).max(10).optional(),
      description: z.string().max(1000).optional(),
    }),
    execute: async ({ title, startDateTime, endDateTime, attendees, description }) => ({
      confirmationRequired: true,
      type: "create_event" as const,
      preview: { title, startDateTime, endDateTime, attendees: attendees ?? [], description },
    }),
  });

  const propose_update_event = tool({
    description:
      "PROPOSE updating an existing calendar event. Returns a preview for user confirmation — does NOT update immediately.",
    inputSchema: z.object({
      eventId: z.string().describe("Google Calendar event ID from list_events or search_events"),
      title: z.string().max(200).optional(),
      startDateTime: z.string().optional(),
      endDateTime: z.string().optional(),
      description: z.string().max(1000).optional(),
    }),
    execute: async ({ eventId, title, startDateTime, endDateTime, description }) => ({
      confirmationRequired: true,
      type: "update_event" as const,
      preview: { eventId, title, startDateTime, endDateTime, description },
    }),
  });

  return {
    search_emails,
    list_emails,
    list_events,
    search_events,
    propose_send_email,
    propose_create_event,
    propose_update_event,
  };
}
