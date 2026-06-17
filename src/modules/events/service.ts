import { ApiError } from "../../common/utils/api-error.js";
import { corsair } from "../../corsair.js";
import {
  isCorsairEntityUuid,
  normalizeEvent,
  type DbEventRow,
  type NormalizedEvent,
} from "./normalize.js";
import type { CreateEventInput, SyncEventsQuery, UpdateEventInput } from "./schema.js";

function calendarFor(tenantId: string) {
  return corsair.withTenant(tenantId).googlecalendar;
}

function defaultSyncRange(): { timeMin: string; timeMax: string } {
  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const timeMax = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
  return { timeMin, timeMax };
}

async function resolveGoogleEventIdForFetch(tenantId: string, id: string): Promise<string> {
  if (!isCorsairEntityUuid(id)) {
    return id;
  }

  const rows = await calendarFor(tenantId).db.events.search({
    limit: 1,
    data: { id: { equals: id } },
  });

  const row = rows?.[0] as DbEventRow | undefined;
  if (!row) {
    throw ApiError.notFound("Event not found");
  }

  try {
    const googleId = normalizeEvent(row).id;
    if (!googleId) {
      throw ApiError.notFound("Google event id not found for cached row");
    }
    return googleId;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.notFound("Google event id not found for cached row");
  }
}

/** Pulls events from the Google Calendar API into Corsair's synced DB cache. */
export async function syncEvents(tenantId: string, query: SyncEventsQuery = {}) {
  const defaults = defaultSyncRange();

  return calendarFor(tenantId).api.events.getMany({
    timeMin: query.timeMin ?? defaults.timeMin,
    timeMax: query.timeMax ?? defaults.timeMax,
    singleEvents: true,
    maxResults: 250,
    orderBy: "startTime",
  });
}

/** Reads the event feed from Corsair's synced DB (fast, no rate limits). */
export async function listEvents(
  tenantId: string,
  limit: number,
  offset: number,
): Promise<NormalizedEvent[]> {
  const rows = await calendarFor(tenantId).db.events.search({ limit, offset });
  return (rows as DbEventRow[]).map((row) => normalizeEvent(row));
}

export async function searchEvents(
  tenantId: string,
  query: string,
  limit: number,
  offset: number,
): Promise<NormalizedEvent[]> {
  const rows = await calendarFor(tenantId).db.events.search({
    limit,
    offset,
    data: { summary: { contains: query } },
  });

  return (rows as DbEventRow[]).map((row) => normalizeEvent(row));
}

export async function getEvent(tenantId: string, id: string): Promise<NormalizedEvent> {
  const googleId = await resolveGoogleEventIdForFetch(tenantId, id);
  const event = await calendarFor(tenantId).api.events.get({ id: googleId });
  return normalizeEvent(event);
}

export async function createEvent(tenantId: string, input: CreateEventInput) {
  const { event, calendarId, sendUpdates } = input;

  const created = await calendarFor(tenantId).api.events.create({
    event,
    ...(calendarId ? { calendarId } : {}),
    ...(sendUpdates ? { sendUpdates } : {}),
  });

  return normalizeEvent(created);
}

export async function updateEvent(tenantId: string, id: string, input: UpdateEventInput) {
  const googleId = await resolveGoogleEventIdForFetch(tenantId, id);
  const { event, calendarId, sendUpdates } = input;

  const updated = await calendarFor(tenantId).api.events.update({
    id: googleId,
    event,
    ...(calendarId ? { calendarId } : {}),
    ...(sendUpdates ? { sendUpdates } : {}),
  });

  return normalizeEvent(updated);
}

export async function deleteEvent(tenantId: string, id: string) {
  const googleId = await resolveGoogleEventIdForFetch(tenantId, id);
  await calendarFor(tenantId).api.events.delete({ id: googleId });
}
