import { ApiError } from "../../common/utils/api-error.js";
import { corsair } from "../../corsair.js";
import { buildRawEmail } from "./mime.js";
import { parseGmailMessage, type ParsedEmail } from "./parse.js";
import type { ComposeEmailInput } from "./schema.js";

function gmailFor(tenantId: string) {
  return corsair.withTenant(tenantId).gmail;
}

type DbMessageRow = Record<string, unknown> & {
  id?: string;
  entityId?: string;
  entity_id?: string;
};

function isCorsairEntityUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** Corsair DB rows use `id` for the internal UUID and `entity_id` for the Gmail message id. */
function resolveGmailMessageId(row: DbMessageRow): string {
  const gmailId = row.entityId ?? row.entity_id;
  if (typeof gmailId === "string" && gmailId.length > 0) {
    return gmailId;
  }

  if (typeof row.id === "string" && !isCorsairEntityUuid(row.id)) {
    return row.id;
  }

  throw ApiError.notFound("Gmail message id not found for cached row");
}

function isListRowSparse(row: DbMessageRow): boolean {
  const { from, subject } = normalizeListRow(row);
  return !from && !subject;
}

function normalizeListRow(row: DbMessageRow) {
  const message = (row.data ?? row) as Record<string, unknown>;
  const parsed = parseGmailMessage(message as Parameters<typeof parseGmailMessage>[0]);

  return {
    id: resolveGmailMessageId(row),
    corsairId: row.id,
    threadId: message.threadId as string | undefined,
    snippet: (message.snippet as string | undefined) ?? parsed.snippet,
    subject: (message.subject as string | undefined) || parsed.subject || undefined,
    from: (message.from as string | undefined) || parsed.from || undefined,
    to: (message.to as string | undefined) || parsed.to || undefined,
    internalDate:
      message.internalDate != null ? String(message.internalDate) : undefined,
  };
}

async function enrichSparseListRow(tenantId: string, row: DbMessageRow) {
  const baseline = normalizeListRow(row);
  if (!isListRowSparse(row)) {
    return baseline;
  }

  const gmailId = resolveGmailMessageId(row);
  const message = await gmailFor(tenantId).api.messages.get({ id: gmailId, format: "full" });
  const parsed = parseGmailMessage(message);

  return {
    ...baseline,
    subject: parsed.subject || undefined,
    from: parsed.from || undefined,
    to: parsed.to || undefined,
  };
}

async function resolveGmailMessageIdForFetch(tenantId: string, id: string): Promise<string> {
  if (!isCorsairEntityUuid(id)) {
    return id;
  }

  const rows = await gmailFor(tenantId).db.messages.search({
    limit: 1,
    data: { id: { equals: id } },
  });

  const row = rows?.[0] as DbMessageRow | undefined;
  if (!row) {
    throw ApiError.notFound("Email not found");
  }

  return resolveGmailMessageId(row);
}

/** Pulls the latest inbox messages from the Gmail API into Corsair's synced DB cache. */
export async function syncInbox(tenantId: string, maxResults = 25) {
  const gmail = gmailFor(tenantId);
  const listResult = await gmail.api.messages.list({ maxResults, labelIds: ["INBOX"] });
  const messages = (listResult as { messages?: { id?: string }[] })?.messages ?? [];

  await Promise.all(
    messages
      .filter((message): message is { id: string } => typeof message.id === "string")
      .map((message) =>
        gmail.api.messages.get({
          id: message.id,
          format: "metadata",
        }),
      ),
  );

  return listResult;
}

/** Reads the inbox feed from Corsair's synced DB (fast, no rate limits). */
export async function listEmails(tenantId: string, limit: number, offset: number) {
  const rows = await gmailFor(tenantId).db.messages.search({ limit, offset });
  return Promise.all((rows as DbMessageRow[]).map((row) => enrichSparseListRow(tenantId, row)));
}

export async function searchEmails(
  tenantId: string,
  query: string,
  limit: number,
  offset: number,
) {
  const rows = await gmailFor(tenantId).db.messages.search({
    limit,
    offset,
    data: { snippet: { contains: query } },
  });

  return Promise.all((rows as DbMessageRow[]).map((row) => enrichSparseListRow(tenantId, row)));
}

export async function getEmail(tenantId: string, id: string): Promise<ParsedEmail> {
  const gmailId = await resolveGmailMessageIdForFetch(tenantId, id);
  const message = await gmailFor(tenantId).api.messages.get({ id: gmailId, format: "full" });
  return parseGmailMessage(message);
}

export async function sendEmail(tenantId: string, input: ComposeEmailInput) {
  return gmailFor(tenantId).api.messages.send({ raw: buildRawEmail(input) });
}

export async function createDraft(tenantId: string, input: ComposeEmailInput) {
  return gmailFor(tenantId).api.drafts.create({
    draft: { message: { raw: buildRawEmail(input) } },
  });
}
