import { z } from "zod";

const limitSchema = z.coerce.number().int().min(1).max(100).default(25);
const offsetSchema = z.coerce.number().int().min(0).default(0);

const sendUpdatesSchema = z.enum(["all", "externalOnly", "none"]);

export const eventDateTimeSchema = z
  .object({
    date: z.string().optional(),
    dateTime: z.string().optional(),
    timeZone: z.string().optional(),
  })
  .refine((value) => Boolean(value.date || value.dateTime), {
    message: "Either date or dateTime is required",
  });

export const eventAttendeeSchema = z.object({
  email: z.string().trim().email("Invalid attendee email"),
});

export const eventInputSchema = z.object({
  summary: z.string().trim().min(1, "Event title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  start: eventDateTimeSchema,
  end: eventDateTimeSchema,
  attendees: z.array(eventAttendeeSchema).optional(),
});

export const createEventSchema = z.object({
  event: eventInputSchema,
  calendarId: z.string().optional(),
  sendUpdates: sendUpdatesSchema.optional(),
});

export const updateEventSchema = z.object({
  event: eventInputSchema.partial(),
  calendarId: z.string().optional(),
  sendUpdates: sendUpdatesSchema.optional(),
});

export const listEventsQuerySchema = z.object({
  limit: limitSchema,
  offset: offsetSchema,
});

export const syncEventsQuerySchema = z.object({
  timeMin: z.string().datetime({ offset: true }).optional(),
  timeMax: z.string().datetime({ offset: true }).optional(),
});

export const searchEventsQuerySchema = z.object({
  q: z.string().trim().min(1, "Search query is required"),
  limit: limitSchema,
  offset: offsetSchema,
});

export type EventDateTime = z.infer<typeof eventDateTimeSchema>;
export type EventInput = z.infer<typeof eventInputSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
export type SyncEventsQuery = z.infer<typeof syncEventsQuerySchema>;
export type SearchEventsQuery = z.infer<typeof searchEventsQuerySchema>;
