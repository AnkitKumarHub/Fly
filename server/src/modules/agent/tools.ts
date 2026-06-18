import { tool } from "ai";
import { z } from "zod";
import { searchEmails, listEmails, sendEmail } from "../emails/service.js";
import { listEvents, searchEvents, createEvent, updateEvent } from "../events/service.js";

/** All tools are closed over tenantId — the LLM CANNOT specify a different tenant.
 *  Read tools call Corsair DB directly (fast, no API rate limits).
 *  Write tools execute REAL actions (send email, create event, update event).
 *  The system prompt instructs the LLM to ALWAYS confirm with the user in chat
 *  before calling any write tool. The conversation history provides the memory. */
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

  // ── WRITE TOOLS ───────────────────────────────────────────────────────────
  // These ACTUALLY execute the action. The system prompt mandates the LLM
  // must confirm with the user in chat BEFORE calling any of these.

  const send_email = tool({
    description:
      "Send an email on behalf of the user. CRITICAL: You MUST first describe the full email (to, subject, body) in the chat and ask the user to confirm with something like 'Shall I send this?'. Only call this tool AFTER the user has explicitly said yes/confirmed.",
    inputSchema: z.object({
      to: z.string().email().describe("Recipient email address"),
      subject: z.string().max(500),
      body: z.string().max(5000).describe("Email body text"),
    }),
    execute: async ({ to, subject, body }) => {
      try {
        await sendEmail(tenantId, { to, subject, body });
        return { success: true, message: `Email sent to ${to} with subject "${subject}"` };
      } catch (error) {
        return {
          success: false,
          message: `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    },
  });

  const create_event = tool({
    description:
      "Create a Google Calendar event. CRITICAL: You MUST first describe the full event details (title, date/time, attendees) in the chat and ask the user to confirm. Only call this tool AFTER the user has explicitly confirmed.",
    inputSchema: z.object({
      title: z.string().max(200),
      startDateTime: z.string().describe("ISO 8601 datetime e.g. 2026-06-20T09:00:00+05:30"),
      endDateTime: z.string().describe("ISO 8601 datetime"),
      attendees: z.array(z.string().email()).max(10).optional(),
      description: z.string().max(1000).optional(),
    }),
    execute: async ({ title, startDateTime, endDateTime, attendees, description }) => {
      try {
        const result = await createEvent(tenantId, {
          event: {
            summary: title,
            start: { dateTime: startDateTime },
            end: { dateTime: endDateTime },
            attendees: attendees?.map((email) => ({ email })),
            description,
          },
        });
        return { success: true, message: `Event "${title}" created successfully`, eventId: result.id };
      } catch (error) {
        return {
          success: false,
          message: `Failed to create event: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    },
  });

  const update_event = tool({
    description:
      "Update an existing Google Calendar event. CRITICAL: Describe the changes first and get user confirmation before calling this tool.",
    inputSchema: z.object({
      eventId: z.string().describe("Google Calendar event ID from list_events or search_events"),
      title: z.string().max(200).optional(),
      startDateTime: z.string().optional(),
      endDateTime: z.string().optional(),
      description: z.string().max(1000).optional(),
    }),
    execute: async ({ eventId, title, startDateTime, endDateTime, description }) => {
      try {
        const eventUpdate: Record<string, unknown> = {};
        if (title) eventUpdate.summary = title;
        if (startDateTime) eventUpdate.start = { dateTime: startDateTime };
        if (endDateTime) eventUpdate.end = { dateTime: endDateTime };
        if (description) eventUpdate.description = description;

        const result = await updateEvent(tenantId, eventId, {
          event: eventUpdate as Parameters<typeof updateEvent>[2]["event"],
        });
        return { success: true, message: `Event updated successfully`, eventId: result.id };
      } catch (error) {
        return {
          success: false,
          message: `Failed to update event: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    },
  });

  return {
    search_emails,
    list_emails,
    list_events,
    search_events,
    send_email,
    create_event,
    update_event,
  };
}
