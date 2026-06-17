export interface EventDateTime {
  date?: string;
  dateTime?: string;
  timeZone?: string;
}

export interface EventAttendee {
  email?: string;
  displayName?: string;
  responseStatus?: string;
}

export interface NormalizedEvent {
  id: string;
  corsairId?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: EventDateTime;
  end?: EventDateTime;
  htmlLink?: string;
  status?: string;
  attendees?: EventAttendee[];
  hangoutLink?: string;
}

export type DbEventRow = Record<string, unknown> & {
  id?: string;
  entityId?: string;
  entity_id?: string;
  data?: Record<string, unknown>;
};

type GoogleEventPayload = Record<string, unknown> & {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: EventDateTime;
  end?: EventDateTime;
  htmlLink?: string;
  status?: string;
  attendees?: EventAttendee[];
  hangoutLink?: string;
};

function eventPayload(row: DbEventRow): GoogleEventPayload {
  if (row.data && typeof row.data === "object") {
    return row.data as GoogleEventPayload;
  }

  return row as GoogleEventPayload;
}

export function isCorsairEntityUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** Corsair DB rows use `id` for the internal UUID and `entity_id` for the Google event id. */
function resolveGoogleEventId(row: DbEventRow): string {
  const googleId = row.entityId ?? row.entity_id;
  if (typeof googleId === "string" && googleId.length > 0) {
    return googleId;
  }

  const payload = eventPayload(row);
  if (typeof payload.id === "string" && payload.id.length > 0) {
    return payload.id;
  }

  if (typeof row.id === "string" && !isCorsairEntityUuid(row.id)) {
    return row.id;
  }

  throw new Error("Google event id not found for cached row");
}

export function normalizeEvent(row: DbEventRow | GoogleEventPayload): NormalizedEvent {
  const isRow = "entityId" in row || "entity_id" in row || ("data" in row && row.data != null);
  const payload = isRow ? eventPayload(row as DbEventRow) : (row as GoogleEventPayload);
  const dbRow = isRow ? (row as DbEventRow) : undefined;

  const googleId =
    (typeof payload.id === "string" && payload.id.length > 0
      ? payload.id
      : dbRow
        ? resolveGoogleEventId(dbRow)
        : "") || "";

  const result: NormalizedEvent = { id: googleId };

  if (dbRow?.id && isCorsairEntityUuid(dbRow.id)) {
    result.corsairId = dbRow.id;
  }
  if (payload.summary) result.summary = payload.summary;
  if (payload.description) result.description = payload.description;
  if (payload.location) result.location = payload.location;
  if (payload.start) result.start = payload.start;
  if (payload.end) result.end = payload.end;
  if (payload.htmlLink) result.htmlLink = payload.htmlLink;
  if (payload.status) result.status = payload.status;
  if (payload.attendees) result.attendees = payload.attendees;
  if (payload.hangoutLink) result.hangoutLink = payload.hangoutLink;

  return result;
}
